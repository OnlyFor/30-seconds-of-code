import fs from 'fs';
import path from 'path';

export default class CoverPresenter {
  static COVER_EXTENSION = '.webp';
  static COVER_PREFIXES = {
    snippet: '/assets/cover/',
    collection: '/assets/splash/',
  };

  static COVER_SUFFIX = {
    home: '-400',
    snippet: '-400',
    snippetFull: '-800',
    collection: '-600',
  };

  static COVER_SIZES = {
    snippet: ['400w', '800w'],
    snippetFull: ['800w', '400w', '1200w'],
    collection: ['600w', '400w'],
  };

  constructor(object, options = {}) {
    this.object = object;
    this.options = options;
  }

  coverUrl(full = false) {
    return `${this.coverPrefix}${this.coverName}${this.coverSuffix(full)}${
      CoverPresenter.COVER_EXTENSION
    }`;
  }

  coverFullUrl() {
    // TODO: Use a setting for this
    return `https://www.30secondsofcode.org${this.coverUrl(false)}`;
  }

  coverSrcset(full = false) {
    return this.coverSizes(full).map(size => {
      const suffix = size.replace('w', '');
      return `${this.coverPrefix}${this.coverName}-${suffix}${CoverPresenter.COVER_EXTENSION} ${size}`;
    });
  }

  static get allSnippetCovers() {
    if (!this.snippetCovers)
      this.snippetCovers = fs
        .readdirSync('content/assets/cover/')
        .slice(2)
        .map(cover => {
          return path.basename(cover, '.jpg');
        });

    return this.snippetCovers;
  }

  get coverName() {
    return this.object.cover;
  }

  get coverPrefix() {
    return this.object.isSnippet
      ? CoverPresenter.COVER_PREFIXES.snippet
      : CoverPresenter.COVER_PREFIXES.collection;
  }

  coverSizes(full = false) {
    return this.object.isSnippet
      ? full
        ? CoverPresenter.COVER_SIZES.snippetFull
        : CoverPresenter.COVER_SIZES.snippet
      : CoverPresenter.COVER_SIZES.collection;
  }

  coverSuffix(full = false) {
    return this.object.isSnippet
      ? full
        ? CoverPresenter.COVER_SUFFIX.snippetFull
        : CoverPresenter.COVER_SUFFIX.snippet
      : CoverPresenter.COVER_SUFFIX.collection;
  }
}
