export interface Currency {
  code: string;
  symbol: string;
  position: 'before' | 'after';
}

export interface LocaleConfig {
  code: string;
  name: string;
  currency: Currency;
  flag: string;
}