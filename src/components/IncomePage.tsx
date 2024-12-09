import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { useLocaleStore } from '../store/useLocaleStore';
import { dbService } from '../services/DatabaseService';
import { formatCurrency } from '../utils/currency';
import { ConfirmationModal } from './ConfirmationModal';
import type { Income } from '../types';

export const IncomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLocale } = useLocaleStore();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const data = await dbService.getAllIncomes();
      setIncomes(data);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (income: Omit<Income, 'id' | 'status'>) => {
    try {
      await dbService.addIncome({
        ...income,
        status: 'active'
      });
      await loadIncomes();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleEdit = async (id: number, data: Partial<Income>) => {
    try {
      await dbService.updateIncome(id, data);
      await loadIncomes();
      setShowEditModal(false);
      setSelectedIncome(null);
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dbService.deleteIncome(id);
      await loadIncomes();
      setShowDeleteModal(false);
      setSelectedIncome(null);
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dbService.toggleIncomeStatus(id);
      await loadIncomes();
    } catch (error) {
      console.error('Error toggling income status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <BackButton />
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('income.title')}</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>{t('income.addButton')}</span>
          </button>
        </div>

        {incomes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('income.noIncomes')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incomes.map((income) => (
              <div
                key={income.id}
                className={`bg-white rounded-lg shadow p-4 flex items-center justify-between
                  ${income.status === 'inactive' ? 'opacity-60' : ''}`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{income.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(income.amount, currentLocale)}
                    </span>
                    {income.recurrent && (
                      <span className="text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        {t('income.recurrentLabel')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(income.date).toLocaleDateString(currentLocale.code)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedIncome(income);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(income.id)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {income.status === 'active' ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIncome(income);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Adicionar */}
        <AddIncomeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />

        {/* Modal de Editar */}
        {selectedIncome && (
          <EditIncomeModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedIncome(null);
            }}
            onSubmit={(data) => handleEdit(selectedIncome.id, data)}
            income={selectedIncome}
          />
        )}

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedIncome(null);
          }}
          onConfirm={() => selectedIncome && handleDelete(selectedIncome.id)}
          title={t('income.deleteTitle')}
          message={t('income.deleteConfirmation')}
        />
      </div>
    </div>
  );
};