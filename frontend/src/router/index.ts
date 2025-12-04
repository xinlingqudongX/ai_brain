import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import RoleManagement from '../views/RoleManagement.vue';
import CapabilityManagement from '../views/CapabilityManagement.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/roles',
      name: 'role-management',
      component: RoleManagement,
    },
    {
      path: '/capabilities',
      name: 'capability-management',
      component: CapabilityManagement,
    },
  ],
});

export default router;
