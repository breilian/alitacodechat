import { test, expect } from '@playwright/test';
import ChatPage from '../po/chat.page';

test.describe('UI tests', () => {
  test('main elements should be visible', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await expect(chatPage.chatArea).toBeVisible();
    await expect(chatPage.messageField).toBeVisible();
    await expect(chatPage.sendButton).toBeVisible();
    await expect(chatPage.refreshButton).toBeVisible();
    await expect(chatPage.scrollDownArrow).toBeVisible();
    await expect(chatPage.cleanChatButton).toBeVisible();
  });

  test('Verify that the list of prompts matches the prompts from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.checkAutocompleteOptions([
      'Creating a JS class in Playwright',
      'Test Cases Generator',
      'Adviser'
    ]);
  });

  test('Verify that the list of datasources matches the datasources from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('#');
    await chatPage.checkAutocompleteOptions([
      'Create locator',
      'Git Repo Assistant',
      'Reskill to JS assistant',
      'Datasource Info - Confluence - Contribution activities'
    ]);
  });

  test('Verify that the list of agents matches the agents from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('@');
    await chatPage.checkAutocompleteOptions([
      'SDLC helper'
    ]);
  });

  test('Verify prompt pop-up appears with possibility to change variables', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await chatPage.checkPromptModalComponents('Test Cases Generator');
    await chatPage.changePromptModalVariable2('As a registered user, I want to log into my account using my email and password');
    await chatPage.applyPrompt();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
    await chatPage.verifySettingsOpenPromptModal();
    await chatPage.applyPrompt();
  });
});
