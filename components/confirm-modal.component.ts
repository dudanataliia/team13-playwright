import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BaseComponent } from './base.component';

export class ConfirmModal extends BaseComponent {
  readonly yesCancelButton: Locator;
  readonly continueEditingButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    const root = page.locator('mat-dialog-container, .mat-mdc-dialog-container').first();
    super(page, root);
    this.yesCancelButton = this.root.locator('button.primary-global-button');
    this.continueEditingButton = this.root.locator('button.secondary-global-button');
    this.closeButton = this.root.locator('button.close');
  }

  async waitUntilVisible(): Promise<void> {
    await allure.step('Wait for the confirmation modal to appear', async () => {
      await this.root.waitFor({ state: 'visible' });
    });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  async getMessage(): Promise<string> {
    return (await this.root.innerText()).replace(/\s+/g, ' ').trim();
  }

  async confirmCancel(): Promise<void> {
    await allure.step('Click "Yes, cancel" in the confirmation modal', async () => {
      await this.yesCancelButton.click();
      await this.root.waitFor({ state: 'hidden' }).catch(() => undefined);
    });
  }

  async continueEditing(): Promise<void> {
    await allure.step('Click "Continue editing" in the confirmation modal', async () => {
      await this.continueEditingButton.click();
      await this.root.waitFor({ state: 'hidden' }).catch(() => undefined);
    });
  }
}
