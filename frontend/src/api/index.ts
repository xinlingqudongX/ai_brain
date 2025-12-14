import axios from 'axios';
import type { Agent, Role, Capability, TimelineNotifier } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agents API
export const agentsApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    api.post<{ items: Agent[]; total: number }>('/agents/action/list', params),

  get: (id: string) => api.post<Agent>('/agents/action/get', { id }),

  create: (data: Partial<Agent>) =>
    api.post<Agent>('/agents/action/create', data),

  update: (id: string, data: Partial<Agent>) =>
    api.post<Agent>('/agents/action/update', { id, ...data }),

  delete: (id: string) => api.post('/agents/action/delete', { id }),

  execute: (id: string, context?: Record<string, any>) =>
    api.post('/agents/action/execute', { id, context }),
};

// Roles API
export const rolesApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    api.post<{ items: Role[]; total: number }>('/roles/action/list', params),

  get: (id: string) => api.post<Role>('/roles/action/get', { id }),

  create: (data: Partial<Role>) => api.post<Role>('/roles/action/create', data),

  update: (id: string, data: Partial<Role>) =>
    api.post<Role>('/roles/action/update', { id, ...data }),

  delete: (id: string) => api.post('/roles/action/delete', { id }),
};

// Capabilities API
export const capabilitiesApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    api.post<{ items: Capability[]; total: number }>(
      '/capabilities/action/list',
      params,
    ),

  get: (id: string) => api.post<Capability>('/capabilities/action/get', { id }),

  create: (data: Partial<Capability>) =>
    api.post<Capability>('/capabilities/action/create', data),

  update: (id: string, data: Partial<Capability>) =>
    api.post<Capability>('/capabilities/action/update', { id, ...data }),

  delete: (id: string) => api.post('/capabilities/action/delete', { id }),
};

// Timeline API
export const timelineApi = {
  list: (params: {
    page?: number;
    limit?: number;
    search?: string;
    isEnabled?: boolean;
  }) =>
    api.post<{ items: TimelineNotifier[]; total: number }>(
      '/timeline/action/list',
      params,
    ),

  get: (id: string) =>
    api.post<TimelineNotifier>('/timeline/action/get', { id }),

  create: (data: Partial<TimelineNotifier>) =>
    api.post<TimelineNotifier>('/timeline/action/create', data),

  update: (id: string, data: Partial<TimelineNotifier>) =>
    api.post<TimelineNotifier>('/timeline/action/update', { id, ...data }),

  delete: (id: string) => api.post('/timeline/action/delete', { id }),

  trigger: (id: string) => api.post('/timeline/action/trigger', { id }),
};

export default api;
