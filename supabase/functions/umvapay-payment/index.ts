
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency, phone, email, name, description } = await req.json();

    console.log('Processing UmvaPay payment request:', { amount, currency, phone, email, name });

    // UmvaPay API configuration
    const UMVAPAY_BASE_URL = 'https://umvapay.com/api/v1';
    const PUBLIC_KEY = 'zxfk70rif9y4mxzw1cvthkd6refpwga9g4l4ps7tjppffxptvk';
    const SECRET_KEY = 'dmhw53gfjtzxnd38jx74n8qsxi815xh9fs6ebft4mwk9f23zn4';

    // Create payment request to UmvaPay
    const paymentData = {
      amount: amount,
      currency: currency || 'USD',
      phone: phone,
      email: email,
      name: name,
      description: description || 'Donation to support independent journalism',
      callback_url: `${req.headers.get('origin')}/donate?status=success`,
      cancel_url: `${req.headers.get('origin')}/donate?status=cancelled`,
      public_key: PUBLIC_KEY
    };

    console.log('Sending payment request to UmvaPay:', paymentData);

    // Make request to UmvaPay API
    const response = await fetch(`${UMVAPAY_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SECRET_KEY}`,
        'X-Public-Key': PUBLIC_KEY
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    console.log('UmvaPay response:', result);

    if (response.ok && result.checkout_url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          checkout_url: result.checkout_url,
          transaction_id: result.transaction_id || result.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      console.error('UmvaPay API error:', result);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.message || 'Payment initialization failed' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
