import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/DatabaseService';
import type { User } from '../../types';
import { Shield, Ban, AlertTriangle, MessageCircle, Eye } from 'lucide-react';
import { UserDetailsModal } from './UserDetailsModal';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await dbService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number) => {
    const reason = prompt('Motivo do banimento:');
    if (!reason) return;

    try {
      await dbService.updateUser(userId, {
        status: 'banned',
        banReason: reason,
        bannedAt: new Date().toISOString()
      });
      await loadUsers();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    const reason = prompt('Motivo da suspensão:');
    if (!reason) return;

    const days = parseInt(prompt('Duração em dias:') || '0');
    if (!days) return;

    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + days);

    try {
      await dbService.updateUser(userId, {
        status: 'suspended',
        banReason: reason,
        bannedAt: new Date().toISOString(),
        bannedUntil: bannedUntil.toISOString()
      });
      await loadUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      await dbService.updateUser(userId, {
        status: 'active',
        banReason: undefined,
        bannedAt: undefined,
        bannedUntil: undefined
      });
      await loadUsers();
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  const handleAddWarning = async (userId: number) => {
    const message = prompt('Digite a mensagem de aviso para o usuário:');
    if (!message) return;

    try {
      console.log('Enviando aviso para usuário:', userId);
      await dbService.addWarning(userId, message);
      console.log('Aviso enviado com sucesso');
      await loadUsers();
    } catch (error) {
      console.error('Error adding warning:', error);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
        
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Tipo</th>
                  <th className="px-6 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Ver detalhes"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {user.status === 'active' && user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleBanUser(user.id!)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Banir usuário"
                            >
                              <Ban className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleSuspendUser(user.id!)}
                              className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Suspender usuário"
                            >
                              <AlertTriangle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAddWarning(user.id!)}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Enviar aviso"
                            >
                              <MessageCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {(user.status === 'banned' || user.status === 'suspended') && (
                          <button
                            onClick={() => handleReactivateUser(user.id!)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Reativar usuário"
                          >
                            <Shield className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        user={selectedUser}
      />
    </>
  );
}; 