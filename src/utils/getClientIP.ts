export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting client IP:', error);
    // Fallback para um identificador alternativo em caso de falha
    return `${navigator.userAgent}-${window.innerWidth}x${window.innerHeight}`;
  }
}; 