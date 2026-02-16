// electron/preload.js - Preload Script (Security Bridge)
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // File/Folder selection
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  showMessage: (options) => ipcRenderer.invoke('show-message', options),

  // IPC listeners
  on: (channel, callback) => {
    const validChannels = [
      'scan-library',
      'batch-edit',
      'sync-serato',
      'sync-rekordbox',
      'sync-traktor',
      'find-missing-files',
      'remove-duplicates',
      'analyze-audio',
      'music-folder-selected',
      'import-playlist',
      'export-playlist',
    ];

    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // Platform info
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});

// Expose environment
contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  isDevelopment: process.env.NODE_ENV === 'development',
});

console.log('🔒 Preload script loaded - Electron API exposed securely');
