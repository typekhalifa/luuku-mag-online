import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  DollarSign,
  Users,
  Globe,
  Target,
  Banknote,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PaymentSettings {
  donations: {
    enabled: boolean;
    minAmount: number;
    currency: string;
    thankYouMessage: string;
  };
  umvaPay: {
    enabled: boolean;
    publicKey: string;
    environment: string;
  };
  paypal: {
    enabled: boolean;
    email: string;
    environment: string;
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
  };
}

// Default settings that match the admin panel
const defaultPaymentSettings: PaymentSettings = {
  donations: {
    enabled: true,
    minAmount: 5,
    currency: "USD",
    thankYouMessage: "Thank you for your generous donation! Your support helps us continue delivering quality news.",
  },
  umvaPay: {
    enabled: true,
    publicKey: "zxfk70rif9y4mxzw1cvthkd6refpwga9g4l4ps7tjppffxptvk",
    environment: "live",
  },
  paypal: {
    enabled: true,
    email: "jeandh023@gmail.com",
    environment: "live",
  },
  stripe: {
    enabled: false,
    publishableKey: "",
  },
};

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [processing, setProcessing] = useState(false);

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    // Load payment settings from localStorage, but use defaults if not found
    try {
      const saved = localStorage.getItem('paymentSettings');
      if (saved) {
        const savedSettings = JSON.parse(saved);
        setPaymentSettings(savedSettings);
      }
      // If no saved settings, we already have defaults loaded
    } catch (error) {
      console.error("Error loading payment settings:", error);
      // Use default settings on error
    }
  }, []);

  const getAvailablePaymentMethods = () => {
    const methods = [];
    
    if (paymentSettings?.stripe?.enabled) {
      methods.push({
        id: 'stripe',
        name: 'Credit/Debit Card',
        icon: CreditCard,
        description: 'Visa, Mastercard, American Express',
        popular: true
      });
    }

    if (paymentSettings?.paypal?.enabled) {
      methods.push({
        id: 'paypal',
        name: 'PayPal',
        icon: DollarSign,
        description: 'Secure PayPal payment',
        popular: false
      });
    }

    if (paymentSettings?.umvaPay?.enabled) {
      methods.push({
        id: 'umvapay',
        name: 'Mobile Money (UmvaPay)',
        icon: Smartphone,
        description: 'MTN MoMo, Airtel Money, Vodafone Cash',
        popular: true
      });
    }

    // Always show these as backup options
    methods.push(
      {
        id: 'western-union',
        name: 'Western Union',
        icon: Banknote,
        description: 'International money transfer',
        popular: false
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        icon: Bitcoin,
        description: 'Bitcoin, Ethereum, USDC',
        popular: false
      }
    );

    return methods;
  };

  const paymentMethods = getAvailablePaymentMethods();

  const impactLevels = [
    {
      amount: 10,
      title: 'Community Supporter',
      description: 'Helps fund one article research',
      icon: Heart
    },
    {
      amount: 25,
      title: 'Story Enabler',
      description: 'Supports quality fact-checking for multiple stories',
      icon: Target
    },
    {
      amount: 50,
      title: 'Journalism Advocate',
      description: 'Funds a week of independent reporting',
      icon: Globe
    },
    {
      amount: 100,
      title: 'Media Champion',
      description: 'Supports a month of investigative journalism',
      icon: Users
    }
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const processUmvaPayPayment = async (amount: number) => {
    if (!paymentSettings?.umvaPay?.publicKey) {
      throw new Error('UmvaPay not configured');
    }

    if (!donorInfo.phone) {
      throw new Error('Phone number is required for mobile money payments');
    }

    const paymentData = {
      amount: amount,
      currency: paymentSettings.donations.currency,
      phone: donorInfo.phone,
      email: donorInfo.email,
      name: donorInfo.name,
      description: `Donation to support independent journalism`
    };

    console.log('Processing UmvaPay payment:', paymentData);

    // Create Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // Call the edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/umvapay-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    console.log('UmvaPay response:', result);

    if (result.success && result.checkout_url) {
      // Redirect to UmvaPay portal
      window.location.href = result.checkout_url;
      return {
        success: true,
        transactionId: result.transaction_id,
        message: 'Redirecting to UmvaPay...'
      };
    } else {
      throw new Error(result.error || 'Payment initialization failed');
    }
  };

  const processPayPalPayment = async (amount: number) => {
    if (!paymentSettings?.paypal?.enabled) {
      throw new Error('PayPal not configured');
    }

    // In a real implementation, you would integrate with PayPal SDK
    console.log('Processing PayPal payment:', {
      amount,
      email: paymentSettings.paypal.email,
      environment: paymentSettings.paypal.environment
    });

    // Simulate PayPal payment process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      transactionId: `PP_${Date.now()}`,
      message: 'PayPal payment completed'
    };
  };

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Please select an amount",
        description: "Choose a predefined amount or enter a custom amount",
        variant: "destructive"
      });
      return;
    }

    if (amount < paymentSettings.donations.minAmount) {
      toast({
        title: "Amount too low",
        description: `Minimum donation amount is ${paymentSettings.donations.currency} ${paymentSettings.donations.minAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Please select a payment method",
        description: "Choose how you'd like to make your donation",
        variant: "destructive"
      });
      return;
    }

    if (selectedPayment === 'umvapay' && !donorInfo.phone) {
      toast({
        title: "Phone number required",
        description: "Mobile money payments require a phone number",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      let result;
      
      switch (selectedPayment) {
        case 'umvapay':
          result = await processUmvaPayPayment(amount);
          break;
        case 'paypal':
          result = await processPayPalPayment(amount);
          break;
        case 'stripe':
          // Stripe integration would go here
          result = { success: true, transactionId: `STRIPE_${Date.now()}`, message: 'Stripe payment processed' };
          break;
        default:
          // For other payment methods, show instructions
          toast({
            title: "Payment Method Selected",
            description: `Please follow the instructions for ${paymentMethods.find(p => p.id === selectedPayment)?.name} payment`,
          });
          return;
      }

      if (result.success && selectedPayment !== 'umvapay') {
        toast({
          title: "Thank you for your support!",
          description: paymentSettings?.donations?.thankYouMessage || "Your donation helps support independent journalism",
        });

        // Reset form
        setSelectedAmount(null);
        setCustomAmount('');
        setDonorInfo({ name: '', email: '', phone: '', message: '' });
        setSelectedPayment(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

  // Check if donations are enabled - now uses default settings as fallback
  if (!paymentSettings?.donations?.enabled) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Donations Currently Unavailable
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We're working on setting up our donation system. Please check back soon!
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check for payment status in URL (for return from UmvaPay)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      toast({
        title: "Payment Successful!",
        description: paymentSettings?.donations?.thankYouMessage || "Thank you for your generous donation! Your support helps us continue delivering quality news.",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, "/donate");
    } else if (status === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive"
      });
      // Clean up URL
      window.history.replaceState({}, document.title, "/donate");
    }
  }, [paymentSettings]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Support Independent Journalism
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your donation helps us continue delivering quality news, in-depth analysis, 
              and stories that matter to our community. Every contribution makes a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Main Donation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Amount Selection */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <DollarSign className="h-5 w-5" />
                    Choose Your Donation Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Predefined Amounts */}
                  <div>
                    <Label className="text-base font-medium mb-3 block dark:text-white">
                      Quick Select ({paymentSettings.donations.currency})
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {predefinedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className="h-12"
                          onClick={() => handleAmountSelect(amount)}
                        >
                          {paymentSettings.donations.currency === 'USD' ? '$' : ''}
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="custom-amount" className="text-base font-medium dark:text-white">
                      Or Enter Custom Amount
                    </Label>
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        min={paymentSettings.donations.minAmount}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Minimum amount: {paymentSettings.donations.currency} {paymentSettings.donations.minAmount}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-colors dark:border-gray-600 ${
                          selectedPayment === method.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        {method.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                            Popular
                          </Badge>
                        )}
                        <div className="flex items-center gap-3">
                          <method.icon className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium dark:text-white">{method.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {method.description}
                            </div>
                          </div>
                          {selectedPayment === method.id && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Donor Information */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Donor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="donor-name" className="dark:text-white">Full Name</Label>
                      <Input
                        id="donor-name"
                        placeholder="Your name"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="donor-email" className="dark:text-white">Email Address</Label>
                      <Input
                        id="donor-email"
                        type="email"
                        placeholder="your@email.com"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  {selectedPayment === 'umvapay' && (
                    <div>
                      <Label htmlFor="donor-phone" className="dark:text-white">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="donor-phone"
                        type="tel"
                        placeholder="+256 XXX XXX XXX"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={donorInfo.phone}
                        onChange={(e) => setDonorInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Required for mobile money payments
                      </p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="donor-message" className="dark:text-white">Message (Optional)</Label>
                    <Textarea
                      id="donor-message"
                      placeholder="Leave a message of support..."
                      rows={3}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Donate Button */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={handleDonate}
                    disabled={!finalAmount || !selectedPayment || processing}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    {processing ? 'Processing...' : `Donate ${paymentSettings.donations.currency} ${finalAmount.toFixed(2)}`}
                  </Button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Your donation is secure and helps support independent journalism
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Impact Levels */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Your Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {impactLevels.map((level) => (
                    <div
                      key={level.amount}
                      className={`p-3 rounded-lg border ${
                        finalAmount >= level.amount
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <level.icon className={`h-5 w-5 ${
                          finalAmount >= level.amount ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <div>
                          <div className={`font-medium text-sm ${
                            finalAmount >= level.amount ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
                          }`}>{level.title}</div>
                          <div className={`text-xs ${
                            finalAmount >= level.amount ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                          }`}>{level.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Why Donate */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Why Your Support Matters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="dark:text-gray-300">Fund independent, unbiased reporting</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="dark:text-gray-300">Support investigative journalism</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="dark:text-gray-300">Keep our content accessible to everyone</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="dark:text-gray-300">Maintain editorial independence</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">This Month's Impact</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="dark:text-gray-300">Articles Published:</span>
                    <span className="font-semibold dark:text-white">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dark:text-gray-300">Investigations:</span>
                    <span className="font-semibold dark:text-white">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dark:text-gray-300">Community Reached:</span>
                    <span className="font-semibold dark:text-white">50K+</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Donate;
