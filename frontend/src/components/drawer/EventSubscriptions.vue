<template>
  <div class="space-y-6">
    <div class="bg-card p-4 rounded-lg border border-gray-700">
      <h3 class="font-bold text-lg mb-4 flex items-center">
        <i class="fa-solid fa-calendar-check mr-2 text-green-400"></i>监听与触发 (Events)
      </h3>

      <div class="relative pl-4 border-l border-gray-800 space-y-6">
        <!-- Existing Events -->
        <div
          v-for="(event, index) in localEvents"
          :key="index"
          class="relative group"
        >
          <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-main border-2 border-green-500 mt-1.5"></div>
          <div class="bg-gray-800/50 p-3 rounded border border-gray-700">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-green-400 text-sm">事件订阅</span>
              <button
                @click="removeEvent(index)"
                class="text-gray-500 hover:text-red-400"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div class="text-lg font-mono text-white">{{ event }}</div>
            <p class="text-xs text-gray-500">当此事件触发时，Agent 会收到通知</p>
          </div>
        </div>

        <!-- Add New Event -->
        <div class="relative">
          <div class="absolute -left-[21px] w-3 h-3 rounded-full bg-gray-800 mt-2"></div>
          <div v-if="!showAddForm">
            <button
              @click="showAddForm = true"
              class="w-full border border-dashed border-gray-600 rounded p-2 text-sm text-gray-400 hover:text-white hover:border-gray-400 hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <i class="fa-solid fa-plus"></i> 添加新的事件订阅
            </button>
          </div>
          <div v-else class="bg-gray-800/50 p-3 rounded border border-gray-700">
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">事件名称</label>
                <input
                  v-model="newEventName"
                  type="text"
                  placeholder="例如：daily.backup, hourly.monitor"
                  class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="addEvent"
                  :disabled="!newEventName"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                >
                  添加
                </button>
                <button
                  @click="cancelAdd"
                  class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Events Hint -->
        <div class="bg-gray-800/30 p-3 rounded border border-gray-700/50">
          <p class="text-xs text-gray-500 mb-2">
            <i class="fa-solid fa-info-circle mr-1"></i> 可用的事件示例：
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in eventSuggestions"
              :key="suggestion"
              @click="quickAddEvent(suggestion)"
              class="text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  subscribedEvents: string[];
}>();

const emit = defineEmits(['update:subscribedEvents']);

const localEvents = computed({
  get: () => props.subscribedEvents,
  set: (value) => emit('update:subscribedEvents', value),
});

const showAddForm = ref(false);
const newEventName = ref('');

const eventSuggestions = [
  'daily.backup',
  'hourly.monitor',
  'weekly.report',
  'user.login',
  'system.alert',
];

function addEvent() {
  if (newEventName.value && !localEvents.value.includes(newEventName.value)) {
    emit('update:subscribedEvents', [...localEvents.value, newEventName.value]);
    newEventName.value = '';
    showAddForm.value = false;
  }
}

function quickAddEvent(eventName: string) {
  if (!localEvents.value.includes(eventName)) {
    emit('update:subscribedEvents', [...localEvents.value, eventName]);
  }
}

function removeEvent(index: number) {
  const events = [...localEvents.value];
  events.splice(index, 1);
  emit('update:subscribedEvents', events);
}

function cancelAdd() {
  newEventName.value = '';
  showAddForm.value = false;
}
</script>
