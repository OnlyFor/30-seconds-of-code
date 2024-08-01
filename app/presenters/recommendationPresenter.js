import Snippet from '../models/snippet.js';

export default class RecommendationPresenter {
  // Language
  static LANGUAGE_SCORE_LIMIT = 45.0;
  static FULL_LANGUAGE_SCORE = 45.0;
  // Primary Tag
  static PRIMARY_TAG_SCORE_LIMIT = 15.0;
  static FULL_PRIMARY_TAG_SCORE = 15.0;
  // Rounded up to 8 instead of 7.5
  static HALF_PRIMARY_TAG_SCORE = 8.0;
  // Search tokens
  static SEARCH_TOKEN_SCORE_LIMIT = 40.0;
  // Total
  // Language + Primary Tag + Search Tokens
  static TOTAL_SCORE_LIMIT = 100.0;
  // Total without language
  // Primary Tag + Search Tokens / Total
  static SCORE_LIMIT_WITHOUT_LANGUAGE = 0.55;
  // Total without language and primary tag
  // Search Tokens / Total
  static SCORE_LIMIT_WITHOUT_LANGUAGE_AND_PRIMARY_TAG = 0.4;
  static RECOMMENDATION_COUNT = 4;

  static candidates = null;
  static candidatesByLang = {};
  static candidatesByLangAndTag = {};

  static prepareRecommendableSnippets() {
    const now = new Date();
    this.candidates = Snippet.where({
      dateModified: d => d < now,
    }).order((a, b) => b.ranking - a.ranking);

    const groupedCandidates = this.candidates.reduce((acc, snippet) => {
      if (!acc[snippet.languageCid]) acc[snippet.languageCid] = [];
      acc[snippet.languageCid].push(snippet);
      return acc;
    }, {});

    Object.entries(groupedCandidates).forEach(
      ([language, languageSnippets]) => {
        const candidatesExceptLanguage = this.candidates.filter(
          snippet => snippet.languageCid !== language
        );
        this.candidatesByLang[language] = languageSnippets.concat(
          candidatesExceptLanguage
        );

        const tagGroupedSnippets = languageSnippets.reduce((acc, snippet) => {
          if (!acc[snippet.primaryTag]) acc[snippet.primaryTag] = [];
          acc[snippet.primaryTag].push(snippet);
          return acc;
        }, {});

        this.candidatesByLangAndTag[language] = {};

        Object.entries(tagGroupedSnippets).forEach(([tag, tagSnippets]) => {
          const languageSnippetsExceptTag = languageSnippets.filter(
            snippet => snippet.primaryTag !== tag
          );
          this.candidatesByLangAndTag[language][tag] = tagSnippets
            .concat(languageSnippetsExceptTag)
            .concat(candidatesExceptLanguage);
        });
      }
    );
  }

  recommendableSnippets(language = null, tag = null) {
    if (RecommendationPresenter.candidates === null)
      RecommendationPresenter.prepareRecommendableSnippets();

    if (language === null) return RecommendationPresenter.candidates;

    const tagExists = Boolean(
      RecommendationPresenter.candidatesByLangAndTag[language][tag]
    );

    if (tag === null || !tagExists)
      return RecommendationPresenter.candidatesByLang[language];

    return RecommendationPresenter.candidatesByLangAndTag[language][tag];
  }

  constructor(object, options = {}) {
    this.object = object;
    this.options = options;

    this.cid = this.object.cid;
    this.slugId = this.object.slugId;
    this.languageCid = this.object.languageCid;
    this.primaryTag = this.object.primaryTag;
    this.searchTokensArray = this.object.searchTokensArray;
    this.isListed = this.object.isListed;
    this.searchTokensLength = this.object.searchTokensArray.length;
    this.recommendationRankings = new Map();
    this.minRankings = [];
  }

  recommendSnippets() {
    const recommendableSnippets = this.recommendableSnippets(
      this.object.languageCid,
      this.object.primaryTag
    );

    recommendableSnippets.forEach(snippet => {
      // Skip if the snippet is the same as the current snippet
      if (snippet.cid === this.cid) return;
      // Skip if the snippet is the same in another language
      if (snippet.slugId === this.slugId) return;
      // Skip unless this snippet is listed or the object is unlisted
      if (!snippet.isListed && this.isListed) return;

      // Store the minimum ranking so far
      const minRanking = this.minRankings[0] || 0;

      // Performance optimization - if language score is 0 and the minimum
      // recommendation score is greater than the score limit without language,
      // then we can skip the rest of the calculations.
      const isSameLanguage = this.languageCid === snippet.languageCid;
      if (
        !isSameLanguage &&
        minRanking > RecommendationPresenter.SCORE_LIMIT_WITHOUT_LANGUAGE
      )
        return;

      // Determine score for language:
      //  * Same language, as language = 100% of language score
      //  * Not same language = 0% of language score
      const languageScore = isSameLanguage
        ? RecommendationPresenter.FULL_LANGUAGE_SCORE
        : 0;

      // Performance optimization - if both language and primary tag scores are
      // 0 and the minimum recommendation score is greater than the score limit
      // without language and primary tag, then we can skip the rest of the
      // calculations.
      const primaryTagIndex = isSameLanguage
        ? snippet.tags.indexOf(this.primaryTag)
        : -1;

      if (
        !isSameLanguage &&
        primaryTagIndex === -1 &&
        minRanking >
          RecommendationPresenter.SCORE_LIMIT_WITHOUT_LANGUAGE_AND_PRIMARY_TAG
      )
        return;

      // Determine primary tag score:
      //  * Different language = 0% of tag score
      //  * Same primary tag = 100% of tag score
      //  * Contains primary tag, but not primary = 50% of tag score
      //  * Doesn't contain tag = 0% of language score
      const primaryTagScore =
        primaryTagIndex === -1
          ? 0
          : primaryTagIndex === 0
            ? RecommendationPresenter.FULL_PRIMARY_TAG_SCORE
            : RecommendationPresenter.HALF_PRIMARY_TAG_SCORE;

      // Determine search token score:
      //  * Count found tokens and divide by total number of tokens
      const searchTokenScore =
        (this.searchTokensArray.reduce(
          (a, t) => (snippet.searchTokensArray.includes(t) ? a + 1 : a),
          0
        ) /
          this.searchTokensLength) *
        RecommendationPresenter.SEARCH_TOKEN_SCORE_LIMIT;

      // Divide by the limit to get a value between 0 and 1
      const recommendationRanking =
        (languageScore + primaryTagScore + searchTokenScore) /
        RecommendationPresenter.TOTAL_SCORE_LIMIT;

      // Performance optimization to minimize the number of times we have to
      // sort afterwards. As soon as the minimum amount of snippets has been
      // considered, we can start trimming off any snippets below the lowest
      // snippet's recommendation ranking.
      if (recommendationRanking > 0) {
        if (
          this.minRankings.length < RecommendationPresenter.RECOMMENDATION_COUNT
        ) {
          // First 4 snippets are always added
          this.minRankings.push(recommendationRanking);
        } else {
          // If the new ranking is lower than the lowest ranking, ignore it
          if (recommendationRanking < this.minRankings[0]) {
            return;
          } else {
            // Otherwise, replace the lowest ranking with the new ranking
            this.minRankings[0] = recommendationRanking;
          }
        }
        this.minRankings.sort((a, b) => a - b);

        this.recommendationRankings.set(snippet.cid, [
          recommendationRanking,
          snippet.ranking,
          snippet,
        ]);
      }
    });

    return Array.from(this.recommendationRankings.values())
      .sort((a, b) => (a[0] === b[0] ? b[1] - a[1] : b[0] - a[0]))
      .slice(0, RecommendationPresenter.RECOMMENDATION_COUNT)
      .map(r => r[2]);
  }
}
