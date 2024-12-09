import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { BanNotification } from './BanNotification';

export const UserStatusMonitor: React.FC = () => {
  const { user, logout, banReason, setBanReason } = useAuthStore();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleUserBan = (event: CustomEvent<{ userId: number; reason: string }>) => {
      if (user && event.detail.userId === user.id) {
        setBanReason(event.detail.reason);
        logout();
        navigate('/login');
        setShowNotification(true);
      }
    };

    window.addEventListener('user-banned', handleUserBan as EventListener);
    return () => {
      window.removeEventListener('user-banned', handleUserBan as EventListener);
    };
  }, [user, logout, navigate, setBanReason]);

  if (!showNotification || !banReason) return null;

  return (
    <BanNotification
      reason={banReason}
      onClose={() => {
        setShowNotification(false);
        setBanReason(null);
      }}
    />
  );
}; 