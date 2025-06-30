
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface DonateButtonProps {
  finalAmount: number;
  selectedPayment: string | null;
  processing: boolean;
  currency: string;
  onDonate: () => void;
}

const DonateButton: React.FC<DonateButtonProps> = ({
  finalAmount,
  selectedPayment,
  processing,
  currency,
  onDonate
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="pt-6">
        <Button
          size="lg"
          className="w-full text-lg"
          onClick={onDonate}
          disabled={!finalAmount || !selectedPayment || processing}
        >
          <Heart className="mr-2 h-5 w-5" />
          {processing ? 'Processing...' : `Donate ${currency} ${finalAmount.toFixed(2)}`}
        </Button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
          Your donation is secure and helps support independent journalism
        </p>
      </CardContent>
    </Card>
  );
};

export default DonateButton;
