import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WelcomeEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "LUUKU MAG <newsletter@luukumag.com>",
      to: [email],
      subject: "Welcome to LUUKU MAG Newsletter! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                          <span style="color: #00d4ff;">LUUKU</span> MAG
                        </h1>
                        <p style="margin: 10px 0 0; color: #cccccc; font-size: 16px;">
                          Your Modern Online Magazine
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: bold;">
                          Welcome to Our Community! 🎉
                        </h2>
                        
                        <p style="margin: 0 0 15px; color: #555555; font-size: 16px; line-height: 1.6;">
                          Thank you for subscribing to LUUKU MAG! We're thrilled to have you join our community of readers who are passionate about staying informed.
                        </p>
                        
                        <p style="margin: 0 0 15px; color: #555555; font-size: 16px; line-height: 1.6;">
                          You'll now receive our carefully curated newsletters featuring:
                        </p>
                        
                        <ul style="margin: 0 0 20px; padding-left: 20px; color: #555555; font-size: 16px; line-height: 1.8;">
                          <li><strong>Breaking News</strong> - Stay ahead with the latest updates</li>
                          <li><strong>In-Depth Analysis</strong> - Expert perspectives on current events</li>
                          <li><strong>Politics & Finance</strong> - Insights that matter</li>
                          <li><strong>Technology & Culture</strong> - Trends shaping our world</li>
                          <li><strong>Exclusive Content</strong> - Stories you won't find elsewhere</li>
                        </ul>
                        
                        <table role="presentation" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="https://luukumag.com" style="display: inline-block; padding: 15px 40px; background-color: #00d4ff; color: #000000; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                Explore LUUKU MAG
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #00d4ff; border-radius: 4px;">
                          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                            💡 <strong>Pro Tip:</strong> Add newsletter@luukumag.com to your contacts to ensure you never miss our updates!
                          </p>
                        </div>
                        
                        <p style="margin: 20px 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
                          We're excited to share our stories with you. Stay curious!
                        </p>
                        
                        <p style="margin: 15px 0 0; color: #555555; font-size: 16px; line-height: 1.6;">
                          Best regards,<br>
                          <strong>The LUUKU MAG Team</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Social Links -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td align="center">
                              <p style="margin: 0 0 15px; color: #999999; font-size: 14px;">
                                Connect with us:
                              </p>
                              <table role="presentation" style="display: inline-block;">
                                <tr>
                                  <td style="padding: 0 10px;">
                                    <a href="https://facebook.com/luukumag1" style="color: #00d4ff; text-decoration: none; font-size: 14px;">Facebook</a>
                                  </td>
                                  <td style="padding: 0 10px;">
                                    <a href="https://twitter.com/luukumag1" style="color: #00d4ff; text-decoration: none; font-size: 14px;">Twitter</a>
                                  </td>
                                  <td style="padding: 0 10px;">
                                    <a href="https://instagram.com/luukumag1" style="color: #00d4ff; text-decoration: none; font-size: 14px;">Instagram</a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                          © ${new Date().getFullYear()} LUUKU MAG. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                          You're receiving this email because you subscribed to our newsletter.<br>
                          Don't want these emails? You can unsubscribe anytime from our website.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

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
    console.error("Error in send-welcome-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
