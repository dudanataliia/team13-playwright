import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BaseComponent } from './base.component';

export class Header extends BaseComponent {
  private readonly signInButton: Locator;
  private readonly userName: Locator;

  constructor(page: Page) {
    super(page, page.locator('app-header, header').first());
    this.signInButton = this.root.getByRole('img', { name: /sing in button/i });
    this.userName = this.root.locator('.header_user-name, [class*="user-name"]');
  }

  async openSignIn(): Promise<void> {
    await allure.step('Open the "Sign in" dialog from the header', async () => {
      await this.signInButton.click();
    });
  }

  async isUserLoggedIn(): Promise<boolean> {
    return allure.step('Check whether a user is logged in', async () => {
      return this.userName.isVisible().catch(() => false);
    });
  }
}
