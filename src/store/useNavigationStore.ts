import { create } from 'zustand';

type Page = 'dashboard' | 'investments' | 'income' | 'expenses';

interface NavigationStore {
  currentPage: Page;
  setPage: (page: Page) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentPage: 'dashboard',
  setPage: (page) => set({ currentPage: page }),
}));