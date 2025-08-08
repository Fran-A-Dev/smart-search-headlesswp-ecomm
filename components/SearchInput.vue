<template>
  <div class="search-input">
    <!-- Search Input Container -->
    <div class="search-container mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleInput"
          @keyup.enter="handleSubmit"
          type="text"
          :placeholder="placeholder"
          class="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />

        <!-- Search Icon -->
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <SearchIcon />
        </div>

        <!-- Clear Button -->
        <button
          v-if="searchQuery"
          @click="handleClear"
          class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
        >
          <CloseIcon customClass="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import SearchIcon from "~/components/icons/SearchIcon.vue";
import CloseIcon from "~/components/icons/CloseIcon.vue";

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
const emit = defineEmits(["search", "clear", "input"]);

// Reactive data
const searchQuery = ref(props.initialQuery);

// Debounce timer
let searchTimeout = null;

// Methods
const handleInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("input", searchQuery.value);
  }, 300); // 300ms debounce
};

const handleSubmit = () => {
  emit("search", searchQuery.value);
};

const handleClear = () => {
  searchQuery.value = "";
  emit("clear");
};

// Watch for external changes to search query
watch(
  () => props.initialQuery,
  (newQuery) => {
    searchQuery.value = newQuery;
  }
);

// Expose methods for parent component
defineExpose({
  clearQuery: () => {
    searchQuery.value = "";
  },
  setQuery: (query) => {
    searchQuery.value = query;
  },
  searchQuery: searchQuery,
});
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
