import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

const RED_BORDER = 'rgb(255, 0, 0)';

test.describe('TC-02: Title validation & Publish button enabling', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News validation');
  });

  test('Title field validation and Publish button stays disabled until Title, Main Text and a tag are provided', async ({
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

    await allure.step('Empty "Title" is highlighted in red and "Publish" is disabled', async () => {
      await createNewsPage.touchTitle();
      expect.soft(await createNewsPage.isTitleInvalid(), 'Empty Title must be invalid').toBeTruthy();
      expect
        .soft(await createNewsPage.getTitleBorderColor(), 'Empty Title border must be red')
        .toBe(RED_BORDER);
      await expect.soft(createNewsPage.publishButton).toBeDisabled();
    });

    await allure.step('Character counter shows "0/170" for an empty Title', async () => {
      expect.soft(await createNewsPage.getTitleCounterText()).toMatch(/0\s*\/\s*170/);
    });

    await allure.step('Title is limited to 170 characters and the counter is highlighted when exceeded', async () => {
      await createNewsPage.fillTitle('A'.repeat(171));
      const value = await createNewsPage.getTitleValue();
      expect
        .soft(value.length, 'Title must be limited to 170 characters')
        .toBeLessThanOrEqual(170);
      expect
        .soft(await createNewsPage.isTitleCounterHighlighted(), 'Counter must be highlighted when over the limit')
        .toBeTruthy();
    });

    await allure.step('A valid Title (9 chars) shows "9/170" and a normal (non-red) border', async () => {
      await createNewsPage.fillTitle('Test News');
      expect.soft(await createNewsPage.getTitleCounterText()).toMatch(/9\s*\/\s*170/);
      expect
        .soft(await createNewsPage.getTitleBorderColor(), 'Valid Title border must not be red')
        .not.toBe(RED_BORDER);
      expect.soft(await createNewsPage.isTitleInvalid(), 'Valid Title must not be invalid').toBeFalsy();
    });

    await allure.step('"Publish" stays disabled while "Main Text" is empty', async () => {
      await expect.soft(createNewsPage.publishButton).toBeDisabled();
    });

    await allure.step('Select a tag and fill "Main Text"', async () => {
      await createNewsPage.selectTag('News');
      expect.soft(await createNewsPage.isTagSelected('News'), 'Selected tag must change appearance').toBeTruthy();
      await createNewsPage.fillMainText('This is a valid news content for testing.');
    });

    await allure.step('"Publish" becomes enabled once Title, Main Text and a tag are provided', async () => {
      await expect(createNewsPage.publishButton).toBeEnabled();
    });
  });
});
