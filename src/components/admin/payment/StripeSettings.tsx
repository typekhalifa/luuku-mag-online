
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldIcon } from "lucide-react";

interface StripeSettingsProps {
  settings: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
  };
  onSettingChange: (field: string, value: string | boolean) => void;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ settings, onSettingChange }) => {
  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        {settings.enabled && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                <Input
                  id="stripePublishableKey"
                  value={settings.publishableKey}
                  onChange={(e) => onSettingChange('publishableKey', e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="stripeSecretKey">Secret Key</Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={settings.secretKey}
                  onChange={(e) => onSettingChange('secretKey', e.target.value)}
                  placeholder="sk_test_..."
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeSettings;
