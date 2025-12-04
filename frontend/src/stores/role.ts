import { defineStore } from 'pinia';
import { ref } from 'vue';
import { rolesApi } from '../api';
import type { Role } from '../types';

export const useRoleStore = defineStore('role', () => {
  const roles = ref<Role[]>([]);
  const loading = ref(false);

  async function fetchRoles() {
    loading.value = true;
    try {
      const response = await rolesApi.list({ page: 1, limit: 1000 });
      roles.value = response.data.items;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createRole(data: Partial<Role>) {
    loading.value = true;
    try {
      const response = await rolesApi.create(data);
      roles.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateRole(id: string, data: Partial<Role>) {
    loading.value = true;
    try {
      const response = await rolesApi.update(id, data);
      const index = roles.value.findIndex((r) => r.id === id);
      if (index !== -1) {
        roles.value[index] = response.data;
      }
      return response.data;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRole(id: string) {
    loading.value = true;
    try {
      await rolesApi.delete(id);
      roles.value = roles.value.filter((r) => r.id !== id);
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
});
