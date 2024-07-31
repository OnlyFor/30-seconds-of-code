import ContentModel from './contentModel.js';
import TagFormatter from '../lib/tagFormatter.js';

// TODO: Give me a home
const normalizedTokens = str =>
  str
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9\-']+/i)
    .filter(x => x.length >= 2);

// TODO: Splitter getters can be defined as part of the model schema in a t.string_delimited or something we'll see
class Snippet extends ContentModel {
  static ARTICLE_MINI_PREVIEW_TAG = 'Article';
  static GITHUB_URL_PREFIX =
    'https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets';

  className = 'Snippet';

  get hasLanguage() {
    return this.languageCid !== null;
  }

  get seoTitle() {
    if (!this.hasLanguage) return this.title;

    const titleLanguage =
      this.languageCid === 'javascript' && this.primaryTag === 'node'
        ? this.formattedPrimaryTag
        : this.language.name;

    return this.title.includes(titleLanguage)
      ? this.title
      : `${titleLanguage} (${this.title})`;
  }

  get primaryTag() {
    return this.tags[0];
  }

  get formattedPrimaryTag() {
    return TagFormatter.format(this.primaryTag);
  }

  // Used for snippet previews in search autocomplete
  get formattedMiniPreviewTag() {
    if (this.hasLanguage) return this.language.name;
    return Snippet.ARTICLE_MINI_PREVIEW_TAG;
  }

  get formattedTags() {
    const formattedTags = this.tags.map(tag => TagFormatter.format(tag));
    if (this.hasLanguage) formattedTags.unshift(this.language.name);
    return formattedTags.join(', ');
  }

  get formattedPreviewTags() {
    if (this.hasLanguage) return this.language.name;
    return this.formattedPrimaryTag;
  }

  get githubUrl() {
    return `${Snippet.GITHUB_URL_PREFIX}${this.slug}.md`;
  }

  get isScheduled() {
    return this.dateModified > new Date();
  }

  get isPublished() {
    return !this.isScheduled;
  }

  get isListed() {
    return this.listed && this.isPublished;
  }

  get dateFormatted() {
    return this.dateModified.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get dateMachineFormatted() {
    return this.dateModified.toISOString().slice(0, 10);
  }

  get searchTokensArray() {
    return [
      ...new Set(
        ...[
          this.slugId,
          ...this.tags,
          ...this.tokens,
          ...normalizedTokens(this.title),
          this.language?.short?.toLowerCase(),
          this.language?.long?.toLowerCase(),
        ].filter(Boolean)
      ),
    ];
  }

  get hasCollection() {
    return this.collection_snippets.length > 0;
  }
}

export default Snippet;
