<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-flex items-center">
        <LoadingSpinner
          customClass="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
        />
        <span class="text-lg">Loading products...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600">
        <ErrorIcon customClass="mx-auto h-16 w-16 text-red-400 mb-4" />
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
        <EmptyBoxIcon />
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
import LoadingSpinner from "~/components/icons/LoadingSpinner.vue";
import ErrorIcon from "~/components/icons/ErrorIcon.vue";
import EmptyBoxIcon from "~/components/icons/EmptyBoxIcon.vue";

// Search state
const searchActive = ref(false);

// Handle search results from layout SearchBar
const handleSearchResults = (event) => {
  const searchData = event.detail;
  searchActive.value = searchData.results.length > 0 || searchData.query.trim();
};

// Handle home link click to reset search
const handleResetSearch = () => {
  searchActive.value = false;
  // Also clear the search in the SearchBar component
  const searchBarEvent = new CustomEvent("clear-search-from-home");
  window.dispatchEvent(searchBarEvent);
};

// Listen for search results from layout and reset search event
onMounted(() => {
  if (process.client) {
    window.addEventListener("layout-search-results", handleSearchResults);
    window.addEventListener("reset-search", handleResetSearch);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("layout-search-results", handleSearchResults);
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
