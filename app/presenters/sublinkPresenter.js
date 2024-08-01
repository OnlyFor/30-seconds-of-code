import Collection from '../models/collection.js';

export default class SublinkPresenter {
  static PARENT_TITLE = 'All';
  static MORE_COLLECTIONS_SUBLINK = {
    title: 'More',
    url: '/collections/p/1',
    icon: 'arrow-right',
    selected: false,
  };

  constructor(object, options = {}) {
    this.object = object;
    this.options = options;
  }

  get sublinks() {
    if (this.object.isMain) {
      return Collection.where({ topLevel: true })
        .order((a, b) => b.ranking - a.ranking)
        .map(collection => this.toSublink(collection))
        .flat()
        .concat([SublinkPresenter.MORE_COLLECTIONS_SUBLINK]);
    }

    if (!this.object.isPrimary && !this.object.hasParent) return [];

    if (this.object.isPrimary && this.object.children.length === 0) return [];

    let links = this.object.hasParent
      ? this.object.siblings
      : this.object.children;

    console;

    links = links
      .map(link => this.toSublink(link, link.cid === this.object.cid))
      .order((a, b) => a.title.localeCompare(b.title));

    links.unshift({
      title: SublinkPresenter.PARENT_TITLE,
      url: `${this.object.rootUrl}/p/1`,
      selected: this.object.isPrimary,
    });

    return links;
  }

  toSublink(collection, selected = false) {
    return {
      title: collection.miniTitle,
      url: collection.firstPageSlug,
      selected,
    };
  }
}
