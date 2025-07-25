<template>
  <div>
    <!-- Default Products -->
    <div class="default-products">
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
import ProductCard from "~/components/ProductCard.vue";

// Fetch the products from WooCommerce via GraphQL
const { data: products } = await useFetch(
  useRuntimeConfig().public.wordpressUrl,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
      variables: { first: 10 },
    },
    transform: (data) =>
      data.data.products.edges.map((edge) => ({
        id: edge.node.databaseId,
        title: edge.node.name,
        image: edge.node.image?.sourceUrl || "/placeholder.jpg",
      })),
    key: "products-list",
  }
);

definePageMeta({ layout: "products" });

useHead({
  title: "Nuxt HeadlessWP eCommerce | All Products",
  meta: [
    {
      name: "description",
      content:
        "Browse our complete collection of products in our headless WordPress eCommerce store",
    },
  ],
});
</script>
