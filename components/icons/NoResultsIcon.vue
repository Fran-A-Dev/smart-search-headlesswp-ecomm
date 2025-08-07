<template>
  <svg
    class="mx-auto h-16 w-16 text-gray-300 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    :class="customClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12M6 20.291A7.962 7.962 0 016 12m0 8.291zm12 0A7.962 7.962 0 0018 12m0 8.291z"
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
