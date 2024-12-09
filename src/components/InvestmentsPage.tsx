import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { AddInvestmentForm } from './AddInvestmentForm';
import { EditInvestmentForm } from './EditInvestmentForm';
import { useLocaleStore } from '../store/useLocaleStore';
import { dbService } from '../services/DatabaseService';
import { formatCurrency } from '../utils/currency';
import type { Investment, NewInvestment } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { useAuthStore } from '../store/useAuthStore';
import { useAnonymousLogger } from '../hooks/useAnonymousLogger';

export const InvestmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLocale } = useLocaleStore();
  const { user } = useAuthStore();
  const { logAction } = useAnonymousLogger();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<number | null>(null);

  const loadInvestments = async () => {
    try {
      if (!user?.id) return;
      const data = await dbService.getInvestments(user.id);
      setInvestments(data);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleAdd = async (data: NewInvestment) => {
    try {
      if (!user?.id) return;
      await dbService.addInvestment(data, user.id);
      
      // Log anônimo da ação
      await logAction('investment_add', {
        amount: data.amount,
        hasReturn: !!data.return
      });
      
      loadInvestments();
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const handleEdit = async (id: number, data: Partial<Investment>) => {
    if (id) {
      await dbService.updateInvestment(id, data);
      await loadInvestments();
      setEditingInvestment(null);
    }
  };

  const handleDelete = async (id: number) => {
    await dbService.deleteInvestment(id);
    await loadInvestments();
    setDeleteModalOpen(false);
    setInvestmentToDelete(null);
  };

  const handleToggleStatus = async (id: number) => {
    if (id) {
      await dbService.toggleInvestmentStatus(id);
      await loadInvestments();
    }
  };

  const openDeleteModal = (id: number) => {
    setInvestmentToDelete(id);
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <BackButton />
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('investments.title')}
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{t('investments.addButton')}</span>
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('investments.noInvestments')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {investments.map((investment) => (
              <div
                key={investment.id}
                className={`bg-white rounded-lg shadow p-4 flex items-center justify-between ${
                  investment.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{investment.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(investment.amount, currentLocale)}
                    </span>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      investment.return >= 0 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-red-600 bg-red-50'
                    }`}>
                      {investment.return >= 0 ? '+' : ''}{investment.return}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(investment.date).toLocaleDateString(currentLocale.code)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(investment.id)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={investment.status === 'active' ? t('common.deactivate') : t('common.activate')}
                  >
                    {investment.status === 'active' ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingInvestment(investment);
                      setShowAddForm(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setInvestmentToDelete(investment.id);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <AddInvestmentForm 
            onClose={() => setShowAddForm(false)} 
            onSubmit={handleAdd} 
          />
        )}

        {editingInvestment && editingInvestment.id && (
          <EditInvestmentForm
            investment={editingInvestment}
            onClose={() => setEditingInvestment(null)}
            onSubmit={(data) => handleEdit(editingInvestment.id!, data)}
          />
        )}

        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setInvestmentToDelete(null);
          }}
          onConfirm={() => investmentToDelete && handleDelete(investmentToDelete)}
          title={t('investments.deleteTitle')}
          message={t('investments.deleteConfirmation')}
        />
      </div>
    </div>
  );
};