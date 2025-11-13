import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactReplyRequest {
  messageId: string;
  replyMessage: string;
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

    const { messageId, replyMessage }: ContactReplyRequest = await req.json();

    const { data: message, error: messageError } = await supabaseClient
      .from("contact_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      console.error("Error fetching message:", messageError);
      return new Response(
        JSON.stringify({ error: "Message not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "LUUKU MAG <support@luukumag.com>",
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <h2>Thank you for contacting LUUKU MAG</h2>
        <p>Dear ${message.name},</p>
        <p>${replyMessage}</p>
        <hr />
        <p><strong>Your original message:</strong></p>
        <p>${message.message}</p>
        <br />
        <p>Best regards,<br>LUUKU MAG Team</p>
      `,
    });

    await supabaseClient
      .from("contact_messages")
      .update({ replied: true, reply_message: replyMessage })
      .eq("id", messageId);

    console.log("Reply sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
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
    console.error("Error in send-contact-reply function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
