import React from 'react';
import { Globe } from 'lucide-react';
import { useLocaleStore } from '../store/useLocaleStore';
import { locales } from '../config/locales';
import { useTranslation } from 'react-i18next';

export const LocaleSelector: React.FC = () => {
  const { currentLocale, setLocale } = useLocaleStore();
  const { i18n } = useTranslation();

  const handleLocaleChange = (locale: typeof currentLocale) => {
    setLocale(locale);
    i18n.changeLanguage(locale.code.split('-')[0]);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
        <Globe className="h-5 w-5" />
        <span>{currentLocale.flag}</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg hidden group-hover:block border border-gray-100">
        {locales.map((locale) => (
          <button
            key={locale.code}
            className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-2"
            onClick={() => handleLocaleChange(locale)}
          >
            <span>{locale.flag}</span>
            <span>{locale.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};