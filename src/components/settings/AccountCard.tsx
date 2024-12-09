import React from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserResponse } from '../../types';

interface AccountCardProps {
  user: UserResponse;
  onEditName: () => void;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  user,
  onEditName,
  onChangePassword,
  onDeleteAccount
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t('settings.account.title')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Nome */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <User className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">
              {t('settings.account.personalInfo.name.label')}
            </p>
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
          </div>
          <button 
            onClick={onEditName}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('settings.account.personalInfo.name.edit')}
          </button>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Mail className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {t('settings.account.personalInfo.email.label')}
            </p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
        </div>

        {/* Senha */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Lock className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">
              {t('settings.account.security.password.label')}
            </p>
            <p className="text-sm font-medium text-gray-900">••••••••</p>
          </div>
          <button 
            onClick={onChangePassword}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {t('settings.account.security.password.change')}
          </button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            {t('settings.account.dangerZone.title')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('settings.account.dangerZone.deleteWarning')}
          </p>
          <button 
            onClick={onDeleteAccount}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            {t('settings.account.dangerZone.deleteButton')}
          </button>
        </div>
      </div>
    </div>
  );
}; 