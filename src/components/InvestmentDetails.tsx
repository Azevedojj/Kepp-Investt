// src/components/InvestmentDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { dbService } from '../services/DatabaseService';
import { BackButton } from './BackButton';
import type { Investment } from '../types';

export const InvestmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvestment = async () => {
      try {
        if (id) {
          const data = await dbService.getInvestment(parseInt(id, 10));
          setInvestment(data);
        }
      } catch (error) {
        console.error('Error loading investment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvestment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="container mx-auto px-6 py-8">
        <BackButton />
        <div className="text-center py-12">
          <p className="text-gray-500">{t('investments.notFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <BackButton />
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{investment.name}</h2>
        {/* Adicione mais detalhes do investimento aqui */}
      </div>
    </div>
  );
};