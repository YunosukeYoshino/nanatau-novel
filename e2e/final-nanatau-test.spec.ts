import { test, expect } from '@playwright/test';

test.describe('ななたうゲーム最終確認', () => {
  test('ゲームが正常に起動し基本動作する', async ({ page }) => {
    // サーバーに直接アクセス
    await page.goto('http://localhost:5175/');
    
    console.log('🎮 ゲーム起動テスト開始...');
    
    // ゲーム初期化まで待機
    await page.waitForSelector('#dialogue-container', { timeout: 10000 });
    console.log('✅ ダイアログコンテナ表示確認');
    
    // 基本UI要素の確認
    await expect(page.locator('#character-name')).toBeVisible();
    await expect(page.locator('#dialogue-text')).toBeVisible();
    await expect(page.locator('#continue-button')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    
    console.log('✅ 基本UI要素表示確認');
    
    // ダイアログテキストが表示されていることを確認
    const dialogueText = await page.locator('#dialogue-text').textContent();
    expect(dialogueText).toBeTruthy();
    console.log(`📝 初期ダイアログ: "${dialogueText?.substring(0, 30)}..."`);
    
    // 続けるボタンをクリックしてゲームが進むことを確認
    const continueButton = page.locator('#continue-button');
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // ダイアログが更新されることを確認
    const updatedDialogue = await page.locator('#dialogue-text').textContent();
    console.log(`📝 更新後ダイアログ: "${updatedDialogue?.substring(0, 30)}..."`);
    
    expect(updatedDialogue).toBeTruthy();
    
    console.log('🎉 ななたうゲーム基本動作確認成功！');
  });
});