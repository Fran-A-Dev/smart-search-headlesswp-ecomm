<template>
  <div class="card">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div class="p-7">
        <div
          v-if="product.image && product.image.trim()"
          class="image-container"
        >
          <NuxtImg
            :src="product.image"
            :alt="product.title || 'Product image'"
            class="product-image mx-auto my-7"
            width="400"
            height="400"
            fit="contain"
            @error="handleImageError"
          />
        </div>
        <div v-else class="no-image-placeholder mx-auto my-7">
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
            <span class="placeholder-text">No Image Available</span>
          </div>
        </div>
      </div>
      <div class="p-7">
        <h1 class="text-4xl my-7 font-bold">{{ product.title }}</h1>
        <p class="text-2xl my-7 font-semibold text-green-600">
          ${{ product.price.toFixed(2) }}
        </p>
        <h2 class="font-bold border-b-2 mb-4 pb-2 text-lg">
          Product Description:
        </h2>
        <div class="mb-7 prose max-w-none" v-html="product.description"></div>
        <button class="btn flex items-center justify-center">
          <i class="material-icons mr-2">add_shopping_cart</i>
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { product } = defineProps(["product"]);

const handleImageError = () => {
  if (process.dev) {
    console.warn("Product detail image failed to load:", product.id);
  }
};
</script>

<style scoped>
.product-image {
  max-width: 400px;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
}

.no-image-placeholder {
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  height: 100%;
  color: #6b7280;
}

.placeholder-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.placeholder-text {
  font-size: 16px;
  font-weight: 500;
}
</style>
