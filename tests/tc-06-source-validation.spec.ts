import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

const EXPECTED_MESSAGE =
  'Please add the link of the original article/news/post. The link must start with http(s)://';

test.describe('TC-06: Source field validation (optional, valid URL)', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News source validation');
  });

  test('Empty Source is allowed; an invalid URL keeps Publish disabled with a red error; a valid URL enables publishing', async ({
    newsPage,
    createNewsPage,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );
    test.setTimeout(90_000);

    await loginAsUser();
    await newsPage.open();
    await newsPage.clickCreateNews();
    await createNewsPage.waitForFormVisible();

    const title = `TC06 ${Date.now()}`;

    await allure.step('Fill all mandatory fields (Title, tag, Main Text)', async () => {
      await createNewsPage.fillTitle(title);
      await createNewsPage.selectTag('News');
      await createNewsPage.fillMainText('This is a valid test content for the source validation.');
    });

    await allure.step('An empty Source is allowed -> Publish is enabled', async () => {
      await expect(createNewsPage.publishButton).toBeEnabled();
    });

    await allure.step('An invalid URL -> red error and Publish disabled', async () => {
      await createNewsPage.fillSource('www.example.com');

      await expect.soft(createNewsPage.publishButton).toBeDisabled();
      expect.soft(await createNewsPage.isSourceInvalid(), 'The Source field must be marked invalid').toBeTruthy();
      expect.soft(await createNewsPage.isSourceMessageRed(), 'The error message must be red').toBeTruthy();
      expect
        .soft(
          await createNewsPage.getSourceMessageText(),
          'BUG: error wording differs from the spec (missing "the"/"The": "of original ... Link must start")',
        )
        .toBe(EXPECTED_MESSAGE);
    });

    await allure.step('A valid URL -> error disappears and Publish becomes enabled', async () => {
      await createNewsPage.fillSource('https://example.com');

      expect.soft(await createNewsPage.isSourceMessageRed(), 'The error message must disappear').toBeFalsy();
      expect.soft(await createNewsPage.isSourceInvalid(), 'The Source field must no longer be invalid').toBeFalsy();
      await expect(createNewsPage.publishButton).toBeEnabled();
    });

    await allure.step('Publish the news and verify it is created successfully', async () => {
      await createNewsPage.publish();
      await newsPage.open();
      await expect(newsPage.newsCardByTitle(title)).toBeVisible();
    });

    await allure.step('Open the published news and verify the provided source link is shown', async () => {
      await newsPage.openNewsByTitle(title);
      await expect.soft(newsPage.newsTitleHeading.first()).toBeVisible();
      expect
        .soft(
          await newsPage.getNewsSourceText(),
          'BUG: the published news does not display the provided source link',
        )
        .toContain('example.com');
    });
  });
});
