import dotenv from 'dotenv';

dotenv.config();

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') {
    return fallback;
  }
  return value.toLowerCase() === 'true';
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  BASE_URL: process.env.BASE_URL ?? 'https://www.greencity.cx.ua/#/greenCity',
  HEADLESS: toBool(process.env.HEADLESS, true),
  RETRIES: toNumber(process.env.RETRIES, 0),
  TIMEOUT: toNumber(process.env.TIMEOUT, 30000),
  USER_EMAIL: process.env.USER_EMAIL ?? '',
  USER_PASSWORD: process.env.USER_PASSWORD ?? '',
};
