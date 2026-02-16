// electron/main.js - Electron Main Process
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendProcess;

// Start backend server
function startBackend() {
  const backendPath = path.join(__dirname, '..', 'backend', 'dist', 'index.js');

  console.log('🚀 Starting backend server...');
  backendProcess = spawn('node', [backendPath], {
    cwd: path.join(__dirname, '..', 'backend'),
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      PORT: '5000',
    },
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error] ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0a0a0a',
    show: false,
    title: 'DJ Library Manager',
  });

  // Wait for window to be ready before showing
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Load frontend
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000');

    // Auto-reload on frontend changes
    mainWindow.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 1000);
    });
  } else {
    // In production, load built files
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Music Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => openMusicFolder(),
        },
        {
          label: 'Scan Library',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.webContents.send('scan-library'),
        },
        { type: 'separator' },
        {
          label: 'Import Playlist',
          click: () => importPlaylist(),
        },
        {
          label: 'Export Playlist',
          click: () => exportPlaylist(),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Batch Edit Tracks',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow.webContents.send('batch-edit'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Integrations',
      submenu: [
        {
          label: 'Sync with Serato',
          click: () => mainWindow.webContents.send('sync-serato'),
        },
        {
          label: 'Sync with rekordbox',
          click: () => mainWindow.webContents.send('sync-rekordbox'),
        },
        {
          label: 'Sync with Traktor',
          click: () => mainWindow.webContents.send('sync-traktor'),
        },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Find Missing Files',
          click: () => mainWindow.webContents.send('find-missing-files'),
        },
        {
          label: 'Remove Duplicates',
          click: () => mainWindow.webContents.send('remove-duplicates'),
        },
        {
          label: 'Analyze Audio Features',
          click: () => mainWindow.webContents.send('analyze-audio'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin'
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal(
              'https://github.com/yourusername/dj-library-manager'
            );
          },
        },
        {
          label: 'Report Issue',
          click: () => {
            require('electron').shell.openExternal(
              'https://github.com/yourusername/dj-library-manager/issues'
            );
          },
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About DJ Library Manager',
              message: 'DJ Library Manager',
              detail: 'Version 1.0.0\n\nA professional DJ library management system with multi-platform sync capabilities.\n\nBuilt with Electron, React, and Node.js',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
async function openMusicFolder() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Music Library Folder',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    mainWindow.webContents.send('music-folder-selected', folderPath);
    return folderPath;
  }
}

async function importPlaylist() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Playlist Files', extensions: ['m3u', 'm3u8', 'pls', 'nml', 'xml'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    title: 'Import Playlist',
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    mainWindow.webContents.send('import-playlist', filePath);
    return filePath;
  }
}

async function exportPlaylist() {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'M3U Playlist', extensions: ['m3u'] },
      { name: 'M3U8 Playlist', extensions: ['m3u8'] },
    ],
    title: 'Export Playlist',
  });

  if (!result.canceled && result.filePath) {
    mainWindow.webContents.send('export-playlist', result.filePath);
    return result.filePath;
  }
}

// App lifecycle
app.whenReady().then(() => {
  // IPC handlers - must be registered after app is ready
  ipcMain.handle('select-folder', openMusicFolder);
  ipcMain.handle('select-file', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  });
  ipcMain.handle('save-file', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  });
  ipcMain.handle('show-message', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  });

  // Start backend server
  startBackend();

  // Wait a bit for backend to start, then create window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Kill backend process
  if (backendProcess) {
    console.log('🛑 Stopping backend server...');
    backendProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});
