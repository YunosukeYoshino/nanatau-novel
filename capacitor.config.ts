import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nanatau.novel',
  appName: 'ななたう',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
    Keyboard: {
      resize: 'ionic',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    Filesystem: {
      iosPaths: {
        library: 'LIBRARY',
        document: 'DOCUMENT',
        external: 'EXTERNAL',
        externalStorage: 'EXTERNAL_STORAGE',
        cache: 'CACHE',
      },
    },
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
