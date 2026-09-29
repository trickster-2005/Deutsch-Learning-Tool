// Mobile overflow check: opens the word detail card at 375 px for the words
// most likely to overflow and reports any horizontal overflow.
// Usage: dev or preview server running, then
//   PREVIEW_URL=http://localhost:5173/Deutsch-Learning-Tool/ node scripts/check-mobile.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4173/Deutsch-Learning-Tool/';
const rows = JSON.parse(readFileSync(new URL('../public/data/browse/words.json', import.meta.url), 'utf8'));
const byLen = [...rows].filter((r) => !r.x).sort((a, b) => b.d.length - a.d.length);
const pick = new Map();
for (const r of byLen.slice(0, 8)) pick.set(r.k, r);                               // longest words
for (const p of ['VERB', 'ADJ', 'NOUN']) for (const r of byLen.filter((x) => x.p === p).slice(0, 3)) pick.set(r.k, r);
for (const k of ['übersetzen', 'aufstehen', 'Haus', 'Arbeitslosigkeit', 'Freundlichkeit', 'Einfamilienhaus']) {
  const r = rows.find((x) => x.k === k);
  if (r) pick.set(k, r);
}

const launch = async () => {
  for (const channel of ['msedge', 'chrome', undefined]) {
    try { return await chromium.launch(channel ? { channel } : {}); } catch { /* next */ }
  }
  throw new Error('no browser');
};
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
let failures = 0;
for (const r of pick.values()) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}#/family/${r.f}?focus=${encodeURIComponent(r.k)}`);
  await page.waitForSelector('.o-node.selected, .o-node.focus', { timeout: 15000 });
  await page.click('.o-node.selected');
  await page.waitForSelector('.detail-panel .headword');
  await page.waitForTimeout(600); // entry, dual readings and affixes load async
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const panel = document.querySelector('.detail-panel');
    const pr = panel.getBoundingClientRect();
    const bad = [];
    for (const el of panel.querySelectorAll('*')) {
      const b = el.getBoundingClientRect();
      if (b.width && (b.right > pr.right + 0.5 || b.left < pr.left - 0.5)) {
        bad.push(`${el.tagName.toLowerCase()}.${el.className} ${Math.round(b.left)}-${Math.round(b.right)}`);
      }
    }
    return {
      vw, docScroll: document.documentElement.scrollWidth,
      panel: [Math.round(pr.left), Math.round(pr.right)],
      panelScroll: panel.scrollWidth, panelClient: panel.clientWidth, bad: bad.slice(0, 5),
    };
  });
  const ok = res.docScroll <= res.vw && res.panelScroll <= res.panelClient + 1 && !res.bad.length
    && res.panel[0] >= 0 && res.panel[1] <= res.vw;
  await page.close();
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.k.padEnd(34)} panel ${res.panel.join('-')} scroll ${res.panelScroll}/${res.panelClient} doc ${res.docScroll}/${res.vw}${res.bad.length ? `\n     ${res.bad.join('\n     ')}` : ''}`);
}
// the "?" legend popover must stay on screen too
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}#/family/${rows.find((x) => x.k === 'stehen')?.f ?? rows[0].f}`);
  await page.waitForSelector('.o-node');
  await page.click('.family-head .rel > button');
  const r = await page.evaluate(() => {
    const b = document.querySelector('.help-pop').getBoundingClientRect();
    return { l: b.left, r: b.right, bt: b.bottom, vw: document.documentElement.clientWidth, vh: innerHeight, doc: document.documentElement.scrollWidth };
  });
  const ok = r.l >= 0 && r.r <= r.vw && r.bt <= r.vh + 1 && r.doc <= r.vw;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} legend popover ${Math.round(r.l)}-${Math.round(r.r)} doc ${r.doc}/${r.vw}`);
  await page.close();
}
await browser.close();
console.log(failures ? `${failures} overflow(s)` : 'no overflow');
process.exit(failures ? 1 : 0);
