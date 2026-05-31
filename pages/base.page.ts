import { Page } from '@playwright/test';
import { env } from '../utils/env';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openByHash(hashPath: string): Promise<void> {
    const normalized = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
    const origin = env.BASE_URL.split('#')[0];
    await this.page.goto(`${origin}#${normalized}`, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}
