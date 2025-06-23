
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCardIcon } from "lucide-react";

interface DonationSettingsProps {
  settings: {
    enabled: boolean;
    minAmount: number;
    currency: string;
    thankYouMessage: string;
  };
  onSettingChange: (field: string, value: string | boolean | number) => void;
}

const DonationSettings: React.FC<DonationSettingsProps> = ({ settings, onSettingChange }) => {
  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minAmount">Minimum Donation Amount</Label>
            <Input
              id="minAmount"
              type="number"
              value={settings.minAmount}
              onChange={(e) => onSettingChange('minAmount', Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => onSettingChange('currency', value)}
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
            value={settings.thankYouMessage}
            onChange={(e) => onSettingChange('thankYouMessage', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationSettings;
