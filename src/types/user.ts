export type UserStatus = 'active' | 'suspended' | 'banned';
export type UserRole = 'user' | 'admin';

export interface UserWarning {
  id: number;
  message: string;
  createdAt: string;
  readAt?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  banReason?: string;
  bannedAt?: string;
  bannedUntil?: string;
  warnings: UserWarning[];
  settings: {
    emailNotifications: boolean;
    profileVisibility: boolean;
    usageDataShare: boolean;
    twoFactorEnabled: boolean;
    darkMode: boolean;
    language: string;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  warnings: UserWarning[];
  settings: User['settings'];
}

export type LogType = 
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'SETTINGS_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'INVESTMENT_CREATE'
  | 'INVESTMENT_UPDATE'
  | 'INVESTMENT_DELETE'
  | 'EXPENSE_CREATE'
  | 'EXPENSE_UPDATE'
  | 'EXPENSE_DELETE'
  | 'WARNING_RECEIVED'
  | 'WARNING_READ'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_BANNED'
  | 'ACCOUNT_REACTIVATED'
  | 'ACCOUNT_CREATED';

export interface UserLog {
  id: number;
  userId: number;
  type: LogType;
  action: string;
  details?: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
} 