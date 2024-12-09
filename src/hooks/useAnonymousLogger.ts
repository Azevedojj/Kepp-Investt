import { useCallback } from 'react';
import { dbService } from '../services/DatabaseService';
import { useAuthStore } from '../store/useAuthStore';
import type { LogAction, UserResponse } from '../types';

export const useAnonymousLogger = () => {
  const { user } = useAuthStore();

  const logAction = useCallback(async (
    action: LogAction, 
    metadata?: Record<string, any>
  ) => {
    if (!user?.settings?.usageDataShare) return;

    try {
      await dbService.logAnonymousAction(action, metadata);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [user?.settings?.usageDataShare]);

  return { logAction };
}; 