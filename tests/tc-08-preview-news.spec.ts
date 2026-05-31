import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

const PREVIEW_TITLE = 'Test Preview';
const PREVIEW_TEXT = 'This is a test preview content';

test.describe('TC-08: Preview news content', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News preview');
  });

  test('Preview displays the entered title, main text, current date, author, and offers "Back to editing"', async ({
    newsPage,
    createNewsPage,
    previewNewsPage,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );

    await loginAsUser();

    await allure.step('Open the form, enter a valid Title and Main Text, click "Preview"', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle(PREVIEW_TITLE);
      await createNewsPage.fillMainText(PREVIEW_TEXT);
      await createNewsPage.clickPreview();
    });

    await allure.step('The preview mode opens', async () => {
      await previewNewsPage.waitForVisible();
    });

    await allure.step('The entered Title is displayed correctly', async () => {
      expect.soft(await previewNewsPage.getTitle()).toBe(PREVIEW_TITLE);
    });

    await allure.step('The entered Main Text is displayed correctly', async () => {
      expect.soft(await previewNewsPage.getContent()).toBe(PREVIEW_TEXT);
    });

    await allure.step('The preview displays the current date', async () => {
      const expectedDate = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const actualDate = await previewNewsPage.getDate();
      expect.soft(actualDate, 'Date must follow the "Month D, YYYY" format').toMatch(/^[A-Za-z]+\s+\d{1,2},\s*\d{4}$/);
      expect.soft(actualDate, 'Date must be the current date').toBe(expectedDate);
    });

    await allure.step("The author's name is displayed correctly", async () => {
      const author = await previewNewsPage.getAuthor();
      expect.soft(author, 'Author must be shown as "by <name>"').toMatch(/^by\s+\S+/i);
    });

    await allure.step('A "Back to editing" control is available and must return to the edit mode', async () => {
      await expect.soft(previewNewsPage.backToEditingLink, 'A "Back to editing" link must be available').toBeVisible();
      await previewNewsPage.backToEditing();
      await createNewsPage.titleField.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      expect
        .soft(
          await createNewsPage.isFormVisible(),
          'BUG: "Back to editing" navigates to /create-news but the form is not rendered (no Title/Main Text fields)',
        )
        .toBeTruthy();
    });
  });
});
