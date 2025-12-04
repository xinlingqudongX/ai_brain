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
      // Fetch capabilities with role relations
      const response = await capabilitiesApi.list({ page: 1, limit: 1000 });
      capabilities.value = response.data.items;
    } catch (error) {
      console.error('Failed to fetch capabilities:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createCapability(data: Partial<Capability>) {
    loading.value = true;
    try {
      const response = await capabilitiesApi.create(data);
      capabilities.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create capability:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateCapability(id: string, data: Partial<Capability>) {
    loading.value = true;
    try {
      const response = await capabilitiesApi.update(id, data);
      const index = capabilities.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        capabilities.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update capability:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCapability(id: string) {
    loading.value = true;
    try {
      await capabilitiesApi.delete(id);
      capabilities.value = capabilities.value.filter((c) => c.id !== id);
    } catch (error) {
      console.error('Failed to delete capability:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    capabilities,
    loading,
    fetchCapabilities,
    createCapability,
    updateCapability,
    deleteCapability,
  };
});
