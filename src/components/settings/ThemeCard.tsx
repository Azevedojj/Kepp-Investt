import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export const ThemeCard: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        {t('settings.preferences.theme.title')}
      </h2>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isDarkMode 
                ? t('settings.preferences.theme.dark')
                : t('settings.preferences.theme.light')
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.preferences.theme.description')}
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
      </div>
    </div>
  );
}; 