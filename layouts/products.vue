<template>
  <div>
    <header class="shadow-sm bg-white">
      <nav class="container mx-auto p-4">
        <NuxtLink to="/" class="font-bold">Nuxt Headless WP Demo</NuxtLink>
      </nav>
    </header>

    <!-- Search Bar Section -->
    <div class="bg-gray-50 border-b">
      <div class="container mx-auto p-4">
        <SearchBar @search-results="handleSearchResults" />
      </div>
    </div>

    <div class="container mx-auto p-4">
      <slot />
    </div>
    <footer class="container mx-auto p-4 flex justify-between border-t-2">
      <ul class="flex gap-4"></ul>
    </footer>
  </div>
</template>

<script setup>
import SearchBar from "~/components/SearchBar.vue";

// Handle search results from SearchBar and emit to pages
const handleSearchResults = (searchData) => {
  // Dispatch custom event that pages can listen to
  if (process.client) {
    const event = new CustomEvent("layout-search-results", {
      detail: searchData,
    });
    window.dispatchEvent(event);
  }
};
</script>

<style scoped>
.router-link-exact-active {
  color: #12b488;
}
</style>
