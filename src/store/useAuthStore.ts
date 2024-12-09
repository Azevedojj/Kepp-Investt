import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '../types';

interface AuthStore {
  user: UserResponse | null;
  isAuthenticated: boolean;
  banReason: string | null;
  login: (user: UserResponse) => void;
  logout: () => void;
  updateUser: (user: UserResponse) => void;
  setBanReason: (reason: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      banReason: null,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, banReason: null }),
      updateUser: (updatedUser) => set((state) => ({
        ...state,
        user: updatedUser
      })),
      setBanReason: (reason) => set({ banReason: reason })
    }),
    {
      name: 'auth-storage',
    }
  )
); 