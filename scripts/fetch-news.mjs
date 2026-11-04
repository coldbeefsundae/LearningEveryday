// Fetches the top CBC Kids News story and writes news.json (headline, one line, link).
// Runs in GitHub Actions (Node 20+, no packages). Safe to fail: if anything goes wrong it
// leaves the old news.json alone and the app keeps showing it (or hides the card).
//
// It only stores a headline, a one-line description and the link, and the app opens the
// story on cbc.ca. No article text or pictures are copied.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const FRONT = 'https://www.cbc.ca/kidsnews';
const OUT = process.argv[2] || 'news.json';
const UA = 'Mozilla/5.0 (compatible; StarQuestFamilyApp/1.0; personal, once a day)';

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
  const a = new RegExp('<meta[^>]+(?:property|name)=["\']' + key + '["\'][^>]*content=["\']([^"\']*)["\']', 'i').exec(html);
  if (a) return decode(a[1]);
  const b = new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:property|name)=["\']' + key + '["\']', 'i').exec(html);
  return b ? decode(b[1]) : '';
}

function storyLinks(html) {
  const flat = html.replace(/\\\//g, '/');
  const seen = [];
  const re = /(?:https:\/\/www\.cbc\.ca)?\/kidsnews\/post\/([a-z0-9][a-z0-9-]{3,120})/gi;
  let m;
  while ((m = re.exec(flat))) {
    const url = 'https://www.cbc.ca/kidsnews/post/' + m[1].toLowerCase();
    if (!seen.includes(url)) seen.push(url);
  }
  return seen;
}

function clip(s, n) { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '\u2026' : s; }

try {
  const front = await get(FRONT);
  const links = storyLinks(front);
  if (!links.length) throw new Error('no story links found on the front page (page layout may have changed)');
  let item = null;
  for (const url of links.slice(0, 6)) {
    try {
      const page = await get(url);
      const title = clip(meta(page, 'og:title').replace(/\s*[|\u2013-]\s*CBC Kids News\s*$/i, ''), 160);
      const summary = clip(meta(page, 'og:description') || meta(page, 'description'), 260);
      const dm = meta(page, 'article:published_time') || (/<time[^>]+datetime=["']([^"']+)["']/i.exec(page) || [])[1] || '';
      if (title) { item = { title, summary, url, published: dm ? String(dm).slice(0, 10) : '' }; break; }
    } catch (e) { console.log('skip ' + url + ': ' + e.message); }
  }
  if (!item) throw new Error('could not read a title from any story page');
  const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const out = { source: 'CBC Kids News', title: item.title, summary: item.summary, url: item.url, published: item.published, fetched: new Date().toISOString().slice(0, 10) };
  if (old.url === out.url && old.title === out.title && old.summary === out.summary) { console.log('No change: ' + out.title); }
  else { writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n'); console.log('Updated: ' + out.title + ' -> ' + out.url); }
} catch (e) {
  console.log('::warning::News fetch failed, keeping the old news.json: ' + e.message);
}
