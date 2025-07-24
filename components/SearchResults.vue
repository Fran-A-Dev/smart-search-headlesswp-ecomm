<template>
  <div class="search-results">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-6">
      <div class="inline-flex items-center">
        <svg
          class="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500"
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
        <span class="text-lg">Searching...</span>
      </div>
    </div>

    <!-- Search Results -->
    <div v-else-if="results.length > 0" class="search-results-content">
      <!-- Results Header -->
      <div class="mb-6 flex justify-between items-center">
        <div class="text-lg font-medium text-gray-700">
          Found {{ totalResults }} products
          <span v-if="searchTime" class="text-sm text-gray-500"
            >({{ searchTime }}ms)</span
          >
        </div>
        <button
          @click="clearResults"
          class="text-sm text-gray-600 hover:text-gray-800"
        >
          Clear Results
        </button>
      </div>

      <!-- Products Grid -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div v-for="product in results" :key="product.id">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else-if="hasSearched && !isLoading" class="text-center py-12">
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
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12M6 20.291A7.962 7.962 0 016 12m0 8.291zm12 0A7.962 7.962 0 0018 12m0 8.291z"
          ></path>
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p class="text-gray-600">
          Try adjusting your search terms or search options
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
    >
      <div class="flex">
        <svg
          class="h-5 w-5 text-red-400"
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
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Search Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductCard from "~/components/ProductCard.vue";

// Props
const props = defineProps({
  results: {
    type: Array,
    default: () => [],
  },
  totalResults: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasSearched: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  searchTime: {
    type: Number,
    default: 0,
  },
});

// Emits
const emit = defineEmits(["clear-results"]);

// Methods
const clearResults = () => {
  emit("clear-results");
};
</script>

<style scoped>
.search-results-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
