import React from 'react';
import { Bell, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '../../types';

interface NotificationsCardProps {
  settings: UserSettings;
  onSettingChange: (setting: keyof UserSettings) => void;
}

export const NotificationsCard: React.FC<NotificationsCardProps> = ({
  settings,
  onSettingChange
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {t('settings.notifications.title')}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Mail className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('settings.notifications.preferences.email.title')}
              </p>
              <p className="text-sm text-gray-500">
                {t('settings.notifications.preferences.email.updates')}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => onSettingChange('emailNotifications')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}; 