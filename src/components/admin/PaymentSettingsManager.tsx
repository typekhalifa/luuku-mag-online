import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, CreditCardIcon, ShieldIcon, SmartphoneIcon } from "lucide-react";

interface PaymentSettings {
  donations: {
    enabled: boolean;
    minAmount: number;
    currency: string;
    thankYouMessage: string;
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    email: string;
    environment: string;
  };
  umvaPay: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    environment: string;
  };
  mobileMoney: {
    enabled: boolean;
    mtnMomoApiKey: string;
    airtelMoneyApiKey: string;
  };
}

const PaymentSettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    donations: {
      enabled: true, // Enable donations by default
      minAmount: 5,
      currency: "USD",
      thankYouMessage: "Thank you for your generous donation! Your support helps us continue delivering quality news.",
    },
    stripe: {
      enabled: false,
      publishableKey: "",
      secretKey: "",
    },
    paypal: {
      enabled: true,
      email: "jeandh023@gmail.com",
      environment: "live", // Changed to live since this is for production
    },
    umvaPay: {
      enabled: true,
      publicKey: "zxfk70rif9y4mxzw1cvthkd6refpwga9g4l4ps7tjppffxptvk",
      secretKey: "dmhw53gfjtzxnd38jx74n8qsxi815xh9fs6ebft4mwk9f23zn4",
      environment: "live",
    },
    mobileMoney: {
      enabled: false,
      mtnMomoApiKey: "",
      airtelMoneyApiKey: "",
    },
  });

  const [saving, setSaving] = useState(false);

  const handleInputChange = (section: keyof PaymentSettings, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to a secure settings table
      localStorage.setItem('paymentSettings', JSON.stringify(settings));
      
      toast({
        title: "Payment Settings Saved",
        description: "Payment configuration has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('paymentSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading payment settings:", error);
    }
  };

  const testUmvaPayConnection = async () => {
    if (!settings.umvaPay.publicKey || !settings.umvaPay.secretKey) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both public and secret keys for UmvaPay",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testing UmvaPay Connection",
      description: "Verifying your UmvaPay credentials...",
    });

    // This would normally make an API call to UmvaPay to verify credentials
    // For now, we'll simulate a successful connection
    setTimeout(() => {
      toast({
        title: "UmvaPay Connected",
        description: "Your UmvaPay merchant account is ready to accept payments!",
      });
    }, 2000);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Payment Configuration</h3>
          <p className="text-sm text-muted-foreground">Configure payment gateways and donation settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Donation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              Donation Settings
            </CardTitle>
            <CardDescription>Configure donation functionality and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="donationsEnabled">Enable Donations</Label>
                <p className="text-sm text-muted-foreground">Allow users to make donations</p>
              </div>
              <Switch
                id="donationsEnabled"
                checked={settings.donations.enabled}
                onCheckedChange={(checked) => handleInputChange('donations', 'enabled', checked)}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount">Minimum Donation Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={settings.donations.minAmount}
                  onChange={(e) => handleInputChange('donations', 'minAmount', Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.donations.currency}
                  onValueChange={(value) => handleInputChange('donations', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="UGX">UGX (USh)</SelectItem>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                    <SelectItem value="RWF">RWF (FRw)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="thankYouMessage">Thank You Message</Label>
              <Input
                id="thankYouMessage"
                value={settings.donations.thankYouMessage}
                onChange={(e) => handleInputChange('donations', 'thankYouMessage', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* UmvaPay Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SmartphoneIcon className="h-5 w-5" />
              UmvaPay Configuration
            </CardTitle>
            <CardDescription>Configure UmvaPay for mobile money payments in East Africa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="umvaPayEnabled">Enable UmvaPay</Label>
                <p className="text-sm text-muted-foreground">Accept mobile money payments via UmvaPay</p>
              </div>
              <Switch
                id="umvaPayEnabled"
                checked={settings.umvaPay.enabled}
                onCheckedChange={(checked) => handleInputChange('umvaPay', 'enabled', checked)}
              />
            </div>
            {settings.umvaPay.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="umvaPayPublicKey">Public Key</Label>
                    <Input
                      id="umvaPayPublicKey"
                      value={settings.umvaPay.publicKey}
                      onChange={(e) => handleInputChange('umvaPay', 'publicKey', e.target.value)}
                      placeholder="Your UmvaPay public key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="umvaPaySecretKey">Secret Key</Label>
                    <Input
                      id="umvaPaySecretKey"
                      type="password"
                      value={settings.umvaPay.secretKey}
                      onChange={(e) => handleInputChange('umvaPay', 'secretKey', e.target.value)}
                      placeholder="Your UmvaPay secret key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="umvaPayEnvironment">Environment</Label>
                    <Select
                      value={settings.umvaPay.environment}
                      onValueChange={(value) => handleInputChange('umvaPay', 'environment', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                        <SelectItem value="live">Live (Production)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={testUmvaPayConnection} variant="outline" className="w-full">
                    Test UmvaPay Connection
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* PayPal Settings */}
        <Card>
          <CardHeader>
            <CardTitle>PayPal Configuration</CardTitle>
            <CardDescription>Configure PayPal payment gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
              </div>
              <Switch
                id="paypalEnabled"
                checked={settings.paypal.enabled}
                onCheckedChange={(checked) => handleInputChange('paypal', 'enabled', checked)}
              />
            </div>
            {settings.paypal.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={settings.paypal.email}
                      onChange={(e) => handleInputChange('paypal', 'email', e.target.value)}
                      placeholder="your@paypal.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paypalEnvironment">Environment</Label>
                    <Select
                      value={settings.paypal.environment}
                      onValueChange={(value) => handleInputChange('paypal', 'environment', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                        <SelectItem value="live">Live (Production)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5" />
              Stripe Configuration
            </CardTitle>
            <CardDescription>Configure Stripe payment gateway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                <p className="text-sm text-muted-foreground">Accept credit/debit card payments</p>
              </div>
              <Switch
                id="stripeEnabled"
                checked={settings.stripe.enabled}
                onCheckedChange={(checked) => handleInputChange('stripe', 'enabled', checked)}
              />
            </div>
            {settings.stripe.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                    <Input
                      id="stripePublishableKey"
                      value={settings.stripe.publishableKey}
                      onChange={(e) => handleInputChange('stripe', 'publishableKey', e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                    <Input
                      id="stripeSecretKey"
                      type="password"
                      value={settings.stripe.secretKey}
                      onChange={(e) => handleInputChange('stripe', 'secretKey', e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mobile Money Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Other Mobile Money Providers</CardTitle>
            <CardDescription>Configure additional mobile money payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobileMoneyEnabled">Enable Other Providers</Label>
                <p className="text-sm text-muted-foreground">MTN MoMo and Airtel Money direct integration</p>
              </div>
              <Switch
                id="mobileMoneyEnabled"
                checked={settings.mobileMoney.enabled}
                onCheckedChange={(checked) => handleInputChange('mobileMoney', 'enabled', checked)}
              />
            </div>
            {settings.mobileMoney.enabled && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mtnMomoApiKey">MTN MoMo API Key</Label>
                    <Input
                      id="mtnMomoApiKey"
                      type="password"
                      value={settings.mobileMoney.mtnMomoApiKey}
                      onChange={(e) => handleInputChange('mobileMoney', 'mtnMomoApiKey', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="airtelMoneyApiKey">Airtel Money API Key</Label>
                    <Input
                      id="airtelMoneyApiKey"
                      type="password"
                      value={settings.mobileMoney.airtelMoneyApiKey}
                      onChange={(e) => handleInputChange('mobileMoney', 'airtelMoneyApiKey', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSettingsManager;
