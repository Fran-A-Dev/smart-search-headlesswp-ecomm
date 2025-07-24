<template>
  <div class="price-filter mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filter by Price</h3>
      <button
        v-if="priceRange.min > 0 || priceRange.max < maxPrice"
        @click="clearFilter"
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        Reset Price
      </button>
    </div>

    <div class="px-3">
      <div class="flex justify-between items-center mb-4">
        <span class="text-sm font-medium text-gray-700"
          >${{ priceRange.min }}</span
        >
        <span class="text-sm text-gray-500">to</span>
        <span class="text-sm font-medium text-gray-700"
          >${{ priceRange.max }}</span
        >
      </div>

      <div class="relative">
        <div class="h-2 bg-gray-200 rounded-lg relative">
          <div
            class="absolute h-2 bg-blue-500 rounded-lg"
            :style="{ left: percentLeft, width: percentWidth }"
          />
        </div>

        <input
          v-model.number="priceRange.min"
          @input="handlePriceChange"
          type="range"
          :min="0"
          :max="maxPrice"
          :step="10"
          aria-label="Minimum price"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
        />

        <input
          v-model.number="priceRange.max"
          @input="handlePriceChange"
          type="range"
          :min="0"
          :max="maxPrice"
          :step="10"
          aria-label="Maximum price"
          class="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
        />
      </div>

      <button
        v-if="priceRange.min > 0 || priceRange.max < maxPrice"
        @click="applyFilter"
        type="button"
        class="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Price Filter (${{ priceRange.min }} - ${{ priceRange.max }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef, onUnmounted } from "vue";

const props = defineProps({
  initialMin: { type: Number, default: 0 },
  initialMax: { type: Number, default: 1000 },
  maxPrice: { type: Number, default: 1000 },
});
const emit = defineEmits(["price-changed", "price-applied", "price-cleared"]);

const priceRange = ref({ min: props.initialMin, max: props.initialMax });
const maxPrice = toRef(props, "maxPrice");

let priceTimeout;

const percentLeft = computed(
  () => `${(priceRange.value.min / maxPrice.value) * 100}%`
);
const percentWidth = computed(
  () =>
    `${((priceRange.value.max - priceRange.value.min) / maxPrice.value) * 100}%`
);

function handlePriceChange() {
  let { min, max } = priceRange.value;
  if (min > max) {
    min = max;
  } else if (max < min) {
    max = min;
  }
  priceRange.value.min = min;
  priceRange.value.max = max;

  emit("price-changed", { min, max });
  clearTimeout(priceTimeout);
  priceTimeout = setTimeout(() => {
    if (priceRange.value.min > 0 || priceRange.value.max < maxPrice.value) {
      emit("price-applied", {
        min: priceRange.value.min,
        max: priceRange.value.max,
      });
    }
  }, 1000);
}

function clearFilter() {
  priceRange.value.min = 0;
  priceRange.value.max = maxPrice.value;
  emit("price-cleared");
}

function applyFilter() {
  emit("price-applied", {
    min: priceRange.value.min,
    max: priceRange.value.max,
  });
}

onUnmounted(() => {
  clearTimeout(priceTimeout);
});

defineExpose({ clearPrice: clearFilter });
</script>

<style scoped>
.slider-thumb::-webkit-slider-thumb,
.slider-thumb::-moz-range-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  position: relative;
  z-index: 1;
}
.slider-thumb:hover::-webkit-slider-thumb,
.slider-thumb:hover::-moz-range-thumb {
  background: #2563eb;
}
.slider-thumb:active::-webkit-slider-thumb,
.slider-thumb:active::-moz-range-thumb {
  background: #1d4ed8;
}
</style>
