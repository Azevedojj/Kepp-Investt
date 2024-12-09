import React from 'react';
import { X } from 'lucide-react';

interface BanNotificationProps {
  reason: string;
  onClose: () => void;
}

export const BanNotification: React.FC<BanNotificationProps> = ({ reason, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-slide-in">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-red-800">Conta Suspensa</h3>
          <p className="mt-1 text-sm text-red-600">
            Sua conta foi banida pelo seguinte motivo:
          </p>
          <p className="mt-2 text-sm text-gray-700 bg-white p-3 rounded border border-red-100">
            {reason}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}; 