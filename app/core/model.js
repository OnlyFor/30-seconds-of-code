import QueryResult from './queryResult.js';

export default class Model {
  static instances = {};
  static indexedInstances = {};
  static getterCache = {};

  static prepare(model, indexes) {
    const name = model.name;

    // Create an array for each model to store instances
    if (!Model.instances[name]) Model.instances[name] = [];

    // Create a map for each index to speed up queries
    if (indexes && indexes.length) {
      // Store indexes for future usage
      model.indexes = indexes;

      if (!Model.indexedInstances[name]) {
        Model.indexedInstances[name] = indexes.reduce((acc, index) => {
          acc[index] = new Map();
          return acc;
        }, {});
      }
    }

    // Cache getters, using a WeakMap for each model/key pair
    if (!Model.getterCache[name]) Model.getterCache[name] = {};

    Object.entries(Object.getOwnPropertyDescriptors(model.prototype)).forEach(
      ([key, descriptor]) => {
        // Find getter functions, create the WeakMap, redefine the getter
        if (typeof descriptor.get === 'function') {
          Model.getterCache[name][key] = new WeakMap();
          Object.defineProperty(model.prototype, key, {
            get() {
              if (!Model.getterCache[name][key].has(this)) {
                // This calls the getter function and caches the result
                Model.getterCache[name][key].set(
                  this,
                  descriptor.get.call(this)
                );
              }
              return Model.getterCache[name][key].get(this);
            },
          });
        }
      }
    );
  }

  constructor(data) {
    const modelName = this.constructor.name;

    Model.instances[modelName].push(this);

    const modelIndexes = this.constructor.indexes || [];
    if (!modelIndexes.length) return;

    modelIndexes.forEach(index => {
      Model.indexedInstances[modelName][index].set(data[index], this);
    });
  }

  static get all() {
    return QueryResult.from(Model.instances[this.name] || []);
  }

  static where(query) {
    return this.all.where(query);
  }

  static scope(...scopes) {
    return scopes.reduce((acc, scope) => acc.where(this[scope]), this.all);
  }

  // TODO: Rename cid to id at some point
  static find(cid) {
    return Model.indexedInstances[this.name].cid.get(cid);
  }

  static search(cidOrSlug) {
    const searchTerm = cidOrSlug
      .replace(/^\//, '')
      .replace(/\/$/, '')
      .toLowerCase();
    return this.find(searchTerm);
  }
}
