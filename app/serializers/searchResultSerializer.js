import BaseSerializer from './baseSerializer.js';

export default class SearchResultSerializer extends BaseSerializer {
  static {
    BaseSerializer.prepare(this, [
      ['title', 'shortTitle'],
      'url',
      [
        'tag',
        object => {
          return object.isSnippet
            ? object.formattedMiniPreviewTag
            : object.formattedSnippetCount;
        },
      ],
      'searchTokens',
      'type',
    ]);
  }
}
