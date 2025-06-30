
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  DollarSign,
  Banknote,
  CheckCircle
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  popular: boolean;
}

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedPayment: string | null;
  onPaymentSelect: (paymentId: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedPayment,
  onPaymentSelect
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <CreditCard className="h-5 w-5" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-colors dark:border-gray-600 ${
                selectedPayment === method.id
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => onPaymentSelect(method.id)}
            >
              {method.popular && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                  Popular
                </Badge>
              )}
              <div className="flex items-center gap-3">
                <method.icon className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <div className="font-medium dark:text-white">{method.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {method.description}
                  </div>
                </div>
                {selectedPayment === method.id && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
