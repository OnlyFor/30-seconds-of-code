import fs from 'fs-extra';
import { writeFile } from 'fs/promises';
import handlebars from 'handlebars';
import pathSettings from 'settings/paths';
import { Application } from 'blocks/application';
import { Logger } from 'blocks/utilities/logger';

/**
 * Writes the sitemap.xml file.
 */
export class SitemapWriter {
  static sitemapSettings = {
    sitemapTemplatePath: 'src/templates/sitemapTemplate.hbs',
    sitemapFileName: 'sitemap.xml',
  };

  /**
   * Generates the website's sitemap from the JSON files of the pages.
   * @param {object} options - An options object, containing the following:
   *  - `sitemapFileName`: Name of the sitemap XML file.
   *  - `publicPath`: Path for the generated XML file.
   *  - `websiteUrl`: Root URL of the website.
   *
   * All `options` values default to values from settings.
   * @returns {Promise} A promise that will resolve when the sitemap has been written to disk.
   */
  static write = async () => {
    const { publicPath } = pathSettings;
    const {
      sitemapFileName,
      sitemapTemplatePath,
    } = SitemapWriter.sitemapSettings;
    const logger = new Logger('SitemapWriter.write');
    const template = handlebars.compile(
      fs.readFileSync(sitemapTemplatePath, 'utf-8')
    );
    const pages = Application.dataset.getModel('Page').records.indexable;
    logger.log(`Generating sitemap for ${pages.length} routes`);

    const sitemap = template({
      nodes: pages.flatSelect('fullRoute', 'priority'),
    });

    await writeFile(`${publicPath}/${sitemapFileName}`, sitemap);

    logger.success('Generating sitemap complete');
  };
}