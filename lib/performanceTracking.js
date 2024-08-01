import fs from 'fs';
import Redirects from './redirects.js';

export default class PerforanceTracking {
  static KEY_PROPERTY = 'Top pages';
  static EXCLUDED_PROPERTIES = [this.KEY_PROPERTY, 'CTR', 'Position'];
  static DEFAULT_PAGE_DATA = { clicks: 0, impressions: 0 };

  static {
    const csvData = fs.readFileSync('imported/Pages.csv', 'utf8');
    this.data = csvData
      .split('\n')
      .map(row => row.split(','))
      .reduce((acc, [key, clicks, impressions]) => {
        const slug = key.replace('https://www.30secondsofcode.org', '');
        acc[slug] = {
          clicks: Number.parseInt(clicks, 10),
          impressions: Number.parseInt(impressions, 10),
        };
        return acc;
      }, {});
  }

  static for(...slugs) {
    let allSlugs = slugs.length === 1 ? Redirects.for(slugs[0]) : slugs;
    return allSlugs.reduce(
      (acc, slug) => {
        if (this.data[slug]) {
          acc.clicks += this.data[slug].clicks;
          acc.impressions += this.data[slug].impressions;
        }
        return acc;
      },
      { ...this.DEFAULT_PAGE_DATA }
    );
  }
}
