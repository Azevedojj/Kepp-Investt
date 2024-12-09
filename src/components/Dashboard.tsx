import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, Plus, Wallet, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from './DashboardCard';
import { TotalAssetsCard } from './TotalAssetsCard';
import { AssetsChart } from './AssetsChart';
import { dbService } from '../services/DatabaseService';
import type { Investment, Expense } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface DashboardData {
  totalAssets: number;
  totalInvestments: number;
  monthlyExpenses: number;
  assetsTrend: number;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalAssets: 0,
    totalInvestments: 0,
    monthlyExpenses: 0,
    assetsTrend: 0
  });
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      if (!user?.id) return;
      
      // Carregar investimentos e despesas do usuário atual
      const investments = await dbService.getInvestments(user.id);
      const expenses = await dbService.getAllExpenses(user.id);
      
      // Calcular total dos investimentos ativos
      const totalInvestments = investments.reduce((total, inv) => 
        inv.status === 'active' ? total + inv.amount : total, 0);

      // Calcular total das despesas do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyExpenses = expenses.reduce((total: number, exp: Expense) => {
        const expDate = new Date(exp.date);
        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
          return total + exp.amount;
        }
        return total;
      }, 0);

      // Calcular total de ativos (investimentos - despesas mensais)
      const totalAssets = totalInvestments - monthlyExpenses;

      // Calcular tendência com números menores (dividindo por 100)
      const assetsTrend = totalInvestments > 0 
        ? ((monthlyExpenses / totalInvestments) * 100) / 100 // Isso vai resultar em números entre 0 e 1
        : 0;

      setDashboardData({
        totalAssets,
        totalInvestments,
        monthlyExpenses,
        assetsTrend: Number(assetsTrend.toFixed(2)) // Limitar a 2 casas decimais
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-orange-100 to-transparent rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcomeUser', { name: user?.name?.split(' ')[0] })}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.overview')}
          </p>
        </div>

        {/* Main Stats Card */}
        <TotalAssetsCard 
          value={dashboardData.totalAssets} 
          trend={dashboardData.assetsTrend} 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title={t('dashboard.investmentReturn')}
            value={dashboardData.totalInvestments}
            icon={ArrowUpCircle}
            trend={dashboardData.assetsTrend}
            page="investments"
            variant="primary"
          />
          <DashboardCard
            title={t('dashboard.monthlyExpenses')}
            value={dashboardData.monthlyExpenses}
            icon={ArrowDownCircle}
            trend={Number((-dashboardData.assetsTrend).toFixed(2))}
            page="expenses"
            variant="secondary"
          />
          <DashboardCard
            title={t('dashboard.totalAssets')}
            value={dashboardData.totalAssets}
            icon={TrendingUp}
            trend={dashboardData.assetsTrend}
            page="investments"
            variant="tertiary"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.performanceChart')}
              </h2>
              <p className="text-gray-500 mt-1">
                {t('dashboard.chartDescription')}
              </p>
            </div>
          </div>
          <AssetsChart />
        </div>
      </div>
    </div>
  );
};