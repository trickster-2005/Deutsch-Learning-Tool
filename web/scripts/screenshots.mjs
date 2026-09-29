// Take README screenshots from the local preview site (spec 16.3).
// Usage: npm run build && npx vite preview --port 4173 &  node scripts/screenshots.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4173/Deutsch-Learning-Tool/';
const OUT = new URL('../../docs/screenshots/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const launch = async () => {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch {
      /* try next */
    }
  }
  throw new Error('no Chromium-based browser available');
};

const browser = await launch();
const shot = async (path, name, viewport, action) => {
  const ctx = await browser.newContext({ viewport, colorScheme: 'light', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}#${path}`);
  await page.waitForLoadState('networkidle');
  if (action) await action(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: new URL(name, OUT).pathname.replace(/^\/([A-Za-z]:)/, '$1') });
  await ctx.close();
  console.log('saved', name);
};

const familyUrl = async (page, word) => {
  await page.goto(BASE);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="search"]', word);
  await page.keyboard.press('Enter');
  await page.waitForURL(/#\/family\//);
  return page.url().split('#')[1];
};

const probe = await browser.newPage();
const stehen = await familyUrl(probe, 'stand auf');
await probe.close();

await shot(stehen, 'family-tree.png', { width: 1440, height: 900 });
await shot('/browse?tab=affix&a=%C3%BCber-', 'browse.png', { width: 1440, height: 900 });
await shot(stehen, 'mobile.png', { width: 375, height: 812 });
await browser.close();
