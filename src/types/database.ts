export interface KeepInvestDB extends DBSchema {
  // ... outras stores ...

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
} 