<template>
  <div class="bg-card p-4 rounded-lg border border-gray-700">
    <h3 class="font-bold text-lg mb-4 flex items-center">
      <i class="fa-solid fa-users mr-2 text-green-400"></i>角色选择
    </h3>
    
    <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      <label
        v-for="role in roleStore.roles"
        :key="role.id"
        class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
        :class="
          isSelected(role.id)
            ? 'border-green-500/50 bg-green-900/10'
            : 'border-gray-700 hover:bg-gray-800'
        "
      >
        <input
          type="checkbox"
          :checked="isSelected(role.id)"
          @change="toggleRole(role.id)"
          class="mt-1 w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500 bg-gray-700"
        />
        <div class="flex-1">
          <span
            class="font-medium"
            :class="isSelected(role.id) ? 'text-green-200' : 'text-gray-300'"
          >
            {{ role.name }}
          </span>
          <p class="text-xs text-gray-400 mt-1">{{ role.description }}</p>
          <div class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="capability in role.capabilities"
              :key="capability.id"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200"
            >
              {{ capability.name }}
            </span>
          </div>
        </div>
      </label>

      <div
        v-if="roleStore.roles.length === 0"
        class="h-40 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 text-sm italic"
      >
        暂无角色，请先创建角色
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoleStore } from '../../stores/role';

const props = defineProps<{
  selectedRoles: string[];
}>();

const emit = defineEmits(['update:selectedRoles']);

const roleStore = useRoleStore();

onMounted(async () => {
  if (roleStore.roles.length === 0) {
    await roleStore.fetchRoles();
  }
});

function isSelected(id: string): boolean {
  return props.selectedRoles.includes(id);
}

function toggleRole(id: string) {
  const selected = [...props.selectedRoles];
  const index = selected.indexOf(id);

  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(id);
  }

  emit('update:selectedRoles', selected);
}
</script>