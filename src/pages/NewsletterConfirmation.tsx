import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Mail, Heart, Briefcase, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const NewsletterConfirmation = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className={`transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <CheckCircle className="mx-auto text-green-500 mb-4" size={80} />
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                Welcome to <span className="text-highlight">LUUKU</span> MAG!
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                Thank you for subscribing to our newsletter
              </p>
              {email && (
                <p className="text-muted-foreground">
                  We've sent a confirmation to <span className="font-semibold text-foreground">{email}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Newsletter Benefits */}
            <Card className={`transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <CardContent className="p-6 text-center">
                <Mail className="mx-auto text-highlight mb-4" size={48} />
                <h3 className="text-xl font-bold font-heading mb-3">Weekly Updates</h3>
                <p className="text-muted-foreground">
                  Get the latest news, politics, technology, and culture stories delivered to your inbox every week.
                </p>
              </CardContent>
            </Card>

            {/* Exclusive Content */}
            <Card className={`transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <CardContent className="p-6 text-center">
                <Gift className="mx-auto text-highlight mb-4" size={48} />
                <h3 className="text-xl font-bold font-heading mb-3">Exclusive Promotions</h3>
                <p className="text-muted-foreground">
                  Be the first to know about special offers, early access to content, and subscriber-only promotions.
                </p>
              </CardContent>
            </Card>

            {/* Career Opportunities */}
            <Card className={`transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} md:col-span-2 lg:col-span-1`}>
              <CardContent className="p-6 text-center">
                <Briefcase className="mx-auto text-highlight mb-4" size={48} />
                <h3 className="text-xl font-bold font-heading mb-3">Career Opportunities</h3>
                <p className="text-muted-foreground">
                  Discover exclusive job postings, internships, and career development opportunities in journalism and media.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <div className={`bg-card border rounded-xl p-8 mb-8 transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="text-center">
              <Heart className="mx-auto text-red-500 mb-4" size={48} />
              <h2 className="text-2xl font-bold font-heading mb-4">Support Independent Journalism</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                LUUKU MAG is committed to delivering high-quality, independent journalism. 
                Your support helps us continue bringing you unbiased news and in-depth analysis. 
                Every contribution, no matter the size, makes a difference in maintaining our editorial independence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-highlight hover:bg-highlight/90 text-white">
                  <Link to="/donate">
                    Support Our Work
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/articles">
                    Read Latest Articles
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className={`text-center transition-all duration-1000 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h3 className="text-xl font-bold font-heading mb-4">What's Next?</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-muted/50 rounded-lg">
                <strong className="block mb-2">1. Check Your Email</strong>
                <p className="text-muted-foreground">Look for our welcome email with additional details</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <strong className="block mb-2">2. Follow Us</strong>
                <p className="text-muted-foreground">Stay connected on social media for real-time updates</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <strong className="block mb-2">3. Explore Articles</strong>
                <p className="text-muted-foreground">Discover our latest stories and featured content</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <strong className="block mb-2">4. Share With Friends</strong>
                <p className="text-muted-foreground">Help us grow by sharing LUUKU MAG with others</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="mr-4">
              <Link to="/">
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link to="/articles">
                Start Reading
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewsletterConfirmation;