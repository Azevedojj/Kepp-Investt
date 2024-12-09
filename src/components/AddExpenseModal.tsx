import React from 'react';
import { AddExpenseForm } from './AddExpenseForm';
import { NewExpense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: NewExpense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return <AddExpenseForm onClose={onClose} onSubmit={onSubmit} />;
}; 