import Page from '../page.js';
import Collection from '../../models/collection.js';
import Snippet from '../../models/snippet.js';
import CoverPresenter from '../../presenters/coverPresenter.js';

// TODO: I'm homeless
const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

export default class HomePage extends Page {
  static {
    Page.register(this);
  }

  static NEW_SNIPPET_CARDS = 6;
  static TOP_SNIPPET_CARDS = 6;
  static TOP_COLLECTION_CHIPS = 8;
  static COVER = 'work-sunrise';

  get params() {
    return null;
  }

  get props() {
    return {
      featuredCollections: this.featuredCollections,
      featuredSnippets: this.featuredSnippets,
      splashImage: this.coverUrl,
      splashImageSrcSet: this.coverSrcset,
      snippetListUrl: this.mainListingUrl,
      pageDescription: this.seoDescription,
    };
  }

  get schemaData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      // TODO: Use a setting
      url: 'https://www.30secondsofcode.org',
    };
  }

  get featuredCollections() {
    return Collection.where({ featuredIndex: x => x !== null })
      .order((a, b) => a.featuredIndex - b.featuredIndex)
      .slice(0, HomePage.TOP_COLLECTION_CHIPS)
      .map(collection => collection.preview)
      .concat([this.exploreCollections]);
  }

  get featuredSnippets() {
    const newSnippets = Snippet.where({ listed: true })
      .order((a, b) => b.dateModified - a.dateModified)
      .slice(0, HomePage.NEW_SNIPPET_CARDS);

    const topSnippets = shuffle(
      Snippet.where({ listed: true })
        .order((a, b) => b.ranking - a.ranking)
        .slice(0, HomePage.TOP_SNIPPET_CARDS * 5)
    );

    return [...new Set(newSnippets.concat(topSnippets))]
      .slice(0, HomePage.TOP_SNIPPET_CARDS + HomePage.NEW_SNIPPET_CARDS)
      .map(snippet => snippet.preview);
  }

  get seoDescription() {
    // TODO: Use settings
    const now = new Date();
    const snippetCount = Snippet.where({ dateModified: d => d < now }).length;
    const websiteName = '30 seconds of code';

    return `Browse ${snippetCount} short code snippets for all your development needs on ${websiteName}`;
  }

  get mainListingUrl() {
    return Collection.main.firstPageSlug;
  }

  get exploreCollections() {
    return {
      title: 'Explore collections',
      url: Collection.collections.firstPageSlug,
      icon: 'arrow-right',
      selected: false,
    };
  }

  get coverPresenter() {
    return new CoverPresenter({ cover: HomePage.COVER });
  }

  get coverUrl() {
    return this.coverPresenter.coverUrl();
  }

  get coverSrcset() {
    return this.coverPresenter.coverSrcset();
  }
}
