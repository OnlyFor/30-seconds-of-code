import Model from '../core/model.js';
import ContentModel from './contentModel.js';
import TagFormatter from '../../lib/tagFormatter.js';
import Language from './language.js';
import CollectionSnippet from './collectionSnippet.js';
import Collection from './collection.js';
import BreadcrumbPresenter from '../presenters/breadcrumbPresenter.js';
import RecommendationPresenter from '../presenters/recommendationPresenter.js';
import Page from '../adapters/page.js';

// TODO: Give me a home
const normalizedTokens = str =>
  str
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9\-']+/i)
    .filter(x => x.length >= 2);

export default class Snippet extends ContentModel {
  static ARTICLE_MINI_PREVIEW_TAG = 'Article';
  static GITHUB_URL_PREFIX =
    'https://github.com/Chalarangelo/30-seconds-of-code/blob/master/content/snippets';

  static {
    Model.prepare(this, ['cid']);
  }

  constructor(data) {
    super(data);
    this.cid = data.cid;
    this.title = data.title;
    this.shortTitle = data.shortTitle;
    this.content = data.content;
    this.description = data.description;
    this.listed = data.listed || false;
    this.cover = data.cover;
    this.tokens = data.tokens.split(';');
    this.ranking = data.ranking;
    this.tags = data.tags.split(';');
    this.dateModified = new Date(data.dateModified);
    this.tableOfContents = data.tableOfContents;
    this.languageCid = data.languageCid;
  }

  get language() {
    return Language.find(this.languageCid);
  }

  get collectionSnippets() {
    return CollectionSnippet.where({ snippetCid: this.cid });
  }

  get collections() {
    return Collection.where({
      cid: this.collectionSnippets.pluck('collectionCid'),
    });
  }

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
      : `${titleLanguage} - ${this.title}`;
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

  get dateShortString() {
    return this.dateModified.toISOString().split('T')[0];
  }

  get searchTokensArray() {
    return [
      ...new Set(
        [
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
    return this.collectionSnippets.length > 0;
  }

  get breadcrumbs() {
    return this.breadcrumbsPresenter.breadcrumbs;
  }

  get recommendedCollection() {
    return this.breadcrumbsPresenter.recommendedCollection;
  }

  get recommendedSnippets() {
    return this.recommendationPresenter.recommendSnippets();
  }

  get page() {
    return Page.from(this);
  }

  get breadcrumbsPresenter() {
    return new BreadcrumbPresenter(this);
  }

  get recommendationPresenter() {
    return new RecommendationPresenter(this);
  }
}
