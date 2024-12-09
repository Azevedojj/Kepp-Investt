const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs específicas de forma segura
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo de APIs seguras
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  updateUserSettings: (settings) => ipcRenderer.invoke('updateUserSettings', settings),
  // Adicione outras APIs necessárias aqui
}); 