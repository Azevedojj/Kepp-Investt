import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
      <span className="font-medium">Back</span>
    </button>
  );
};