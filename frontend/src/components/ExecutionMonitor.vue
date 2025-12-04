<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
      <i class="fa-solid fa-chart-line text-accent"></i> 实时执行监控 (Execution Call Stack)
    </h2>
    <div class="bg-card border border-gray-700 rounded-xl p-6 overflow-hidden">
      <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
        <span class="text-sm text-gray-400 font-semibold">
          最新执行: {{ latestExecution.agentName }} | {{ latestExecution.timestamp }}
        </span>
        <span
          class="text-xs px-2 py-1 rounded"
          :class="statusClass(latestExecution.status)"
        >
          {{ statusText(latestExecution.status) }}
        </span>
      </div>

      <div class="relative pl-6">
        <div
          class="flow-line"
          :class="latestExecution.status === 'success' ? 'flow-line-success' : 'flow-line-error'"
        ></div>

        <div
          v-for="step in latestExecution.steps"
          :key="step.step"
          class="relative mb-8"
        >
          <div
            class="absolute -left-[14px] top-1 w-6 h-6 rounded-full bg-main border-2 flex items-center justify-center"
            :class="stepBorderClass(step.status)"
          >
            <i
              class="text-xs"
              :class="stepIconClass(step.status)"
            ></i>
          </div>
          <p class="font-bold text-sm">{{ step.step }}. {{ step.name }}</p>
          <p class="text-xs text-gray-400">{{ step.description }}</p>
          <p v-if="step.duration" class="text-xs text-gray-500 mt-1">
            耗时: {{ step.duration }}ms
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ExecutionLog } from '../types';

const latestExecution = ref<ExecutionLog>({
  id: '1',
  agentName: '男朋友角色',
  eventName: 'daily.lunch',
  timestamp: new Date().toLocaleTimeString('zh-CN'),
  status: 'success',
  steps: [
    {
      step: 1,
      name: '上下文初始化',
      description: '输入: {时间: 12:00 PM, 角色: 男朋友, 地点: 家}',
      status: 'success',
    },
    {
      step: 2,
      name: 'LLM 决策引擎调用 (Meta-Prompt)',
      description: '推理: 12:00 PM 优先级 → 餐饮类能力',
      status: 'success',
    },
    {
      step: 3,
      name: '能力调用: ordering_service.place_order',
      description: '参数: {item: "咖啡", address: "家里", note: "加糖"}',
      status: 'success',
      duration: 450,
    },
    {
      step: 4,
      name: '结果输出: 用户收到点餐请求',
      description: '耗时: 450ms | Token: 1.2k',
      status: 'success',
    },
  ],
});

function statusClass(status: string) {
  const classes: Record<string, string> = {
    success: 'text-green-400 bg-green-400/10',
    failed: 'text-red-400 bg-red-400/10',
    processing: 'text-yellow-400 bg-yellow-400/10',
  };
  return classes[status] || '';
}

function statusText(status: string) {
  const texts: Record<string, string> = {
    success: '决策成功',
    failed: '执行失败',
    processing: '执行中',
  };
  return texts[status] || status;
}

function stepBorderClass(status: string) {
  const classes: Record<string, string> = {
    success: 'border-green-500',
    failed: 'border-red-500',
    processing: 'border-yellow-500',
  };
  return classes[status] || 'border-gray-500';
}

function stepIconClass(status: string) {
  const classes: Record<string, string> = {
    success: 'fa-solid fa-check text-green-500',
    failed: 'fa-solid fa-times text-red-500',
    processing: 'fa-solid fa-spinner fa-spin text-yellow-500',
  };
  return classes[status] || 'fa-solid fa-circle text-gray-500';
}
</script>
