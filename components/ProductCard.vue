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
        <ImagePlaceholderIcon customClass="w-6 h-6 mb-1" />
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
import ImagePlaceholderIcon from "~/components/icons/ImagePlaceholderIcon.vue";

const { product } = defineProps(["product"]);

const handleImageError = (event) => {
  // Image failed to load - NuxtImg will handle fallback display
  if (process.dev) {
    console.warn("Image failed to load for product:", product.id);
  }
};

const handleImageLoad = () => {
  // Image loaded successfully - NuxtImg handles opacity automatically
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
