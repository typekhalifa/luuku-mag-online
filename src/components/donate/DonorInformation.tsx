
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DonorInfo {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface DonorInformationProps {
  donorInfo: DonorInfo;
  selectedPayment: string | null;
  onDonorInfoChange: (field: keyof DonorInfo, value: string) => void;
}

const DonorInformation: React.FC<DonorInformationProps> = ({
  donorInfo,
  selectedPayment,
  onDonorInfoChange
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Donor Information</CardTitle>
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
              onChange={(e) => onDonorInfoChange('name', e.target.value)}
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
              onChange={(e) => onDonorInfoChange('email', e.target.value)}
            />
          </div>
        </div>
        {selectedPayment === 'umvapay' && (
          <div>
            <Label htmlFor="donor-phone" className="dark:text-white">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="donor-phone"
              type="tel"
              placeholder="+256 XXX XXX XXX"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={donorInfo.phone}
              onChange={(e) => onDonorInfoChange('phone', e.target.value)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Required for mobile money payments
            </p>
          </div>
        )}
        <div>
          <Label htmlFor="donor-message" className="dark:text-white">Message (Optional)</Label>
          <Textarea
            id="donor-message"
            placeholder="Leave a message of support..."
            rows={3}
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={donorInfo.message}
            onChange={(e) => onDonorInfoChange('message', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorInformation;
