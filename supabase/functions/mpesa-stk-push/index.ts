// v6.1 - Disabling JWT for public guest checkout
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Daraja base URLs
const MPESA_ENV    = Deno.env.get('MPESA_ENVIRONMENT') || 'sandbox';
const DARAJA_BASE = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

interface StkPushRequest {
  phone: string;   // format: 2547XXXXXXXX
  amount: number;  // in KES, integer
  orderId: string; // UUID of the order already inserted in DB
}

interface DarajaTokenResponse {
  access_token: string;
  expires_in: string;
  error?: string;
  error_description?: string;
}

interface DarajaStkResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
}

Deno.serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`[mpesa-stk-push] ${timestamp} — Request received. Method: ${req.method}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[mpesa-stk-push] ${timestamp} — CORS preflight, returning OK`);
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Server-side secrets (never exposed to browser) ──
    console.log(`[mpesa-stk-push] ${timestamp} — Reading environment variables...`);
    const consumerKey    = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const shortcode      = Deno.env.get('MPESA_SHORTCODE')    ?? '174379';
    const passkey        = Deno.env.get('MPESA_PASSKEY')       ?? 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const callbackUrl    = Deno.env.get('MPESA_CALLBACK_URL');
    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
    const serviceKey     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log(`[mpesa-stk-push] ${timestamp} — Env check: consumerKey=${!!consumerKey ? '✓' : '✗'}, consumerSecret=${!!consumerSecret ? '✓' : '✗'}, callbackUrl=${!!callbackUrl ? '✓' : '✗'}, shortcode=${shortcode}, passkey=${!!passkey ? '✓' : '✗'}`);

    if (!consumerKey || !consumerSecret) {
      throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET must be set in Supabase Edge Function secrets.');
    }
    if (!callbackUrl) {
      throw new Error('MPESA_CALLBACK_URL must be set. It must be a publicly reachable URL (your mpesa-callback Edge Function URL).');
    }

    // ── Parse request ──
    console.log(`[mpesa-stk-push] ${timestamp} — Parsing request body...`);
    const body = await req.json() as StkPushRequest;
    const { phone, amount, orderId } = body;

    console.log(`[mpesa-stk-push] ${timestamp} — Request payload: phone=${phone}, amount=${amount}, orderId=${orderId}`);

    if (!phone || !amount || !orderId) {
      throw new Error('Missing required fields: phone (2547XXXXXXXX), amount (integer KES), orderId (UUID)');
    }
    if (!/^2547\d{8}$|^2541\d{8}$/.test(phone)) {
      throw new Error(`Invalid phone format: "${phone}". Must be 2547XXXXXXXX or 2541XXXXXXXX (12 digits).`);
    }

    // ── Step 1: Get OAuth token from Daraja ──
    console.log(`[mpesa-stk-push] ${timestamp} — Step 1: Requesting OAuth token from Daraja (${DARAJA_BASE})...`);
    const tokenRes = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
      },
    });

    console.log(`[mpesa-stk-push] ${timestamp} — Step 1: OAuth response status ${tokenRes.status}`);

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Daraja OAuth HTTP ${tokenRes.status}: ${errorText}`);
    }

    const tokenData = await tokenRes.json() as DarajaTokenResponse;
    if (!tokenData.access_token) {
      throw new Error(`Daraja OAuth failed: ${tokenData.error_description ?? JSON.stringify(tokenData)}`);
    }
    console.log(`[mpesa-stk-push] ${timestamp} — Step 1: ✓ OAuth token acquired. Expires in ${tokenData.expires_in}s`);

    // ── Step 2: Build password ──
    // Password = Base64(Shortcode + Passkey + Timestamp)
    const darajaTimestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '');

    const password = btoa(`${shortcode}${passkey}${darajaTimestamp}`);
    const shortOrderRef = orderId.slice(-8).toUpperCase();

    console.log(`[mpesa-stk-push] ${timestamp} — Step 2: Built password. Timestamp=${darajaTimestamp}, OrderRef=${shortOrderRef}`);

    // ── Step 3: Initiate STK push ──
    console.log(`[mpesa-stk-push] ${timestamp} — Step 3: Initiating STK push to phone ${phone} for KES ${amount}...`);
    const stkRes = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: darajaTimestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),       // Safaricom requires integer
        PartyA: phone,                    // Customer phone
        PartyB: shortcode,                // Paybill/shortcode
        PhoneNumber: phone,               // Phone to prompt
        CallBackURL: callbackUrl,
        AccountReference: shortOrderRef,  // Shown on customer's M-PESA receipt
        TransactionDesc: `Nadhir Order ${shortOrderRef}`,
      }),
    });

    console.log(`[mpesa-stk-push] ${timestamp} — Step 3: STK push response status ${stkRes.status}`);

    if (!stkRes.ok) {
      const errorText = await stkRes.text();
      throw new Error(`Daraja STK push HTTP ${stkRes.status}: ${errorText}`);
    }

    const stkData = await stkRes.json() as DarajaStkResponse;

    if (stkData.ResponseCode !== '0') {
      // Daraja error — surface the actual message
      const errMsg = stkData.errorMessage ?? stkData.ResponseDescription ?? 'STK push rejected by Safaricom';
      console.log(`[mpesa-stk-push] ${timestamp} — Step 3: Daraja error (${stkData.errorCode ?? stkData.ResponseCode}): ${errMsg}`);
      throw new Error(`Daraja STK push failed (${stkData.errorCode ?? stkData.ResponseCode}): ${errMsg}`);
    }

    const checkoutRequestId = stkData.CheckoutRequestID;
    console.log(`[mpesa-stk-push] ${timestamp} — Step 3: ✓ STK push accepted by Daraja. CheckoutRequestID=${checkoutRequestId}`);

    // ── Step 4: Store checkoutRequestId on order so callback can resolve it ──
    console.log(`[mpesa-stk-push] ${timestamp} — Step 4: Storing CheckoutRequestID in database for order ${orderId}...`);
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ mpesa_checkout_request_id: checkoutRequestId })
      .eq('id', orderId);

    if (updateError) {
      // Non-fatal — payment was still initiated. Log and continue.
      console.error(`[mpesa-stk-push] ${timestamp} — Step 4: Warning — Failed to store checkoutRequestId: ${updateError.message}`);
    } else {
      console.log(`[mpesa-stk-push] ${timestamp} — Step 4: ✓ CheckoutRequestID stored in order`);
    }

    console.log(`[mpesa-stk-push] ${timestamp} — ✓ STK push complete. CheckoutRequestID=${checkoutRequestId}, OrderID=${orderId}`);

    return new Response(
      JSON.stringify({ checkoutRequestId, orderId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: unknown) {
    const ts = new Date().toISOString();
    const message = err instanceof Error ? err.message : 'Unknown error in mpesa-stk-push';
    console.error(`[mpesa-stk-push] ${ts} — ✗ ERROR: ${message}`);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
