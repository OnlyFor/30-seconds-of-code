import { t } from './utils.js';

const CollectionSnippetSchema = t.model(
  'CollectionSnippet',
  t.string('collectionCid'),
  t.string('snippetCid'),
  t.integer('position'),
  t.date('dateModified'),
  t.index('collection_cid'),
  t.index('snippet_cid')
);

const CollectionSchema = t.model(
  'Collection',
  t.primaryKey('cid'),
  t.string('title'),
  t.string('shortTitle'),
  t.string('miniTitle'),
  t.text('content'),
  t.text('description'),
  t.boolean('listed'),
  t.string('cover'),
  t.stringArray('tokens'),
  t.float('ranking'),
  t.integer('featuredIndex'),
  t.boolean('topLevel'),
  t.string('parentCid'),
  t.index('cid', { unique: true }),
  t.index('parent_cid')
);

export const LanguageSchema = t.model(
  'Language',
  t.primaryKey('cid'),
  t.string('long'),
  t.string('short'),
  t.string('name'),
  t.index('cid', { unique: true })
);

export const SnippetSchema = t.model(
  'Snippet',
  t.primaryKey('cid'),
  t.string('title'),
  t.string('shortTitle'),
  t.text('content'),
  t.text('description'),
  t.boolean('listed'),
  t.string('cover'),
  t.stringArray('tokens'),
  t.float('ranking'),
  t.stringArray('tags'),
  t.date('dateModified'),
  t.text('tableOfContents'),
  t.string('languageCid'),
  t.index('cid', { unique: true }),
  t.index('date_modified'),
  t.index('language_cid'),
  t.index('ranking', { order: 'DESC' })
);

export const models = [
  CollectionSnippetSchema,
  CollectionSchema,
  // LanguageSchema,
  // SnippetSchema,
];
