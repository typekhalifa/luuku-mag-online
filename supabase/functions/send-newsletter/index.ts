import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, content }: NewsletterRequest = await req.json();

    const { data: subscribers, error: subError } = await supabaseClient
      .from("newsletter_subscriptions")
      .select("email, unsubscribe_token")
      .eq("status", "active");

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send individual emails with personalized unsubscribe links
    const emailPromises = subscribers.map((sub) => {
      const unsubscribeLink = sub.unsubscribe_token 
        ? `https://luukumag.com/unsubscribe?token=${sub.unsubscribe_token}`
        : 'https://luukumag.com';
      
      const htmlWithUnsubscribe = `
        ${content}
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="text-align: center; color: #999999; font-size: 12px; line-height: 1.5;">
          © ${new Date().getFullYear()} LUUKU MAG. All rights reserved.<br>
          <a href="${unsubscribeLink}" style="color: #00d4ff; text-decoration: underline;">Unsubscribe from this list</a>
        </p>
      `;
      
      return resend.emails.send({
        from: "LUUKU MAG <newsletter@luukumag.com>",
        to: [sub.email],
        subject: subject,
        html: htmlWithUnsubscribe,
      });
    });

    const emailResponse = await Promise.all(emailPromises);

    console.log("Newsletter sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: subscribers.length,
        response: emailResponse,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
