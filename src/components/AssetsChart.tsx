import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '../store/useLocaleStore';
import { formatCurrency } from '../utils/currency';
import { dbService } from '../services/DatabaseService';

interface ChartData {
  label: string;
  fullDate: Date;
  assets: number;
}

export const AssetsChart: React.FC = () => {
  const { currentLocale } = useLocaleStore();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  useEffect(() => {
    loadChartData();
  }, [i18n.language, selectedPeriod]);

  const formatDateLabel = (date: Date) => {
    if (selectedPeriod === '1W') {
      return date.toLocaleString(currentLocale.code, {
        weekday: 'short',
        day: '2-digit'
      });
    }
    return date.toLocaleString(currentLocale.code, {
      month: 'short',
      year: 'numeric'
    });
  };

  const loadChartData = async () => {
    try {
      const investments = await dbService.getInvestments();
      
      const now = new Date();
      const startDate = new Date();
      const timeData = new Map<string, { date: Date; total: number }>();

      // Definir data inicial baseada no período
      switch (selectedPeriod) {
        case '1W':
          startDate.setDate(now.getDate() - 7); // Última semana
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'ALL':
          const oldestDate = investments.reduce((oldest, inv) => {
            const invDate = new Date(inv.date);
            return invDate < oldest ? invDate : oldest;
          }, now);
          startDate.setTime(oldestDate.getTime());
          break;
      }

      // Criar pontos de dados para o período
      let currentDate = new Date(startDate);
      while (currentDate <= now) {
        const key = selectedPeriod === '1W' 
          ? currentDate.toISOString().substring(0, 10) // YYYY-MM-DD
          : currentDate.toISOString().substring(0, 7);  // YYYY-MM

        if (!timeData.has(key)) {
          timeData.set(key, { date: new Date(currentDate), total: 0 });
        }

        if (selectedPeriod === '1W') {
          currentDate.setDate(currentDate.getDate() + 1); // Incrementar por dia
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      // Calcular total de ativos para cada período
      investments.forEach(inv => {
        if (inv.status === 'active') {
          const investmentDate = new Date(inv.date);
          let currentTime = new Date(
            Math.max(investmentDate.getTime(), startDate.getTime())
          );
          
          while (currentTime <= now) {
            const key = selectedPeriod === '1W'
              ? currentTime.toISOString().substring(0, 10)
              : currentTime.toISOString().substring(0, 7);

            if (timeData.has(key)) {
              const total = inv.amount + (inv.amount * (inv.return / 100));
              timeData.get(key)!.total += total;
            }

            if (selectedPeriod === '1W') {
              currentTime.setDate(currentTime.getDate() + 1);
            } else {
              currentTime.setMonth(currentTime.getMonth() + 1);
            }
          }
        }
      });

      // Converter para array e ordenar por data
      const chartData = Array.from(timeData.entries())
        .map(([_, { date, total }]) => ({
          label: formatDateLabel(date),
          fullDate: date,
          assets: total
        }))
        .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
        .filter(item => item.fullDate >= startDate && item.fullDate <= now);

      setData(chartData);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  const periods = [
    { key: '1W', label: t('chart.period.1w') },
    { key: '1M', label: t('chart.period.1m') },
    { key: '6M', label: t('chart.period.6m') },
    { key: '1Y', label: t('chart.period.1y') },
    { key: 'ALL', label: t('chart.period.all') }
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{t('dashboard.totalAssets')}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('chart.performance', { period: t(`chart.period.${selectedPeriod.toLowerCase()}`) })}
          </p>
        </div>
        <div className="flex space-x-2">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                key === selectedPeriod
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, currentLocale, { notation: 'compact' })}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => formatCurrency(value, currentLocale)}
              labelFormatter={(label) => 
                selectedPeriod === '1W' 
                  ? `${t('chart.date')}: ${label}`
                  : `${t('chart.month')}: ${label}`
              }
            />
            <Area
              type="monotone"
              dataKey="assets"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAssets)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};