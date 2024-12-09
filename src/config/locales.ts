import { LocaleConfig } from '../types/currency';

export const locales: LocaleConfig[] = [
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    currency: {
      code: 'BRL',
      symbol: 'R$',
      position: 'before'
    },
    flag: '🇧🇷'
  },
  {
    code: 'en-US',
    name: 'English (US)',
    currency: {
      code: 'USD',
      symbol: '$',
      position: 'before'
    },
    flag: '🇺🇸'
  }
];