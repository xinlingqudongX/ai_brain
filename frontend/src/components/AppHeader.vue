<template>
  <header class="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900 z-10">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <i class="fa-solid fa-brain text-white text-sm"></i>
      </div>
      <h1 class="font-bold text-xl tracking-wide">
        CIIA <span class="text-gray-500 font-normal text-sm">| 智能作定计</span>
      </h1>
    </div>
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
        <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        系统心跳正常
      </div>
      <button
        @click="$emit('new-agent')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <i class="fa-solid fa-plus mr-2"></i>新建智能体
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['new-agent']);
</script>
