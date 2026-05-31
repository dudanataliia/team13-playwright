import { Locator, Page } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }
}
