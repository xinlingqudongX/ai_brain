<template>
  <div class="p-6">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-white">能力管理</h1>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <i class="fa-solid fa-plus mr-2"></i>
        新建能力
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="capabilityStore.loading" class="flex justify-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Capabilities Table -->
    <div
      v-else
      class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
    >
      <table class="min-w-full divide-y divide-gray-700">
        <thead class="bg-gray-750">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              能力名称
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              描述
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              使用角色
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              状态
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-800 divide-y divide-gray-700">
          <tr
            v-for="capability in capabilityStore.capabilities"
            :key="capability.id"
            class="hover:bg-gray-750"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-white">
                {{ capability.name }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-300">
                {{ capability.description }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-300">
                {{
                  (capability as any).roles
                    ?.map((r: any) => r.name)
                    .join(', ') || '-'
                }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  capability.isActive
                    ? 'bg-green-900 text-green-200'
                    : 'bg-red-900 text-red-200',
                ]"
              >
                {{ capability.isActive ? '启用' : '禁用' }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="openEditModal(capability)"
                class="text-blue-400 hover:text-blue-300 mr-3"
              >
                编辑
              </button>
              <button
                @click="deleteCapability(capability.id)"
                class="text-red-400 hover:text-red-300"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl mx-4"
      >
        <div
          class="px-6 py-4 border-b border-gray-700 flex justify-between items-center"
        >
          <h3 class="text-lg font-medium text-white">
            {{ editingCapability ? '编辑能力' : '新建能力' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-white">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2"
                >能力名称 *</label
              >
              <input
                v-model="form.name"
                type="text"
                placeholder="请输入能力名称"
                class="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2"
                >描述 *</label
              >
              <input
                v-model="form.description"
                type="text"
                placeholder="请输入能力描述"
                class="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2"
                >Prompt *</label
              >
              <textarea
                v-model="form.prompt"
                rows="4"
                placeholder="请输入能力 Prompt"
                class="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2"
                >分组 *</label
              >
              <input
                v-model="form.group"
                type="text"
                placeholder="请输入能力分组"
                class="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                v-model="form.isActive"
                class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label for="isActive" class="ml-2 text-sm text-gray-300">
                启用能力
              </label>
            </div>
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-gray-700 flex justify-end space-x-3"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
          >
            取消
          </button>
          <button
            @click="saveCapability"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCapabilityStore } from '../stores/capability';
import type { Capability } from '../types';

const capabilityStore = useCapabilityStore();

const showModal = ref(false);
const editingCapability = ref<Capability | null>(null);
const saving = ref(false);

const form = ref({
  name: '',
  description: '',
  prompt: '',
  group: '',
  isActive: true,
});

onMounted(async () => {
  await capabilityStore.fetchCapabilities();
});

function openCreateModal() {
  editingCapability.value = null;
  form.value = {
    name: '',
    description: '',
    prompt: '',
    group: '',
    isActive: true,
  };
  showModal.value = true;
}

function openEditModal(capability: Capability) {
  editingCapability.value = capability;
  form.value = {
    name: capability.name,
    description: capability.description,
    prompt: capability.prompt,
    group: capability.group || '',
    isActive: capability.isActive,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveCapability() {
  saving.value = true;
  try {
    if (editingCapability.value) {
      // Update existing capability
      await capabilityStore.updateCapability(
        editingCapability.value.id,
        form.value,
      );
    } else {
      // Create new capability
      await capabilityStore.createCapability(form.value);
    }
    closeModal();
    await capabilityStore.fetchCapabilities();
  } catch (error) {
    console.error('Failed to save capability:', error);
    // TODO: Show error message to user
  } finally {
    saving.value = false;
  }
}

async function deleteCapability(id: string) {
  if (confirm('确定要删除这个能力吗？')) {
    try {
      await capabilityStore.deleteCapability(id);
      await capabilityStore.fetchCapabilities();
    } catch (error) {
      console.error('Failed to delete capability:', error);
      // TODO: Show error message to user
    }
  }
}
</script>
