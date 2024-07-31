class TagFormatter {
  static TAG_DICTIONARY = {
    css: 'CSS',
    javascript: 'JavaScript',
    node: 'Node.js',
    php: 'PHP',
    seo: 'SEO',
    vscode: 'Visual Studio Code',
    html: 'HTML',
    webdev: 'Web development',
    http: 'HTTP',
  };

  static formattedTags = {};

  static format(tag) {
    if (!tag) return '';

    if (this.formattedTags[tag]) {
      return this.formattedTags[tag];
    }

    const formattedTag = this.TAG_DICTIONARY[tag] || tag;
    this.formattedTags[tag] = formattedTag;
    return formattedTag;
  }
}

export default TagFormatter;
