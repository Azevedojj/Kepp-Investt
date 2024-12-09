import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '../store/useLocaleStore';
import { formatCurrency } from '../utils/currency';
import { TrendingDown } from 'lucide-react';

interface ExpensesCardProps {
  value: number;
}

export const ExpensesCard: React.FC<ExpensesCardProps> = ({ value }) => {
  const { t } = useTranslation();
  const { currentLocale } = useLocaleStore();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600">
            {t('dashboard.totalExpenses')}
          </h3>
        </div>
      </div>

      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(value, currentLocale)}
        </span>
      </div>
    </div>
  );
}; 