// v4.1 - Disabling JWT for public M-PESA callback
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Daraja STK callback payload shape
interface DarajaCallbackItem {
  Name: string;
  Value: string | number;
}

interface DarajaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;       // 0 = success, anything else = failure
      ResultDesc: string;
      CallbackMetadata?: {
        Item: DarajaCallbackItem[];
      };
    };
  };
}

// Daraja ResultCode meanings (for logging)
const RESULT_CODE_MESSAGES: Record<number, string> = {
  0:    'Success',
  1:    'Insufficient funds',
  17:   'M-PESA transaction limit reached',
  1032: 'Request cancelled by user',
  1037: 'DS timeout — user failed to respond',
  2001: 'Wrong PIN entered',
};

// Helper to safely extract a value from the callback metadata
function getMetadataValue(items: DarajaCallbackItem[], name: string): string | number | undefined {
  return items.find(item => item.Name === name)?.Value;
}

Deno.serve(async (req) => {
  const timestamp = new Date().toISOString();
  console.log(`[mpesa-callback] ${timestamp} — Request received. Method: ${req.method}`);

  // Safaricom always POSTs — reject anything else
  if (req.method !== 'POST') {
    console.log(`[mpesa-callback] ${timestamp} — Non-POST method rejected: ${req.method}`);
    return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Always respond 200 to Safaricom — they retry on non-200
  // All errors are logged internally, never surfaced to Safaricom as failures
  try {
    console.log(`[mpesa-callback] ${timestamp} — Parsing request...`);
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase    = createClient(supabaseUrl, serviceKey);

    const payload = await req.json() as DarajaCallback;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = payload.Body.stkCallback;

    console.log(`[mpesa-callback] ${timestamp} — Callback received. CheckoutRequestID=${CheckoutRequestID}, ResultCode=${ResultCode} (${RESULT_CODE_MESSAGES[ResultCode] ?? ResultDesc})`);

    if (ResultCode === 0) {
      // ── Payment succeeded ──
      console.log(`[mpesa-callback] ${timestamp} — Payment succeeded (ResultCode=0). Processing...`);
      const items = CallbackMetadata?.Item ?? [];

      const mpesaCode = getMetadataValue(items, 'MpesaReceiptNumber') as string | undefined;
      const amount    = getMetadataValue(items, 'Amount') as number | undefined;
      const phone     = getMetadataValue(items, 'PhoneNumber');

      console.log(`[mpesa-callback] ${timestamp} — Payment details: MpesaRef=${mpesaCode ?? 'N/A'}, Amount=${amount ?? 'N/A'}, Phone=${phone ?? 'N/A'}`);

      console.log(`[mpesa-callback] ${timestamp} — Updating order to paid status...`);
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status:    'paid',
          payment_reference: mpesaCode ?? null,
          status:            'confirmed',
        })
        .eq('mpesa_checkout_request_id', CheckoutRequestID)
        .select('id, customer_name, total_amount_kes')
        .single();

      if (error) {
        console.error(`[mpesa-callback] ${timestamp} — ✗ DB update FAILED on success path: ${error.message} (code: ${error.code})`);
      } else {
        console.log(`[mpesa-callback] ${timestamp} — ✓ Order ${data?.id} for ${data?.customer_name} marked PAID (KES ${data?.total_amount_kes}). M-PESA ref: ${mpesaCode}`);
      }

    } else {
      // ── Payment failed or cancelled ──
      const reason = RESULT_CODE_MESSAGES[ResultCode] ?? ResultDesc;
      console.log(`[mpesa-callback] ${timestamp} — Payment failed/cancelled. ResultCode=${ResultCode}, Reason: ${reason}`);

      console.log(`[mpesa-callback] ${timestamp} — Updating order to failed status...`);
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('mpesa_checkout_request_id', CheckoutRequestID);

      if (error) {
        console.error(`[mpesa-callback] ${timestamp} — ✗ DB update FAILED on failure path: ${error.message} (code: ${error.code})`);
      } else {
        console.log(`[mpesa-callback] ${timestamp} — ✓ Order marked FAILED due to: ${reason}`);
      }
    }

    // Always return success to Safaricom to prevent retries
    console.log(`[mpesa-callback] ${timestamp} — Returning 200 OK to Safaricom`);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const ts = new Date().toISOString();
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[mpesa-callback] ${ts} — ✗ UNHANDLED ERROR: ${message}`);
    console.error(`[mpesa-callback] ${ts} — Stack trace: ${err instanceof Error ? err.stack : 'N/A'}`);

    // Still return 200 — Safaricom retries otherwise and could spam the endpoint
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
