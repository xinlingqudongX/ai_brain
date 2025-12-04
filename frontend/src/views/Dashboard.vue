<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <AppHeader @new-agent="openDrawer(null)" />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-8">
      <!-- Agent Grid -->
      <h2 class="text-2xl font-bold mb-6">智能体概览 (Agent Grid)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <AgentCard
          v-for="agent in agentStore.agents"
          :key="agent.id"
          :agent="agent"
          @click="openDrawer(agent.id)"
        />
      </div>

      <!-- Execution Monitor -->
      <ExecutionMonitor />
    </main>

    <!-- Config Drawer -->
    <ConfigDrawer
      v-model:visible="drawerVisible"
      :agent-id="selectedAgentId"
      @close="closeDrawer"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAgentStore } from '../stores/agent';
import { useCapabilityStore } from '../stores/capability';
import AppHeader from '../components/AppHeader.vue';
import AgentCard from '../components/AgentCard.vue';
import ExecutionMonitor from '../components/ExecutionMonitor.vue';
import ConfigDrawer from '../components/ConfigDrawer.vue';

const agentStore = useAgentStore();
const capabilityStore = useCapabilityStore();

const drawerVisible = ref(false);
const selectedAgentId = ref<string | null>(null);

function openDrawer(agentId: string | null) {
  selectedAgentId.value = agentId;
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
  selectedAgentId.value = null;
}

function handleSaved() {
  agentStore.fetchAgents();
  closeDrawer();
}

onMounted(() => {
  agentStore.fetchAgents();
  capabilityStore.fetchCapabilities();
});
</script>
