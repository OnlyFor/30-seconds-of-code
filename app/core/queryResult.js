export default class QueryResult extends Array {
  where(query) {
    return QueryResult.from(
      this.filter(record => {
        return Object.keys(query).every(key => {
          // If function use it to determine matches
          if (typeof query[key] === 'function') return query[key](record[key]);

          // If array, use it to determine matches
          if (Array.isArray(query[key]))
            return query[key].includes(record[key]);

          // If single value, use strict equality
          return record[key] === query[key];
        });
      })
    );
  }

  order(comparator) {
    return QueryResult.from(this.sort(comparator));
  }

  pluck(key) {
    return super.map(record => record[key]);
  }

  map(fn) {
    return QueryResult.from(super.map(fn));
  }
}
