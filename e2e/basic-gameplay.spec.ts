import { test, expect } from '@playwright/test';

/**
 * 基本ゲームプレイのE2Eテスト
 */

test.describe('基本ゲームプレイ', () => {
  test.beforeEach(async ({ page }) => {
    // コンソールログをキャプチャ
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]: ${msg.text()}`);
    });

    // エラーをキャプチャ
    page.on('pageerror', error => {
      console.error(`Browser error: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('ゲーム起動時にタイトル画面が正常に表示される', async ({ page }) => {
    // ページタイトルが正しく設定されているかを確認
    await expect(page).toHaveTitle('ななたう - 硝子の心、たう（届く）まで');
    
    // ゲームコンテナが表示されているかを確認
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
    
    // Pixiキャンバスが表示されているかを確認
    const pixiCanvas = page.locator('canvas');
    await expect(pixiCanvas).toBeVisible();
  });

  test('Pixi\'VNエンジンが正常に初期化される', async ({ page }) => {
    // コンソールログでエンジンの初期化成功を確認
    const initMessage = page.waitForEvent('console', msg => 
      msg.text().includes('Pixi\'VN Engine initialized successfully!')
    );
    
    // ページエラーをキャプチャ
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // 初期化メッセージを待機
    await initMessage;
    
    // エンジンが正常に動作していることを確認
    const hasGame = await page.evaluate(() => {
      return typeof (window as any).Game !== 'undefined';
    });
    
    const hasNarration = await page.evaluate(() => {
      return typeof (window as any).narration !== 'undefined';
    });
    
    expect(hasGame).toBeTruthy();
    expect(hasNarration).toBeTruthy();
    expect(pageErrors).toHaveLength(0);
  });

  test('ゲーム画面が適切にレンダリングされる', async ({ page }) => {
    // 初期化完了を待機
    await page.waitForEvent('console', msg => 
      msg.text().includes('Pixi\'VN Engine initialized successfully!')
    );
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // キャンバスのサイズが適切かを確認
    const canvasSize = await canvas.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    
    expect(canvasSize.width).toBeGreaterThan(400);
    expect(canvasSize.height).toBeGreaterThan(200);
  });

  test('エラー詳細の確認', async ({ page }) => {
    const consoleMessages: { type: string, text: string }[] = [];
    const pageErrors: string[] = [];
    
    // 全てのコンソールメッセージをキャプチャ
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      console.log(`Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // ページエラーをキャプチャ
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.error(`Page Error: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    });
    
    // 3秒待機してログを確認
    await page.waitForTimeout(3000);
    
    console.log('\n=== Console Messages ===');
    consoleMessages.forEach(msg => {
      console.log(`${msg.type}: ${msg.text}`);
    });
    
    console.log('\n=== Page Errors ===');
    pageErrors.forEach(error => {
      console.log(`Error: ${error}`);
    });
    
    // 初期化が開始されているかを確認
    const hasStartMessage = consoleMessages.some(msg => 
      msg.text.includes('Starting game initialization')
    );
    
    console.log(`Has start message: ${hasStartMessage}`);
    
    // 少なくとも初期化が始まっていることを確認
    expect(hasStartMessage).toBeTruthy();
  });
});