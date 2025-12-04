<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        @click="$emit('close')"
      ></div>
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <div
        v-if="visible"
        class="fixed top-0 right-0 h-full w-[90%] lg:w-[85%] xl:w-[70%] bg-main border-l border-gray-700 shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900 sticky top-0 z-10">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <span class="text-blue-500">⚙️</span> 配置智能体：
            <span>{{ formData.name || '新建智能体' }}</span>
          </h2>
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 rounded hover:bg-gray-800 text-gray-400 text-sm"
            >
              取消
            </button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-900/50 disabled:opacity-50"
            >
              {{ saving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6">
          <!-- Column 1: Role Settings -->
          <RoleSettings v-model="formData" class="col-span-12 lg:col-span-4" />

          <!-- Column 2: Capability Selection -->
          <CapabilitySelection
            v-model:selected-capabilities="selectedCapabilities"
            class="col-span-12 lg:col-span-4"
          />

          <!-- Column 3: Event Subscriptions -->
          <EventSubscriptions
            v-model:subscribed-events="formData.subscribedEvents"
            class="col-span-12 lg:col-span-4"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAgentStore } from '../stores/agent';
import RoleSettings from './drawer/RoleSettings.vue';
import CapabilitySelection from './drawer/CapabilitySelection.vue';
import EventSubscriptions from './drawer/EventSubscriptions.vue';

const props = defineProps<{
  visible: boolean;
  agentId: string | null;
}>();

const emit = defineEmits(['close', 'saved', 'update:visible']);

const agentStore = useAgentStore();
const saving = ref(false);

const formData = ref({
  name: '',
  description: '',
  goal: '',
  prompt: '',
  subscribedEvents: [] as string[],
  roleIds: [] as string[],
});

const selectedCapabilities = ref<string[]>([]);

watch(() => props.agentId, async (newId) => {
  if (newId) {
    await agentStore.fetchAgent(newId);
    if (agentStore.currentAgent) {
      formData.value = {
        name: agentStore.currentAgent.name,
        description: agentStore.currentAgent.description,
        goal: agentStore.currentAgent.goal,
        prompt: agentStore.currentAgent.roles[0]?.prompt || '',
        subscribedEvents: agentStore.currentAgent.subscribedEvents || [],
        roleIds: agentStore.currentAgent.roles.map(r => r.id),
      };
      
      // Extract capabilities from roles
      selectedCapabilities.value = agentStore.currentAgent.roles
        .flatMap(r => r.capabilities?.map(c => c.id) || []);
    }
  } else {
    // Reset form for new agent
    formData.value = {
      name: '',
      description: '',
      goal: '',
      prompt: '',
      subscribedEvents: [],
      roleIds: [],
    };
    selectedCapabilities.value = [];
  }
}, { immediate: true });

async function handleSave() {
  saving.value = true;
  try {
    const data = {
      name: formData.value.name,
      description: formData.value.description,
      goal: formData.value.goal,
      subscribedEvents: formData.value.subscribedEvents,
      roleIds: formData.value.roleIds,
    };

    if (props.agentId) {
      await agentStore.updateAgent(props.agentId, data);
    } else {
      await agentStore.createAgent(data);
    }

    emit('saved');
  } catch (error) {
    console.error('Failed to save agent:', error);
    alert('保存失败，请重试');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease-in-out;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
