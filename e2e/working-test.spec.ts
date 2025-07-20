import { test, expect } from '@playwright/test';

/**
 * 実際に動作するE2Eテスト
 */

test.describe('ななたうゲーム動作確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('ゲームが正常に起動し、エラーが発生しない', async ({ page }) => {
    // ページエラーをキャプチャ
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // ページタイトルの確認
    await expect(page).toHaveTitle('ななたう - 硝子の心、たう（届く）まで');
    
    // ゲームコンテナの確認
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
    
    // キャンバスの確認
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 3秒待機してゲームの初期化を待つ
    await page.waitForTimeout(3000);
    
    // Game オブジェクトが正常に初期化されているかを確認
    const gameInitialized = await page.evaluate(() => {
      return typeof (window as any).Game !== 'undefined';
    });
    
    // narration オブジェクトが正常に初期化されているかを確認
    const narrationInitialized = await page.evaluate(() => {
      return typeof (window as any).narration !== 'undefined';
    });
    
    // キャンバスが適切なサイズかを確認
    const canvasSize = await canvas.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    // 全ての確認
    expect(gameInitialized).toBeTruthy();
    expect(narrationInitialized).toBeTruthy();
    expect(canvasSize.width).toBeGreaterThan(400);
    expect(canvasSize.height).toBeGreaterThan(200);
    expect(pageErrors).toHaveLength(0);
  });

  test('レスポンシブ対応の確認', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1280, height: 720 });
    let canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await expect(canvas).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await expect(canvas).toBeVisible();
    
    // 各サイズでキャンバスが適切に表示されることを確認
    const mobileCanvasSize = await canvas.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    expect(mobileCanvasSize.width).toBeGreaterThan(0);
    expect(mobileCanvasSize.height).toBeGreaterThan(0);
  });

  test('コンソールメッセージの確認', async ({ page }) => {
    let initializationStarted = false;
    let initializationCompleted = false;
    const errorMessages: string[] = [];
    
    // コンソールメッセージを監視
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Starting game initialization')) {
        initializationStarted = true;
      }
      if (text.includes('Game initialization completed successfully')) {
        initializationCompleted = true;
      }
      if (msg.type() === 'error') {
        errorMessages.push(text);
      }
    });
    
    // 3秒待機
    await page.waitForTimeout(3000);
    
    // 初期化プロセスが実行されたことを確認
    expect(initializationStarted).toBeTruthy();
    expect(initializationCompleted).toBeTruthy();
    expect(errorMessages).toHaveLength(0);
  });
});