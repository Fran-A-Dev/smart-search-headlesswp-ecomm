import { useSmartSearch } from "./useSmartSearch";
import { ref } from "vue";

/**
 * REFACTORING NOTE: Smart Search Server-Side Filtering
 * 
 * This composable has been refactored to use Smart Search's server-side filtering
 * capabilities instead of client-side JavaScript filtering. This addresses the
 * following issues:
 * 
 * BEFORE (Client-side filtering):
 * 1. Fetched ALL products with wildcard search ("*")
 * 2. Retrieved complete product data for ALL results
 * 3. Filtered results in JavaScript using applyPriceFilter()
 * 
 * PROBLEMS with client-side approach:
 * - Inefficient: fetches unnecessary data
 * - Poor performance: transfers more data over network
 * - Defeats the purpose of having a "Smart Search" system
 * - Doesn't scale well with large product catalogs
 * 
 * AFTER (Server-side filtering):
 * 1. Smart Search API now accepts filter parameters
 * 2. Price filtering happens on the server before data transfer
 * 3. Only relevant products are returned from the search API
 * 4. Much more efficient and scalable approach
 * 
 * The Smart Search API has been enhanced to support:
 * - Price range filtering: { price: { min: number, max: number } }
 * - Future extensibility for other filter types
 */

export const useSearchLogic = () => {
  const { searchProducts, getProductDetails } = useSmartSearch();
  const resultsLimit = ref(20);

  const mapBasicResults = (documents) =>
    documents.map(({ data, score }) => ({
      id: data.ID,
      title: data.post_title,
      description: data.post_content,
      score,
      image: "",
      price: 0,
    }));

  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      return { success: false, error: "Empty query" };
    }
    const startTime = Date.now();

    try {
      const { data } = await searchProducts(query, {
        limit: Number(resultsLimit.value),
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      const results = mapBasicResults(data.find.documents);
      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results,
        total: data.find.total,
        searchTime,
      };
    } catch (error) {
      if (process.dev) {
        console.error("Search error:", error);
      }
      return {
        success: false,
        error: `Search failed: ${error.message || "Please try again."}`,
      };
    }
  };

  const performActivitySearch = async (activityValue) => {
    if (!activityValue || !activityValue.trim()) {
      return { success: false, error: "No activity selected" };
    }
    const label = getActivityLabel(activityValue);
    return performSearch(label);
  };

  const performPriceOnlySearch = async ({ min, max }) => {
    const startTime = Date.now();

    try {
      // Use Smart Search's server-side price filtering instead of client-side filtering
      const { data } = await searchProducts("*", {
        limit: Number(resultsLimit.value),
        filters: {
          price: { min, max }
        }
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      // Smart Search now returns only products within the price range
      const basic = mapBasicResults(data.find.documents);
      // Still need to fetch complete product data for display purposes
      const detailed = await fetchCompleteProductData(basic);
      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: detailed, // No need for client-side filtering anymore
        total: data.find.total,
        searchTime,
        query: `Price: $${min} - $${max}`,
      };
    } catch (error) {
      if (process.dev) {
        console.error("Price search error:", error);
      }
      return {
        success: false,
        error: `Search failed: ${error.message || "Please try again."}`,
      };
    }
  };

  const fetchCompleteProductData = async (products) => {
    if (!products.length) return [];

    try {
      const ids = products.map((p) => p.id);
      const response = await getProductDetails(ids);
      const edges = response?.data?.products?.edges || [];

      return products.map((prod) => {
        const edge = edges.find((e) => e.node.databaseId === prod.id);
        if (!edge) return prod;

        const { image, regularPrice } = edge.node;
        return {
          ...prod,
          image: image?.sourceUrl || "",
          price: regularPrice
            ? parseFloat(regularPrice.replace(/[^0-9.]/g, ""))
            : 0,
        };
      });
    } catch (error) {
      if (process.dev) {
        console.error("Error fetching product details:", error);
      }
      return products;
    }
  };

  // Remove applyPriceFilter since Smart Search now handles price filtering server-side
  // const applyPriceFilter = (results, { min, max }) =>
  //   results.filter((p) => p.price >= min && p.price <= max);

  const getActivityLabel = (activityValue) => {
    const labels = {
      coding: "Coding",
      running: "Running",
      "rock-climbing": "Rock Climbing",
    };
    return labels[activityValue] || activityValue;
  };

  return {
    performSearch,
    performActivitySearch,
    performPriceOnlySearch,
    fetchCompleteProductData,
    // applyPriceFilter, // Removed - no longer needed
    getActivityLabel,
  };
};
