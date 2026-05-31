import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';

export class SignInPage extends BasePage {
  private readonly dialog: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.locator('app-auth-modal, .modal-window, [class*="modal"]').first();
    this.emailInput = this.dialog.locator('#email, input[formcontrolname="email"]');
    this.passwordInput = this.dialog.locator('#password, input[formcontrolname="password"]');
    this.submitButton = this.dialog.locator('button[type="submit"]');
  }

  async signIn(email: string, password: string): Promise<void> {
    await allure.step(`Sign in as "${email}"`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.submitButton.click();
    });
  }

  async waitUntilClosed(): Promise<void> {
    await allure.step('Wait until the sign-in dialog is closed', async () => {
      await this.dialog.waitFor({ state: 'hidden' });
    });
  }
}
