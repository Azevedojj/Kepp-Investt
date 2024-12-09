import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Shield, AlertCircle, Clock } from 'lucide-react';
import type { User as UserType, UserLog, LogType } from '../../types';
import { dbService } from '../../services/DatabaseService';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserLogs();
    }
  }, [user?.id]);

  const loadUserLogs = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const userLogs = await dbService.getUserLogs(user.id);
      console.log('Logs carregados:', userLogs);
      setLogs(userLogs);
    } catch (error) {
      console.error('Error loading user logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogColor = (type: LogType): string => {
    switch (type) {
      case 'LOGIN':
        return 'bg-green-50 border-green-100';
      case 'LOGIN_FAILED':
        return 'bg-red-50 border-red-100';
      case 'WARNING_RECEIVED':
        return 'bg-orange-50 border-orange-100';
      case 'ACCOUNT_BANNED':
      case 'ACCOUNT_SUSPENDED':
        return 'bg-red-50 border-red-100';
      case 'ACCOUNT_REACTIVATED':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-white border-gray-100';
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes do Usuário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Conta</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded text-sm ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Ativo' :
                     user.status === 'suspended' ? 'Suspenso' : 'Banido'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status da Conta */}
          {(user.status === 'banned' || user.status === 'suspended') && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-red-900 mb-4">Informações de Penalidade</h3>
              <div className="space-y-3">
                {user.banReason && (
                  <div>
                    <p className="text-sm text-red-800 font-medium">Motivo:</p>
                    <p className="text-sm text-red-600">{user.banReason}</p>
                  </div>
                )}
                {user.bannedAt && (
                  <div>
                    <p className="text-sm text-red-800 font-medium">Data:</p>
                    <p className="text-sm text-red-600">
                      {new Date(user.bannedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {user.bannedUntil && (
                  <div>
                    <p className="text-sm text-red-800 font-medium">Até:</p>
                    <p className="text-sm text-red-600">
                      {new Date(user.bannedUntil).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avisos */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-orange-900 mb-4">Histórico de Avisos</h3>
            {user.warnings?.length === 0 ? (
              <p className="text-sm text-orange-600">Nenhum aviso registrado</p>
            ) : (
              <div className="space-y-4">
                {user.warnings?.map((warning) => (
                  <div key={warning.id} className="bg-white p-3 rounded border border-orange-100">
                    <p className="text-sm text-gray-800">{warning.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(warning.createdAt).toLocaleDateString()}
                      </p>
                      {warning.readAt && (
                        <span className="text-xs text-green-600">
                          Lido em {new Date(warning.readAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações da Conta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Idioma</p>
                <p className="font-medium">{user.settings.language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Moeda</p>
                <p className="font-medium">{user.settings.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tema Escuro</p>
                <p className="font-medium">{user.settings.darkMode ? 'Ativado' : 'Desativado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Notificações por Email</p>
                <p className="font-medium">
                  {user.settings.emailNotifications ? 'Ativadas' : 'Desativadas'}
                </p>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Datas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Criado em</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Última atualização</p>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs da Conta */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Logs da Conta</h3>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {logs.length} registros encontrados
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum log encontrado
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded border hover:border-gray-200 transition-colors ${getLogColor(log.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {log.action}
                        </p>
                        {log.details && (
                          <p className="text-xs text-gray-500 mt-1">
                            {log.details}
                          </p>
                        )}
                        {log.ip && (
                          <p className="text-xs text-gray-400 mt-1">
                            IP: {log.ip} | {log.userAgent}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 