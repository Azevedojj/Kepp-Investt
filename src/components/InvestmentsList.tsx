import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '../store/useLocaleStore';
import { formatCurrency } from '../utils/formatCurrency';
import type { Investment } from '../types';

interface InvestmentsListProps {
  investments: Investment[];
}

export const InvestmentsList: React.FC<InvestmentsListProps> = ({ investments }) => {
  const { currentLocale } = useLocaleStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {investments.map((investment) => {
        const returnValue = investment.amount * (investment.return / 100);
        const isPositive = investment.return >= 0;

        return (
          <div key={investment.id} className="card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{investment.name}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(investment.date).toLocaleDateString(currentLocale.code)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatCurrency(investment.amount, currentLocale)}
                </p>
                <div className={`inline-flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}{investment.return}% (
                    {formatCurrency(Math.abs(returnValue), currentLocale)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 