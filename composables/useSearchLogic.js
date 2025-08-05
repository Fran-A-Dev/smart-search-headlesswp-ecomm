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

  // SERVER-SIDE: Text search with semantic AI search
  const performSearch = async (query) => {
    if (!query || !query.trim()) {
      return { success: false, error: "Empty query" };
    }

    const startTime = Date.now();

    try {
      const { data } = await searchProducts(query, {
        limit: Number(resultsLimit.value),
        // strictMode: false (default) - enables semantic search for text input
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      const basic = mapBasicResults(data.find.documents);
      const detailed = await fetchCompleteProductData(basic);
      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: detailed,
        total: data.find.total,
        searchTime,
        query: `Text search: "${query}"`,
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

  // SERVER-SIDE: Activity filtering with strict category matching
  const performActivitySearch = async (activityValue, priceFilter = null) => {
    if (!activityValue || !activityValue.trim()) {
      return { success: false, error: "No activity selected" };
    }

    const startTime = Date.now();

    try {
      // SERVER-SIDE: Smart Search query for exact category matching
      let query = `product_cat.name.keyword:"${getActivityLabel(
        activityValue
      )}"`;

      const { data } = await searchProducts(query, {
        limit: Number(resultsLimit.value),
        strictMode: true, // Disables semantic search for exact category matching
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      const basic = mapBasicResults(data.find.documents);
      const detailed = await fetchCompleteProductData(basic);

      // CLIENT-SIDE: Price filtering on category-filtered results
      let filteredResults = detailed;
      if (
        priceFilter &&
        (priceFilter.min !== undefined || priceFilter.max !== undefined)
      ) {
        filteredResults = detailed.filter((product) => {
          const price = product.price || 0;
          const { min = 0, max = Infinity } = priceFilter;
          return price >= min && price <= max;
        });
      }

      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: filteredResults,
        total: filteredResults.length,
        searchTime,
        query: `Activity: ${getActivityLabel(activityValue)}${
          priceFilter
            ? ` | Price: $${priceFilter.min || 0} - $${
                priceFilter.max || "max"
              }`
            : ""
        }`,
      };
    } catch (error) {
      if (process.dev) {
        console.error("Activity search error:", error);
      }
      return {
        success: false,
        error: `Search failed: ${error.message || "Please try again."}`,
      };
    }
  };

  // CLIENT-SIDE: Price-only filtering (fallback when no server-side price data available)
  const performPriceOnlySearch = async (
    { min, max },
    activityFilter = null
  ) => {
    const startTime = Date.now();

    try {
      // Get all products (or activity-filtered products)
      let query = activityFilter
        ? `product_cat.name.keyword:"${getActivityLabel(activityFilter)}"`
        : "*";

      const { data } = await searchProducts(query, {
        limit: Number(resultsLimit.value),
        strictMode: true,
      });

      if (!data?.find) {
        throw new Error("Invalid search response");
      }

      const basic = mapBasicResults(data.find.documents);
      const detailed = await fetchCompleteProductData(basic);

      // CLIENT-SIDE: Price filtering on all results
      const filteredResults = detailed.filter((product) => {
        const price = product.price || 0;
        return price >= min && price <= max;
      });

      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: filteredResults,
        total: filteredResults.length,
        searchTime,
        query: `${
          activityFilter
            ? `Activity: ${getActivityLabel(activityFilter)} | `
            : ""
        }Price: $${min} - $${max}`,
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
      const productMap = new Map();
      products.forEach((prod) => {
        productMap.set(prod.id, prod);
      });

      const productIds = Array.from(productMap.keys());
      const response = await getProductDetails(productIds);

      const edges = response?.data?.products?.edges || [];

      const graphqlDataMap = new Map();
      edges.forEach((edge) => {
        if (edge?.node?.databaseId) {
          graphqlDataMap.set(edge.node.databaseId, edge.node);
        }
      });

      const enrichedProducts = [];
      for (const [productId, basicProduct] of productMap) {
        const graphqlNode = graphqlDataMap.get(productId);

        if (!graphqlNode) {
          enrichedProducts.push({
            ...basicProduct,
            image: "",
            price: 0,
            formattedPrice: "$0.00",
            hasImage: false,
            isAvailable: false,
          });
          continue;
        }

        const imageData = graphqlNode.image;
        const imageUrl = imageData?.sourceUrl || "";
        const imageAlt = imageData?.altText || basicProduct.title || "";

        const rawPrice = graphqlNode.regularPrice || "";
        let priceValue = 0;
        let formattedPrice = "$0.00";

        if (rawPrice) {
          const numericPrice = rawPrice.replace(/[^0-9.]/g, "");
          priceValue = numericPrice ? parseFloat(numericPrice) : 0;

          if (priceValue > 0) {
            formattedPrice = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(priceValue);
          }
        }

        const productName = graphqlNode.name || basicProduct.title;
        const productSlug = graphqlNode.slug || "";
        const productDescription =
          graphqlNode.description || basicProduct.description || "";

        enrichedProducts.push({
          ...basicProduct,
          title: productName,
          description: productDescription,
          slug: productSlug,
          image: imageUrl,
          imageAlt,
          hasImage: Boolean(imageUrl),
          price: priceValue,
          formattedPrice,
          rawPrice,
          isAvailable: priceValue > 0,
          hasCompleteData: true,
        });
      }

      return enrichedProducts;
    } catch (error) {
      if (process.dev) {
        console.error("Error fetching product details:", error);
      }

      return products.map((prod) => ({
        ...prod,
        image: "",
        price: 0,
        formattedPrice: "$0.00",
        hasImage: false,
        isAvailable: false,
        hasCompleteData: false,
        error: "Failed to fetch complete data",
      }));
    }
  };

  const getActivityLabel = (activityValue) => {
    // Map activity values to actual category names in Smart Search index
    const labels = {
      coding: "coding", // matches exactly
      running: "Running", // matches exactly (note capital R)
      "rock-climbing": "climbing", // maps to "climbing" in index
    };
    return labels[activityValue] || activityValue;
  };

  // Combined activity + price filtering (uses performActivitySearch)
  const performCombinedSearch = async (activityValue, priceFilter) => {
    return performActivitySearch(activityValue, priceFilter);
  };

  return {
    performSearch,
    performActivitySearch,
    performPriceOnlySearch,
    performCombinedSearch,
    fetchCompleteProductData,
    getActivityLabel,
  };
};
