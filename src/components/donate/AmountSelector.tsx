
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

interface AmountSelectorProps {
  selectedAmount: number | null;
  customAmount: string;
  currency: string;
  minAmount: number;
  onAmountSelect: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
}

const AmountSelector: React.FC<AmountSelectorProps> = ({
  selectedAmount,
  customAmount,
  currency,
  minAmount,
  onAmountSelect,
  onCustomAmountChange
}) => {
  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <DollarSign className="h-5 w-5" />
          Choose Your Donation Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block dark:text-white">
            Quick Select ({currency})
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                className="h-12"
                onClick={() => onAmountSelect(amount)}
              >
                {currency === 'USD' ? '$' : ''}
                {amount}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="custom-amount" className="text-base font-medium dark:text-white">
            Or Enter Custom Amount
          </Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="custom-amount"
              type="number"
              placeholder="0.00"
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={customAmount}
              onChange={(e) => onCustomAmountChange(e.target.value)}
              min={minAmount}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Minimum amount: {currency} {minAmount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AmountSelector;
