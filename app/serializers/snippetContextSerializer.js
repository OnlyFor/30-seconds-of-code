import BaseSerializer from './baseSerializer.js';

export default class SnippetContextSerializer extends BaseSerializer {
  static {
    BaseSerializer.prepare(this, [
      'title',
      'content',
      'slug',
      ['date', 'dateFormatted'],
      ['dateTime', 'dateMachineFormatted'],
      ['tags', 'formattedTags'],
      ['cover', object => object.coverUrlFullSize],
      ['coverSrcset', object => object.coverSrcsetFullSize],
      'githubUrl',
      'tableOfContents',
    ]);
  }
}
