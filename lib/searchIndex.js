import fs from 'fs-extra/esm';
import Collection from '../app/models/collection.js';
import Snippet from '../app/models/snippet.js';
import SearchResultSerializer from '../app/serializers/searchResultSerializer.js';

export default class SearchIndex {
  static generate() {
    // TODO: These were ordered by cid before for good reason, does it still work?
    const snippets = Snippet.where({ listed: true }).order((a, b) =>
      a.cid.localeCompare(b.cid)
    );
    const collections = Collection.where({ listed: true }).order((a, b) =>
      a.cid.localeCompare(b.cid)
    );

    const searchIndex = {
      searchIndex: SearchResultSerializer.serializeArray(
        snippets.concat(collections)
      ),
    };

    // Write to file
    fs.writeJson(
      'public/search-data.json',
      searchIndex,
      { spaces: 2 },
      () => {}
    );
  }
}
