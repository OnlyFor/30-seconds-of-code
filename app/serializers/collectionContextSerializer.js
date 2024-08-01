import BaseSerializer from './baseSerializer.js';

export default class CollectionContextSerializer extends BaseSerializer {
  static {
    BaseSerializer.prepare(this, [
      'title',
      'content',
      ['cover', 'coverUrl'],
      'coverSrcset',
      'sublinks',
    ]);
  }
}
