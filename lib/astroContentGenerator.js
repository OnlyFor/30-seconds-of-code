import fs from 'fs-extra/esm';
import Page from '../app/adapters/page.js';
import Collection from '../app/models/collection.js';
import Snippet from '../app/models/snippet.js';

export default class AstroContentGenerator {
  static generate() {
    this.prepare();

    this.generateHomePage();
    this.generateCollectionPages();
    this.generateSnippetPages();
  }

  static prepare() {
    // Ensure dir exists
    fs.ensureDirSync('.content/pages/[lang]/s');
  }

  static generateHomePage() {
    const page = Page.home.serialize;

    // Write to file
    fs.writeJson('.content/pages/index.json', page, { spaces: 2 }, () => {});
  }

  static generateCollectionPages() {
    const pages = Collection.all.reduce((acc, collection) => {
      collection.pages.forEach(page => {
        acc[page.key] = page.serialize;
      });

      return acc;
    }, {});

    fs.writeJson(
      '.content/pages/[lang]/[...listing].json',
      pages,
      { spaces: 2 },
      () => {}
    );
  }

  static generateSnippetPages() {
    const now = new Date();
    const pages = Snippet.where({ dateModified: d => d < now }).reduce(
      (acc, snippet) => {
        const page = snippet.page;
        acc[page.key] = page.serialize;
        return acc;
      },
      {}
    );

    fs.writeJson(
      '.content/pages/[lang]/s/[snippet].json',
      pages,
      { spaces: 2 },
      () => {}
    );

    return pages;
  }
}
