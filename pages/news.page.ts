import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { Header } from '../components/header.component';
import { env } from '../utils/env';

export class NewsPage extends BasePage {
  readonly header: Header;
  readonly newsTitleHeading: Locator;
  readonly newsSourceText: Locator;
  readonly editNewsButton: Locator;
  readonly newsDate: Locator;
  readonly newsContent: Locator;
  readonly newsTags: Locator;
  private readonly createNewsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
    this.createNewsButton = page.locator('a[href*="news/create-news"], a.create');
    this.newsTitleHeading = page.locator('.news-title');
    this.newsSourceText = page.locator('.source-text, .source-field a');
    this.editNewsButton = page.locator('.edit-news');
    this.newsDate = page.locator('.news-info-date');
    this.newsContent = page.locator('.news-text-content');
    this.newsTags = page.locator('.tags-item');
  }

  async open(): Promise<void> {
    await allure.step('Open the GreenCity News page', async () => {
      await this.openByHash('/greenCity/news');
      await this.waitForPageLoad();
    });
  }

  async clickCreateNews(): Promise<void> {
    await allure.step('Click the "Create News" button', async () => {
      await this.createNewsButton.click();
    });
  }

  newsCardByTitle(title: string): Locator {
    return this.page.locator('.list-gallery-content').filter({ hasText: title }).first();
  }

  async openNewsByTitle(title: string): Promise<void> {
    await allure.step(`Open the published news "${title}"`, async () => {
      await this.open();
      const card = this.newsCardByTitle(title);
      await card.waitFor({ state: 'visible' });
      // The card is wrapped in an <a href="#/greenCity/news/{id}">. Navigating directly
      // avoids transient cdk overlay backdrops that intercept clicks after publishing.
      const href = await card.evaluate((el) => {
        const anchor = el.closest('a');
        return anchor ? anchor.getAttribute('href') : null;
      });
      if (href) {
        const origin = env.BASE_URL.split('#')[0];
        await this.page.goto(`${origin}${href}`, { waitUntil: 'domcontentloaded' });
      } else {
        await card.click();
      }
      await this.page.waitForLoadState('domcontentloaded');
      await this.newsTitleHeading.first().waitFor({ state: 'visible' }).catch(() => undefined);
    });
  }

  async getNewsSourceText(): Promise<string> {
    if ((await this.newsSourceText.count()) === 0) {
      return '';
    }
    return (await this.newsSourceText.first().innerText()).trim();
  }

  async getDetailTitle(): Promise<string> {
    return (await this.newsTitleHeading.first().innerText()).trim();
  }

  async getDetailDate(): Promise<string> {
    return (await this.newsDate.first().innerText()).trim();
  }

  async getDetailContent(): Promise<string> {
    return (await this.newsContent.first().innerText()).trim();
  }

  async getDetailTags(): Promise<string[]> {
    const tags = await this.newsTags.allInnerTexts();
    return tags.map((t) => t.trim()).filter((t) => t.length > 0);
  }

  async clickEditNews(): Promise<void> {
    await allure.step('Click the "Edit news" button', async () => {
      await this.editNewsButton.first().click();
      await this.page
        .waitForURL((url) => url.toString().includes('create-news'), { timeout: 15000 })
        .catch(() => undefined);
    });
  }

  async getTagsForNews(title: string): Promise<string[]> {
    return allure.step(`Read tags of the published news "${title}"`, async () => {
      await this.open();
      const card = this.newsCardByTitle(title);
      await card.waitFor({ state: 'visible' });
      const tags = await card.locator('.filter-tag .ul-eco-buttons span').allInnerTexts();
      return tags
        .map((t) => t.trim().toUpperCase())
        .filter((t) => /[A-Z]/.test(t));
    });
  }
}
