import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Expense } from '../types';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Expense>) => void;
  expense: Expense;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expense
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de edição
    onSubmit({
      ...expense,
      // campos atualizados
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('expenses.editTitle')}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Implementar formulário de edição */}
        </form>
      </div>
    </div>
  );
}; 