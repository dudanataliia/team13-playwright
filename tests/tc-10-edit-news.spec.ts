import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';

test.describe('TC-10: Author can edit their own news and changes are saved', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Edit news');
  });

  test('Editing title, content and tags is saved while the original creation date stays unchanged', async ({
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

    const originalTitle = `TC10 ${Date.now()}`;
    const originalContent = 'Original content created before editing the news post.';
    const updatedTitle = `${originalTitle} EDITED`;
    const updatedContent = 'Updated content after editing the news post successfully.';

    await allure.step('Precondition: create a news post with title, one tag and content', async () => {
      await newsPage.open();
      await newsPage.clickCreateNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle(originalTitle);
      await createNewsPage.selectTag('News');
      await createNewsPage.fillMainText(originalContent);
      await expect(createNewsPage.publishButton).toBeEnabled();
      await createNewsPage.publish();
    });

    let creationDate = '';

    await allure.step('Open the created news post and capture the original values', async () => {
      await newsPage.openNewsByTitle(originalTitle);
      expect.soft(await newsPage.getDetailTitle(), 'Original title must be shown').toBe(originalTitle);
      expect
        .soft(await newsPage.getDetailContent(), 'Original content must be shown')
        .toContain(originalContent);
      creationDate = await newsPage.getDetailDate();
      expect
        .soft(creationDate, 'Creation date must follow the "Month D, YYYY" format')
        .toMatch(/^[A-Za-z]+\s+\d{1,2},\s*\d{4}$/);
    });

    await allure.step('Click "Edit news" and modify title, content and tags', async () => {
      await newsPage.clickEditNews();
      await createNewsPage.waitForFormVisible();
      await createNewsPage.fillTitle(updatedTitle);
      await createNewsPage.fillMainText(updatedContent);
      // The original post has the "News" tag; add "Events" to modify the tag set.
      await createNewsPage.selectTag('Events');
    });

    await allure.step('Submit the edited news', async () => {
      await createNewsPage.submitEdit();
    });

    await allure.step('Reopen the news post and verify the updated values are saved', async () => {
      await newsPage.openNewsByTitle(updatedTitle);

      expect.soft(await newsPage.getDetailTitle(), 'Title must be updated').toBe(updatedTitle);
      expect
        .soft(await newsPage.getDetailContent(), 'Content must be updated')
        .toContain(updatedContent);

      const tags = (await newsPage.getDetailTags()).map((t) => t.toUpperCase());
      expect.soft(tags, 'Updated news must keep the "News" tag').toContain('NEWS');
      expect.soft(tags, 'Updated news must include the newly added "Events" tag').toContain('EVENTS');
    });

    await allure.step('Verify the original creation date has not changed', async () => {
      const dateAfterEdit = await newsPage.getDetailDate();
      expect
        .soft(dateAfterEdit, 'The creation date must remain unchanged after editing')
        .toBe(creationDate);
    });
  });
});
