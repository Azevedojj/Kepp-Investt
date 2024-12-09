import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { 
  Investment, 
  Income, 
  Expense, 
  NewInvestment,
  StoreNames,
  StoreValue,
  DBTransaction,
  User,
  UserResponse,
  LogAction,
  AnonymousLog,
  UserWarning,
  LogType,
  UserLog
} from '../types';
import DOMPurify from 'dompurify';
import { getClientIP } from '../utils/getClientIP';
import { eventService } from './EventService';

interface KeepInvestDB extends DBSchema {
  investments: {
    key: number;
    value: Investment & { userId: number };
    indexes: {
      'by-date': string;
      'by-name': string;
      'by-user': number;
    };
  };
  incomes: {
    key: number;
    value: Income;
    indexes: {
      'by-date': string;
      'by-name': string;
    };
  };
  expenses: {
    key: number;
    value: Expense & { userId: number };
    indexes: {
      'by-date': string;
      'by-category': string;
      'by-user': number;
    };
  };
  users: {
    key: number;
    value: User;
    indexes: {
      'by-email': string;
    };
  };
  anonymousLogs: {
    key: number;
    value: AnonymousLog;
    indexes: {
      'by-action': string;
      'by-timestamp': string;
    };
  };
  loginAttempts: {
    key: number;
    value: {
      userId: number;
      success: boolean;
      timestamp: string;
      ip: string;
      userAgent: string;
    };
    indexes: {
      'by-ip': string;
      'by-timestamp': string;
    };
  };
  userLogs: {
    key: number;
    value: UserLog;
    indexes: {
      'by-user': number;
      'by-timestamp': string;
      'by-type': string;
    };
  };
}

interface DBInvestment extends Investment {
  userId: number;
}

interface DBExpense extends Expense {
  userId: number;
}

const USER_BAN_EVENT = 'user-banned';

class DatabaseService {
  private dbName = 'KeepInvestDB';
  private version = 2;
  private db: IDBPDatabase<KeepInvestDB> | null = null;

  async initDatabase() {
    try {
      console.log('Initializing database...');
      this.db = await openDB<KeepInvestDB>(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion) {
          console.log('Upgrading database...');
          if (!db.objectStoreNames.contains('users')) {
            const userStore = db.createObjectStore('users', {
              keyPath: 'id',
              autoIncrement: true,
            });
            userStore.createIndex('by-email', 'email', { unique: true });
          }

          if (!db.objectStoreNames.contains('investments')) {
            const investmentStore = db.createObjectStore('investments', {
              keyPath: 'id',
              autoIncrement: true,
            });
            investmentStore.createIndex('by-date', 'date');
            investmentStore.createIndex('by-name', 'name');
            investmentStore.createIndex('by-user', 'userId');
          }

          if (!db.objectStoreNames.contains('incomes')) {
            const incomeStore = db.createObjectStore('incomes', {
              keyPath: 'id',
              autoIncrement: true,
            });
            incomeStore.createIndex('by-date', 'date');
            incomeStore.createIndex('by-name', 'name');
          }

          if (!db.objectStoreNames.contains('expenses')) {
            const expenseStore = db.createObjectStore('expenses', {
              keyPath: 'id',
              autoIncrement: true,
            });
            expenseStore.createIndex('by-date', 'date');
            expenseStore.createIndex('by-category', 'category');
            expenseStore.createIndex('by-user', 'userId');
          }

          if (!db.objectStoreNames.contains('anonymousLogs')) {
            const logStore = db.createObjectStore('anonymousLogs', {
              keyPath: 'id',
              autoIncrement: true,
            });
            logStore.createIndex('by-action', 'action');
            logStore.createIndex('by-timestamp', 'timestamp');
          }

          if (!db.objectStoreNames.contains('loginAttempts')) {
            const loginAttemptsStore = db.createObjectStore('loginAttempts', {
              keyPath: 'id',
              autoIncrement: true,
            });
            loginAttemptsStore.createIndex('by-ip', 'ip');
            loginAttemptsStore.createIndex('by-timestamp', 'timestamp');
          }

          if (!db.objectStoreNames.contains('userLogs')) {
            const logsStore = db.createObjectStore('userLogs', {
              keyPath: 'id',
              autoIncrement: true,
            });
            logsStore.createIndex('by-user', 'userId');
            logsStore.createIndex('by-timestamp', 'timestamp');
            logsStore.createIndex('by-type', 'type');
          }
        },
      });
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async addInvestment(investment: NewInvestment, userId: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    const now = new Date().toISOString();
    const newInvestment: Omit<DBInvestment, 'id'> = {
      ...investment,
      userId,
      createdAt: now,
      updatedAt: now
    };

    try {
      await this.db!.add('investments', newInvestment);
    } catch (error) {
      console.error('Error adding investment:', error);
      throw error;
    }
  }

  async getInvestments(userId: number): Promise<Investment[]> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('investments', 'readonly');
      const index = tx.store.index('by-user');
      const investments = await index.getAll(userId);
      
      return investments.map(inv => ({
        ...inv,
        status: inv.status || 'active'
      }));
    } catch (error) {
      console.error('Error getting investments:', error);
      throw error;
    }
  }

  async updateInvestment(id: number, data: Partial<Investment>): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('investments', 'readwrite');
      const store = tx.objectStore('investments');
      
      const investment = await store.get(id);
      if (!investment) {
        throw new Error('Investment not found');
      }

      const updatedInvestment = {
        ...investment,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedInvestment);
      await tx.done;
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  }

  async deleteInvestment(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      await this.db!.delete('investments', id);
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  }

  async toggleInvestmentStatus(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('investments', 'readwrite');
      const store = tx.objectStore('investments');
      
      const investment = await store.get(id);
      if (!investment) {
        throw new Error('Investment not found');
      }

      const updatedInvestment: Investment = {
        ...investment,
        status: investment.status === 'active' ? 'inactive' : 'active',
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedInvestment);
      await tx.done;
    } catch (error) {
      console.error('Error toggling investment status:', error);
      throw error;
    }
  }

  async getInvestment(id: number): Promise<Investment | null> {
    if (!this.db) await this.initDatabase();
    
    try {
      const investment = await this.db!.get('investments', id);
      if (!investment) return null;
      
      return {
        ...investment,
        status: investment.status || 'active'
      };
    } catch (error) {
      console.error('Error getting investment:', error);
      throw error;
    }
  }

  async checkEmailBanStatus(email: string): Promise<{
    isBanned: boolean;
    reason?: string;
  }> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const existingUser = await store.index('by-email').get(email);

      if (!existingUser) return { isBanned: false };

      return {
        isBanned: existingUser.status === 'banned',
        reason: existingUser.banReason
      };
    } catch (error) {
      console.error('Error checking email ban status:', error);
      return { isBanned: false };
    }
  }

  async registerUser(name: string, email: string, password: string): Promise<UserResponse> {
    if (!this.db) await this.initDatabase();

    try {
      // Verificar status de banimento do email
      const banStatus = await this.checkEmailBanStatus(email);
      if (banStatus.isBanned) {
        throw new Error(`Este email está associado a uma conta banida. Motivo: ${banStatus.reason}`);
      }

      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');

      // Verificar se o email já está cadastrado
      const existingUser = await store.index('by-email').get(email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      const now = new Date().toISOString();
      const newUser = {
        name,
        email,
        password,
        status: 'active' as const,
        role: 'user' as const,
        warnings: [],
        settings: {
          emailNotifications: false,
          profileVisibility: false,
          usageDataShare: false,
          twoFactorEnabled: false,
          darkMode: false,
          language: 'pt-BR',
          currency: 'BRL'
        },
        createdAt: now,
        updatedAt: now
      };

      const id = await store.add(newUser);
      await tx.done;

      await this.addUserLog(id as number, 'ACCOUNT_CREATED', 'Conta criada');

      return {
        id: id as number,
        name,
        email,
        role: newUser.role,
        status: newUser.status,
        settings: newUser.settings
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  private sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input);
  }

  async loginUser(email: string, password: string): Promise<UserResponse | null> {
    if (!this.db) await this.initDatabase();

    try {
      const sanitizedEmail = this.sanitizeInput(email.toLowerCase());
      
      const tx = this.db!.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('by-email');
      const user = await index.get(sanitizedEmail);

      if (!user) return null;

      // Verificar se o usuário está banido
      if (user.status === 'banned') {
        throw new Error(`Conta banida. Motivo: ${user.banReason}`);
      }

      // Verificar se o usuário está suspenso
      if (user.status === 'suspended') {
        const bannedUntil = new Date(user.bannedUntil!);
        if (bannedUntil > new Date()) {
          throw new Error(`Conta suspensa até ${bannedUntil.toLocaleDateString()}. Motivo: ${user.banReason}`);
        }
        // Se a suspensão expirou, reativar a conta
        await this.updateUser(user.id!, {
          status: 'active',
          banReason: undefined,
          bannedAt: undefined,
          bannedUntil: undefined
        });
      }

      // Verificar senha
      if (user.password !== password) {
        await this.addUserLog(user.id!, 'LOGIN_FAILED', 'Tentativa de login falha');
        return null;
      }

      await this.addUserLog(user.id!, 'LOGIN', 'Login realizado com sucesso');
      return {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        settings: user.settings
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  private async logLoginAttempt(userId: number, success: boolean): Promise<void> {
    try {
      const ip = await getClientIP();
      const log = {
        userId,
        success,
        timestamp: new Date().toISOString(),
        ip,
        userAgent: navigator.userAgent,
      };

      await this.db!.add('loginAttempts', log);
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  async getUserById(id: number): Promise<UserResponse | null> {
    if (!this.db) await this.initDatabase();

    try {
      const user = await this.db!.get('users', id);
      if (!user) return null;

      return {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        settings: user.settings
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<UserResponse> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');

      const user = await store.get(id);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedUser);
      await tx.done;

      await this.addUserLog(id, 'PROFILE_UPDATE', 'Perfil atualizado');

      return {
        id: updatedUser.id!,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        settings: updatedUser.settings
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      await this.db!.delete('users', id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getAllIncomes(): Promise<Income[]> {
    if (!this.db) await this.initDatabase();
    
    try {
      const incomes = await this.db!.getAll('incomes');
      return incomes.map(income => ({
        ...income,
        status: income.status || 'active'
      }));
    } catch (error) {
      console.error('Error getting incomes:', error);
      throw error;
    }
  }

  async addIncome(income: NewIncome): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    const now = new Date().toISOString();
    const newIncome: Omit<Income, 'id'> = {
      ...income,
      createdAt: now,
      updatedAt: now
    };

    try {
      await this.db!.add('incomes', newIncome);
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  }

  async updateIncome(id: number, data: Partial<Income>): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('incomes', 'readwrite');
      const store = tx.objectStore('incomes');
      
      const income = await store.get(id);
      if (!income) {
        throw new Error('Income not found');
      }

      const updatedIncome: Income = {
        ...income,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedIncome);
      await tx.done;
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  }

  async deleteIncome(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      await this.db!.delete('incomes', id);
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  }

  async toggleIncomeStatus(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('incomes', 'readwrite');
      const store = tx.objectStore('incomes');
      
      const income = await store.get(id);
      if (!income) {
        throw new Error('Income not found');
      }

      const updatedIncome = {
        ...income,
        status: income.status === 'active' ? 'inactive' : 'active',
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedIncome);
      await tx.done;
    } catch (error) {
      console.error('Error toggling income status:', error);
      throw error;
    }
  }

  async getAllExpenses(userId: number): Promise<Expense[]> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('expenses', 'readonly');
      const index = tx.store.index('by-user');
      return await index.getAll(userId);
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }

  async addExpense(expense: NewExpense, userId: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    const now = new Date().toISOString();
    const newExpense: Omit<DBExpense, 'id'> = {
      ...expense,
      userId,
      createdAt: now,
      updatedAt: now
    };

    try {
      await this.db!.add('expenses', newExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  async updateExpense(id: number, data: Partial<Expense>): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');
      
      const expense = await store.get(id);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const updatedExpense = {
        ...expense,
        ...data,
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedExpense);
      await tx.done;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      await this.db!.delete('expenses', id);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async toggleExpenseStatus(id: number): Promise<void> {
    if (!this.db) await this.initDatabase();
    
    try {
      const tx = this.db!.transaction('expenses', 'readwrite');
      const store = tx.objectStore('expenses');
      
      const expense = await store.get(id);
      if (!expense) {
        throw new Error('Expense not found');
      }

      const updatedExpense = {
        ...expense,
        status: expense.status === 'active' ? 'inactive' : 'active',
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedExpense);
      await tx.done;
    } catch (error) {
      console.error('Error toggling expense status:', error);
      throw error;
    }
  }

  async updateUserName(userId: number, newName: string): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      
      const user = await store.get(userId);
      if (user) {
        user.name = newName;
        user.updatedAt = new Date().toISOString();
        await store.put(user);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error updating user name:', error);
      throw error;
    }
  }

  async updateUserPassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      
      const user = await store.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      user.updatedAt = new Date().toISOString();
      await store.put(user);
      
      await tx.done;
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  async deleteAllUserData(userId: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      // Deletar todos os investimentos do usuário
      const investmentsTx = this.db!.transaction('investments', 'readwrite');
      const investmentsIndex = investmentsTx.store.index('by-user');
      const userInvestments = await investmentsIndex.getAllKeys(userId);
      await Promise.all(userInvestments.map(id => investmentsTx.store.delete(id)));
      await investmentsTx.done;

      // Deletar todas as despesas do usuário
      const expensesTx = this.db!.transaction('expenses', 'readwrite');
      const expensesIndex = expensesTx.store.index('by-user');
      const userExpenses = await expensesIndex.getAllKeys(userId);
      await Promise.all(userExpenses.map(id => expensesTx.store.delete(id)));
      await expensesTx.done;

    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  async updateUserSettings(userId: number, settings: Partial<User['settings']>): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      // Sanitizar inputs
      const sanitizedSettings = Object.entries(settings).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'string' ? this.sanitizeInput(value) : value
      }), {});

      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      
      const user = await store.get(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Adicionar timestamp para proteção contra replay attacks
      const updatedUser = {
        ...user,
        settings: {
          ...user.settings,
          ...sanitizedSettings
        },
        updatedAt: new Date().toISOString(),
        lastModified: Date.now()
      };

      await store.put(updatedUser);
      await tx.done;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async logAnonymousAction(action: LogAction, metadata?: Record<string, any>): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const log: Omit<AnonymousLog, 'id'> = {
        action,
        timestamp: new Date().toISOString(),
        platform: navigator.platform,
        browser: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        metadata
      };

      await this.db!.add('anonymousLogs', log);
    } catch (error) {
      console.error('Error logging action:', error);
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  async getAnonymousLogs(
    filter?: { 
      action?: LogAction; 
      startDate?: Date; 
      endDate?: Date; 
    }
  ): Promise<AnonymousLog[]> {
    if (!this.db) await this.initDatabase();

    try {
      let logs: AnonymousLog[];

      if (filter?.action) {
        const tx = this.db!.transaction('anonymousLogs', 'readonly');
        const index = tx.store.index('by-action');
        logs = await index.getAll(filter.action);
      } else {
        logs = await this.db!.getAll('anonymousLogs');
      }

      if (filter?.startDate || filter?.endDate) {
        logs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (filter.startDate && logDate < filter.startDate) return false;
          if (filter.endDate && logDate > filter.endDate) return false;
          return true;
        });
      }

      return logs;
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  }

  async getLoginAttempts(ip: string): Promise<any[]> {
    if (!this.db) await this.initDatabase();
    
    const tx = this.db!.transaction('loginAttempts', 'readonly');
    const store = tx.objectStore('loginAttempts');
    const index = store.index('by-ip');
    
    return await index.getAll(ip);
  }

  async getFailedAttempts(minutes: number = 15): Promise<any[]> {
    if (!this.db) await this.initDatabase();
    
    const tx = this.db!.transaction('loginAttempts', 'readonly');
    const store = tx.objectStore('loginAttempts');
    const attempts = await store.getAll();
    
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return attempts.filter(attempt => 
      !attempt.success && 
      new Date(attempt.timestamp).getTime() > cutoff
    );
  }

  async createAdmin(data: { name: string; email: string; password: string }): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');

      const existingUser = await store.index('by-email').get(data.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      const now = new Date().toISOString();
      const newUser: User = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'admin',
        status: 'active',
        warnings: [],
        settings: {
          emailNotifications: false,
          profileVisibility: false,
          usageDataShare: false,
          twoFactorEnabled: false,
          darkMode: false,
          language: 'pt-BR',
          currency: 'BRL'
        },
        createdAt: now,
        updatedAt: now
      };

      await store.add(newUser);
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) await this.initDatabase();

    try {
      return await this.db!.getAll('users');
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async banUser(userId: number, reason: string): Promise<void> {
    await this.updateUser(userId, {
      status: 'banned',
      banReason: reason,
      bannedAt: new Date().toISOString()
    });

    await this.addUserLog(userId, 'ACCOUNT_BANNED', 'Conta banida', reason);
    // Emitir evento de banimento
    const event = new CustomEvent(USER_BAN_EVENT, {
      detail: { userId, reason }
    });
    window.dispatchEvent(event);
  }

  async suspendUser(userId: number, reason: string, duration: number): Promise<void> {
    const bannedUntil = new Date();
    bannedUntil.setTime(bannedUntil.getTime() + duration);

    await this.updateUser(userId, {
      status: 'suspended',
      banReason: reason,
      bannedAt: new Date().toISOString(),
      bannedUntil: bannedUntil.toISOString()
    });

    await this.addUserLog(
      userId, 
      'ACCOUNT_SUSPENDED', 
      'Conta suspensa', 
      `Motivo: ${reason}, Duração: ${duration}ms`
    );
  }

  async unbanUser(userId: number): Promise<void> {
    await this.updateUser(userId, {
      status: 'active',
      banReason: undefined,
      bannedAt: undefined,
      bannedUntil: undefined
    });

    await this.addUserLog(userId, 'ACCOUNT_REACTIVATED', 'Conta reativada');
  }

  async addWarning(userId: number, message: string): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      
      const user = await store.get(userId);
      if (!user) throw new Error('User not found');

      const warning: UserWarning = {
        id: Date.now(),
        message,
        createdAt: new Date().toISOString()
      };

      const updatedUser = {
        ...user,
        warnings: [...(user.warnings || []), warning],
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedUser);
      await tx.done;

      await this.addUserLog(
        userId,
        'WARNING_RECEIVED',
        'Aviso recebido',
        message
      );
      
      // Disparar evento de forma síncrona
      const event = new CustomEvent('new-warning', {
        detail: { userId, warning }
      });
      window.dispatchEvent(event);
      
      console.log('Warning added and event dispatched:', { userId, warning });
    } catch (error) {
      console.error('Error adding warning:', error);
      throw error;
    }
  }

  // Método para verificar se o usuário está banido
  async checkUserStatus(userId: number): Promise<{
    isBanned: boolean;
    reason?: string;
  }> {
    const user = await this.getUserById(userId);
    if (!user) return { isBanned: false };

    return {
      isBanned: user.status === 'banned',
      reason: user.banReason
    };
  }

  async getUserWarnings(userId: number): Promise<UserWarning[]> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const user = await store.get(userId);
      
      if (!user) return [];
      console.log('Warnings encontrados:', user.warnings);
      return user.warnings || [];
    } catch (error) {
      console.error('Error getting user warnings:', error);
      return [];
    }
  }

  async markWarningAsRead(userId: number, warningId: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const user = await store.get(userId);
      
      if (!user) throw new Error('User not found');

      // Atualizar o warning específico
      const updatedWarnings = user.warnings.map(warning => 
        warning.id === warningId
          ? { ...warning, readAt: new Date().toISOString() }
          : warning
      );

      // Atualizar o usuário com os warnings atualizados
      const updatedUser = {
        ...user,
        warnings: updatedWarnings,
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedUser);
      await tx.done;

      await this.addUserLog(
        userId,
        'WARNING_READ',
        'Aviso marcado como lido',
        `ID do aviso: ${warningId}`
      );

      console.log('Warning marked as read:', { userId, warningId });
    } catch (error) {
      console.error('Error marking warning as read:', error);
      throw error;
    }
  }

  async markAllWarningsAsRead(userId: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const user = await store.get(userId);
      
      if (!user) throw new Error('User not found');

      const now = new Date().toISOString();
      
      // Marcar todos os warnings como lidos
      const updatedWarnings = user.warnings.map(warning => 
        warning.readAt ? warning : { ...warning, readAt: now }
      );

      // Atualizar o usuário com os warnings atualizados
      const updatedUser = {
        ...user,
        warnings: updatedWarnings,
        updatedAt: now
      };

      await store.put(updatedUser);
      await tx.done;

      console.log('All warnings marked as read for user:', userId);
    } catch (error) {
      console.error('Error marking all warnings as read:', error);
      throw error;
    }
  }

  async clearAllWarnings(userId: number): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('users', 'readwrite');
      const store = tx.objectStore('users');
      const user = await store.get(userId);
      
      if (!user) throw new Error('User not found');

      // Limpar todos os warnings
      const updatedUser = {
        ...user,
        warnings: [],
        updatedAt: new Date().toISOString()
      };

      await store.put(updatedUser);
      await tx.done;

      console.log('All warnings cleared for user:', userId);
    } catch (error) {
      console.error('Error clearing warnings:', error);
      throw error;
    }
  }

  async getUserLogs(userId: number): Promise<UserLog[]> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('userLogs', 'readonly');
      const store = tx.objectStore('userLogs');
      const index = store.index('by-user');
      
      const logs = await index.getAll(userId);
      console.log('Logs encontrados:', logs);
      return logs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting user logs:', error);
      return [];
    }
  }

  async addUserLog(userId: number, type: LogType, action: string, details?: string): Promise<void> {
    if (!this.db) await this.initDatabase();

    try {
      const tx = this.db!.transaction('userLogs', 'readwrite');
      const store = tx.objectStore('userLogs');

      const log: UserLog = {
        id: Date.now(),
        userId,
        type,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip: await getClientIP(),
        userAgent: navigator.userAgent
      };

      await store.add(log);
      await tx.done;
      console.log('Log adicionado:', log);
    } catch (error) {
      console.error('Error adding user log:', error);
    }
  }
}

export const dbService = new DatabaseService(); 