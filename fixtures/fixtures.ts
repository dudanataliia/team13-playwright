import { test as base } from '@playwright/test';
import { allure } from 'allure-playwright';
import { NewsPage } from '../pages/news.page';
import { SignInPage } from '../pages/sign-in.page';
import { CreateNewsPage } from '../pages/create-news.page';
import { PreviewNewsPage } from '../pages/preview-news.page';
import { ConfirmModal } from '../components/confirm-modal.component';
import { env } from '../utils/env';

type GreenCityFixtures = {
  newsPage: NewsPage;
  signInPage: SignInPage;
  createNewsPage: CreateNewsPage;
  previewNewsPage: PreviewNewsPage;
  confirmModal: ConfirmModal;
  loginAsUser: () => Promise<void>;
};

export const test = base.extend<GreenCityFixtures>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const networkErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (error) => {
      pageErrors.push(`${error.name}: ${error.message}`);
    });
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        networkErrors.push(`${status} ${response.request().method()} ${response.url()}`);
      }
    });

    await page.addInitScript(() => {
      try {
        localStorage.setItem('language', 'en');
      } catch {
        /* localStorage may be unavailable before navigation */
      }
    });

    await use(page);

    const sections: string[] = [];
    if (pageErrors.length) {
      sections.push(`=== Page (JS) errors: ${pageErrors.length} ===\n${pageErrors.join('\n')}`);
    }
    if (consoleErrors.length) {
      sections.push(`=== Console errors: ${consoleErrors.length} ===\n${consoleErrors.join('\n')}`);
    }
    if (networkErrors.length) {
      sections.push(`=== Failed HTTP responses (>=400): ${networkErrors.length} ===\n${networkErrors.join('\n')}`);
    }
    if (sections.length) {
      await allure.attachment(
        'Browser console & network errors',
        sections.join('\n\n'),
        'text/plain',
      );
    }
  },

  newsPage: async ({ page }, use) => {
    await use(new NewsPage(page));
  },

  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  createNewsPage: async ({ page }, use) => {
    await use(new CreateNewsPage(page));
  },

  previewNewsPage: async ({ page }, use) => {
    await use(new PreviewNewsPage(page));
  },

  confirmModal: async ({ page }, use) => {
    await use(new ConfirmModal(page));
  },

  loginAsUser: async ({ newsPage, signInPage }, use) => {
    const login = async (): Promise<void> => {
      await newsPage.open();
      await newsPage.header.openSignIn();
      await signInPage.signIn(env.USER_EMAIL, env.USER_PASSWORD);
      await signInPage.waitUntilClosed();
    };
    await use(login);
  },
});

export { expect } from '@playwright/test';
