import fs from 'fs';

import models from '../app/models/models.js';
import serializers from '../app/serializers/serializers.js';
import pages from '../app/adapters/page/page.js';
import Model from '../app/core/model.js';
import SearchIndex from './searchIndex.js';
import Page from '../app/adapters/page.js';
import AstroContentGenerator from './astroContentGenerator.js';
import Feed from './feed.js';
import Sitemap from './sitemap.js';
import Redirects from './redirects.js';
import PerformanceTracking from './performanceTracking.js';
import PreparedQueries from './preparedQueries.js';

export default class Loader {
  static loadModules() {
    return {
      models,
      serializers,
      pages,
      Model,
      SearchIndex,
      Page,
      AstroContentGenerator,
      Feed,
      Sitemap,
      Redirects,
      PerformanceTracking,
      PreparedQueries,
    };
  }

  static importData() {
    if (!this.importedData) {
      const data = fs.readFileSync('.content/content.json', 'utf8');

      this.importedData = JSON.parse(data, (key, value) => {
        if (!value?.model) return value;
        return new models[value.model](value);
      });
    }

    return this.importedData;
  }
}
