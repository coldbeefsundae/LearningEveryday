// Fetches the newest real CBC Kids News story and writes news.json (headline, one line, link).
// Runs in GitHub Actions (Node 20+, no packages). Safe to fail: if anything goes wrong it
// leaves the old news.json alone and the app keeps showing it (or hides the card).
//
// v2: reads several story pages, skips promo / teacher pages, and picks the newest by date.
// It only stores a headline, a one-line description and the link, and the app opens the
// story on cbc.ca. No article text or pictures are copied.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FRONT = 'https://www.cbc.ca/kidsnews';
const OUT = process.argv[2] || 'news.json';
const UA = 'Mozilla/5.0 (compatible; StarQuestFamilyApp/1.0; personal, once a day)';
const MAX_CANDIDATES = 14;

// Pages that are about CBC Kids News itself, not news
const PROMO_TITLE = /bring cbc kids news|your (class|classroom|school)|classroom|teachers?\b|educators?\b|about cbc kids news|newsletter|subscribe|contest|submit your|meet the (team|kid)|how cbc kids news/i;
const PROMO_SLUG = /(^|-)(classroom|teachers?|educators?|newsletter|subscribe|contest|about-us)(-|$)/i;

const decode = (s) => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&#x27;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/\s+/g, ' ').trim();

async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA, 'accept': 'text/html,application/xhtml+xml' }, redirect: 'follow' });
  if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
  return await r.text();
}

function meta(html, key) {
  const a = new RegExp('<meta[^>]+(?:property|name|itemprop)=["\']' + key + '["\'][^>]*content=["\']([^"\']*)["\']', 'i').exec(html);
  if (a) return decode(a[1]);
  const b = new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name|itemprop)=["\']' + key + '["\']', 'i').exec(html);
  return b ? decode(b[1]) : '';
}

function findDate(html) {
  const tries = [
    meta(html, 'article:published_time'),
    meta(html, 'datePublished'),
    meta(html, 'pubdate'),
    meta(html, 'publish-date'),
    meta(html, 'date'),
    (/"datePublished"\s*:\s*"([^"]+)"/i.exec(html) || [])[1],
    (/"publishedAt"\s*:\s*"([^"]+)"/i.exec(html) || [])[1],
    (/"firstPublished"\s*:\s*"?([0-9T:\-+.Z]+)"?/i.exec(html) || [])[1],
    (/<time[^>]+datetime=["']([^"']+)["']/i.exec(html) || [])[1],
    meta(html, 'og:updated_time'),
