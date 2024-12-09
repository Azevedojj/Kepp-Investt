import { dbService } from '../services/DatabaseService';
import { rateLimiter } from './rateLimit';
import { getClientIP } from './getClientIP';

export const debugDB = async () => {
  const ip = await getClientIP();
  console.log('=== Debug Login Protection ===');
  
  console.log('Rate Limiter Status:');
  const attempts = rateLimiter.getAttempts(`login:${ip}`);
  console.log('Tentativas:', attempts);
  console.log('Tentativas restantes:', rateLimiter.getRemainingAttempts(`login:${ip}`));
  
  console.log('\nLogin Attempts from DB:');
  const dbAttempts = await dbService.getLoginAttempts(ip);
  console.table(dbAttempts);
};

// Para usar no console do navegador
(window as any).debugLoginSystem = debugDB; 