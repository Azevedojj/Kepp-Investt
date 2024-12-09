class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number = 5;
  private readonly timeWindow: number = 15 * 60 * 1000; // 15 minutos

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Limpar tentativas antigas
    const recentAttempts = attempts.filter(timestamp => 
      now - timestamp < this.timeWindow
    );

    console.log('Rate limit check:', {
      key,
      recentAttempts: recentAttempts.length,
      maxAttempts: this.maxAttempts,
      isLimited: recentAttempts.length >= this.maxAttempts
    });
    
    if (recentAttempts.length >= this.maxAttempts) {
      this.attempts.set(key, recentAttempts);
      return true;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return false;
  }

  reset(key: string): void {
    console.log('Resetting rate limit for:', key);
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(timestamp => 
      now - timestamp < this.timeWindow
    );
    
    const remaining = Math.max(0, this.maxAttempts - recentAttempts.length);
    console.log('Remaining attempts:', { key, remaining });
    return remaining;
  }
}

export const rateLimiter = new RateLimiter(); 