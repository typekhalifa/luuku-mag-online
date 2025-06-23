
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon, CreditCardIcon, ShieldIcon } from "lucide-react";

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
    clientId: string;
    clientSecret: string;
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
      enabled: true,
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
      enabled: false,
      clientId: "",
      clientSecret: "",
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
                    <Label htmlFor="paypalClientId">Client ID</Label>
                    <Input
                      id="paypalClientId"
                      value={settings.paypal.clientId}
                      onChange={(e) => handleInputChange('paypal', 'clientId', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paypalClientSecret">Client Secret</Label>
                    <Input
                      id="paypalClientSecret"
                      type="password"
                      value={settings.paypal.clientSecret}
                      onChange={(e) => handleInputChange('paypal', 'clientSecret', e.target.value)}
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
            <CardTitle>Mobile Money Configuration</CardTitle>
            <CardDescription>Configure mobile money payment options for African markets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mobileMoneyEnabled">Enable Mobile Money</Label>
                <p className="text-sm text-muted-foreground">Accept MTN MoMo and Airtel Money</p>
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
