import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton';
import { User, Mail, Lock, X, AlertCircle, Eye, BarChart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { dbService } from '../services/DatabaseService';
import { useNavigate } from 'react-router-dom';
import { AccountCard } from './settings/AccountCard';
import { PrivacyCard } from './settings/PrivacyCard';
import { NotificationsCard } from './settings/NotificationsCard';
import type { UserSettings } from '../types';
import { PreferencesCard } from './settings/PreferencesCard';
import { SecurityCard } from './settings/SecurityCard';
import { toast } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: false,
    profileVisibility: false,
    usageDataShare: false,
    twoFactorEnabled: false,
    darkMode: false,
    language: 'pt-BR',
    currency: 'BRL'
  });

  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, [user]);

  const handleUpdateName = async () => {
    try {
      if (!user?.id) return;
      
      await dbService.updateUserName(user.id, newName);
      updateUser({ ...user, name: newName });
      setShowEditNameModal(false);
      setError('');
      toast.success(t('settings.account.forms.editName.success'));
    } catch (error) {
      console.error('Error updating name:', error);
      setError(t('settings.messages.errors.generic'));
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!user?.id) return;

      if (newPassword !== confirmPassword) {
        setError('passwordsDontMatch');
        return;
      }

      if (newPassword.length < 8) {
        setError('tooWeak');
        return;
      }

      await dbService.updateUserPassword(user.id, currentPassword, newPassword);
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      toast.success(t('settings.account.security.password.messages.success'));
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        setError('incorrectPassword');
      } else {
        setError('generic');
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) return;

      // Deletar todos os dados do usuário
      await dbService.deleteAllUserData(user.id);
      // Deletar a conta
      await dbService.deleteUser(user.id);
      
      // Fazer logout e redirecionar para login
      toast.success(t('settings.account.messages.accountDeleted'));
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(t('settings.messages.errors.generic'));
    }
  };

  const handleSettingChange = async (setting: keyof UserSettings) => {
    try {
      if (!user?.id) return;

      const newSettings = {
        ...settings,
        [setting]: !settings[setting as keyof typeof settings]
      };

      await dbService.updateUserSettings(user.id, {
        [setting]: !settings[setting as keyof typeof settings]
      });

      setSettings(newSettings);
      updateUser({
        ...user,
        settings: newSettings
      });
      setError('');
      toast.success(t('settings.messages.success.saved'));
    } catch (error) {
      console.error('Error updating settings:', error);
      setError(t('settings.messages.errors.generic'));
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <BackButton />
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('settings.title')}
        </h1>

        <div className="space-y-6">
          <AccountCard
            user={user!}
            onEditName={() => setShowEditNameModal(true)}
            onChangePassword={() => setShowChangePasswordModal(true)}
            onDeleteAccount={() => setShowDeleteAccountModal(true)}
          />

          <SecurityCard
            settings={settings}
            onSettingChange={handleSettingChange}
          />

          <PrivacyCard
            settings={settings}
            onSettingChange={handleSettingChange}
          />

          <NotificationsCard
            settings={settings}
            onSettingChange={handleSettingChange}
          />

          <PreferencesCard
            settings={settings}
            onSettingChange={handleSettingChange}
          />
        </div>
      </div>

      {/* Modal de Editar Nome */}
      {showEditNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('settings.account.personalInfo.name.edit')}
              </h3>
              <button 
                onClick={() => setShowEditNameModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateName(); }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.account.personalInfo.name.label')}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('settings.account.personalInfo.name.placeholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditNameModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
            {error && (
              <p className="text-sm text-red-600 mt-4">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Alterar Senha */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('settings.account.security.password.form.title')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('settings.account.security.password.form.description')}
                </p>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.account.security.password.form.currentPassword.label')}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('settings.account.security.password.form.currentPassword.placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.account.security.password.form.newPassword.label')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settings.account.security.password.form.newPassword.placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('settings.account.security.password.form.newPassword.requirements')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.account.security.password.form.confirmPassword.label')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('settings.account.security.password.form.confirmPassword.placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 mt-4">
                  {t(`settings.account.security.password.messages.error.${error}`)}
                </p>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Conta */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('settings.account.dangerZone.title')}
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                {t('settings.account.dangerZone.deleteWarning')}
              </p>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  {t('settings.account.dangerZone.confirmationWarning')}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-4">
                {t('settings.messages.errors.generic')}
              </p>
            )}

            <div className="flex justify-end items-center space-x-4 mt-8">
              <button
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('settings.account.dangerZone.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 