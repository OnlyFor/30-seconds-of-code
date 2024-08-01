import Model from '../core/model.js';
import CoverPresenter from '../presenters/coverPresenter.js';
import serializers from '../serializers/serializers.js';

// TODO: Deduplicate, these two methods exist in parsley, too!
/**
 * Converts a given string to kebab-case.
 * @param {string} str - The string to be converted.
 */
export const toKebabCase = str =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-');

/**
 * Converts a slug to a SEO-friendly representation.
 * Steps:
 *  - Kebab-case
 *  - Add a '/' in the front
 * @param {string} str - The string to be converted.
 */
export const convertToSeoSlug = str => `/${toKebabCase(str)}`;

// TODO: I need a home, too!
export const stripHtmlParagraphsAndLinks = str =>
  str.replace(/<\/?p>/g, '').replace(/<a.*?>(.*?)<\/a>/g, '$1');

/**
 * Strips HTML format from a string.
 * @param {string} str - The HTML string to be stripped.
 */
export const stripHtml = str =>
  str
    .replace(/<.*?>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<');

export default class ContentModel extends Model {
  static {
    Model.prepare(this, []);
  }

  get slug() {
    return `/${this.cid.toLowerCase()}`;
  }

  get slugId() {
    return this.slug.split('/').pop();
  }

  get allSlugs() {
    // TODO: Redirects.for(url).flat()
    return null;
  }

  get url() {
    if (this.isSnippet) return this.slug;
    return this.firstPageSlug;
  }

  get fullUrl() {
    // TODO: Use a setting for this
    return `https://www.30secondsofcode.org${this.url}`;
  }

  get formattedDescription() {
    return stripHtmlParagraphsAndLinks(this.description);
  }

  get seoDescription() {
    return stripHtml(this.description);
  }

  get searchTokens() {
    return this.searchTokensArray.join(' ');
  }

  get isSnippet() {
    return this.constructor.name === 'Snippet';
  }

  get type() {
    return this.constructor.name.toLowerCase();
  }

  // Covers

  get coverPresenter() {
    return new CoverPresenter(this);
  }

  get coverUrl() {
    return this.coverPresenter.coverUrl();
  }

  get coverSrcset() {
    return this.coverPresenter.coverSrcset();
  }

  get coverFullUrl() {
    return this.coverPresenter.coverFullUrl();
  }

  get coverUrlFullSize() {
    return this.coverPresenter.coverUrl(true);
  }

  get coverSrcsetFullSize() {
    return this.coverPresenter.coverSrcset(true);
  }

  // Serializable

  serializeAs(name) {
    const serializerName = `${name}Serializer`;
    const serializer = new serializers[serializerName](this);

    if (!serializer) {
      throw new Error(`Serializer ${serializerName} not found`);
    }
    return serializer.serialize();
  }

  get context() {
    return this.isSnippet
      ? this.serializeAs('SnippetContext')
      : this.serializeAs('CollectionContext');
  }

  // Previewable

  get preview() {
    return this.serializeAs('Preview');
  }

  get previewTitle() {
    return this.isSnippet ? this.title : this.shortTitle;
  }
}
