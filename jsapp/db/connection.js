import { Sequelize } from 'sequelize';
import { models, SnippetSchema, LanguageSchema } from './schema.js';
import Snippet from '../models/snippet.js';
import Language from '../models/language.js';

// sqlite3 storage/jsdb.sqlite '.schema' > js_schema.sql
// sqlite3 storage/development.sqlite3 '.schema' > rails_schema.sql

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'storage/jsdb.sqlite',
});

const DEFAULT_MODEL_OPTIONS = {
  timestamps: false,
  underscored: true,
};

let sqliteModels = {};

models.forEach(([name, attributes, options = {}]) => {
  sqliteModels[name] = sequelize.define(name, attributes, {
    ...DEFAULT_MODEL_OPTIONS,
    ...options,
  });
});

Snippet.init(SnippetSchema[1], {
  ...DEFAULT_MODEL_OPTIONS,
  ...SnippetSchema[2],
  sequelize,
});

Language.init(LanguageSchema[1], {
  ...DEFAULT_MODEL_OPTIONS,
  ...LanguageSchema[2],
  sequelize,
});

Language.hasMany(Snippet, {
  foreignKey: 'languageCid',
  sourceKey: 'cid',
});

Snippet.belongsTo(Language, {
  foreignKey: 'languageCid',
  sourceKey: 'cid',
});

sequelize.sync().then(() => {
  const { Snippet, Language } = sequelize.models;

  const createData = Promise.all([
    Language.bulkCreate([
      {
        cid: 'javascript',
        long: 'JavaScript',
        short: 'JS',
        name: 'JavaScript',
      },
    ]),
    Snippet.bulkCreate([
      {
        cid: 'javascript-1',
        title: 'JavaScript Snippet 1',
        shortTitle: 'JS Snippet 1',
        content: 'console.log("Hello, World!");',
        description: 'Prints "Hello, World!" to the console',
        listed: true,
        cover: 'https://via.placeholder.com/150',
        tokens: 'hello;world;console;log',
        ranking: 0.5,
        tags: 'hello;world;console;node',
        dateModified: '2020-01-01',
        tableOfContents: '1. Hello, World!',
        languageCid: 'javascript',
      },
    ]),
  ]);

  createData.then(() => {
    Language.findOne({ where: { cid: 'javascript' } }).then(language => {
      language.getSnippets().then(snippets => {
        console.log(snippets.map(snippet => snippet.toJSON()));
      });
    });
    console.log('\n\n\n');
    Snippet.findOne({ where: { cid: 'javascript-1' } }).then(snippet => {
      console.log('\n\n\n');
      snippet.getLanguage().then(language => {
        console.log(language.toJSON());
      });
    });
  });
});
