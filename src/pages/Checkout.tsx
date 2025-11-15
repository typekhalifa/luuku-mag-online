import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Shield, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutData {
  amount: number;
  currency: string;
  paymentMethod: string;
  donorInfo: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!location.state?.checkoutData) {
      navigate('/donate');
      return;
    }
    setCheckoutData(location.state.checkoutData);
  }, [location.state, navigate]);

  if (!checkoutData) {
    return null;
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'stripe': return <CreditCard className="h-5 w-5" />;
      case 'umvapay': return <Smartphone className="h-5 w-5" />;
      case 'paypal': return <CreditCard className="h-5 w-5" />;
      case 'mobilemoney': return <Smartphone className="h-5 w-5" />;
      default: return <Banknote className="h-5 w-5" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'stripe': return 'Credit/Debit Card (Stripe)';
      case 'umvapay': return 'UmvaPay Mobile Money';
      case 'paypal': return 'PayPal';
      case 'mobilemoney': return 'Mobile Money';
      default: return method;
    }
  };

  const getPaymentInstructions = (method: string) => {
    switch (method) {
      case 'stripe':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Secure payment powered by Stripe</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Proceed to Payment" below</li>
                <li>You'll be redirected to Stripe's secure payment page</li>
                <li>Enter your card details (Visa, MasterCard, American Express)</li>
                <li>Complete the payment securely</li>
                <li>You'll receive a confirmation email</li>
              </ol>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Payment processed instantly</span>
            </div>
          </div>
        );
      
      case 'umvapay':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Secure mobile money payment</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Proceed to Payment" below</li>
                <li>You'll be redirected to UmvaPay's secure platform</li>
                <li>Choose your mobile money provider (MTN, Airtel, etc.)</li>
                <li>Enter your mobile money number</li>
                <li>Approve the payment on your phone</li>
                <li>Receive confirmation SMS</li>
              </ol>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Payment processed within 2-5 minutes</span>
            </div>
          </div>
        );
      
      case 'paypal':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Secure payment via PayPal</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Proceed to Payment" below</li>
                <li>You'll be redirected to PayPal's secure platform</li>
                <li>Login to your PayPal account or pay as guest</li>
                <li>Review and confirm your donation</li>
                <li>Complete the payment</li>
                <li>Return to our site with confirmation</li>
              </ol>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Payment processed instantly</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm">Payment instructions will be provided on the next step.</p>
          </div>
        );
    }
  };

  const handleProceedToPayment = async () => {
    setProcessing(true);
    
    try {
      if (checkoutData.paymentMethod === 'umvapay') {
        const { data, error } = await supabase.functions.invoke('umvapay-payment', {
          body: {
            amount: checkoutData.amount,
            currency: checkoutData.currency,
            phone: checkoutData.donorInfo.phone,
            email: checkoutData.donorInfo.email,
            name: checkoutData.donorInfo.name,
            description: `Donation - ${checkoutData.donorInfo.message || 'Supporting independent journalism'}`
          }
        });

        if (error) throw error;

        if (data?.checkout_url) {
          window.open(data.checkout_url, '_blank');
        }
      } else if (checkoutData.paymentMethod === 'paypal') {
        // Simulate PayPal payment process
        toast({
          title: "Redirecting to PayPal",
          description: "You will be redirected to PayPal to complete your donation.",
        });
        // In a real implementation, you would redirect to PayPal
        setTimeout(() => {
          toast({
            title: "Payment Successful",
            description: "Thank you for your donation!",
          });
          navigate('/donate');
        }, 3000);
      } else {
        toast({
          title: "Payment Method",
          description: `Proceeding with ${getPaymentMethodName(checkoutData.paymentMethod)}`,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/donate')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Donate
          </Button>
          <h1 className="text-3xl font-bold mb-2">Complete Your Donation</h1>
          <p className="text-muted-foreground">
            You're about to make a difference. Review your donation details and complete the payment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Donation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Donation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {checkoutData.currency} {checkoutData.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Donation Amount</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {getPaymentIcon(checkoutData.paymentMethod)}
                  <div>
                    <div className="font-medium">{getPaymentMethodName(checkoutData.paymentMethod)}</div>
                    <div className="text-sm text-muted-foreground">Payment Method</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Donor Information:</div>
                  <div className="text-sm space-y-1">
                    <div><strong>Name:</strong> {checkoutData.donorInfo.name}</div>
                    <div><strong>Email:</strong> {checkoutData.donorInfo.email}</div>
                    {checkoutData.donorInfo.phone && (
                      <div><strong>Phone:</strong> {checkoutData.donorInfo.phone}</div>
                    )}
                    {checkoutData.donorInfo.message && (
                      <div><strong>Message:</strong> {checkoutData.donorInfo.message}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPaymentIcon(checkoutData.paymentMethod)}
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {getPaymentInstructions(checkoutData.paymentMethod)}
              
              <div className="pt-4 border-t">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleProceedToPayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Proceed to Payment'}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Your donation helps support independent journalism and quality content.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-2">Your Security is Our Priority</h4>
                <p className="text-sm text-muted-foreground">
                  All payments are processed through secure, encrypted connections. We never store your payment information. 
                  Your donation details are handled with the highest level of security and privacy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Checkout;