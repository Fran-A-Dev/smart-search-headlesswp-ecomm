<template>
  <div class="search-bar">
    <!-- Search Input Component -->
    <SearchInput
      ref="searchInputRef"
      :initial-query="initialQuery"
      :placeholder="placeholder"
      @input="handleSearchInput"
      @search="handleSearchSubmit"
      @clear="handleSearchClear"
    />

    <!-- Activity Filter Component -->
    <ActivityFilter
      ref="activityFilterRef"
      :initial-activity="selectedActivity"
      @activity-selected="handleActivitySelected"
      @activity-cleared="handleActivityCleared"
    />

    <!-- Price Filter Component -->
    <PriceFilter
      ref="priceFilterRef"
      :initial-min="priceRange.min"
      :initial-max="priceRange.max"
      :max-price="maxPrice"
      @price-changed="handlePriceChanged"
      @price-applied="handlePriceApplied"
      @price-cleared="handlePriceCleared"
    />

    <!-- Search Results Component -->
    <SearchResults
      :results="searchResults"
      :total-results="totalResults"
      :is-loading="isLoading"
      :has-searched="hasSearched"
      :error="error"
      :search-time="searchTime"
      @clear-results="handleClearResults"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SearchInput from "./SearchInput.vue";
import ActivityFilter from "./ActivityFilter.vue";
import PriceFilter from "./PriceFilter.vue";
import SearchResults from "./SearchResults.vue";
import { useSearchLogic } from "~/composables/useSearchLogic";

// Props
const props = defineProps({
  initialQuery: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search products...",
  },
});

// Emits
const emit = defineEmits(["search-results", "search-start", "search-complete"]);

// Use search logic composable
const {
  performSearch,
  performActivitySearch,
  performPriceOnlySearch,
  fetchCompleteProductData,
  // applyPriceFilter, // Removed - Smart Search now handles price filtering server-side
} = useSearchLogic();

// Component refs
const searchInputRef = ref(null);
const activityFilterRef = ref(null);
const priceFilterRef = ref(null);

// Reactive data
const searchResults = ref([]);
const totalResults = ref(0);
const isLoading = ref(false);
const hasSearched = ref(false);
const error = ref("");
const searchTime = ref(0);

// Filter states
const selectedActivity = ref("");
const priceRange = ref({
  min: 0,
  max: 1000,
});
const maxPrice = ref(1000);

// Search Input Event Handlers
const handleSearchInput = async (query) => {
  if (query.trim()) {
    await executeSearch(query, "semantic-search");
  } else {
    clearResults();
  }
};

const handleSearchSubmit = async (query) => {
  if (query.trim()) {
    await executeSearch(query, "semantic-search");
  }
};

const handleSearchClear = () => {
  clearResults();
  clearAllFilters();
};

// Activity Filter Event Handlers
const handleActivitySelected = async (activityValue) => {
  selectedActivity.value = activityValue;
  searchInputRef.value?.clearQuery();
  await executeActivitySearch(activityValue);
};

const handleActivityCleared = () => {
  selectedActivity.value = "";
  clearResults();
};

// Price Filter Event Handlers
const handlePriceChanged = (priceData) => {
  priceRange.value = priceData;
};

const handlePriceApplied = async (priceData) => {
  priceRange.value = priceData;
  await executePriceFilter();
};

const handlePriceCleared = () => {
  priceRange.value = { min: 0, max: maxPrice.value };
  // Re-run current search without price filter
  if (searchInputRef.value?.searchQuery?.trim()) {
    executeSearch(searchInputRef.value.searchQuery, "semantic-search");
  } else if (selectedActivity.value) {
    executeActivitySearch(selectedActivity.value);
  }
};

// Results Event Handlers
const handleClearResults = () => {
  clearResults();
  clearAllFilters();
};

// Core Search Execution Methods
const executeSearch = async (query, type) => {
  isLoading.value = true;
  error.value = "";
  hasSearched.value = true;

  emit("search-start", { query, type });

  const result = await performSearch(query);

  if (result.success) {
    searchResults.value = result.results;
    totalResults.value = result.total;
    searchTime.value = result.searchTime;

    // Fetch complete product data
    if (result.results.length > 0) {
      const completeResults = await fetchCompleteProductData(result.results);
      searchResults.value = completeResults;
    }

    emit("search-results", {
      results: searchResults.value,
      total: totalResults.value,
      query,
      type,
      time: searchTime.value,
    });
  } else {
    error.value = result.error;
    searchResults.value = [];
    totalResults.value = 0;
  }

  isLoading.value = false;
  emit("search-complete", {
    success: result.success,
    resultsCount: searchResults.value.length,
  });
};

const executeActivitySearch = async (activityValue) => {
  isLoading.value = true;
  error.value = "";
  hasSearched.value = true;

  emit("search-start", { query: activityValue, type: "activity-filter" });

  const result = await performActivitySearch(activityValue);

  if (result.success) {
    searchResults.value = result.results;
    totalResults.value = result.total;
    searchTime.value = result.searchTime;

    // Fetch complete product data
    if (result.results.length > 0) {
      const completeResults = await fetchCompleteProductData(result.results);
      searchResults.value = completeResults;
    }

    emit("search-results", {
      results: searchResults.value,
      total: totalResults.value,
      query: result.query,
      type: "activity-filter",
      time: searchTime.value,
    });
  } else {
    error.value = result.error;
    searchResults.value = [];
    totalResults.value = 0;
  }

  isLoading.value = false;
  emit("search-complete", {
    success: result.success,
    resultsCount: searchResults.value.length,
  });
};

const executePriceFilter = async () => {
  if (!searchResults.value.length) {
    // If no search has been performed, search all products with price filter
    await executePriceOnlySearch();
    return;
  }

  // Since we can't re-filter existing results server-side, we need to perform a new search
  // This is a limitation - ideally we'd store the original query and re-run it with price filters
  // For now, we'll perform a price-only search as the most reasonable approach
  await executePriceOnlySearch();
};

const executePriceOnlySearch = async () => {
  isLoading.value = true;
  error.value = "";
  hasSearched.value = true;

  const query = `Price: $${priceRange.value.min} - $${priceRange.value.max}`;
  emit("search-start", { query, type: "price-filter" });

  const result = await performPriceOnlySearch(priceRange.value);

  if (result.success) {
    // Smart Search already filtered by price server-side, so we just use the results
    searchResults.value = result.results;
    totalResults.value = result.total;
    searchTime.value = result.searchTime;

    // Fetch complete product data if needed
    if (result.results.length > 0) {
      const completeResults = await fetchCompleteProductData(result.results);
      searchResults.value = completeResults;
      // No need for client-side price filtering anymore - Smart Search handled it
    }

    emit("search-results", {
      results: searchResults.value,
      total: totalResults.value,
      query: result.query,
      type: "price-filter",
      time: searchTime.value,
    });
  } else {
    error.value = result.error;
    searchResults.value = [];
    totalResults.value = 0;
  }

  isLoading.value = false;
  emit("search-complete", {
    success: result.success,
    resultsCount: searchResults.value.length,
  });
};

// Utility Methods
const clearResults = () => {
  searchResults.value = [];
  totalResults.value = 0;
  hasSearched.value = false;
  error.value = "";
  searchTime.value = 0;
};

const clearAllFilters = () => {
  selectedActivity.value = "";
  priceRange.value = { min: 0, max: maxPrice.value };
  searchInputRef.value?.clearQuery();
  activityFilterRef.value?.clearActivity();
  priceFilterRef.value?.clearPrice();
};

// Handle clear search from home link
const handleClearFromHome = () => {
  clearResults();
  clearAllFilters();
  // Emit empty search results to reset the parent state
  emit("search-results", {
    results: [],
    total: 0,
    query: "",
    type: "clear",
    time: 0,
  });
};

// Listen for clear search event from home link
onMounted(() => {
  if (process.client) {
    window.addEventListener("clear-search-from-home", handleClearFromHome);
  }
});

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("clear-search-from-home", handleClearFromHome);
  }
});
</script>

<style scoped>
/* Main container styles */
</style>
