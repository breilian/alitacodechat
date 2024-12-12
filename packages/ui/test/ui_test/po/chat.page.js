import { expect } from '@playwright/test';

export default class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageField = page.locator('textarea#standard-multiline-static');
    this.sendButton = page.locator('button[data-testid="Sendbutton"]');
    this.chatArea = page.locator('.MuiList-root');
    this.refreshButton = page.locator('[data-testid="RefreshOutlinedIcon"]');
    this.scrollDownArrow = page.locator('[data-testid="KeyboardDoubleArrowDownOutlinedIcon"]');
    this.cleanChatButton = page.locator('[data-testid="ClearTheChat"]');
    this.chatCommandAutocomplete = page.locator('div.MuiPaper-root ul');
    this.promptModalHeader = page.locator('#alert-dialog-title:nth-child(1)');
    this.promptModalVariablesHeader = page.locator('#alert-dialog-title:nth-child(3)');
    this.promptModalVariable1 = page.locator('#project_description');
    this.promptModalVariable2 = page.locator('#user_story');
    this.promptModalOkBtn = page.locator('button.MuiButton-root[type="button"]')
    this.promptSettingsOpenVariableModal = page.locator('[data-testid="Settings-button"]');
    this.chosenPromptName = page.locator('//button[@data-testid="Settings-button"]/preceding-sibling::span');
  }
  
  async openChat() {
    await this.page.goto('/');
  }

  async typeInMessageField(text) {
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.type(text);
  }

  async checkAutocompleteOptions(expectedOptions) {
    for (let i = 0; i < expectedOptions.length; i++) {
      await expect(this.chatCommandAutocomplete.locator(`li`).nth(i)).toHaveText(expectedOptions[i]);
    }
  }

  async chooseAutocompleteOption(option) {
    const optionLocator = this.chatCommandAutocomplete.locator(`li >> text=${option}`);
    await optionLocator.waitFor();
    await optionLocator.click();
  }

  async checkPromptModalComponents(headerName) {
    await this.promptModalHeader.waitFor();
    await expect(this.promptModalHeader).toHaveText(headerName);
    await expect(this.promptModalVariablesHeader).toHaveText('Variables');
    await expect(this.promptModalVariable1).toBeVisible();
    await expect(this.promptModalVariable2).toBeVisible();
  }

  async changePromptModalVariable2(inputText) {
    await this.promptModalVariable2.type(inputText);
  }

  async applyPrompt() {
    await this.promptModalOkBtn.click();
  }

  async verifyChosenPrompt(promptName) {
    await expect(this.promptSettingsOpenVariableModal).toBeVisible();
    await expect(this.chosenPromptName).toHaveText(promptName);
  }

  async verifySettingsOpenPromptModal() {
    await this.promptSettingsOpenVariableModal.click();
    await this.promptModalHeader.waitFor();
    await expect(this.promptModalHeader).toBeVisible();
  }

}
