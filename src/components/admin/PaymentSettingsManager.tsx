
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { SaveIcon, RefreshCwIcon } from "lucide-react";
import DonationSettings from "./payment/DonationSettings";
import UmvaPaySettings from "./payment/UmvaPaySettings";
import PayPalSettings from "./payment/PayPalSettings";
import StripeSettings from "./payment/StripeSettings";
import MobileMoneySettings from "./payment/MobileMoneySettings";

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
        <DonationSettings 
          settings={settings.donations}
          onSettingChange={(field, value) => handleInputChange('donations', field, value)}
        />
        
        <UmvaPaySettings 
          settings={settings.umvaPay}
          onSettingChange={(field, value) => handleInputChange('umvaPay', field, value)}
        />
        
        <PayPalSettings 
          settings={settings.paypal}
          onSettingChange={(field, value) => handleInputChange('paypal', field, value)}
        />
        
        <StripeSettings 
          settings={settings.stripe}
          onSettingChange={(field, value) => handleInputChange('stripe', field, value)}
        />
        
        <MobileMoneySettings 
          settings={settings.mobileMoney}
          onSettingChange={(field, value) => handleInputChange('mobileMoney', field, value)}
        />
      </div>
    </div>
  );
};

export default PaymentSettingsManager;
