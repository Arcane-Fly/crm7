import type { PuppeteerLaunchOptions, Browser } from 'puppeteer-core';

interface PuppeteerConfig {
  launchOptions: PuppeteerLaunchOptions;
}

const DEFAULT_CONFIG: PuppeteerConfig = {
  launchOptions: {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  },
};

let browser: Browser | null = null;

/**
 * Helper function to get a browser instance with proper error handling
 */
export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    const puppeteer = await import('puppeteer-core');
    browser = await puppeteer.default.launch(DEFAULT_CONFIG.launchOptions);
  }
  return browser;
}

/**
 * Helper function to close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser: unknown) {
    await browser.close();
    browser = null;
  }
}

export { DEFAULT_CONFIG };
export type { PuppeteerConfig, Browser };
