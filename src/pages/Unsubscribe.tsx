import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Heart, ArrowLeft } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (token) {
      checkSubscriptionStatus();
    }
  }, [token]);

  const checkSubscriptionStatus = async () => {
    if (!token) return;
    
    const { data } = await supabase
      .from("newsletter_subscriptions" as any)
      .select("email, status")
      .eq("unsubscribe_token", token)
      .maybeSingle();
    
    if (data) {
      setEmail((data as any).email);
      if ((data as any).status === "unsubscribed") {
        setUnsubscribed(true);
      }
    }
  };

  const handleUnsubscribe = async () => {
    if (!token) {
      toast.error("Invalid unsubscribe link");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions" as any)
        .update({ 
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString()
        })
        .eq("unsubscribe_token", token);

      if (error) throw error;

      // Optionally save feedback
      if (feedback.trim()) {
        await supabase.from("contacts").insert({
          email: email,
          name: "Newsletter Unsubscribe Feedback",
          message: `Unsubscribe reason: ${feedback}`,
          subject: "Newsletter Unsubscribe Feedback"
        });
      }

      setUnsubscribed(true);
      toast.success("You've been unsubscribed successfully");
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions" as any)
        .update({ 
          status: "active",
          unsubscribed_at: null
        })
        .eq("unsubscribe_token", token);

      if (error) throw error;

      toast.success("Welcome back! You're subscribed again 🎉");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error resubscribing:", error);
      toast.error("Failed to resubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>This unsubscribe link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (unsubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>You've Been Unsubscribed</CardTitle>
            <CardDescription>
              We're sorry to see you go. You will no longer receive newsletters from LUUKU MAG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Changed your mind?
              </p>
              <Button 
                onClick={handleResubscribe} 
                disabled={loading}
                className="w-full"
              >
                <Heart className="mr-2 h-4 w-4" />
                Resubscribe to Newsletter
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle>We'll Miss You!</CardTitle>
          <CardDescription>
            Are you sure you want to unsubscribe from LUUKU MAG newsletter?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium">By staying subscribed, you'll get:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
              <li>Breaking news and trending stories</li>
              <li>Exclusive in-depth articles</li>
              <li>Expert insights and analysis</li>
              <li>Special subscriber-only content</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Help us improve (optional)
            </label>
            <Textarea
              placeholder="Why are you unsubscribing? Your feedback helps us serve you better..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUnsubscribe} 
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? "Processing..." : "Yes, Unsubscribe"}
            </Button>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              No, Keep Me Subscribed
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can always resubscribe later on our website
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
