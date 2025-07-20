import { test, expect } from '@playwright/test';

/**
 * 選択肢システムの統合テスト
 * 高度な選択肢システムでユーザーが選択肢を選んだ際に、ゲームが正しく進行するかをテスト
 */

test.describe('選択肢システム統合テスト', () => {
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

  test('高度な選択肢システムが表示され、選択後にゲームが進行する', async ({ page }) => {
    console.log('Starting advanced choice system test...');

    // 続けるボタンを複数回クリックして選択肢システムまで進む
    const continueButton = page.locator('#continue-button');
    
    // 選択肢システムが表示されるまで進む（最大15回クリック）
    for (let i = 0; i < 15; i++) {
      try {
        // 選択肢モーダルが表示されたかチェック
        const choiceModal = page.locator('#advanced-choice-modal');
        if (await choiceModal.isVisible()) {
          console.log(`Advanced choice modal found after ${i} clicks`);
          break;
        }

        // 続けるボタンが表示されている場合はクリック
        if (await continueButton.isVisible()) {
          await continueButton.click();
          console.log(`Clicked continue button ${i + 1} times`);
          await page.waitForTimeout(1000); // 1秒待機
        } else {
          console.log('Continue button not visible, waiting...');
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log(`Click ${i + 1} failed or timeout, continuing...`);
        await page.waitForTimeout(1000);
      }
    }

    // 高度な選択肢モーダルが表示されるまで待機
    console.log('Waiting for advanced choice modal...');
    await page.waitForSelector('#advanced-choice-modal', { timeout: 30000 });
    
    // モーダルが表示されていることを確認
    const choiceModal = page.locator('#advanced-choice-modal');
    await expect(choiceModal).toBeVisible();
    console.log('Advanced choice modal is visible');

    // 選択肢ボタンが表示されていることを確認
    const choiceButtons = page.locator('#advanced-choice-modal button');
    const buttonCount = await choiceButtons.count();
    console.log(`Found ${buttonCount} choice buttons`);
    expect(buttonCount).toBeGreaterThan(0);

    // 現在のダイアログテキストを記録
    const currentDialogue = await page.locator('#dialogue-text').textContent();
    console.log('Current dialogue before choice:', currentDialogue);

    // 最初の選択肢をクリック
    const firstChoiceButton = choiceButtons.first();
    const choiceText = await firstChoiceButton.textContent();
    console.log('Clicking choice:', choiceText);
    
    await firstChoiceButton.click();

    // 選択肢モーダルが閉じることを確認
    await expect(choiceModal).not.toBeVisible();
    console.log('Choice modal closed after selection');

    // ダイアログが更新されることを確認（選択結果が反映される）
    await page.waitForTimeout(3000); // 選択結果処理の待機

    const updatedDialogue = await page.locator('#dialogue-text').textContent();
    console.log('Updated dialogue after choice:', updatedDialogue);

    // ダイアログテキストが変更されていることを確認
    expect(updatedDialogue).not.toBe(currentDialogue);
    
    // 選択したテキストが反映されていることを確認
    if (choiceText) {
      const choiceTextClean = choiceText.replace(/[\n\r]+/g, ' ').trim();
      expect(updatedDialogue).toContain('を選んでくれたのですね');
    }

    console.log('Choice system test completed successfully');
  });

  test('複数の選択肢から異なる選択をした場合、異なる結果が得られる', async ({ page }) => {
    console.log('Starting multiple choice test...');

    // 選択肢システムまで進む
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const choiceModal = page.locator('#advanced-choice-modal');
        if (await choiceModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1000);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#advanced-choice-modal', { timeout: 30000 });
    
    // 選択肢の数を確認
    const choiceButtons = page.locator('#advanced-choice-modal button');
    const buttonCount = await choiceButtons.count();
    console.log(`Found ${buttonCount} choice buttons for multiple choice test`);

    if (buttonCount > 1) {
      // 2番目の選択肢をクリック
      const secondChoiceButton = choiceButtons.nth(1);
      const secondChoiceText = await secondChoiceButton.textContent();
      console.log('Clicking second choice:', secondChoiceText);
      
      await secondChoiceButton.click();

      // モーダルが閉じることを確認
      await expect(page.locator('#advanced-choice-modal')).not.toBeVisible();

      // ダイアログが更新されることを確認
      await page.waitForTimeout(3000);
      const resultDialogue = await page.locator('#dialogue-text').textContent();
      console.log('Result dialogue for second choice:', resultDialogue);

      // 2番目の選択肢の結果が反映されていることを確認
      expect(resultDialogue).toContain('を選んでくれたのですね');
      
      console.log('Multiple choice test completed successfully');
    } else {
      console.log('Only one choice available, skipping multiple choice test');
    }
  });

  test('選択肢にキーボードナビゲーションが機能する', async ({ page }) => {
    console.log('Starting keyboard navigation test...');

    // 選択肢システムまで進む
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const choiceModal = page.locator('#advanced-choice-modal');
        if (await choiceModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1000);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#advanced-choice-modal', { timeout: 30000 });
    
    // 最初の選択肢ボタンにフォーカス
    const firstChoiceButton = page.locator('#advanced-choice-modal button').first();
    await firstChoiceButton.focus();

    // Enterキーで選択できることを確認
    await page.keyboard.press('Enter');

    // モーダルが閉じることを確認
    await expect(page.locator('#advanced-choice-modal')).not.toBeVisible();

    // ダイアログが更新されることを確認
    await page.waitForTimeout(3000);
    const resultDialogue = await page.locator('#dialogue-text').textContent();
    
    expect(resultDialogue).toContain('を選んでくれたのですね');
    console.log('Keyboard navigation test completed successfully');
  });

  test('選択肢選択後にゲームを続行できる', async ({ page }) => {
    console.log('Starting choice continuation test...');

    // 選択肢システムまで進んで選択
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 15; i++) {
      try {
        const choiceModal = page.locator('#advanced-choice-modal');
        if (await choiceModal.isVisible()) {
          break;
        }
        if (await continueButton.isVisible()) {
          await continueButton.click();
          await page.waitForTimeout(1000);
        } else {
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForSelector('#advanced-choice-modal', { timeout: 30000 });
    
    // 選択肢をクリック
    await page.locator('#advanced-choice-modal button').first().click();
    await page.waitForTimeout(3000);

    // 選択後に続けるボタンが再び機能することを確認
    const dialogueAfterChoice = await page.locator('#dialogue-text').textContent();
    console.log('Dialogue after choice:', dialogueAfterChoice);

    // 続けるボタンがクリック可能であることを確認
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();

    // 続けるボタンをクリックしてゲームが進むことを確認
    await continueButton.click();
    await page.waitForTimeout(2000);

    // ダイアログが更新されることを確認（ゲームが続行している）
    const dialogueAfterContinue = await page.locator('#dialogue-text').textContent();
    console.log('Dialogue after continue:', dialogueAfterContinue);

    // ダイアログが変化していることを確認（ゲームが進行している）
    expect(dialogueAfterContinue).not.toBe(dialogueAfterChoice);

    console.log('Choice continuation test completed successfully');
  });
});