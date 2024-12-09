import React from 'react';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '../store/useLocaleStore';
import { formatCurrency } from '../utils/currency';
import { dbService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';

interface TotalAssetsCardProps {
  value: number;
  trend: number;
}

export const TotalAssetsCard: React.FC<TotalAssetsCardProps> = ({ value }) => {
  const { currentLocale } = useLocaleStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [weekGrowth, setWeekGrowth] = React.useState<number>(0);

  React.useEffect(() => {
    calculateWeekGrowth();
  }, []);

  const calculateWeekGrowth = async () => {
    try {
      const investments = await dbService.getInvestments();
      
      // Obter o início da semana atual (7 dias atrás)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Calcular total de ativos no início da semana
      const startWeekTotal = investments.reduce((total, inv) => {
        if (inv.status === 'active' && new Date(inv.date) <= startOfWeek) {
          const returnValue = inv.amount * (inv.return / 100);
          return total + inv.amount + returnValue;
        }
        return total;
      }, 0);

      // Calcular total atual
      const currentTotal = investments.reduce((total, inv) => {
        if (inv.status === 'active') {
          const returnValue = inv.amount * (inv.return / 100);
          return total + inv.amount + returnValue;
        }
        return total;
      }, 0);

      // Calcular crescimento em porcentagem
      if (startWeekTotal > 0) {
        const growth = ((currentTotal - startWeekTotal) / startWeekTotal) * 100;
        setWeekGrowth(growth);
      } else if (currentTotal > 0) {
        // Se não havia investimentos no início da semana mas há agora
        setWeekGrowth(100);
      } else {
        // Se não há investimentos
        setWeekGrowth(0);
      }
    } catch (error) {
      console.error('Error calculating week growth:', error);
    }
  };

  const valueColorClass = weekGrowth < 0 ? 'text-red-600' : 'text-gray-900';

  return (
    <div className="card card-hover p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start space-x-6">
          <div className="bg-orange-50 p-4 rounded-2xl">
            <Wallet className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-600">{t('dashboard.totalAssets')}</h2>
            <p className={`text-4xl font-bold mt-2 ${valueColorClass}`}>
              {formatCurrency(value, currentLocale)}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                weekGrowth >= 0 
                  ? 'bg-green-50 text-green-600' 
                  : 'bg-red-50 text-red-600'
              }`}>
                {weekGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>
                  {weekGrowth >= 0 ? '+' : '-'}
                  {Math.abs(weekGrowth).toFixed(1)}%
                </span>
              </span>
              <span className="text-sm text-gray-500">{t('dashboard.wtd')}</span>
            </div>
            {weekGrowth < 0 && (
              <p className="text-sm text-red-600 mt-1">
                {t('dashboard.loss', { value: formatCurrency(Math.abs(value * (weekGrowth / 100)), currentLocale) })}
              </p>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/investments')}
          className="flex items-center justify-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-6 py-3 rounded-xl transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          <span>{t('dashboard.viewDetails')}</span>
        </button>
      </div>
    </div>
  );
};