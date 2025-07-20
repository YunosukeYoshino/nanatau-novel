const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // アプリケーション情報
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // メニューからのイベントリスナー
  onMenuNewGame: (callback) => {
    ipcRenderer.on('menu-new-game', callback);
  },
  onMenuLoadGame: (callback) => {
    ipcRenderer.on('menu-load-game', callback);
  },
  onMenuSaveGame: (callback) => {
    ipcRenderer.on('menu-save-game', callback);
  },

  // ファイルシステム操作（ゲームセーブ用）
  saveGameData: (data) => {
    return ipcRenderer.invoke('save-game-data', data);
  },
  loadGameData: () => {
    return ipcRenderer.invoke('load-game-data');
  },
  
  // ウィンドウ制御
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },
  maximizeWindow: () => {
    ipcRenderer.send('maximize-window');
  },
  closeWindow: () => {
    ipcRenderer.send('close-window');
  },

  // 設定データの永続化
  saveSettings: (settings) => {
    return ipcRenderer.invoke('save-settings', settings);
  },
  loadSettings: () => {
    return ipcRenderer.invoke('load-settings');
  },

  // アプリケーション情報
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version');
  },

  // 開発モード判定
  isDevelopment: () => {
    return process.env.NODE_ENV === 'development';
  },
});

// セキュリティ強化: 不要なNode.jsAPIへのアクセスを防ぐ
delete window.require;
delete window.exports;
delete window.module;