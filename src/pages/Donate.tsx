import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import AmountSelector from '@/components/donate/AmountSelector';
import PaymentMethodSelector from '@/components/donate/PaymentMethodSelector';
import DonorInformation from '@/components/donate/DonorInformation';
import ImpactDisplay from '@/components/donate/ImpactDisplay';
import DonateButton from '@/components/donate/DonateButton';
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  DollarSign,
  Banknote
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface DonorInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Default settings that match the admin panel
const defaultPaymentSettings: PaymentSettings = {
  donations: {
    enabled: true,
    minAmount: 1,
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
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [processing, setProcessing] = useState(false);

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

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleDonorInfoChange = (field: keyof DonorInfo, value: string) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
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

    try {
      // Use Supabase client to invoke the edge function
      const { data, error } = await supabase.functions.invoke('umvapay-payment', {
        body: paymentData
      });

      console.log('UmvaPay response:', data);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Payment initialization failed');
      }

      if (data.success && data.checkout_url) {
        // Redirect to UmvaPay portal
        window.location.href = data.checkout_url;
        return {
          success: true,
          transactionId: data.transaction_id,
          message: 'Redirecting to UmvaPay...'
        };
      } else {
        throw new Error(data.error || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
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
              <AmountSelector
                selectedAmount={selectedAmount}
                customAmount={customAmount}
                currency={paymentSettings.donations.currency}
                minAmount={paymentSettings.donations.minAmount}
                onAmountSelect={handleAmountSelect}
                onCustomAmountChange={handleCustomAmountChange}
              />

              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedPayment={selectedPayment}
                onPaymentSelect={setSelectedPayment}
              />

              <DonorInformation
                donorInfo={donorInfo}
                selectedPayment={selectedPayment}
                onDonorInfoChange={handleDonorInfoChange}
              />

              <DonateButton
                finalAmount={finalAmount}
                selectedPayment={selectedPayment}
                processing={processing}
                currency={paymentSettings.donations.currency}
                onDonate={handleDonate}
              />
            </div>

            {/* Sidebar */}
            <div>
              <ImpactDisplay finalAmount={finalAmount} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Donate;
