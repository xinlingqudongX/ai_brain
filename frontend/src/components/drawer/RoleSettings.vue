<template>
  <div class="space-y-6">
    <!-- Role Configuration -->
    <div class="bg-card p-4 rounded-lg border border-gray-700">
      <h3 class="font-bold text-lg mb-4 flex items-center">
        <i class="fa-solid fa-user-gear mr-2 text-blue-400"></i>角色设定
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Agent 名称</label>
          <input
            v-model="localData.name"
            type="text"
            placeholder="例如：男朋友、项目经理、DBA"
            class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">描述</label>
          <input
            v-model="localData.description"
            type="text"
            placeholder="简短描述这个 Agent 的职责"
            class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">目标 (Goal)</label>
          <input
            v-model="localData.goal"
            type="text"
            placeholder="这个 Agent 要达成什么目标"
            class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">人设 Prompt (System)</label>
          <textarea
            v-model="localData.prompt"
            rows="6"
            placeholder="定义 Agent 的个性、行为准则和决策逻辑..."
            class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Prompt Preview -->
    <div class="bg-card p-4 rounded-lg border border-gray-700">
      <h3 class="font-bold text-lg mb-4 flex items-center text-purple-400">
        <i class="fa-solid fa-code mr-2"></i>最终 Prompt 预览
      </h3>
      <div class="bg-gray-800 border border-gray-700 rounded p-3 text-xs font-mono text-gray-300 overflow-x-auto max-h-48 whitespace-pre-wrap">
{{ finalPrompt }}
      </div>
      <p class="text-xs text-gray-500 mt-2">
        预览由：角色 Prompt + 已选能力描述 + 监听上下文 动态组合生成。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

const props = defineProps<{
  modelValue: {
    name: string;
    description: string;
    goal: string;
    prompt: string;
    subscribedEvents: string[];
    roleIds: string[];
  };
  roleStore: any; // Receive roleStore as a prop
}>();

const emit = defineEmits(['update:modelValue']);

const localData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const finalPrompt = computed(() => {
  const parts = [];
  
  if (localData.value.prompt) {
    parts.push(`[SYSTEM] ${localData.value.prompt}`);
  }
  
  // Dynamically generate capabilities based on selected roles
  if (props.roleStore && localData.value.roleIds.length > 0) {
    const selectedRoles = localData.value.roleIds
      .map((id: string) => props.roleStore.roles.find((r: any) => r.id === id))
      .filter(Boolean);
      
    if (selectedRoles.length > 0) {
      const allCapabilities = selectedRoles.flatMap((role: any) => 
        role.capabilities.map((cap: any) => `\"${cap.name}\": ${cap.description}`)
      );
      
      // Remove duplicates
      const uniqueCapabilities = [...new Set(allCapabilities)];
      
      if (uniqueCapabilities.length > 0) {
        parts.push(`[CAPABILITIES] Available tools:\n${uniqueCapabilities.map((cap: string, index: number) => `  ${index + 1}. ${cap}`).join('\n')}`);
      } else {
        parts.push('[CAPABILITIES] Available tools: None');
      }
    } else {
      parts.push('[CAPABILITIES] Available tools: None');
    }
  } else {
    parts.push('[CAPABILITIES] Available tools: None');
  }
  
  if (localData.value.subscribedEvents.length > 0) {
    parts.push(`[EVENTS] Subscribed to: ${localData.value.subscribedEvents.join(', ')}`);
  }
  
  parts.push('[CONTEXT] Current Time is ' + new Date().toLocaleTimeString('zh-CN'));
  parts.push('[USER] 你现在应该做什么？');
  parts.push('\n--- (This is the final string sent to LLM) ---');
  
  return parts.join('\n');
});
</script>
