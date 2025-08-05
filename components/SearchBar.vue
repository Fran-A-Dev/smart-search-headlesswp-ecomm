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
  performCombinedSearch,
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

  // Check if price filter is active
  const hasPriceFilter =
    priceRange.value.min > 0 || priceRange.value.max < maxPrice.value;

  if (hasPriceFilter) {
    // Use combined search for activity + price
    await executeCombinedSearch(activityValue, priceRange.value);
  } else {
    // Use activity-only search
    await executeActivitySearch(activityValue);
  }
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

  // Check if activity filter is active
  if (selectedActivity.value) {
    // Use combined search for activity + price
    await executeCombinedSearch(selectedActivity.value, priceData);
  } else {
    // Use price-only search
    await executePriceFilter();
  }
};

const handlePriceCleared = () => {
  priceRange.value = { min: 0, max: maxPrice.value };
  // Re-run current search without price filter
  if (searchInputRef.value?.searchQuery?.trim()) {
    executeSearch(searchInputRef.value.searchQuery, "semantic-search");
  } else if (selectedActivity.value) {
    // Re-run activity search without price filter
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
  await executePriceOnlySearch();
};

const executePriceOnlySearch = async () => {
  isLoading.value = true;
  error.value = "";
  hasSearched.value = true;

  const query = `Price: $${priceRange.value.min} - $${priceRange.value.max}`;
  emit("search-start", { query, type: "price-filter" });

  // Pass activity filter if active
  const result = await performPriceOnlySearch(
    priceRange.value,
    selectedActivity.value || null
  );

  if (result.success) {
    searchResults.value = result.results;
    totalResults.value = result.total;
    searchTime.value = result.searchTime;

    emit("search-results", {
      results: searchResults.value,
      total: totalResults.value,
      query: result.query,
      type: selectedActivity.value ? "combined-filter" : "price-filter",
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

const executeCombinedSearch = async (activityValue, priceData) => {
  isLoading.value = true;
  error.value = "";
  hasSearched.value = true;

  const query = `Activity: ${activityValue} | Price: $${priceData.min} - $${priceData.max}`;
  emit("search-start", { query, type: "combined-filter" });

  const result = await performCombinedSearch(activityValue, priceData);

  if (result.success) {
    searchResults.value = result.results;
    totalResults.value = result.total;
    searchTime.value = result.searchTime;

    emit("search-results", {
      results: searchResults.value,
      total: totalResults.value,
      query: result.query,
      type: "combined-filter",
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
