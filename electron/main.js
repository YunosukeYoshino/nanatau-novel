const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
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