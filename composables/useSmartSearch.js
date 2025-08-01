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
   * Search products via Smart Search API.
   * @param {string} searchQuery - The search keywords.
   * @param {{ limit?: number, filters?: object }} [options] - Optional parameters including filters.
   */
  const searchProducts = (searchQuery, { limit = 10, filters = {} } = {}) => {
    // Build the GraphQL query dynamically based on available filters
    let queryString = `query SearchProducts($query: String!, $limit: Int`;
    let variablesObj = { query: searchQuery, limit };
    
    // Add price filter variables if provided
    if (filters.price) {
      queryString += `, $minPrice: Float, $maxPrice: Float`;
      variablesObj.minPrice = filters.price.min;
      variablesObj.maxPrice = filters.price.max;
    }
    
    queryString += `) {
  find(
    query: $query
    limit: $limit
    filter: "post_type:product"`;
    
    // Add price filter to the query if provided
    if (filters.price) {
      queryString += `
    priceFilter: { min: $minPrice, max: $maxPrice }`;
    }
    
    queryString += `
    semanticSearch: { searchBias: 10, fields: ["post_title", "post_content"] }
  ) {
    total
    documents { id score data }
  }
}`;

    return _post({
      url: smartSearchUrl,
      token: smartSearchToken,
      query: queryString,
      variables: variablesObj,
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
