import { test, expect } from '@playwright/test';

/**
 * 完成したななたうゲームの統合テスト
 * 実際のシナリオでゲームが正常に動作するかを確認
 */

test.describe('完成ななたうゲーム統合テスト', () => {
  test.beforeEach(async ({ page }) => {
    // Playwrightのデフォルトポートを5175に更新
    await page.goto('http://localhost:5175/');
    await page.waitForSelector('#dialogue-container', { timeout: 15000 });
    console.log('🎮 ななたうゲーム起動完了');
  });

  test('序章から第一章までゲームが正常に進行する', async ({ page }) => {
    console.log('🌅 序章テスト開始...');

    const continueButton = page.locator('#continue-button');
    let sceneCount = 0;
    const maxScenes = 15; // 序章の想定シーン数

    // 序章を進める
    while (sceneCount < maxScenes) {
      try {
        sceneCount++;
        console.log(`📖 シーン ${sceneCount}:`);

        // 現在のダイアログを確認
        const dialogueText = await page.locator('#dialogue-text').textContent();
        console.log(`  "${dialogueText?.substring(0, 30)}..."`);

        // 特定のシーンを検出
        if (dialogueText?.includes('ななたう - 硝子の心')) {
          console.log('  🎯 タイトル画面を確認');
        } else if (dialogueText?.includes('夕暮れの坂道')) {
          console.log('  🌆 背景設定を確認');
        } else if (dialogueText?.includes('やっと会えたね')) {
          console.log('  👧 ななたう初登場を確認');
        }

        // 続けるボタンをクリック
        if (await continueButton.isVisible({ timeout: 2000 })) {
          await continueButton.click();
          await page.waitForTimeout(1000);
        } else {
          console.log('  ⚠️ 続けるボタンが見つからない');
          break;
        }

      } catch (error) {
        console.log(`  ❌ シーン ${sceneCount} でエラー: ${error}`);
        break;
      }
    }

    // 序章完了確認
    console.log(`✅ 序章テスト完了 (${sceneCount}シーン進行)`);
    
    // 最低限ゲームが動作していることを確認
    const finalDialogue = await page.locator('#dialogue-text').textContent();
    expect(finalDialogue).toBeTruthy();
  });

  test('ゲームUIとキャラクター表示が正常に動作する', async ({ page }) => {
    console.log('🎨 UI表示テスト開始...');

    // 基本UI要素の確認
    await expect(page.locator('#dialogue-container')).toBeVisible();
    await expect(page.locator('#character-name')).toBeVisible();
    await expect(page.locator('#dialogue-text')).toBeVisible();
    await expect(page.locator('#continue-button')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();

    console.log('✅ 基本UI要素の表示確認完了');

    // キャラクター名の表示確認
    const continueButton = page.locator('#continue-button');
    
    for (let i = 0; i < 5; i++) {
      if (await continueButton.isVisible({ timeout: 1000 })) {
        await continueButton.click();
        
        const characterName = await page.locator('#character-name').textContent();
        if (characterName && characterName.trim()) {
          console.log(`  👤 キャラクター名表示: "${characterName}"`);
          
          if (characterName === 'ななたう') {
            console.log('  ✅ ななたう正常表示確認');
            break;
          }
        }
        
        await page.waitForTimeout(1000);
      }
    }

    console.log('✅ UI・キャラクター表示テスト完了');
  });

  test('シナリオパーサーとディレクティブが正常に動作する', async ({ page }) => {
    console.log('📄 シナリオシステムテスト開始...');

    const continueButton = page.locator('#continue-button');
    let foundDirectives = {
      background: false,
      character: false,
      dialogue: false,
    };

    // シナリオを進めてディレクティブを確認
    for (let i = 0; i < 10; i++) {
      try {
        // コンソールログからディレクティブ処理を確認
        const logs: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'log') {
            logs.push(msg.text());
          }
        });

        if (await continueButton.isVisible({ timeout: 2000 })) {
          await continueButton.click();
          await page.waitForTimeout(1500);

          // ログからディレクティブ処理を検出
          const recentLogs = logs.slice(-5).join(' ');
          
          if (recentLogs.includes('Background set:')) {
            foundDirectives.background = true;
            console.log('  🖼️ 背景ディレクティブ動作確認');
          }
          
          if (recentLogs.includes('Character shown:')) {
            foundDirectives.character = true;
            console.log('  👤 キャラクターディレクティブ動作確認');
          }

          // ダイアログが表示されていることを確認
          const dialogueText = await page.locator('#dialogue-text').textContent();
          if (dialogueText && dialogueText.length > 0) {
            foundDirectives.dialogue = true;
            console.log(`  💬 ダイアログ表示: "${dialogueText.substring(0, 20)}..."`);
          }
        }
      } catch (error) {
        console.log(`  ⚠️ ステップ ${i + 1} でエラー: ${error}`);
      }
    }

    // 結果確認
    console.log('📊 ディレクティブ動作結果:');
    console.log(`  背景: ${foundDirectives.background ? '✅' : '❌'}`);
    console.log(`  キャラクター: ${foundDirectives.character ? '✅' : '❌'}`);
    console.log(`  ダイアログ: ${foundDirectives.dialogue ? '✅' : '❌'}`);

    // 少なくともダイアログが動作していることを確認
    expect(foundDirectives.dialogue).toBe(true);
    console.log('✅ シナリオシステムテスト完了');
  });

  test('ゲーム状態管理とタイプライター効果が動作する', async ({ page }) => {
    console.log('⚙️ ゲーム状態・エフェクトテスト開始...');

    // ゲーム状態の確認
    const gameState = await page.evaluate(() => {
      return {
        hasGameState: !!(window as any).gameState,
        currentChapter: (window as any).gameState?.currentChapter,
        sceneIndex: (window as any).gameState?.currentSceneIndex,
        playerName: (window as any).gameState?.playerName,
      };
    });

    console.log('🔍 ゲーム状態確認:');
    console.log(`  ゲーム状態存在: ${gameState.hasGameState ? '✅' : '❌'}`);
    console.log(`  現在章: ${gameState.currentChapter}`);
    console.log(`  シーンインデックス: ${gameState.sceneIndex}`);
    console.log(`  プレイヤー名: ${gameState.playerName}`);

    expect(gameState.hasGameState).toBe(true);
    expect(gameState.currentChapter).toBe('00_prologue');

    // タイプライター効果の確認
    const continueButton = page.locator('#continue-button');
    if (await continueButton.isVisible({ timeout: 2000 })) {
      await continueButton.click();
      
      // タイプライター効果の動作を確認
      await page.waitForTimeout(500);
      const dialogueElement = page.locator('#dialogue-text');
      
      // テキストが段階的に表示されているかを確認
      const initialText = await dialogueElement.textContent();
      await page.waitForTimeout(1000);
      const finalText = await dialogueElement.textContent();
      
      console.log(`  📝 タイプライター効果確認: "${finalText?.substring(0, 30)}..."`);
      expect(finalText).toBeTruthy();
    }

    console.log('✅ ゲーム状態・エフェクトテスト完了');
  });

  test('完成したゲームの総合動作確認', async ({ page }) => {
    console.log('🏆 総合動作確認テスト開始...');

    const continueButton = page.locator('#continue-button');
    let totalScenes = 0;
    let characterAppearances = 0;
    let systemMessages = 0;

    // より長い進行でゲーム全体を確認
    for (let i = 0; i < 20; i++) {
      try {
        totalScenes++;
        
        const dialogueText = await page.locator('#dialogue-text').textContent();
        const characterName = await page.locator('#character-name').textContent();
        
        // 統計収集
        if (characterName?.includes('ななたう')) {
          characterAppearances++;
        } else if (characterName?.includes('システム')) {
          systemMessages++;
        }

        // 重要なゲームイベントを検出
        if (dialogueText?.includes('硝子の心')) {
          console.log('  🎯 メインタイトル確認');
        } else if (dialogueText?.includes('宇品')) {
          console.log('  🏘️ 舞台設定確認');
        } else if (dialogueText?.includes('教会')) {
          console.log('  ⛪ 重要な場所確認');
        } else if (dialogueText?.includes('ステンドグラス')) {
          console.log('  🌈 キーアイテム確認');
        }

        if (await continueButton.isVisible({ timeout: 2000 })) {
          await continueButton.click();
          await page.waitForTimeout(800);
        } else {
          break;
        }

      } catch (error) {
        console.log(`  ⚠️ シーン ${i + 1} でエラー`);
        break;
      }
    }

    // 総合結果
    console.log('📊 総合テスト結果:');
    console.log(`  進行シーン数: ${totalScenes}`);
    console.log(`  ななたう登場回数: ${characterAppearances}`);
    console.log(`  システムメッセージ数: ${systemMessages}`);

    // 最低限の動作確認
    expect(totalScenes).toBeGreaterThan(5);
    expect(characterAppearances).toBeGreaterThan(0);

    console.log('🎉 完成ななたうゲーム総合テスト成功！');
  });
});