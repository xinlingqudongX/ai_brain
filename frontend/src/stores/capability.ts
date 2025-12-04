import { defineStore } from 'pinia';
import { ref } from 'vue';
import { capabilitiesApi } from '../api';
import type { Capability } from '../types';

export const useCapabilityStore = defineStore('capability', () => {
  const capabilities = ref<Capability[]>([]);
  const loading = ref(false);

  async function fetchCapabilities() {
    loading.value = true;
    try {
      const response = await capabilitiesApi.list({ page: 1, limit: 1000 });
      capabilities.value = response.data.items;
    } catch (error) {
      console.error('Failed to fetch capabilities:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    capabilities,
    loading,
    fetchCapabilities,
  };
});
