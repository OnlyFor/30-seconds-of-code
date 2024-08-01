import BaseSerializer from './baseSerializer.js';

export default class PreviewSerializer extends BaseSerializer {
  static COLLECTION_TAG_LITERAL = 'Collection';

  static {
    BaseSerializer.prepare(this, [
      ['title', 'previewTitle'],
      ['description', 'formattedDescription'],
      'url',
      ['cover', 'coverUrl'],
      'coverSrcset',
      [
        'tags',
        object => {
          return object.isSnippet
            ? object.formattedPreviewTags
            : PreviewSerializer.COLLECTION_TAG_LITERAL;
        },
      ],
      [
        'extraContext',
        object => {
          return object.isSnippet
            ? object.dateFormatted
            : object.formattedSnippetCount;
        },
      ],
      [
        'dateTime',
        object => {
          return object.isSnippet ? object.dateMachineFormatted : null;
        },
      ],
    ]);
  }
}
