<template>
  <svg
    class="h-5 w-5 text-red-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    :class="customClass"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
