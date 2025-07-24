<template>
  <div>
    <Head>
      <Title>{{ product.title }} | Nuxt headlesswp eCommerce</Title>
      <Meta name="description" :content="product.description" />
    </Head>

    <ProductDetails :product="product" />
  </div>
</template>

<script setup>
const { id } = useRoute().params;

// Fetch single product from WooCommerce via GraphQL
const { data: product } = await useFetch(
  useRuntimeConfig().public.wordpressUrl,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      query: `
        query GetProduct($id: ID!) {
          product(id: $id, idType: DATABASE_ID) {
            databaseId
            name
            description
            ... on ProductWithPricing {
              regularPrice
            }
            image {
              sourceUrl
              altText
            }
          }
        }
      `,
      variables: {
        id: parseInt(id),
      },
    },
    transform: (data) => {
      const productData = data.data.product;
      if (!productData) return null;

      return {
        id: productData.databaseId,
        title: productData.name,
        description: productData.description || "No description available",
        price: productData.regularPrice
          ? parseFloat(productData.regularPrice.replace(/[^0-9.]/g, ""))
          : 0,
        image: productData.image?.sourceUrl || "/placeholder.jpg",
      };
    },
    key: id,
  }
);

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: "Product not found" });
}

definePageMeta({
  layout: "products",
});
</script>
