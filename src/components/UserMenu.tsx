import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useLocaleStore } from '../store/useLocaleStore';
import { locales } from '../config/locales';
import { ConfirmationModal } from './ConfirmationModal';

export const UserMenu: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentLocale, setLocale } = useLocaleStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLocaleChange = (locale: typeof currentLocale) => {
    setLocale(locale);
    i18n.changeLanguage(locale.code.split('-')[0]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-white hover:bg-orange-700/50 px-3 py-2 rounded-lg transition-all"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium leading-tight">{user?.name}</span>
            <span className="text-xs text-orange-200 leading-tight">{user?.email}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {/* Cabeçalho do Menu */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Seletor de Idioma */}
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              {t('settings.language')}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {locales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                    ${currentLocale.code === locale.code 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-base">{locale.flag}</span>
                  <span>{locale.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              <span>{t('common.settings')}</span>
            </button>
            
            <button
              onClick={() => {
                setShowLogoutModal(true);
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title={t('auth.logoutTitle')}
        message={t('auth.logoutConfirmation')}
        confirmText={t('auth.logout')}
        cancelText={t('common.cancel')}
      />
    </div>
  );
}; 