import { create } from 'zustand';
import { locales } from '../config/locales';
import { LocaleConfig } from '../types/currency';

interface LocaleStore {
  currentLocale: LocaleConfig;
  setLocale: (locale: LocaleConfig) => void;
}

export const useLocaleStore = create<LocaleStore>((set) => ({
  currentLocale: locales[0],
  setLocale: (locale) => set({ currentLocale: locale }),
}));