import type { LocaleConfig } from '../types/currency';

export const formatCurrency = (value: number, locale: LocaleConfig): string => {
  return new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency.code
  }).format(value);
}; 