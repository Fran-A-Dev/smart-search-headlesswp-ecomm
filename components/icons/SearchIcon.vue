<template>
  <svg
    class="h-6 w-6 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    :class="customClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    ></path>
  </svg>
</template>

<script setup>
// Props to allow customization
const props = defineProps({
  customClass: {
    type: String,
    default: "",
  },
});
</script>
