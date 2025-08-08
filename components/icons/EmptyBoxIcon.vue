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
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
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
