
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Target,
  Globe,
  Users
} from 'lucide-react';

interface ImpactLevel {
  amount: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface ImpactDisplayProps {
  finalAmount: number;
}

const ImpactDisplay: React.FC<ImpactDisplayProps> = ({ finalAmount }) => {
  const impactLevels: ImpactLevel[] = [
    {
      amount: 10,
      title: 'Community Supporter',
      description: 'Helps fund one article research',
      icon: Heart
    },
    {
      amount: 25,
      title: 'Story Enabler',
      description: 'Supports quality fact-checking for multiple stories',
      icon: Target
    },
    {
      amount: 50,
      title: 'Journalism Advocate',
      description: 'Funds a week of independent reporting',
      icon: Globe
    },
    {
      amount: 100,
      title: 'Media Champion',
      description: 'Supports a month of investigative journalism',
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Your Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {impactLevels.map((level) => (
            <div
              key={level.amount}
              className={`p-3 rounded-lg border ${
                finalAmount >= level.amount
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400'
                  : 'border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <level.icon className={`h-5 w-5 ${
                  finalAmount >= level.amount ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                <div>
                  <div className={`font-medium text-sm ${
                    finalAmount >= level.amount ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
                  }`}>{level.title}</div>
                  <div className={`text-xs ${
                    finalAmount >= level.amount ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>{level.description}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Why Your Support Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="dark:text-gray-300">Fund independent, unbiased reporting</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="dark:text-gray-300">Support investigative journalism</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="dark:text-gray-300">Keep our content accessible to everyone</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
            <p className="dark:text-gray-300">Maintain editorial independence</p>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">This Month's Impact</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="dark:text-gray-300">Articles Published:</span>
            <span className="font-semibold dark:text-white">127</span>
          </div>
          <div className="flex justify-between">
            <span className="dark:text-gray-300">Investigations:</span>
            <span className="font-semibold dark:text-white">8</span>
          </div>
          <div className="flex justify-between">
            <span className="dark:text-gray-300">Community Reached:</span>
            <span className="font-semibold dark:text-white">50K+</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactDisplay;
