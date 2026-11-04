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
  ];
  for (const t of tries) {
    if (!t) continue;
    const d = new Date(t);
    if (!isNaN(d)) return d;
  }
  return null;
}

function storyLinks(html) {
  const flat = html.replace(/\\\//g, '/');
  const seen = [];
  const re = /(?:https:\/\/www\.cbc\.ca)?\/kidsnews\/post\/([a-z0-9][a-z0-9-]{3,140})/gi;
  let m;
  while ((m = re.exec(flat))) {
    const slug = m[1].toLowerCase();
    if (PROMO_SLUG.test(slug)) continue;
    const url = 'https://www.cbc.ca/kidsnews/post/' + slug;
    if (!seen.includes(url)) seen.push(url);
  }
  return seen;
}

function clip(s, n) { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '\u2026' : s; }

async function readStory(url) {
  try {
    const page = await get(url);
    const title = clip(meta(page, 'og:title').replace(/\s*[|\u2013-]\s*CBC Kids News\s*$/i, ''), 160);
    const summary = clip(meta(page, 'og:description') || meta(page, 'description'), 260);
    const date = findDate(page);
    return { url, title, summary, date };
  } catch (e) { console.log('skip ' + url + ': ' + e.message); return null; }
}

try {
  const front = await get(FRONT);
  const links = storyLinks(front).slice(0, MAX_CANDIDATES);
  if (!links.length) throw new Error('no story links found on the front page (page layout may have changed)');
  const found = (await Promise.all(links.map(readStory))).filter((x) => x && x.title);
  found.forEach((x) => console.log('candidate: ' + (x.date ? x.date.toISOString().slice(0, 10) : 'no-date') + ' | ' + x.title));
  const real = found.filter((x) => !PROMO_TITLE.test(x.title));
  if (!real.length) throw new Error('only promo pages found');
  // newest dated story wins; if no story has a date, keep the order of the front page
  const dated = real.filter((x) => x.date).sort((a, b) => b.date - a.date);
  const item = dated.length ? dated[0] : real[0];
  const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const out = {
    source: 'CBC Kids News',
    title: item.title,
    summary: item.summary,
    url: item.url,
    published: item.date ? item.date.toISOString().slice(0, 10) : '',
    fetched: new Date().toISOString().slice(0, 10),
  };
  if (old.url === out.url && old.title === out.title && old.summary === out.summary) { console.log('No change: ' + out.title); }
  else { writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n'); console.log('Updated: ' + out.title + ' -> ' + out.url); }
} catch (e) {
  console.log('::warning::News fetch failed, keeping the old news.json: ' + e.message);
}
