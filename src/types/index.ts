export interface DBTransaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface Investment extends DBTransaction {
  return: number;
}

export interface NewInvestment {
  name: string;
  amount: number;
  date: string;
  return: number;
  status: 'active' | 'inactive';
}

export interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type StoreNames = 'investments' | 'expenses';
export type StoreValue<T extends StoreNames> = 
  T extends 'investments' ? Investment :
  T extends 'expenses' ? Expense :
  never; 

export interface User {
  id?: number;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
}

interface DashboardData {
  totalAssets: number;
  totalInvestments: number;
  monthlyExpenses: number;
  assetsTrend: number;
}