import { test, expect } from '@playwright/test';

/**
 * 最終的なE2Eテスト - ゲームが実際にプレイできるかを確認
 */

test.describe('ななたうゲーム - 実際にプレイできるかの確認', () => {
  
  test('ゲームが正常に起動し、プレイ可能な状態になる', async ({ page }) => {
    // エラーをキャプチャ
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
      console.error(`Page Error: ${error.message}`);
    });

    // ページに移動
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ページタイトルの確認
    await expect(page).toHaveTitle('ななたう - 硝子の心、たう（届く）まで');
    
    // ゲームコンテナの確認
    const gameContainer = page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
    
    // ゲームの初期化を待つ
    await page.waitForTimeout(4000);
    
    // キャンバスが作成されているかを確認（ゲームエンジンが動作している証拠）
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // ゲームエンジンのオブジェクトが正常に初期化されているかを確認
    const gameEngineStatus = await page.evaluate(() => {
      return {
        hasGame: typeof (window as any).Game !== 'undefined',
        hasNarration: typeof (window as any).narration !== 'undefined',
        canvasCount: document.querySelectorAll('canvas').length
      };
    });
    
    // キャンバスが適切なサイズで表示されているかを確認
    const canvasSize = await canvas.evaluate((canvas) => {
      const rect = canvas.getBoundingClientRect();
      return { 
        width: rect.width, 
        height: rect.height,
        displayed: rect.width > 0 && rect.height > 0
      };
    });
    
    // 全ての確認
    console.log('Game Engine Status:', gameEngineStatus);
    console.log('Canvas Size:', canvasSize);
    console.log('Page Errors:', pageErrors);
    
    expect(gameEngineStatus.hasGame).toBeTruthy();
    expect(gameEngineStatus.hasNarration).toBeTruthy();
    expect(gameEngineStatus.canvasCount).toBe(1); // 1つのキャンバスのみ
    expect(canvasSize.displayed).toBeTruthy();
    expect(canvasSize.width).toBeGreaterThan(400);
    expect(canvasSize.height).toBeGreaterThan(200);
    expect(pageErrors).toHaveLength(0);
  });

  test('複数ブラウザでの動作確認（基本テスト）', async ({ page, browserName }) => {
    // ページに移動
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 基本的な要素の確認
    await expect(page).toHaveTitle('ななたう - 硝子の心、たう（届く）まで');
    await expect(page.locator('#game-container')).toBeVisible();
    
    // 初期化を待つ
    await page.waitForTimeout(3000);
    
    // キャンバスの存在確認
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    console.log(`Browser ${browserName}: Game canvas visible and working`);
  });
});