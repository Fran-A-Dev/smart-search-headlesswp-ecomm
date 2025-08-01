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
        filters: {
          price: { min, max },
        },
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
    getActivityLabel,
  };
};
