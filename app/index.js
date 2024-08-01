import repl from 'node:repl';
import { readFile } from 'node:fs/promises';
import fs from 'fs-extra/esm';

import models from './models/models.js';
import serializers from './serializers/serializers.js';
// This import is needed to set up the pages
import pages from './adapters/page/page.js';
import Model from './core/model.js';
import SearchIndex from '../lib/searchIndex.js';
import Page from './adapters/page.js';
import AstroContentGenerator from '../lib/astroContentGenerator.js';
import Feed from '../lib/feed.js';
import Sitemap from '../lib/sitemap.js';
import Redirects from '../lib/redirects.js';
import PerformanceTracking from '../lib/performanceTracking.js';
import PreparedQueries from '../lib/preparedQueries.js';
import Loader from '../lib/loader.js';

const modules = Loader.loadModules();
const data = Loader.importData();

const replServer = repl.start();

replServer.context.data = data;
Object.keys(models).forEach(model => {
  replServer.context[model] = models[model];
});
Object.keys(serializers).forEach(serializer => {
  replServer.context[serializer] = serializers[serializer];
});
replServer.context.SearchIndex = SearchIndex;
replServer.context.Model = Model;
replServer.context.Page = Page;
replServer.context.AstroContentGenerator = AstroContentGenerator;
replServer.context.Feed = Feed;
replServer.context.Sitemap = Sitemap;
replServer.context.Redirects = Redirects;
replServer.context.PerformanceTracking = PerformanceTracking;
replServer.context.PreparedQueries = PreparedQueries;
replServer.setupHistory('console.log', () => {});

// TODO: Delete me!
// TODO: Settings files
// TODO: Specs
// TODO: Update package.json properly
// TODO: cid -> id
// TODO: nest everything under src
// TODO: Incorporate parsley into the same thing
// TODO: Get rid of the `#`-prefixed imports?
