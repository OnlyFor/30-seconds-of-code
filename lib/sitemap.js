import fs from 'fs';
import Snippet from '../app/models/snippet.js';
import Collection from '../app/models/collection.js';

export default class Sitemap {
  // TODO: Actually use settings for these
  static HOME_PAGE_URL = '#{Orbit::settings[:website][:url]}/';
  static STATIC_PAGE_URLS = [
    '#{Orbit::settings[:website][:url]}/about',
    '#{Orbit::settings[:website][:url]}/faw',
  ];

  static generate() {
    const data = `\
<?xml version="1.0" encoding="UTF-8"?>
  <urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
  >
${Sitemap.urls.join('\n')}
  </urlset>
</rss>`;

    // Write to file
    fs.writeFileSync('public/sitemap.xml', data);
  }

  static get urls() {
    const now = Date.now();
    return [
      Sitemap.HOME_PAGE_URL,
      ...Snippet.where({ dateModified: d => d < now }).map(
        snippet => snippet.fullUrl
      ),
      ...Collection.all.map(collection => collection.allPageFullUrls).flat(),
      ...Sitemap.STATIC_PAGE_URLS,
    ].map(
      url => `\
    <url>
      <loc>${url}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`
    );
  }
}
