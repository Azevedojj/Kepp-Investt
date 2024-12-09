import { LocaleConfig } from '../types/currency';

interface FormatOptions {
  notation?: 'standard' | 'compact';
}

export const formatCurrency = (
  amount: number,
  locale: LocaleConfig,
  options: FormatOptions = {}
) => {
  const formatter = new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency.code,
    notation: options.notation,
  });
  return formatter.format(amount);
};