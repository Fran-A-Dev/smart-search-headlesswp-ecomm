import { useSmartSearch } from "./useSmartSearch";
import { ref } from "vue";

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
      const { data } = await searchProducts("*", {
        limit: Number(resultsLimit.value),
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      const basic = mapBasicResults(data.find.documents);
      const detailed = await fetchCompleteProductData(basic);
      const filtered = applyPriceFilter(detailed, { min, max });
      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: filtered,
        total: filtered.length,
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

  const applyPriceFilter = (results, { min, max }) =>
    results.filter((p) => p.price >= min && p.price <= max);

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
    applyPriceFilter,
    getActivityLabel,
  };
};
