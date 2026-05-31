import { test, expect } from '../fixtures/fixtures';
import { allure } from 'allure-playwright';
import { env } from '../utils/env';
import { gifFile, jpegFile, pngFile } from '../utils/images';

const EXPECTED_MESSAGE = 'Upload only PNG or JPEG. File size must be less than 10MB.';

test.describe('TC-04: Upload Image validation (PNG/JPG, max 10MB)', () => {
  test.beforeEach(async () => {
    await allure.epic('GreenCity');
    await allure.feature('Eco news');
    await allure.story('Create News image upload');
  });

  test('Only PNG/JPEG up to 10MB are accepted; other formats or oversized files are rejected with a red warning', async ({
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

    await allure.step('Upload a GIF file (1MB) -> rejected with a red warning message', async () => {
      await createNewsPage.uploadImage(gifFile(1));
      expect.soft(await createNewsPage.isImageRejected(), 'A GIF must be rejected (red field)').toBeTruthy();
      expect.soft(await createNewsPage.isImageWarningRed(), 'The warning text must turn red').toBeTruthy();
      expect
        .soft(
          await createNewsPage.getImageWarningText(),
          'BUG: the error message wording differs from the spec ("JPG" instead of "JPEG", missing trailing period)',
        )
        .toBe(EXPECTED_MESSAGE);
    });

    await allure.step('Upload a JPEG file (15MB) -> rejected with the same red warning message', async () => {
      await createNewsPage.uploadImage(jpegFile(15));
      expect.soft(await createNewsPage.isImageRejected(), 'A 15MB file must be rejected (red field)').toBeTruthy();
      expect.soft(await createNewsPage.isImageWarningRed(), 'The warning text must turn red').toBeTruthy();
      expect
        .soft(
          await createNewsPage.getImageWarningText(),
          'BUG: the error message wording differs from the spec ("JPG" instead of "JPEG", missing trailing period)',
        )
        .toBe(EXPECTED_MESSAGE);
    });

    await allure.step('Upload a valid PNG file (5MB) -> accepted without errors', async () => {
      await createNewsPage.uploadImage(pngFile(5));
      expect.soft(await createNewsPage.isImageAccepted(), 'A 5MB PNG must be accepted (cropper shown)').toBeTruthy();
      expect.soft(await createNewsPage.isImageRejected(), 'A valid PNG must not be highlighted in red').toBeFalsy();
    });
  });
});
