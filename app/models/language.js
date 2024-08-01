import Model from '../core/model.js';
import Snippet from './snippet.js';

export default class Language extends Model {
  static {
    Model.prepare(this, ['cid']);
  }

  constructor(data) {
    super(data);
    this.cid = data.cid;
    this.long = data.long;
    this.short = data.short;
    this.name = data.name;
  }

  get snippets() {
    return Snippet.where({ languageCid: this.cid });
  }
}
