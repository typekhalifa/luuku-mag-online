
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
    const UMVAPAY_BASE_URL = 'https://pay.umva.net';
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

    // Generate unique identifier for this transaction
    const identifier = `DONATION-${Date.now()}`;

    // Create form data for UmvaPay API
    const formData = new URLSearchParams();
    formData.append('public_key', PUBLIC_KEY);
    formData.append('identifier', identifier);
    formData.append('amount', amount.toString());
    formData.append('currency', currency || 'USD');
    formData.append('details', description || 'Donation to support independent journalism');
    formData.append('ipn_url', `${req.headers.get('origin')}/api/umvapay-ipn`);
    formData.append('success_url', `${req.headers.get('origin')}/donate?status=success`);
    formData.append('cancel_url', `${req.headers.get('origin')}/donate?status=cancelled`);
    formData.append('customer_name', name);
    formData.append('customer_email', email);

    console.log('Sending payment request to UmvaPay:', {
      identifier,
      amount,
      currency: currency || 'USD',
      email,
      name
    });

    // Make request to UmvaPay API
    const response = await fetch(`${UMVAPAY_BASE_URL}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const result = await response.json();
    console.log('UmvaPay response:', result);

    if (result.success === 'ok' && result.url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          checkout_url: result.url,
          transaction_id: identifier
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
