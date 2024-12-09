import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Settings, LogOut, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { LogoutConfirmationModal } from './LogoutConfirmationModal';
import { NotificationBell } from './NotificationBell';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <span className="font-bold text-xl text-gray-900">Kepp</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-orange-50 text-orange-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('common.balance')}
              </Link>
              <Link
                to="/investments"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/investments')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('common.investments')}
              </Link>
              <Link
                to="/expenses"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/expenses')
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('common.expenses')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <div className="relative group">
              <button
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1 bg-white rounded-lg shadow-lg border border-gray-100">
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/users"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Users className="h-4 w-4" />
                        <span>Gerenciar Usuários</span>
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                    </>
                  )}
                  
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('common.settings')}</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </header>
  );
};