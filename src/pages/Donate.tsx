
import React, { useState } from 'react';
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
  Banknote
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      popular: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: DollarSign,
      description: 'Secure PayPal payment',
      popular: false
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'M-Pesa, MTN Mobile Money, Airtel Money',
      popular: true
    },
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
  ];

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

  const handleDonate = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Please select an amount",
        description: "Choose a predefined amount or enter a custom amount",
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

    // Here you would integrate with actual payment processors
    toast({
      title: "Thank you for your support!",
      description: `Donation of $${amount} will be processed via ${paymentMethods.find(p => p.id === selectedPayment)?.name}`,
    });

    console.log('Donation details:', {
      amount,
      paymentMethod: selectedPayment,
      donorInfo
    });
  };

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

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
                      Quick Select
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {predefinedAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className="h-12"
                          onClick={() => handleAmountSelect(amount)}
                        >
                          ${amount}
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
                      />
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <div>
                            <div className="font-medium dark:text-white">{method.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Donor Information */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Donor Information (Optional)</CardTitle>
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
                    disabled={!finalAmount || !selectedPayment}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    Donate ${finalAmount.toFixed(2)}
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

              {/* Monthly Impact */}
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
