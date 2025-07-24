<template>
  <div class="card text-center">
    <div v-if="product.image && product.image.trim()" class="image-container">
      <NuxtImg
        :src="product.image"
        :alt="product.title || 'Product image'"
        class="thumb"
        width="300"
        height="300"
        fit="cover"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </div>
    <div v-else class="no-image-placeholder">
      <div class="placeholder-box">
        <svg
          class="placeholder-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
        <span class="placeholder-text">No Image</span>
      </div>
    </div>
    <p class="font-bold text-gray-500 m-4 truncate">{{ product.title }}</p>
    <div v-if="product.price > 0" class="text-sm text-gray-600 mb-2">
      ${{ product.price.toFixed(2) }}
    </div>
    <NuxtLink :to="`${product.id}`">
      <p class="btn my-4">View Details</p>
    </NuxtLink>
  </div>
</template>

<script setup>
const { product } = defineProps(["product"]);

// Debug: Log the product data when component mounts
console.log("ProductCard received product:", {
  id: product.id,
  title: product.title,
  image: product.image,
  imageType: typeof product.image,
  imageLength: product.image?.length,
});

const handleImageError = (event) => {
  // No fallback - let it show broken image or hide
  console.log(
    "Image failed to load for product:",
    product.id,
    "URL:",
    event.target?.src || "unknown",
    "Original image prop:",
    product.image
  );
};

const handleImageLoad = (event) => {
  // Image loaded successfully - NuxtImg handles opacity automatically
  console.log("Image loaded successfully for product:", product.id);
};
</script>

<style scoped>
.thumb {
  max-height: 100px;
  max-width: 90%;
  width: 100%;
  height: 100px;
  margin: 0 auto;
  object-fit: contain;
  border-radius: 4px;
}

.no-image-placeholder {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  max-width: 90%;
}

.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 4px;
  padding: 20px;
  width: 100%;
  height: 100%;
  color: #6b7280;
}

.placeholder-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.placeholder-text {
  font-size: 12px;
  font-weight: 500;
}
</style>
