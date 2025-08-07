<template>
  <div class="search-results">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-6">
      <div class="inline-flex items-center">
        <LoadingSpinner />
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
        <NoResultsIcon />
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
        <ErrorIcon />
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
import LoadingSpinner from "~/components/icons/LoadingSpinner.vue";
import NoResultsIcon from "~/components/icons/NoResultsIcon.vue";
import ErrorIcon from "~/components/icons/ErrorIcon.vue";

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
