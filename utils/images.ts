export type UploadFile = {
  name: string;
  mimeType: string;
  buffer: Buffer;
};

const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
const GIF_1x1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const JPEG_1x1 = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==',
  'base64',
);

const MB = 1024 * 1024;

const pad = (head: Buffer, sizeBytes: number): Buffer =>
  Buffer.concat([head, Buffer.alloc(Math.max(0, sizeBytes - head.length))]);

export const pngFile = (sizeMb: number): UploadFile => ({
  name: 'image.png',
  mimeType: 'image/png',
  buffer: pad(PNG_1x1, Math.round(sizeMb * MB)),
});

export const gifFile = (sizeMb: number): UploadFile => ({
  name: 'image.gif',
  mimeType: 'image/gif',
  buffer: pad(GIF_1x1, Math.round(sizeMb * MB)),
});

export const jpegFile = (sizeMb: number): UploadFile => ({
  name: 'image.jpeg',
  mimeType: 'image/jpeg',
  buffer: pad(JPEG_1x1, Math.round(sizeMb * MB)),
});
