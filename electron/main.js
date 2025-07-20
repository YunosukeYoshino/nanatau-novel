const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const isDev = process.env.NODE_ENV === 'development';

// メインウィンドウの参照を保持
let mainWindow;

/**
 * メインウィンドウを作成
 */
function createWindow() {
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false, // 準備完了まで非表示
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  // 開発モードかプロダクションモードかで読み込み先を変更
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // 開発ツールを開く
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // ウィンドウの準備が完了したら表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 開発モードでない場合、フォーカスを当てる
    if (!isDev) {
      mainWindow.focus();
    }
  });

  // ウィンドウが閉じられた時の処理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 外部リンクをデフォルトブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ナビゲーションの制御（セキュリティ対策）
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // 開発モードでない場合、外部ナビゲーションを禁止
    if (!isDev && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
}

/**
 * アプリケーションメニューを設定
 */
function createMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新しいゲーム',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-game');
          }
        },
        {
          label: 'ゲームを読み込み',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu-load-game');
          }
        },
        {
          label: 'ゲームを保存',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-game');
          }
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '表示',
      submenu: [
        {
          label: '全画面表示',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
          }
        },
        {
          label: '最前面に表示',
          type: 'checkbox',
          click: (menuItem) => {
            mainWindow.setAlwaysOnTop(menuItem.checked);
          }
        },
        { type: 'separator' },
        {
          label: '再読み込み',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'ゲームについて',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'ななたうについて',
              message: 'ななたう（硝子の心、たう（届く）まで）',
              detail: 'Visual Novel Game powered by Pixi\'VN\nVersion: 1.0.0',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  // macOSの場合、アプリケーションメニューを追加
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          label: `${app.getName()}について`,
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'サービス',
          role: 'services'
        },
        { type: 'separator' },
        {
          label: `${app.getName()}を隠す`,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: '他を隠す',
          accelerator: 'Command+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'すべて表示',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// アプリケーションの初期化完了時
app.whenReady().then(() => {
  createWindow();
  createMenu();
  setupIpcHandlers(); // IPCハンドラーの設定

  // macOSでは、ドックアイコンがクリックされた時にウィンドウを再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 全てのウィンドウが閉じられた時
app.on('window-all-closed', () => {
  // macOS以外では、全ウィンドウが閉じられたらアプリケーションを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// セキュリティ: 新しいウィンドウの作成を制限
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// GPU不具合対策
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

/**
 * セキュリティ: 入力値検証とサニタイゼーション
 */
function validateSlotId(slotId) {
  if (!slotId || typeof slotId !== 'string') {
    return null;
  }
  
  // 安全な文字のみ許可: 英数字、ハイフン、アンダースコア
  const sanitized = slotId.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  // 長さ制限 (最大32文字)
  if (sanitized.length === 0 || sanitized.length > 32) {
    return null;
  }
  
  // パストラバーサル攻撃を防ぐため、特定の文字列を拒否
  const dangerousPatterns = ['.', '/', '\\', ':', '*', '?', '"', '<', '>', '|'];
  for (const pattern of dangerousPatterns) {
    if (sanitized.includes(pattern)) {
      return null;
    }
  }
  
  return sanitized;
}

function validateSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    return { isValid: false, error: 'Settings must be an object' };
  }

  // 必須プロパティの検証
  const requiredSchema = {
    volume: {
      master: 'number',
      bgm: 'number',
      se: 'number',
      voice: 'number'
    },
    display: {
      fullscreen: 'boolean',
      autoSave: 'boolean'
    },
    controls: {
      autoAdvance: 'boolean',
      skipSpeed: 'number'
    }
  };

  function validateObject(obj, schema, path = '') {
    for (const [key, expectedType] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj)) {
        return { isValid: false, error: `Missing required property: ${currentPath}` };
      }

      if (typeof expectedType === 'object') {
        if (typeof obj[key] !== 'object' || obj[key] === null) {
          return { isValid: false, error: `Property ${currentPath} must be an object` };
        }
        const nestedResult = validateObject(obj[key], expectedType, currentPath);
        if (!nestedResult.isValid) {
          return nestedResult;
        }
      } else {
        if (typeof obj[key] !== expectedType) {
          return { isValid: false, error: `Property ${currentPath} must be of type ${expectedType}` };
        }
        
        // 数値の範囲検証
        if (expectedType === 'number') {
          if (key.includes('volume') || key === 'skipSpeed') {
            if (obj[key] < 0 || obj[key] > 2) {
              return { isValid: false, error: `Property ${currentPath} must be between 0 and 2` };
            }
          }
        }
      }
    }
    return { isValid: true };
  }

  return validateObject(settings, requiredSchema);
}

/**
 * IPCハンドラーの設定
 */
function setupIpcHandlers() {
  // ゲームデータのセーブ・ロード
  ipcMain.handle('save-game-data', async (event, data) => {
    try {
      // 入力値検証
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid game data: must be an object' };
      }

      // slotId検証とサニタイゼーション
      const rawSlotId = data.slotId || 'quicksave';
      const sanitizedSlotId = validateSlotId(rawSlotId);
      
      if (!sanitizedSlotId) {
        return { 
          success: false, 
          error: 'Invalid slot ID: must contain only alphanumeric characters, hyphens, and underscores (max 32 chars)' 
        };
      }

      const userDataPath = app.getPath('userData');
      const savePath = path.join(userDataPath, 'saves');
      
      // セーブディレクトリが存在しない場合は作成
      await fs.mkdir(savePath, { recursive: true });
      
      // サニタイズされたslotIdを使用
      const filePath = path.join(savePath, `${sanitizedSlotId}.json`);
      
      // データのサイズ制限 (10MB)
      const dataString = JSON.stringify(data, null, 2);
      if (dataString.length > 10 * 1024 * 1024) {
        return { success: false, error: 'Game data too large (max 10MB)' };
      }
      
      await fs.writeFile(filePath, dataString, 'utf8');
      
      return { success: true, path: filePath, sanitizedSlotId };
    } catch (error) {
      console.error('Failed to save game data:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-game-data', async (event, slotId) => {
    try {
      // slotId検証とサニタイゼーション
      const rawSlotId = slotId || 'quicksave';
      const sanitizedSlotId = validateSlotId(rawSlotId);
      
      if (!sanitizedSlotId) {
        return { 
          success: false, 
          error: 'Invalid slot ID: must contain only alphanumeric characters, hyphens, and underscores (max 32 chars)' 
        };
      }

      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'saves', `${sanitizedSlotId}.json`);
      
      // ファイルサイズ確認
      const stats = await fs.stat(filePath);
      if (stats.size > 10 * 1024 * 1024) { // 10MB制限
        return { success: false, error: 'Save file too large' };
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      
      return { success: true, data: parsedData };
    } catch (error) {
      console.error('Failed to load game data:', error);
      return { success: false, error: error.message };
    }
  });

  // 設定データのセーブ・ロード
  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      // 設定データの検証
      const validation = validateSettings(settings);
      if (!validation.isValid) {
        return { 
          success: false, 
          error: `Invalid settings data: ${validation.error}` 
        };
      }

      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'settings.json');
      
      // データのサイズ制限 (1MB)
      const dataString = JSON.stringify(settings, null, 2);
      if (dataString.length > 1024 * 1024) {
        return { success: false, error: 'Settings data too large (max 1MB)' };
      }
      
      await fs.writeFile(filePath, dataString, 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('load-settings', async (event) => {
    try {
      const userDataPath = app.getPath('userData');
      const filePath = path.join(userDataPath, 'settings.json');
      
      // ファイルサイズ確認
      const stats = await fs.stat(filePath);
      if (stats.size > 1024 * 1024) { // 1MB制限
        console.warn('Settings file too large, using defaults');
        throw new Error('Settings file too large');
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      const parsedSettings = JSON.parse(data);
      
      // 読み込んだ設定の検証
      const validation = validateSettings(parsedSettings);
      if (!validation.isValid) {
        console.warn('Invalid settings file, using defaults:', validation.error);
        throw new Error('Invalid settings format');
      }
      
      return { success: true, settings: parsedSettings };
    } catch (error) {
      // 設定ファイルが存在しない場合や無効な場合はデフォルト設定を返す
      console.log('Loading default settings due to error:', error.message);
      return { 
        success: true, 
        settings: {
          volume: { master: 1.0, bgm: 0.8, se: 0.7, voice: 0.9 },
          display: { fullscreen: false, autoSave: true },
          controls: { autoAdvance: false, skipSpeed: 1.0 }
        }
      };
    }
  });

  // アプリケーション情報取得
  ipcMain.handle('get-app-version', async (event) => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node
    };
  });

  // ウィンドウ制御
  ipcMain.on('minimize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    }
  });

  ipcMain.on('maximize-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.on('close-window', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
  });

  // ファイルダイアログ
  ipcMain.handle('show-save-dialog', async (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showSaveDialog(window, options);
    return result;
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(window, options);
    return result;
  });
}