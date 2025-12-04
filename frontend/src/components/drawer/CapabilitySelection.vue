<template>
  <div class="space-y-6">
    <div class="bg-card p-4 rounded-lg border border-gray-700">
      <h3 class="font-bold text-lg mb-4 flex items-center">
        <i class="fa-solid fa-list-check mr-2 text-yellow-400"></i>能力装配 (Scalable)
      </h3>

      <!-- Category Tabs -->
      <div class="flex border-b border-gray-700 mb-4 overflow-x-auto">
        <button
          v-for="category in categories"
          :key="category.name"
          @click="activeCategory = category.name"
          class="text-sm font-medium pb-2 border-b-2 px-3 whitespace-nowrap transition-colors"
          :class="
            activeCategory === category.name
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-white'
          "
        >
          {{ category.name }} ({{ category.count }})
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-500"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索能力..."
          class="w-full bg-gray-800 border border-gray-700 rounded pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Capability List -->
      <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <label
          v-for="capability in filteredCapabilities"
          :key="capability.id"
          class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
          :class="
            isSelected(capability.id)
              ? 'border-blue-500/50 bg-blue-900/10'
              : 'border-gray-700 hover:bg-gray-800'
          "
        >
          <input
            type="checkbox"
            :checked="isSelected(capability.id)"
            @change="toggleCapability(capability.id)"
            class="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
          />
          <div class="flex-1">
            <span
              class="font-medium"
              :class="isSelected(capability.id) ? 'text-blue-200' : 'text-gray-300'"
            >
              {{ capability.name }}
            </span>
            <p class="text-xs text-gray-400 mt-1">{{ capability.description }}</p>
          </div>
        </label>

        <div
          v-if="filteredCapabilities.length === 0"
          class="h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-sm italic"
        >
          没有找到匹配的能力
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCapabilityStore } from '../../stores/capability';

const props = defineProps<{
  selectedCapabilities: string[];
}>();

const emit = defineEmits(['update:selectedCapabilities']);

const capabilityStore = useCapabilityStore();

const activeCategory = ref('核心');
const searchQuery = ref('');

const categories = computed(() => [
  { name: '核心', count: 3 },
  { name: 'DevOps', count: 12 },
  { name: '数据', count: 5 },
  { name: '生活', count: 2 },
]);

const filteredCapabilities = computed(() => {
  let capabilities = capabilityStore.capabilities;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    capabilities = capabilities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }

  return capabilities;
});

function isSelected(id: string): boolean {
  return props.selectedCapabilities.includes(id);
}

function toggleCapability(id: string) {
  const selected = [...props.selectedCapabilities];
  const index = selected.indexOf(id);

  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(id);
  }

  emit('update:selectedCapabilities', selected);
}
</script>
