import Model from '../core/model.js';
import ContentModel from './contentModel.js';
import CollectionSnippet from './collectionSnippet.js';
import Snippet from './snippet.js';
import Page from '../adapters/page.js';
import SublinkPresenter from '../presenters/sublinkPresenter.js';

// TODO: Move to settings
const CARDS_PER_PAGE = 24;
const COLLECTION_CARDS_PER_PAGE = 12;

export default class Collection extends ContentModel {
  static MAIN_COLLECTION_CID = 'snippets';
  static COLLECTIONS_COLLECTION_CID = 'collections';
  static MORE_COLLECTIONS_SUBLINK = {
    title: 'More',
    url: '/collections/p/1',
    icon: 'arrow-right',
    selected: false,
  };

  static {
    Model.prepare(this, ['cid']);
  }

  constructor(data) {
    super(data);
    this.cid = data.cid;
    this.title = data.title;
    this.shortTitle = data.shortTitle;
    this.miniTitle = data.miniTitle;
    this.content = data.content;
    this.description = data.description;
    this.listed = data.listed || false;
    this.cover = data.cover;
    this.tokens = data.tokens.split(';');
    this.ranking = data.ranking;
    this.featuredIndex = data.featuredIndex;
    this.topLevel = data.topLevel || false;
    this.parentCid = data.parentCid;
  }

  get parent() {
    return Collection.find(this.parentCid);
  }

  get children() {
    return Collection.where({
      parentCid: this.cid,
    });
  }

  get collectionSnippets() {
    return CollectionSnippet.where({ collectionCid: this.cid });
  }

  get snippets() {
    return Snippet.where({
      cid: this.collectionSnippets.pluck('snippetCid'),
    });
  }

  get listedSnippets() {
    const now = new Date();
    return this.collectionSnippets
      .where({
        dateModified: d => d < now,
        position: p => p !== -1,
      })
      .order((a, b) => a.position - b.position)
      .map(cs => cs.snippet);
  }

  static get main() {
    return Collection.find(Collection.MAIN_COLLECTION_CID);
  }

  static get collections() {
    return Collection.find(Collection.COLLECTIONS_COLLECTION_CID);
  }

  get hasParent() {
    return this.parentCid !== null;
  }

  get isMain() {
    return this.cid === Collection.MAIN_COLLECTION_CID;
  }

  get isCollections() {
    return this.cid === Collection.COLLECTIONS_COLLECTION_CID;
  }

  get isPrimary() {
    return Boolean(this.topLevel);
  }

  get isSecondary() {
    return this.hasParent;
  }

  get rootUrl() {
    return this.hasParent ? this.parent.slug : this.slug;
  }

  get siblings() {
    return this.hasParent ? this.parent.children : [];
  }

  get siblingsExceptSelf() {
    return this.siblings.filter(sibling => sibling.cid !== this.cid);
  }

  get searchTokensArray() {
    return this.tokens;
  }

  get firstPageSlug() {
    return `${this.slug}/p/1`;
  }

  get allPageSlugs() {
    return Array.from(
      { length: this.pageCount },
      (_, i) => `${this.slug}/p/${i + 1}`
    );
  }

  get allPageFullUrls() {
    // TODO: Use a setting for this
    return this.allPageSlugs.map(
      slug => `https://www.30secondsofcode.org${slug}`
    );
  }

  get pageCount() {
    return Math.ceil(this.listedSnippets.length / CARDS_PER_PAGE);
  }

  get formattedSnippetCount() {
    return `${this.listedSnippets.length} snippets`;
  }

  get sublinks() {
    return this.sublinkPresenter.sublinks;
  }

  // TODO: A little fiddly
  matchesTag(tag) {
    return this.cid.endsWith(`/${tag}`);
  }

  get pages() {
    if (this.isCollections) return this.collectionsPages;

    const pagination = {
      pageCount: this.pageCount,
      itemCount: this.listedSnippets.length,
      itemType: 'snippets',
    };

    return Array.from({ length: this.pageCount }, (_, i) => {
      const pageNumber = i + 1;
      return Page.from(this, {
        pageNumber,
        items: this.listedSnippets.slice(
          i * CARDS_PER_PAGE,
          (i + 1) * CARDS_PER_PAGE
        ),
        ...pagination,
        largeImages: false,
      });
    });
  }

  get collectionsPages() {
    const featuredCollections = Collection.where({
      featuredIndex: v => v !== null,
    }).order((a, b) => a.featuredIndex - b.featuredIndex);

    const pageCount = Math.ceil(
      featuredCollections.length / COLLECTION_CARDS_PER_PAGE
    );

    const pagination = {
      pageCount,
      itemCount: featuredCollections.length,
      itemType: 'collections',
    };

    return Array.from({ length: pageCount }, (_, i) => {
      const pageNumber = i + 1;
      return Page.from(this, {
        pageNumber,
        items: featuredCollections.slice(
          i * COLLECTION_CARDS_PER_PAGE,
          (i + 1) * COLLECTION_CARDS_PER_PAGE
        ),
        ...pagination,
        largeImages: true,
      });
    });
  }

  get sublinkPresenter() {
    return new SublinkPresenter(this);
  }
}
