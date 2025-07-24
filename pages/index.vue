<template>
  <div>
    <SearchBar @search-results="handleSearchResults" />
    <!-- Default Products (shown when no search active) -->
    <div v-if="!searchActive" class="default-products">
      <h2 class="text-2xl font-bold mb-6">All Products</h2>
      <div class="grid grid-cols-4 gap-5">
        <div v-for="p in products" :key="p.id">
          <ProductCard :product="p" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ProductCard from "~/components/ProductCard.vue";
import SearchBar from "~/components/SearchBar.vue";
// Search state
const searchActive = ref(false);

// Handle search results from SearchBar
const handleSearchResults = (searchData) => {
  searchActive.value = searchData.results.length > 0 || searchData.query.trim();
};

// Fetch the products from WooCommerce via GraphQL
const { data: products } = await useFetch(
  useRuntimeConfig().public.wordpressUrl,
  {
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
  }
);

definePageMeta({
  layout: "products",
});

useHead({
  title: "Nuxt Kitchen Sink | Merch",
  meta: [{ name: "description", content: "Nuxt 3 Merch" }],
});
</script>
