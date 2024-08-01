import fs from 'fs';
import Snippet from '../app/models/snippet.js';

// TODO: A home, I need a home!
export const escapeHtml = str =>
  str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default class Feed {
  // TODO: Actually use settings for these
  static generate() {
    const data = `\
<rss
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  version="2.0"
>
  <channel>
    <title><%= Orbit::settings[:website][:name] %></title>
    <description><%= Orbit::settings[:website][:description] %></description>
    <link><%= Orbit::settings[:website][:url] %></link>
    <language>en-us</language>
    <image>
      <url><%= "#{Orbit::settings[:website][:url]}/assets/logo.png" %></url>
      <title><%= Orbit::settings[:website][:name] %></title>
      <link><%= Orbit::settings[:website][:url] %></link>
    </image>
    <ttl>1440</ttl>
    <atom:link href="<%= "#{Orbit::settings[:website][:url]}/feed.xml" %>" rel="self" type="application/rss+xml" />
${Feed.nodes.join('\n')}
  </channel>
</rss>`;

    // Write to file
    fs.writeFileSync('public/feed.xml', data);
  }

  static get nodes() {
    return Snippet.where({ listed: true })
      .order((a, b) => b.dateModified - a.dateModified)
      .slice(0, 50)
      .map(
        snippet => `\
      <item>
        <title>${escapeHtml(snippet.title)}</title>
        <link>${snippet.fullUrl}</link>
        <description>${escapeHtml(snippet.seoDescription)}</description>
        <pubDate>${new Date(snippet.dateModified).toUTCString()}</pubDate>
      <item>`
      );
  }
}
