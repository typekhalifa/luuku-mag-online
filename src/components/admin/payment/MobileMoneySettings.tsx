
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MobileMoneySettingsProps {
  settings: {
    enabled: boolean;
    mtnMomoApiKey: string;
    airtelMoneyApiKey: string;
  };
  onSettingChange: (field: string, value: string | boolean) => void;
}

const MobileMoneySettings: React.FC<MobileMoneySettingsProps> = ({ settings, onSettingChange }) => {
  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        {settings.enabled && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="mtnMomoApiKey">MTN MoMo API Key</Label>
                <Input
                  id="mtnMomoApiKey"
                  type="password"
                  value={settings.mtnMomoApiKey}
                  onChange={(e) => onSettingChange('mtnMomoApiKey', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="airtelMoneyApiKey">Airtel Money API Key</Label>
                <Input
                  id="airtelMoneyApiKey"
                  type="password"
                  value={settings.airtelMoneyApiKey}
                  onChange={(e) => onSettingChange('airtelMoneyApiKey', e.target.value)}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMoneySettings;
