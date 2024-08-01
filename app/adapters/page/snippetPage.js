import Page from '../page.js';

export default class SnippetPage extends Page {
  static {
    Page.register(this);
  }

  get key() {
    return `${this.slugSegments[0]}/s/${this.slugSegments.slice(-1)[0]}`;
  }

  get params() {
    return {
      lang: this.slugSegments[0],
      snippet: this.slugSegments.slice(-1)[0],
    };
  }

  get props() {
    return {
      breadcrumbs: this.object.breadcrumbs,
      pageDescription: this.object.seoDescription,
      snippet: this.object.context,
      recommendations: [
        this.object.recommendedCollection,
        ...this.object.recommendedSnippets,
      ]
        .filter(Boolean)
        .slice(0, 4)
        .map(rec => rec.preview),
    };
  }

  get additionalSchemaData() {
    return {
      name: this.object.seoTitle,
      // TODO: This is fishy??
      headline: this.object.seoTitle,
      description: this.object.seoDescription,
      image: this.object.coverFullUrl,
      datePublished: this.object.dateShortString,
      dateModified: this.object.dateShortString,
      publisher: {
        // TODO: Settings!!
        '@type': 'Person',
        name: 'Angelos Chalaris',
        url: 'https://github.com/Chalarangelo',
      },
    };
  }
}
