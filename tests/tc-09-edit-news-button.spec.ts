import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

test.describe('TC-09: "Edit news" button is visible to the author', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Edit news permissions');
  });

  test('The author of a news post sees the "Edit news" button on the news page', async ({
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

    const title = `TC09 ${Date.now()}`;

    await allure.step('Precondition: create a news post as the logged-in user', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle(title);
      await createNewsPage.selectTag('News');
      await createNewsPage.fillMainText('This is a valid test content for the edit-news button check.');
      await expect(createNewsPage.publishButton).toBeEnabled();
      await createNewsPage.publish();
    });

    await allure.step('Navigate to the created news post', async () => {
      await newsPage.openNewsByTitle(title);
    });

    await allure.step('The "Edit news" button is displayed to the author', async () => {
      await expect(newsPage.editNewsButton).toBeVisible();
    });
  });
});
