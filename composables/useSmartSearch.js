export const useSmartSearch = () => {
  // Retrieve runtime configuration
  const config = useRuntimeConfig();
  const {
    public: { smartSearchUrl, smartSearchToken, wordpressUrl },
  } = config;

  // Internal helper to post GraphQL queries
  const _post = async ({ url, token, query, variables }) => {
    if (!url) throw new Error("URL not configured");
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      return await $fetch(url, {
        method: "POST",
        headers,
        body: { query, variables },
      });
    } catch (err) {
      if (process.dev) {
        console.error("GraphQL error:", err);
        console.error("Error details:", err.data || err.response || err);
      }
      throw err;
    }
  };

  /**
   * Perform a semantic similarity search to get context documents.
   * @param {string} message - The input text to search against.
   * @param {string} [field='post_content'] - The document field to search.
   * @param {number} [minScore=0.8] - Minimum similarity threshold.
   */
  const getContext = (message, field = "post_content", minScore = 0.8) =>
    _post({
      url: smartSearchUrl,
      token: smartSearchToken,
      query: `query GetContext($message: String!, $field: String!, $minScore: Float!) {\n  similarity(input: { nearest: { text: $message, field: $field }, minScore: $minScore }) {\n    total\n    docs { id data score }\n  }\n}`,
      variables: { message, field, minScore },
    });

  /**
   * Search products via Smart Search API with server-side filtering support.
   * @param {string} searchQuery - The search keywords.
   * @param {{ limit?: number, filters?: object }} [options] - Optional parameters including filters.
   *
   * Smart Search supports server-side price filtering using range query syntax:
   * - price:(>=10 AND <=100) for price ranges
   * - price:>50 for greater than
   * - price:<100 for less than
   */
  const searchProducts = (searchQuery, { limit = 10, filters = {} } = {}) => {
    let finalQuery = searchQuery;

    // Add server-side price filtering using Smart Search range syntax
    if (filters.price) {
      const { min, max } = filters.price;
      let priceQuery = "";

      if (min !== undefined && max !== undefined) {
        // Range query: price:(>=min AND <=max)
        priceQuery = `price:(>=${min} AND <=${max})`;
      } else if (min !== undefined) {
        // Greater than or equal: price:>=min
        priceQuery = `price:>=${min}`;
      } else if (max !== undefined) {
        // Less than or equal: price:<=max
        priceQuery = `price:<=${max}`;
      }

      if (priceQuery) {
        // Combine search query with price filter using AND
        finalQuery =
          searchQuery === "*"
            ? priceQuery // If wildcard search, just use price filter
            : `${searchQuery} AND ${priceQuery}`; // Combine with search terms
      }
    }

    return _post({
      url: smartSearchUrl,
      token: smartSearchToken,
      query: `query SearchProducts($query: String!, $limit: Int) {
  find(
    query: $query
    limit: $limit
    filter: "post_type:product"
    semanticSearch: { searchBias: 10, fields: ["post_title", "post_content"] }
  ) {
    total
    documents { id score data }
  }
}`,
      variables: { query: finalQuery, limit },
    });
  };

  /**
   * Fetch product details from WPGraphQL.
   * @param {number[]} productIds - Array of product database IDs.
   */
  const getProductDetails = (productIds) =>
    _post({
      url: wordpressUrl,
      token: null,
      query: `query GetProductDetails($ids: [Int]!) {\n  products(where: { include: $ids }) {\n    edges { node { databaseId name image { sourceUrl altText } ... on ProductWithPricing { regularPrice } } }\n  }\n}`,
      variables: { ids: productIds },
    });

  return { getContext, searchProducts, getProductDetails };
};
