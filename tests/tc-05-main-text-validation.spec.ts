import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

const EXPECTED_MESSAGE = 'Must be a minimum of 20 and a maximum of 63,206 symbols.';
const MAX_LENGTH = 63206;

test.describe('TC-05: Main Text validation (min 20, max 63,206 chars)', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News main text validation');
  });

  test('Main Text shorter than 20 chars keeps Publish disabled with a red warning; valid text enables publishing', async ({
    newsPage,
    createNewsPage,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );
    test.setTimeout(120_000);

    await loginAsUser();
    await newsPage.open();
    await newsPage.clickCreateNews();
    await createNewsPage.waitForFormVisible();

    const title = `TC05 ${Date.now()}`;

    // A tag and a valid Title are required for Publish, so we isolate Main Text as the only variable.
    await allure.step('Fill a valid Title and select a tag', async () => {
      await createNewsPage.fillTitle(title);
      await createNewsPage.selectTag('News');
    });

    await allure.step('Enter 10 characters -> red error and Publish disabled', async () => {
      await createNewsPage.fillMainText('Short text');

      expect.soft(await createNewsPage.isMainTextMessageRed(), 'The warning must be red for short text').toBeTruthy();
      expect
        .soft(
          await createNewsPage.getMainTextMessageText(),
          'BUG: warning wording differs from the spec ("minimum 20 and maximum 63 206 symbols" vs "a minimum of 20 and a maximum of 63,206 symbols.")',
        )
        .toBe(EXPECTED_MESSAGE);
      await expect.soft(createNewsPage.publishButton).toBeDisabled();
    });

    await allure.step('Enter 63,207 characters -> must be truncated to 63,206 with no error', async () => {
      await createNewsPage.fillMainText('A'.repeat(63207));

      expect
        .soft(
          await createNewsPage.getMainTextLength(),
          'BUG: Main Text is not truncated to 63,206 characters',
        )
        .toBeLessThanOrEqual(MAX_LENGTH);
      expect
        .soft(
          await createNewsPage.isMainTextMessageRed(),
          'BUG: an error is shown for over-limit text instead of silently truncating it',
        )
        .toBeFalsy();
    });

    await allure.step('Enter 25 valid characters -> error disappears and Publish becomes enabled', async () => {
      await createNewsPage.fillMainText('This is a valid test content');

      expect.soft(await createNewsPage.isMainTextMessageRed(), 'The warning must disappear for valid text').toBeFalsy();
      await expect(createNewsPage.publishButton).toBeEnabled();
    });

    await allure.step('Publish the news and verify it is created successfully', async () => {
      await createNewsPage.publish();
      await newsPage.open();
      await expect(newsPage.newsCardByTitle(title)).toBeVisible();
    });
  });
});
