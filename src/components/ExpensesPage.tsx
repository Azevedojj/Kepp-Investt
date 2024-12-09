import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { useLocaleStore } from '../store/useLocaleStore';
import { dbService } from '../services/DatabaseService';
import { formatCurrency } from '../utils/currency';
import { AddExpenseModal } from './AddExpenseModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ConfirmationModal } from './ConfirmationModal';
import type { Expense, NewExpense } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export const ExpensesPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLocale } = useLocaleStore();
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    try {
      if (!user?.id) return;
      const data = await dbService.getAllExpenses(user.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [user?.id]);

  const handleAdd = async (data: NewExpense) => {
    try {
      if (!user?.id) return;
      await dbService.addExpense(data, user.id);
      await loadExpenses();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEdit = async (id: number, data: Partial<Expense>) => {
    try {
      await dbService.updateExpense(id, data);
      await loadExpenses();
      setShowEditModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dbService.deleteExpense(id);
      await loadExpenses();
      setShowDeleteModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dbService.toggleExpenseStatus(id);
      await loadExpenses();
    } catch (error) {
      console.error('Error toggling expense status:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">
            {t('expenses.title')}
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{t('expenses.addButton')}</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('expenses.noExpenses')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className={`bg-white rounded-lg shadow p-4 flex items-center justify-between ${
                  expense.status === 'inactive' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{expense.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-lg font-medium text-gray-900">
                      {formatCurrency(expense.amount, currentLocale)}
                    </span>
                    <span className="text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {t(`expenses.categories.${expense.category}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(expense.date).toLocaleDateString(currentLocale.code)}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(expense.id)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={expense.status === 'active' ? t('common.deactivate') : t('common.activate')}
                  >
                    {expense.status === 'active' ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={t('common.edit')}
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowDeleteModal(true);
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
      </div>

      {showAddModal && (
        <AddExpenseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {showEditModal && selectedExpense && (
        <EditExpenseModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedExpense(null);
          }}
          onSubmit={(data) => handleEdit(selectedExpense.id, data)}
          expense={selectedExpense}
        />
      )}

      {showDeleteModal && selectedExpense && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedExpense(null);
          }}
          onConfirm={() => handleDelete(selectedExpense.id)}
          title={t('expenses.deleteTitle')}
          message={t('expenses.deleteConfirmation')}
        />
      )}
    </div>
  );
};