<template>
  <div
    class="bg-card border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer relative"
    @click="$emit('click')"
  >
    <div
      class="absolute top-4 right-4 w-3 h-3 rounded-full"
      :class="agent.isActive ? 'bg-green-500' : 'bg-gray-500'"
    ></div>
    <div class="flex items-center gap-4 mb-4">
      <div class="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
        {{ getAgentIcon(agent.name) }}
      </div>
      <div>
        <h3 class="font-bold text-lg">{{ agent.name }}</h3>
      </div>
    </div>
    <div class="text-sm text-gray-400 space-y-1">
      <p>
        <i class="fa-solid fa-screwdriver-wrench mr-2"></i>
        {{ getTotalCapabilities(agent) }} 项能力
      </p>
      <p>
        <i class="fa-regular fa-clock mr-2"></i>
        {{ agent.subscribedEvents.length }} 个订阅事件
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Agent } from '../types';

defineProps<{
  agent: Agent;
}>();

defineEmits(['click']);

function getAgentIcon(name: string): string {
  const icons: Record<string, string> = {
    '男朋友': '🧑‍🤝‍🧑',
    '项目经理': '👔',
    'DBA': '💾',
    '开发者': '💻',
  };
  return icons[name] || '🤖';
}

function getTotalCapabilities(agent: Agent): number {
  return agent.roles.reduce((total, role) => total + (role.capabilities?.length || 0), 0);
}
</script>
