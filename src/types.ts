export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface UserSettings {
  emailNotifications: boolean;
  profileVisibility: boolean;
  usageDataShare: boolean;
  twoFactorEnabled: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  settings: UserSettings;
}

export interface User extends UserResponse {
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investment extends BaseEntity {
  userId: number;
  name: string;
  amount: number;
  date: string;
  return: number;
}

export interface NewInvestment {
  name: string;
  amount: number;
  date: string;
  return: number;
  status: 'active' | 'inactive';
}

export interface Expense extends BaseEntity {
  userId: number;
  name: string;
  amount: number;
  date: string;
  category: string;
}

export interface NewExpense {
  name: string;
  amount: number;
  date: string;
  category: string;
  status: 'active' | 'inactive';
}

export type LogAction = 
  | 'login'
  | 'investment_add'
  | 'investment_update'
  | 'investment_delete'
  | 'expense_add'
  | 'expense_update'
  | 'expense_delete'
  | 'settings_change';

export interface AnonymousLog {
  id?: number;
  action: LogAction;
  timestamp: string;
  platform: string;
  browser: string;
  screenSize: string;
  metadata?: Record<string, any>;
} 