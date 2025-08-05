export const useSmartSearch = () => {
  const config = useRuntimeConfig();
  const {
    public: { smartSearchUrl, smartSearchToken, wordpressUrl },
  } = config;

  // Helper for GraphQL requests
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

  // SERVER-SIDE: Semantic similarity search for context documents
  const getContext = (message, field = "post_content", minScore = 0.8) =>
    _post({
      url: smartSearchUrl,
      token: smartSearchToken,
      query: `query GetContext($message: String!, $field: String!, $minScore: Float!) {
        similarity(input: { nearest: { text: $message, field: $field }, minScore: $minScore }) {
          total
          docs { id data score }
        }
      }`,
      variables: { message, field, minScore },
    });

  // SERVER-SIDE: Smart Search with semantic AI or strict filtering
  const searchProducts = (
    searchQuery,
    { limit = 10, strictMode = false, filter = null } = {}
  ) => {
    // Semantic search for text input, strict filtering for category buttons
    const semanticSearchConfig = strictMode
      ? "" // Disable semantic search for exact category matching
      : 'semanticSearch: { searchBias: 10, fields: ["post_title", "post_content"] }';

    let finalFilter = "post_type:product";
    if (filter) {
      finalFilter = `${finalFilter} AND ${filter}`;
    }

    return _post({
      url: smartSearchUrl,
      token: smartSearchToken,
      query: `query SearchProducts($query: String!, $limit: Int, $filter: String!) {
        find(
          query: $query
          limit: $limit
          filter: $filter
          ${semanticSearchConfig}
        ) {
          total
          documents { id score data }
        }
      }`,
      variables: { query: searchQuery, limit, filter: finalFilter },
    });
  };

  // SERVER-SIDE: Fetch complete product data from WooCommerce GraphQL
  const getProductDetails = (productIds) =>
    _post({
      url: wordpressUrl,
      token: null,
      query: `query GetProductDetails($ids: [Int]!) {
        products(where: { include: $ids }) {
          edges { 
            node { 
              databaseId 
              name 
              image { sourceUrl altText } 
              ... on ProductWithPricing { regularPrice } 
            } 
          }
        }
      }`,
      variables: { ids: productIds },
    });

  return { getContext, searchProducts, getProductDetails };
};
