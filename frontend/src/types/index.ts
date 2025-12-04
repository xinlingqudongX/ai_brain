export interface Agent {
  id: string;
  name: string;
  description: string;
  goal: string;
  config?: Record<string, any>;
  isActive: boolean;
  subscribedEvents: string[];
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isActive: boolean;
  capabilities: Capability[];
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  prompt: string;
  isActive: boolean;
}

export interface TimelineNotifier {
  id: string;
  eventName: string;
  description: string;
  cronExpression: string;
  isEnabled: boolean;
  context?: Record<string, any>;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  executionCount: number;
}

export interface ExecutionLog {
  id: string;
  agentName: string;
  eventName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'processing';
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  step: number;
  name: string;
  description: string;
  status: 'success' | 'failed' | 'processing';
  duration?: number;
}
