import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Validate Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthenticated request');

    // Parse Payload
    const { items, customer_name, customer_phone, total_amount_kes } = await req.json();

    if (!items || !customer_name || !customer_phone || !total_amount_kes) {
      throw new Error('Missing required checkout payload fields');
    }

    // SIMULATING M-PESA DELAY (STK Push)
    console.log(`[M-PESA SIMULATION] Initiating STK push to ${customer_phone} for KES ${total_amount_kes}...`);
    // Wait for 2 seconds to simulate network call to Safaricom Daraja API
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`[M-PESA SIMULATION] Success! Payment received from ${customer_phone}.`);

    // SIMULATING ADMIN EMAIL DISPATCH
    console.log(`[ADMIN NOTIFICATION SIMULATION] Dispatching email to nadhirthobes@gmail.com regarding new order for ${customer_name}...`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[ADMIN NOTIFICATION SIMULATION] Email sent successfully.`);

    // Safely insert order into database
    const { data: orderParams, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name,
          customer_phone,
          status: 'pending',
          total_amount_kes,
          items
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    return new Response(
      JSON.stringify(orderParams),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Edge Function Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
