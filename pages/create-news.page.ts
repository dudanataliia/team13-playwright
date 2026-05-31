import { Locator, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { BasePage } from './base.page';
import { UploadFile } from '../utils/images';

export class CreateNewsPage extends BasePage {
  readonly titleField: Locator;
  readonly titleCounter: Locator;
  readonly tagButtons: Locator;
  readonly tagsLimitHint: Locator;
  readonly imageUploader: Locator;
  readonly imageDropzone: Locator;
  readonly imageFileInput: Locator;
  readonly imageWarning: Locator;
  readonly imageCropper: Locator;
  readonly mainTextField: Locator;
  readonly mainTextCounter: Locator;
  readonly sourceField: Locator;
  readonly sourceHint: Locator;
  readonly dateAuthorBlock: Locator;
  readonly authorField: Locator;
  readonly dateField: Locator;
  readonly cancelButton: Locator;
  readonly previewButton: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleField = page.locator('textarea[formcontrolname="title"]');
    this.titleCounter = page.locator('.field-info').filter({ hasText: /\/\s*170/ });
    this.tagButtons = page.locator('button.tag-button');
    this.tagsLimitHint = page.getByText(/Only 3 tags can be added/i);
    this.imageUploader = page.locator('.image-block').first();
    this.imageDropzone = page.locator('app-drag-and-drop .dropzone');
    this.imageFileInput = page.locator('app-drag-and-drop input[type="file"]');
    this.imageWarning = page.locator('app-drag-and-drop .warning');
    this.imageCropper = page.locator('app-drag-and-drop image-cropper, app-drag-and-drop .cropper-block');
    this.mainTextField = page.locator('.ql-editor').first();
    this.mainTextCounter = page.locator('.field-info').filter({ hasText: /63\s?206/ });
    this.sourceField = page.locator('input[formcontrolname="source"]');
    this.sourceHint = page.locator('.field-info').filter({ hasText: /Please add the link/i });
    this.dateAuthorBlock = page.locator('div.date');
    this.authorField = page.locator('div.date p').filter({ hasText: /Author:/i });
    this.dateField = page.locator('div.date p').filter({ hasText: /Date:/i });
    this.cancelButton = page.locator('button.tertiary-global-button');
    this.previewButton = page.locator('button.secondary-global-button:not(.s-btn)');
    this.publishButton = page.locator('button.primary-global-button:not(.s-btn)');
  }

  expectedTagNames(): string[] {
    return ['News', 'Events', 'Education', 'Initiatives', 'Ads'];
  }

  async waitForFormVisible(): Promise<void> {
    await allure.step('Wait for the "Create News" form to be visible', async () => {
      await this.titleField.waitFor({ state: 'visible' });
    });
  }

  async isFormVisible(): Promise<boolean> {
    return this.titleField.isVisible().catch(() => false);
  }

  async clickCancel(): Promise<void> {
    await allure.step('Click the "Cancel" button', async () => {
      await this.cancelButton.click();
    });
  }

  async clickPreview(): Promise<void> {
    await allure.step('Click the "Preview" button', async () => {
      await this.previewButton.click();
    });
  }

  async getElementTop(locator: Locator): Promise<number> {
    const box = await locator.first().boundingBox();
    return box ? box.y : Number.NaN;
  }

  async getFieldsTopOrder(): Promise<{ name: string; top: number }[]> {
    return allure.step('Collect vertical position of each field', async () => {
      const fields: { name: string; locator: Locator }[] = [
        { name: 'Title', locator: this.titleField },
        { name: 'Tag', locator: this.tagButtons.first() },
        { name: 'Add Image', locator: this.imageUploader },
        { name: 'Main Text', locator: this.mainTextField },
        { name: 'Author', locator: this.authorField },
        { name: 'Date', locator: this.dateField },
        { name: 'Source', locator: this.sourceField },
      ];

      const result: { name: string; top: number }[] = [];
      for (const field of fields) {
        result.push({ name: field.name, top: await this.getElementTop(field.locator) });
      }
      return result;
    });
  }

  tag(name: string): Locator {
    return this.tagButtons.filter({ hasText: name });
  }

  async touchTitle(): Promise<void> {
    await allure.step('Focus and blur the "Title" field to trigger validation', async () => {
      await this.titleField.focus();
      await this.titleField.blur();
    });
  }

  async fillTitle(text: string): Promise<void> {
    await allure.step(`Type ${text.length} character(s) into the "Title" field`, async () => {
      await this.titleField.fill(text);
    });
  }

  async getTitleValue(): Promise<string> {
    return this.titleField.inputValue();
  }

  async getTitleBorderColor(): Promise<string> {
    return this.titleField.evaluate((el) => getComputedStyle(el).borderColor);
  }

  async isTitleInvalid(): Promise<boolean> {
    const cls = (await this.titleField.getAttribute('class')) ?? '';
    return cls.includes('ng-invalid');
  }

  async isTitleCounterHighlighted(): Promise<boolean> {
    const cls = (await this.titleCounter.getAttribute('class')) ?? '';
    return cls.includes('warning');
  }

  async getTitleCounterText(): Promise<string> {
    return (await this.titleCounter.innerText()).trim();
  }

  async selectTag(name: string): Promise<void> {
    await allure.step(`Select the "${name}" tag`, async () => {
      const selected = this.tag(name).locator('a.global-tag-clicked');
      await this.tag(name).click();
      try {
        await selected.first().waitFor({ state: 'visible', timeout: 3000 });
      } catch {
        await this.tag(name).click();
        await selected.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => undefined);
      }
    });
  }

  async isTagSelected(name: string): Promise<boolean> {
    return (await this.tag(name).locator('a.global-tag-clicked').count()) > 0;
  }

  async getSelectedTagCount(): Promise<number> {
    return this.tagButtons.locator('a.global-tag-clicked').count();
  }

  async uploadImage(file: UploadFile): Promise<void> {
    await allure.step(`Upload image "${file.name}" (${file.mimeType})`, async () => {
      await this.imageFileInput.setInputFiles({
        name: file.name,
        mimeType: file.mimeType,
        buffer: file.buffer,
      });
      await this.page.waitForTimeout(1500);
    });
  }

  async isImageRejected(): Promise<boolean> {
    return allure.step('Check whether the image field is highlighted in red (rejected)', async () => {
      if ((await this.imageDropzone.count()) === 0) {
        return false;
      }
      const cls = (await this.imageDropzone.first().getAttribute('class')) ?? '';
      return cls.includes('warning-background');
    });
  }

  async isImageWarningRed(): Promise<boolean> {
    if ((await this.imageWarning.count()) === 0) {
      return false;
    }
    const cls = (await this.imageWarning.first().getAttribute('class')) ?? '';
    return cls.includes('warning-color');
  }

  async getImageWarningText(): Promise<string> {
    return (await this.imageWarning.first().innerText()).trim();
  }

  async isImageAccepted(): Promise<boolean> {
    return allure.step('Check whether the image was accepted (cropper shown, no error)', async () => {
      // A valid upload replaces the dropzone with the image cropper.
      await this.imageDropzone
        .first()
        .waitFor({ state: 'detached', timeout: 10000 })
        .catch(() => undefined);
      const dropzoneGone = (await this.imageDropzone.count()) === 0;
      const cropperPresent = (await this.imageCropper.count()) > 0;
      return dropzoneGone && cropperPresent;
    });
  }

  async publish(): Promise<void> {
    await allure.step('Click the "Publish" button', async () => {
      await this.publishButton.click();
      await this.titleField.waitFor({ state: 'hidden' }).catch(() => undefined);
    });
  }

  async submitEdit(): Promise<void> {
    // In edit mode the primary save button is the bottom green button (labelled "Edit");
    // the sticky-header "Submit" button does not save the form.
    await allure.step('Submit the edited news (primary save button)', async () => {
      await this.publishButton.click();
      await this.titleField.waitFor({ state: 'hidden' }).catch(() => undefined);
      await this.page
        .waitForURL((url) => !url.toString().includes('create-news'), { timeout: 15000 })
        .catch(() => undefined);
    });
  }

  async fillMainText(text: string): Promise<void> {
    await allure.step(`Enter ${text.length} character(s) into the "Main Text" field`, async () => {
      await this.mainTextField.click();
      await this.mainTextField.fill(text);
      await this.page.waitForTimeout(500);
    });
  }

  async getMainTextLength(): Promise<number> {
    return this.mainTextField.evaluate((el) => (el.textContent ?? '').replace(/\n+$/, '').length);
  }

  async fillSource(url: string): Promise<void> {
    await allure.step(`Enter "${url || '(empty)'}" into the "Source" field`, async () => {
      await this.sourceField.fill(url);
      await this.sourceField.blur();
      await this.page.waitForTimeout(400);
    });
  }

  async getSourceMessageText(): Promise<string> {
    return (await this.sourceHint.first().innerText()).trim();
  }

  async isSourceMessageRed(): Promise<boolean> {
    const cls = (await this.sourceHint.first().getAttribute('class')) ?? '';
    return cls.includes('warning');
  }

  async isSourceInvalid(): Promise<boolean> {
    const cls = (await this.sourceField.getAttribute('class')) ?? '';
    return cls.includes('field-warning');
  }

  async getMainTextMessageText(): Promise<string> {
    return (await this.mainTextCounter.first().innerText()).trim();
  }

  async isMainTextMessageRed(): Promise<boolean> {
    const cls = (await this.mainTextCounter.first().getAttribute('class')) ?? '';
    return cls.includes('warning');
  }

  async isDateAuthorEditable(): Promise<boolean> {
    return allure.step('Check whether the Date/Author block is editable', async () => {
      return this.dateAuthorBlock
        .first()
        .evaluate((el) => {
          const editableChild = el.querySelector('input, textarea, [contenteditable="true"]');
          const self = el as HTMLElement;
          return self.isContentEditable || editableChild !== null;
        })
        .catch(() => false);
    });
  }
}
