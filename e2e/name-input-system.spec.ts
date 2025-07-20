import { test, expect } from '@playwright/test';

/**
 * プレイヤー名入力システムの統合テスト
 * プレイヤーが名前を入力した際に、ゲームが正しく進行し名前が反映されるかをテスト
 */

test.describe('プレイヤー名入力システム統合テスト', () => {
  test.beforeEach(async ({ page }) => {
    // コンソールエラーをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // ページに移動
    await page.goto('/');
    
    // ゲーム初期化完了まで待機
    await page.waitForSelector('#dialogue-container', { timeout: 15000 });
    console.log('Game initialized, dialogue container found');
  });

  test('プレイヤー名入力モーダルが表示され、名前入力後にゲームが進行する', async ({ page }) => {
    console.log('Starting name input system test...');

    // 続けるボタンを複数回クリックして名前入力システムまで進む
    const continueButton = page.locator('#continue-button');
    
    // 名前入力モーダルが表示されるまで進む
    for (let i = 0; i < 15; i++) {
      try {
        // 名前入力モーダルが表示されたかチェック
        const nameModal = page.locator('#name-input-modal');
        if (await nameModal.isVisible()) {
          console.log(`Name input modal found after ${i} clicks`);
          break;
        }

        // 続けるボタンが表示されている場合はクリック
        if (await continueButton.isVisible()) {
          await continueButton.click();
          console.log(`Clicked continue button ${i + 1} times`);
          await page.waitForTimeout(1500); // 1.5秒待機
        } else {
          console.log('Continue button not visible, waiting...');
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`Click ${i + 1} failed or timeout, continuing...`);
        await page.waitForTimeout(1000);
      }
    }

    // 名前入力モーダルが表示されるまで待機
    console.log('Waiting for name input modal...');
    await page.waitForSelector('#name-input-modal', { timeout: 30000 });
    
    // モーダルが表示されていることを確認
    const nameModal = page.locator('#name-input-modal');
    await expect(nameModal).toBeVisible();
    console.log('Name input modal is visible');

    // 入力フィールドが存在することを確認
    const nameInput = page.locator('#player-name-input');
    await expect(nameInput).toBeVisible();
    console.log('Name input field is visible');

    // テスト用の名前を入力
    const testPlayerName = 'テストプレイヤー';
    await nameInput.fill(testPlayerName);
    console.log(`Entered player name: ${testPlayerName}`);

    // 入力された名前が正しく表示されることを確認
    await expect(nameInput).toHaveValue(testPlayerName);

    // 決定ボタンをクリック
    const confirmButton = page.locator('button:has-text("決定")');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    console.log('Clicked confirm button');

    // モーダルが閉じることを確認
    await expect(nameModal).not.toBeVisible();
    console.log('Name input modal closed');

    // ダイアログが更新されることを確認（名前が反映される）
    await page.waitForTimeout(3000); // 名前入力処理の待機

    const updatedDialogue = await page.locator('#dialogue-text').textContent();
    console.log('Updated dialogue after name input:', updatedDialogue);

    // 入力した名前がダイアログに反映されていることを確認
    expect(updatedDialogue).toContain(testPlayerName);
    expect(updatedDialogue).toContain('さん、素敵なお名前ですね');

    console.log('Name input system test completed successfully');
  });

  test('名前入力でEnterキーでも決定できる', async ({ page }) => {
    console.log('Starting Enter key confirmation test...');

    // 名前入力モーダルまで進む
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const nameModal = page.locator('#name-input-modal');
        if (await nameModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1500);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#name-input-modal', { timeout: 30000 });
    
    // 名前を入力
    const nameInput = page.locator('#player-name-input');
    const testPlayerName = 'Enterテスト';
    await nameInput.fill(testPlayerName);
    console.log(`Entered player name: ${testPlayerName}`);

    // Enterキーで決定
    await nameInput.press('Enter');
    console.log('Pressed Enter key');

    // モーダルが閉じることを確認
    await expect(page.locator('#name-input-modal')).not.toBeVisible();

    // 名前が反映されることを確認
    await page.waitForTimeout(3000);
    const resultDialogue = await page.locator('#dialogue-text').textContent();
    expect(resultDialogue).toContain(testPlayerName);

    console.log('Enter key confirmation test completed successfully');
  });

  test('スキップボタンでデフォルト名を使用できる', async ({ page }) => {
    console.log('Starting skip button test...');

    // 名前入力モーダルまで進む
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const nameModal = page.locator('#name-input-modal');
        if (await nameModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1500);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#name-input-modal', { timeout: 30000 });
    
    // スキップボタンをクリック
    const skipButton = page.locator('button:has-text("スキップ")');
    await expect(skipButton).toBeVisible();
    await skipButton.click();
    console.log('Clicked skip button');

    // モーダルが閉じることを確認
    await expect(page.locator('#name-input-modal')).not.toBeVisible();

    // デフォルト名（プレイヤー）が使用されることを確認
    await page.waitForTimeout(3000);
    const resultDialogue = await page.locator('#dialogue-text').textContent();
    expect(resultDialogue).toContain('プレイヤーさん、素敵なお名前ですね');

    console.log('Skip button test completed successfully');
  });

  test('空の名前を入力した場合デフォルト名が使用される', async ({ page }) => {
    console.log('Starting empty name test...');

    // 名前入力モーダルまで進む
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const nameModal = page.locator('#name-input-modal');
        if (await nameModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1500);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#name-input-modal', { timeout: 30000 });
    
    // 空の名前のまま決定
    const nameInput = page.locator('#player-name-input');
    await nameInput.fill(''); // 空にする
    
    const confirmButton = page.locator('button:has-text("決定")');
    await confirmButton.click();
    console.log('Confirmed with empty name');

    // モーダルが閉じることを確認
    await expect(page.locator('#name-input-modal')).not.toBeVisible();

    // デフォルト名が使用されることを確認
    await page.waitForTimeout(3000);
    const resultDialogue = await page.locator('#dialogue-text').textContent();
    expect(resultDialogue).toContain('プレイヤーさん、素敵なお名前ですね');

    console.log('Empty name test completed successfully');
  });

  test('名前入力後にゲームを続行できる', async ({ page }) => {
    console.log('Starting name input continuation test...');

    // 名前入力システムを完了
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const nameModal = page.locator('#name-input-modal');
        if (await nameModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1500);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#name-input-modal', { timeout: 30000 });
    
    // 名前を入力して決定
    const nameInput = page.locator('#player-name-input');
    await nameInput.fill('継続テスト');
    await page.locator('button:has-text("決定")').click();

    // 名前入力後のダイアログを確認
    await page.waitForTimeout(3000);
    const dialogueAfterName = await page.locator('#dialogue-text').textContent();
    console.log('Dialogue after name input:', dialogueAfterName);

    // 続けるボタンが再び機能することを確認
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    // 続けるボタンをクリックしてゲームが進むことを確認
    await continueButton.click();
    await page.waitForTimeout(2000);

    // ダイアログが更新されることを確認（ゲームが続行している）
    const dialogueAfterContinue = await page.locator('#dialogue-text').textContent();
    console.log('Dialogue after continue:', dialogueAfterContinue);

    // ダイアログが変化していることを確認（ゲームが進行している）
    expect(dialogueAfterContinue).not.toBe(dialogueAfterName);

    console.log('Name input continuation test completed successfully');
  });
});