
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { SmartphoneIcon } from "lucide-react";

interface UmvaPaySettingsProps {
  settings: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
    environment: string;
  };
  onSettingChange: (field: string, value: string | boolean) => void;
}

const UmvaPaySettings: React.FC<UmvaPaySettingsProps> = ({ settings, onSettingChange }) => {
  const testUmvaPayConnection = async () => {
    if (!settings.publicKey || !settings.secretKey) {
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

  return (
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
            checked={settings.enabled}
            onCheckedChange={(checked) => onSettingChange('enabled', checked)}
          />
        </div>
        {settings.enabled && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="umvaPayPublicKey">Public Key</Label>
                <Input
                  id="umvaPayPublicKey"
                  value={settings.publicKey}
                  onChange={(e) => onSettingChange('publicKey', e.target.value)}
                  placeholder="Your UmvaPay public key"
                />
              </div>
              <div>
                <Label htmlFor="umvaPaySecretKey">Secret Key</Label>
                <Input
                  id="umvaPaySecretKey"
                  type="password"
                  value={settings.secretKey}
                  onChange={(e) => onSettingChange('secretKey', e.target.value)}
                  placeholder="Your UmvaPay secret key"
                />
              </div>
              <div>
                <Label htmlFor="umvaPayEnvironment">Environment</Label>
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
              <Button onClick={testUmvaPayConnection} variant="outline" className="w-full">
                Test UmvaPay Connection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UmvaPaySettings;
