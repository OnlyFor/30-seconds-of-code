import Model from '../core/model.js';
import Snippet from './snippet.js';
import Collection from './collection.js';

export default class CollectionSnippet extends Model {
  static {
    Model.prepare(this, []);
  }

  constructor(data) {
    super(data);
    this.collectionCid = data.collectionCid;
    this.snippetCid = data.snippetCid;
    this.position = data.position;
    this.dateModified = new Date(data.dateModified);
  }

  // FIXME: DELETEME
  // TODO: This won't work as a scope!
  // static get byPosition() {
  //   return this.all.sort((a, b) => a.position - b.position);
  // }

  // static get listed() {
  //   return { position: p => p !== -1 };
  // }

  // static get published() {
  //   const now = new Date();
  //   return { dateModified: d => d < now };
  // }

  get snippet() {
    return Snippet.find(this.snippetCid);
  }

  get collection() {
    return Collection.find(this.collectionCid);
  }
}
