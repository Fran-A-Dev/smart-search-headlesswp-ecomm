<template>
  <svg
    class="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    :class="customClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18L18 6M6 6l12 12"
    />
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
