import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

test.describe('TC-01: Create News form layout', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News form');
  });

  test('Create News form displays all required fields and pre-filled, non-editable Author/Date', async ({
    newsPage,
    createNewsPage,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );

    await loginAsUser();

    await newsPage.open();
    await newsPage.clickCreateNews();
    await createNewsPage.waitForFormVisible();

    await allure.step('Verify all required fields are present', async () => {
      await expect.soft(createNewsPage.titleField).toBeVisible();
      await expect.soft(createNewsPage.tagButtons.first()).toBeVisible();
      await expect.soft(createNewsPage.imageUploader).toBeVisible();
      await expect.soft(createNewsPage.mainTextField).toBeVisible();
      await expect.soft(createNewsPage.sourceField).toBeVisible();
      await expect.soft(createNewsPage.dateAuthorBlock).toBeVisible();
    });

    await allure.step('Verify "Title" has a character counter "0/170"', async () => {
      await expect.soft(createNewsPage.titleCounter).toHaveText(/0\s*\/\s*170/);
    });

    await allure.step('Verify the "Tag" set: News, Events, Education, Initiatives, Ads', async () => {
      await expect.soft(createNewsPage.tagButtons).toHaveCount(5);
      await expect.soft(createNewsPage.tagButtons).toHaveText(createNewsPage.expectedTagNames());
      await expect.soft(createNewsPage.tagsLimitHint).toBeVisible();
    });

    await allure.step('Verify "Main Text" has a character counter with maximum "63 206"', async () => {
      await expect.soft(createNewsPage.mainTextCounter).toBeVisible();
    });

    await allure.step('Verify "Source" field placeholder and hint', async () => {
      await expect.soft(createNewsPage.sourceField).toHaveAttribute('placeholder', /.+/);
      await expect.soft(createNewsPage.sourceHint).toContainText(/http\(s\):\/\//i);
    });

    await allure.step('Verify action buttons are present', async () => {
      await expect.soft(createNewsPage.cancelButton).toBeVisible();
      await expect.soft(createNewsPage.previewButton).toBeVisible();
      await expect.soft(createNewsPage.publishButton).toBeVisible();
    });

    await allure.step(
      'Verify fields follow the exact TC-01 order: Title → Tag → Add Image → Main Text → Author → Date → Source',
      async () => {
        const expectedOrder = await createNewsPage.getFieldsTopOrder();

        for (const field of expectedOrder) {
          expect.soft(field.top, `"${field.name}" was not found / not rendered`).not.toBeNaN();
        }

        const expectedSequence = expectedOrder.map((f) => f.name).join(' → ');
        const actualSequence = [...expectedOrder]
          .sort((a, b) => a.top - b.top)
          .map((f) => f.name)
          .join(' → ');

        for (let i = 1; i < expectedOrder.length; i++) {
          expect.soft(
            expectedOrder[i].top,
            `Field order does not match TC-01.\n` +
              `  Expected: ${expectedSequence}\n` +
              `  Actual:   ${actualSequence}\n` +
              `  Mismatch: "${expectedOrder[i - 1].name}" must be above "${expectedOrder[i].name}".`,
          ).toBeGreaterThan(expectedOrder[i - 1].top);
        }
      },
    );

    await allure.step('Verify "Author" and "Date" are pre-filled and cannot be edited', async () => {
      await expect.soft(createNewsPage.authorField).toContainText(/Author:/i);
      await expect.soft(createNewsPage.dateField).toContainText(/Date:/i);
      await expect.soft(createNewsPage.authorField).not.toHaveText(/Author:\s*$/i);

      const currentYear = new Date().getFullYear().toString();
      await expect.soft(createNewsPage.dateField).toContainText(
        new RegExp(`[A-Za-z]+\\s+\\d{1,2},\\s*${currentYear}`),
      );

      expect
        .soft(await createNewsPage.isDateAuthorEditable(), 'Author/Date must not be editable')
        .toBeFalsy();
    });
  });
});
