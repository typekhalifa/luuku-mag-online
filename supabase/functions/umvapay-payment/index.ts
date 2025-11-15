
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const PaymentSchema = z.object({
  amount: z.number().positive().min(1).max(100000),
  currency: z.enum(['USD', 'EUR', 'RWF']).optional(),
  phone: z.string().min(1).max(20).regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/),
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = PaymentSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: validationResult.error.errors
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const { amount, currency, phone, email, name, description } = validationResult.data;

    console.log('Processing UmvaPay payment request:', { amount, currency, phone, email, name });

    // UmvaPay API configuration
    const UMVAPAY_BASE_URL = 'https://pay.umva.net/api/v1';
    const PUBLIC_KEY = Deno.env.get('UMVAPAY_PUBLIC_KEY');
    const SECRET_KEY = Deno.env.get('UMVAPAY_SECRET_KEY');

    if (!PUBLIC_KEY || !SECRET_KEY) {
      console.error('UmvaPay API keys not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment service not configured' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

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
