import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

const EXPECTED_MESSAGE = 'All created content will be lost. Do you still want to cancel news creating?';
const MAIN_TEXT = 'Test content with 20 chars';

test.describe('TC-07: Cancel confirmation modal', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News cancel confirmation');
  });

  test('Cancel shows a confirmation modal: "Yes, cancel" leaves the form, "Continue editing" keeps it with data intact', async ({
    page,
    newsPage,
    createNewsPage,
    confirmModal,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );
    test.setTimeout(90_000);

    await loginAsUser();

    await allure.step('Open the form, fill fields and click "Cancel"', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle('Test');
      await createNewsPage.fillMainText(MAIN_TEXT);
      await createNewsPage.clickCancel();
    });

    await allure.step('A confirmation modal appears with the correct message and buttons', async () => {
      await confirmModal.waitUntilVisible();
      expect.soft(await confirmModal.getMessage(), 'Modal must contain the spec message').toContain(EXPECTED_MESSAGE);
      await expect.soft(confirmModal.yesCancelButton).toBeVisible();
      await expect.soft(confirmModal.continueEditingButton).toBeVisible();
    });

    await allure.step('"Yes, cancel" closes the form and redirects to the news page', async () => {
      await confirmModal.confirmCancel();
      expect.soft(await createNewsPage.isFormVisible(), 'The Create News form must be closed').toBeFalsy();
      expect.soft(page.url(), 'The user must be redirected to the news page').toContain('greenCity/news');
      expect.soft(page.url(), 'The user must leave the create-news form').not.toContain('create-news');
    });

    await allure.step('Reopen the form, fill fields and click "Cancel" again', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle('Test');
      await createNewsPage.fillMainText(MAIN_TEXT);
      await createNewsPage.clickCancel();
      await confirmModal.waitUntilVisible();
    });

    await allure.step('"Continue editing" dismisses the modal and keeps the form with data intact', async () => {
      await confirmModal.continueEditing();
      expect.soft(await confirmModal.isVisible(), 'The modal must be dismissed').toBeFalsy();
      expect.soft(await createNewsPage.isFormVisible(), 'The form must remain open').toBeTruthy();
      expect.soft(page.url(), 'The user must stay on the create-news form').toContain('create-news');
      expect.soft(await createNewsPage.getTitleValue(), 'The Title must be preserved').toBe('Test');
      expect
        .soft(await createNewsPage.getMainTextLength(), 'The Main Text must be preserved')
        .toBe(MAIN_TEXT.length);
    });
  });
});
