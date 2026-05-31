import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

test.describe('TC-03: Tag selection (1 to 3 tags)', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News tags');
  });

  test('User can select between 1 and 3 tags, a 4th is blocked, and tags persist on the published news', async ({
    newsPage,
    createNewsPage,
    loginAsUser,
  }) => {
    test.skip(
      !env.USER_EMAIL || !env.USER_PASSWORD,
      'USER_EMAIL/USER_PASSWORD are not set in .env',
    );

    await loginAsUser();

    const oneTagTitle = `TC03 One Tag ${Date.now()}`;

    await allure.step('Create and publish news with a single tag ("News")', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();

      await createNewsPage.fillTitle(oneTagTitle);
      await createNewsPage.selectTag('News');
      expect.soft(await createNewsPage.getSelectedTagCount(), 'Exactly one tag must be selected').toBe(1);
      await createNewsPage.fillMainText('Test content with twenty plus characters for publishing.');

      await expect(createNewsPage.publishButton).toBeEnabled();
      await createNewsPage.publish();
    });

    await allure.step('Verify the news is published with the "News" tag', async () => {
      const tags = await newsPage.getTagsForNews(oneTagTitle);
      expect.soft(tags, 'Published news must contain exactly the "News" tag').toEqual(['NEWS']);
    });

    const threeTagsTitle = `TC03 Three Tags ${Date.now()}`;

    await allure.step('Open the form again and select three tags (News, Events, Education)', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();

      // A freshly opened "Create News" form must start with NO tags selected.
      // GreenCity keeps the previously selected tags, which later allows a 4th tag.
      expect
        .soft(
          await createNewsPage.getSelectedTagCount(),
          'A reopened Create News form must have no pre-selected tags (state must reset after publishing)',
        )
        .toBe(0);

      await createNewsPage.fillTitle(threeTagsTitle);
      await createNewsPage.selectTag('News');
      await createNewsPage.selectTag('Events');
      await createNewsPage.selectTag('Education');
      expect.soft(await createNewsPage.getSelectedTagCount(), 'Exactly three tags must be selected').toBe(3);
    });

    await allure.step('Attempt to select a fourth tag ("Initiatives") and verify it is blocked', async () => {
      await createNewsPage.selectTag('Initiatives');
      expect
        .soft(await createNewsPage.getSelectedTagCount(), 'No more than three tags may be selected')
        .toBe(3);
      expect
        .soft(await createNewsPage.isTagSelected('Initiatives'), 'The fourth tag must not become selected')
        .toBeFalsy();
    });

    await allure.step('Publish the news with three tags', async () => {
      await createNewsPage.fillMainText('Test content with twenty plus characters for publishing.');
      await expect(createNewsPage.publishButton).toBeEnabled();
      await createNewsPage.publish();
    });

    await allure.step('Verify the news is published with all three selected tags', async () => {
      const tags = await newsPage.getTagsForNews(threeTagsTitle);
      expect.soft(tags.sort(), 'Published news must contain News, Events and Education').toEqual(
        ['EDUCATION', 'EVENTS', 'NEWS'],
      );
    });

    await allure.step(
      'After publishing 3 tags, a reopened form must be clean and must never allow a 4th tag',
      async () => {
        await newsPage.open();
        await newsPage.clickCreateNews();
        await createNewsPage.waitForFormVisible();

        expect
          .soft(
            await createNewsPage.getSelectedTagCount(),
            'The reopened form still shows the previously selected tags (state leak)',
          )
          .toBe(0);

        await createNewsPage.tag('Initiatives').click();
        expect
          .soft(
            await createNewsPage.getSelectedTagCount(),
            'It must never be possible to have more than 3 tags selected',
          )
          .toBeLessThanOrEqual(3);
      },
    );
  });
});
