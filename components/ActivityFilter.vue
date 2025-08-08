<template>
  <div class="activity-filter mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium text-gray-900">Filter by Activity</h3>
      <button
        v-if="selectedActivity"
        @click="clearFilter"
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        Clear Filter
      </button>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        v-for="activity in activities"
        :key="activity.value"
        type="button"
        @click="selectActivity(activity.value)"
        :aria-pressed="selectedActivity === activity.value"
        :class="[
          'px-4 py-2 rounded-full border text-sm font-medium transition-colors',
          selectedActivity === activity.value
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
        ]"
      >
        {{ activity.label }}
      </button>
    </div>

    <div
      v-if="selectedActivity"
      class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm text-blue-800">
          <strong>Active Filter:</strong>
          {{ getActivityLabel(selectedActivity) }}
        </span>
        <button
          @click="clearFilter"
          type="button"
          class="text-blue-600 hover:text-blue-800"
          aria-label="Clear activity filter"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CloseIcon from "~/components/icons/CloseIcon.vue";

const props = defineProps({
  initialActivity: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["activity-selected", "activity-cleared"]);

const selectedActivity = ref(props.initialActivity);

const activities = [
  { value: "coding", label: "Coding" },
  { value: "running", label: "Running" },
  { value: "rock-climbing", label: "Rock Climbing" },
];

function selectActivity(activity) {
  selectedActivity.value = activity;
  emit("activity-selected", activity);
}

function clearFilter() {
  selectedActivity.value = "";
  emit("activity-cleared");
}

function getActivityLabel(value) {
  const activity = activities.find((a) => a.value === value);
  return activity ? activity.label : value;
}

defineExpose({
  clearActivity: clearFilter,
  setActivity: selectActivity,
});
</script>
