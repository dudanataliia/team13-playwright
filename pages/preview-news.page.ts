import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';

export class PreviewNewsPage extends BasePage {
  readonly title: Locator;
  readonly date: Locator;
  readonly author: Locator;
  readonly content: Locator;
  readonly tag: Locator;
  readonly backToEditingLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.news-title');
    this.date = page.locator('.news-info-date');
    this.author = page.locator('.news-info-author');
    this.content = page.locator('.news-text-content');
    this.tag = page.locator('.tags-item');
    this.backToEditingLink = page.locator('a.button-link').filter({ hasText: /back to editing/i });
  }

  async waitForVisible(): Promise<void> {
    await allure.step('Wait for the preview mode to open', async () => {
      await this.title.first().waitFor({ state: 'visible' });
    });
  }

  async getTitle(): Promise<string> {
    return (await this.title.first().innerText()).trim();
  }

  async getDate(): Promise<string> {
    return (await this.date.first().innerText()).trim();
  }

  async getAuthor(): Promise<string> {
    return (await this.author.first().innerText()).trim();
  }

  async getContent(): Promise<string> {
    return (await this.content.first().innerText()).trim();
  }

  async backToEditing(): Promise<void> {
    await allure.step('Click "Back to editing"', async () => {
      await this.backToEditingLink.click();
    });
  }
}
