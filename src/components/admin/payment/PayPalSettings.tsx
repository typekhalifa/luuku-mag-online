
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PayPalSettingsProps {
  settings: {
    enabled: boolean;
    email: string;
    environment: string;
  };
  onSettingChange: (field: string, value: string | boolean) => void;
}

const PayPalSettings: React.FC<PayPalSettingsProps> = ({ settings, onSettingChange }) => {
  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        {settings.enabled && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="paypalEmail">PayPal Email</Label>
                <Input
                  id="paypalEmail"
                  type="email"
                  value={settings.email}
                  onChange={(e) => onSettingChange('email', e.target.value)}
                  placeholder="your@paypal.com"
                />
              </div>
              <div>
                <Label htmlFor="paypalEnvironment">Environment</Label>
                <Select
                  value={settings.environment}
                  onValueChange={(value) => onSettingChange('environment', value)}
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
  );
};

export default PayPalSettings;
