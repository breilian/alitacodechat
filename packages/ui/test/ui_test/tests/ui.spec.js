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

  test('list of promts should match to promts from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.checkAutocompleteOptions([
      'Creating a JS class in Playwright',
      'Test Cases Generator',
      'Adviser'
    ]);
  });

  test('list of datasources should match to datasources from https://eye.projectalita.ai/', async ({ page }) => {
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

  test('list of agents should match to agents from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('@');
    await chatPage.checkAutocompleteOptions([
      'SDLC helper'
    ]);
  });
});
