import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { dbService } from '../services/DatabaseService';
import { UserWarning } from '../types/user';
import { ClearNotificationsModal } from './ClearNotificationsModal';

export const NotificationBell: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<UserWarning[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);

  // Função para carregar notificações
  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const warnings = await dbService.getUserWarnings(user.id);
      setNotifications(warnings);
      setUnreadCount(warnings.filter(n => !n.readAt).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Carregar notificações iniciais
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  // Escutar por novas notificações
  useEffect(() => {
    const handleNewWarning = (event: CustomEvent<{ userId: number; warning: UserWarning }>) => {
      console.log('Nova notificação recebida:', event.detail);
      if (user?.id === event.detail.userId) {
        loadNotifications(); // Recarregar todas as notificações
      }
    };

    window.addEventListener('new-warning', handleNewWarning as EventListener);
    return () => {
      window.removeEventListener('new-warning', handleNewWarning as EventListener);
    };
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user?.id) return;
    try {
      console.log('Marcando notificação como lida:', notificationId);
      await dbService.markWarningAsRead(user.id, notificationId);
      await loadNotifications(); // Recarregar notificações
      console.log('Notificação marcada como lida com sucesso');
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      console.log('Marcando todas as notificações como lidas');
      await dbService.markAllWarningsAsRead(user.id);
      await loadNotifications(); // Recarregar notificações
      console.log('Todas as notificações marcadas como lidas com sucesso');
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    try {
      console.log('Apagando todas as notificações');
      await dbService.clearAllWarnings(user.id);
      await loadNotifications();
      setShowDropdown(false); // Fechar dropdown após limpar
      setShowClearModal(false); // Fechar modal
      console.log('Todas as notificações foram apagadas com sucesso');
    } catch (error) {
      console.error('Erro ao apagar notificações:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Notificações</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-orange-600 hover:text-orange-700"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                {notifications.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Apagar todas
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-0 ${
                      !notification.readAt ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.readAt && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-orange-600 hover:text-orange-700 ml-2"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ClearNotificationsModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearAll}
      />
    </>
  );
}; 