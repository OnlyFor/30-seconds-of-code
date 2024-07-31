import { Model } from 'sequelize';

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

class ContentModel extends Model {
  // TODO: This can be moved to a virtual field, a lot of others, too
  get slug() {
    return convertToSeoSlug(this.cid);
  }

  get slugId() {
    return this.slug.split('/').pop();
  }

  get allSlugs() {
    // Redirects.for(url).flat()
    return null;
  }

  get url() {
    if (this.isSnippet) return this.slug;
    return this.firstPageSlug;
  }

  get fullUrl() {
    // TODO: Use a setting for this
    return `https://30secondsofcode.org${this.url}`;
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
    return this.className === 'Snippet';
  }

  get type() {
    return this.className.toLowerCase();
  }
}

export default ContentModel;
