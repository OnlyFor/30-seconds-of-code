import BaseSerializer from './baseSerializer.js';

export default class PageSerializer extends BaseSerializer {
  static {
    BaseSerializer.prepare(this, [
      [
        'props',
        object => ({
          ...object.props,
          structuredData: object.schemaData,
        }),
      ],
      'params',
    ]);
  }
}
