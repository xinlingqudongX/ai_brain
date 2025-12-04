import { defineStore } from 'pinia';
import { ref } from 'vue';
import { agentsApi } from '../api';
import type { Agent } from '../types';

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<Agent[]>([]);
  const currentAgent = ref<Agent | null>(null);
  const loading = ref(false);

  async function fetchAgents() {
    loading.value = true;
    try {
      const response = await agentsApi.list({ page: 1, limit: 100 });
      agents.value = response.data.items;
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAgent(id: string) {
    loading.value = true;
    try {
      const response = await agentsApi.get(id);
      currentAgent.value = response.data;
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createAgent(data: Partial<Agent>) {
    loading.value = true;
    try {
      const response = await agentsApi.create(data);
      agents.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateAgent(id: string, data: Partial<Agent>) {
    loading.value = true;
    try {
      const response = await agentsApi.update(id, data);
      const index = agents.value.findIndex(a => a.id === id);
      if (index !== -1) {
        agents.value[index] = response.data;
      }
      if (currentAgent.value?.id === id) {
        currentAgent.value = response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAgent(id: string) {
    loading.value = true;
    try {
      await agentsApi.delete(id);
      agents.value = agents.value.filter(a => a.id !== id);
      if (currentAgent.value?.id === id) {
        currentAgent.value = null;
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    agents,
    currentAgent,
    loading,
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  };
});
