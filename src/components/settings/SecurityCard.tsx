import React from 'react';
import { Shield, History, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '../../types';

interface SecurityCardProps {
  settings: UserSettings;
  onSettingChange: (setting: keyof UserSettings) => void;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  settings,
  onSettingChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t('settings.account.security.title')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('settings.account.security.twoFactor.title')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.account.security.twoFactor.description')}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {settings.twoFactorEnabled 
                  ? t('settings.account.security.twoFactor.enabled')
                  : t('settings.account.security.twoFactor.disabled')
                }
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={() => onSettingChange('twoFactorEnabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {/* Login History */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <History className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('settings.account.security.loginHistory.title')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.account.security.loginHistory.description')}
              </p>
            </div>
          </div>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            {t('settings.account.security.loginHistory.viewAll')}
          </button>
        </div>

        {/* Active Sessions */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Smartphone className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('settings.account.security.sessions.title')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.account.security.sessions.description')}
              </p>
            </div>
          </div>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            {t('settings.account.security.sessions.terminateAll')}
          </button>
        </div>
      </div>
    </div>
  );
}; 