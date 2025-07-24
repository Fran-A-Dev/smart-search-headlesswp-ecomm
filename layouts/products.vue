<template>
  <div>
    <header class="shadow-sm bg-white">
      <nav class="container mx-auto p-4">
        <NuxtLink to="/" class="font-bold" @click="handleHomeClick"
          >Nuxt Headless WP Demo</NuxtLink
        >
      </nav>
    </header>
    <div class="container mx-auto p-4">
      <slot />
    </div>
    <footer class="container mx-auto p-4 flex justify-between border-t-2">
      <ul class="flex gap-4"></ul>
    </footer>
  </div>
</template>

<script setup>
const handleHomeClick = () => {
  // Emit an event that the index page can listen to
  if (process.client) {
    window.dispatchEvent(new CustomEvent("reset-search"));
  }
};
</script>

<style scoped>
.router-link-exact-active {
  color: #12b488;
}
</style>
