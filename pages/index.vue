<template>
  <div>
    <SearchBar @search-results="handleSearchResults" />

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-flex items-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-lg">Loading products...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600">
        <svg
          class="mx-auto h-16 w-16 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Failed to load products
        </h3>
        <p class="text-gray-600 mb-4">
          {{ error.message || "Please try again later" }}
        </p>
        <button @click="refresh()" class="btn">Try Again</button>
      </div>
    </div>

    <!-- Default Products (shown when no search active) -->
    <div v-else-if="!searchActive && products?.length" class="default-products">
      <h2 class="text-2xl font-bold mb-6">All Products</h2>
      <div class="grid grid-cols-4 gap-5">
        <div v-for="p in products" :key="p.id">
          <ProductCard :product="p" />
        </div>
      </div>
    </div>

    <!-- No Products State -->
    <div
      v-else-if="!searchActive && !products?.length"
      class="text-center py-12"
    >
      <div class="text-gray-500">
        <svg
          class="mx-auto h-16 w-16 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          No products available
        </h3>
        <p class="text-gray-600">Check back later for new products</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ProductCard from "~/components/ProductCard.vue";
import SearchBar from "~/components/SearchBar.vue";
// Search state
const searchActive = ref(false);

// Handle search results from SearchBar
const handleSearchResults = (searchData) => {
  searchActive.value = searchData.results.length > 0 || searchData.query.trim();
};

// Handle home link click to reset search
const handleResetSearch = () => {
  searchActive.value = false;
  // Also clear the search in the SearchBar component
  const searchBarEvent = new CustomEvent("clear-search-from-home");
  window.dispatchEvent(searchBarEvent);
};

// Listen for reset search event from layout
onMounted(() => {
  if (process.client) {
    window.addEventListener("reset-search", handleResetSearch);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("reset-search", handleResetSearch);
  }
});

// Fetch the products from WooCommerce via GraphQL
const {
  data: products,
  pending,
  error,
  refresh,
} = await useFetch(useRuntimeConfig().public.wordpressUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: {
    query: `
      query GetProducts($first: Int = 10) {
        products(first: $first) {
          edges {
            node {
              databaseId
              name
              image {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    `,
    variables: {
      first: 10,
    },
  },
  transform: (data) => {
    return data.data.products.edges.map((edge) => ({
      id: edge.node.databaseId,
      title: edge.node.name,
      image: edge.node.image?.sourceUrl || "/placeholder.jpg",
    }));
  },
  key: "products-list",
});

definePageMeta({
  layout: "products",
});

useHead({
  title: "Nuxt headlesswp eCommerce | All Products",
  meta: [
    {
      name: "description",
      content:
        "Browse our complete collection of products in our headless WordPress eCommerce store",
    },
  ],
});
</script>
