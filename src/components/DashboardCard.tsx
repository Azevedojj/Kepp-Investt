import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useLocaleStore } from '../store/useLocaleStore';
import { useNavigationStore } from '../store/useNavigationStore';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface DashboardCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  page?: 'investments' | 'income' | 'expenses';
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  page,
  variant = 'primary'
}) => {
  const { currentLocale } = useLocaleStore();
  const navigate = useNavigate();

  const variants = {
    primary: {
      gradient: 'from-gray-50 to-white',
      icon: 'text-orange-600 bg-white',
      decoration: 'text-gray-100'
    },
    secondary: {
      gradient: 'from-gray-50 to-white',
      icon: 'text-orange-600 bg-white',
      decoration: 'text-gray-100'
    },
    tertiary: {
      gradient: 'from-gray-50 to-white',
      icon: 'text-orange-600 bg-white',
      decoration: 'text-gray-100'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div 
      onClick={() => page && navigate(`/${page}`)}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-white`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3.5 rounded-xl ${currentVariant.icon} transition-all group-hover:scale-110 shadow-sm`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
            trend >= 0 
              ? 'bg-emerald-50 text-emerald-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            <ArrowUpRight className={`h-4 w-4 ${trend >= 0 ? '' : 'rotate-180'}`} />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-gray-600 font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(value, currentLocale)}
        </p>
      </div>

      {/* Decorative Icon */}
      <div className={`absolute -right-6 -bottom-6 w-32 h-32 ${currentVariant.decoration} transition-transform group-hover:scale-110 group-hover:rotate-12`}>
        <Icon className="w-full h-full" />
      </div>
    </div>
  );
};