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

  test('Verify user can type any message and receive answer', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('hello');
    await chatPage.sendMessage();
    await chatPage.verifyErrorAlertNotDisplayed();
    await expect(chatPage.chatAreaAnswer).toBeVisible();
  });

  test('Verify that no errors are displayed', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.verifyErrorOverlayNotDisplayed();
    await chatPage.verifyErrorIsNotDisplayed();
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
    await chatPage.changePromptModalVariable(1,'As a registered user, I want to log into my account using my email and password');
    await chatPage.applyPrompt();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
    await chatPage.verifySettingsOpenPromptModal();
    await chatPage.changePromptModalVariable(0,'The project is an online learning platform aimed at delivering interactive courses to users.' +
      'It features user registration, course management, progress tracking, and certificate generation.');
    await chatPage.applyPrompt();
    await chatPage.verifyPromptModalClosed();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
  });

  test('Verify user can choose prompt and receive result', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await chatPage.applyPrompt();
    await expect(chatPage.sendButton).toBeDisabled();
    await chatPage.typeInMessageField('start');
    await chatPage.sendMessage();
    await chatPage.verifyChatPromptResultExists();
  });

  test('Verify user can delete one answer', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('start');
    await chatPage.sendMessage();
    await chatPage.verifyDeleteMessageBtnAndClick('Delete');
    await chatPage.checkDeleteMessageAlertComponents(`The deleted message can't be restored. Are you sure to delete the message?`);
    await chatPage.confirmDeleteMessage();
    await chatPage.verifyMessageIsDeleted();
  });

  test('Verify user can clean the chat', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('start');
    await chatPage.sendMessage();
    await chatPage.clickCleanChatBtn();
    await chatPage.checkDeleteMessageAlertComponents(`The deleted messages can't be restored. Are you sure to delete all the messages?`);
    await chatPage.confirmDeleteMessage();
    await chatPage.verifyChatIsCleaned();
  });

  test.only('Verify user can copy an answer to clipboard', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('start');
    await chatPage.sendMessage();
    await chatPage.verifyCopyMessageBtnAndClick('Copy to clipboard');
    await chatPage.verifyCopyMessageAlert('The message has been copied to the clipboard');
    await chatPage.verifyMessageIsCopiedToClipboard('Sure! How can I assist you today?');
  });
});
