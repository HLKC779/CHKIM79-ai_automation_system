import { apiFetch } from './api'
import type {
  Agent,
  AgentListResponse,
  Task,
  TaskQueueResponse,
  Workflow,
  WorkflowExecutionResponse,
  AgentWebSocketEvent,
  AgentEventType,
  AgentMessage,
  AgentMetrics,
  SystemMetrics
} from '../types/agent.types'

// WebSocket connection management
class AgentWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectInterval: number = 5000
  private maxReconnectAttempts: number = 5
  private reconnectAttempts: number = 0
  private eventHandlers: Map<AgentEventType, Set<(data: any) => void>> = new Map()
  private url: string

  constructor(url: string) {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to agent system')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: AgentWebSocketEvent = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket connection closed')
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(message: AgentWebSocketEvent) {
    const handlers = this.eventHandlers.get(message.event)
    if (handlers) {
      handlers.forEach(handler => handler(message.data))
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectInterval)
    }
  }

  on(event: AgentEventType, handler: (data: any) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  off(event: AgentEventType, handler: (data: any) => void) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  send(message: AgentMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Initialize WebSocket client
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/agents'
export const agentWebSocket = new AgentWebSocketClient(WS_URL)

// Agent Management APIs
export const agentApi = {
  // Agent CRUD operations
  async listAgents(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string 
  }): Promise<AgentListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    
    return apiFetch(`/agents?${queryParams}`)
  },

  async getAgent(id: string): Promise<Agent> {
    return apiFetch(`/agents/${id}`)
  },

  async createAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Agent> {
    return apiFetch('/agents', {
      method: 'POST',
      body: JSON.stringify(agent)
    })
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    return apiFetch(`/agents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  },

  async deleteAgent(id: string): Promise<void> {
    return apiFetch(`/agents/${id}`, {
      method: 'DELETE'
    })
  },

  // Agent control operations
  async startAgent(id: string): Promise<Agent> {
    return apiFetch(`/agents/${id}/start`, {
      method: 'POST'
    })
  },

  async stopAgent(id: string): Promise<Agent> {
    return apiFetch(`/agents/${id}/stop`, {
      method: 'POST'
    })
  },

  async restartAgent(id: string): Promise<Agent> {
    return apiFetch(`/agents/${id}/restart`, {
      method: 'POST'
    })
  },

  // Agent metrics
  async getAgentMetrics(id: string, timeRange?: { start: string; end: string }): Promise<AgentMetrics[]> {
    const queryParams = new URLSearchParams()
    if (timeRange) {
      queryParams.append('start', timeRange.start)
      queryParams.append('end', timeRange.end)
    }
    return apiFetch(`/agents/${id}/metrics?${queryParams}`)
  },

  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiFetch('/agents/metrics/system')
  }
}

// Task Management APIs
export const taskApi = {
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task> {
    return apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    })
  },

  async getTask(id: string): Promise<Task> {
    return apiFetch(`/tasks/${id}`)
  },

  async listTasks(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
  }): Promise<TaskQueueResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    
    return apiFetch(`/tasks?${queryParams}`)
  },

  async assignTask(taskId: string, agentId: string): Promise<Task> {
    return apiFetch(`/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId })
    })
  },

  async cancelTask(id: string): Promise<Task> {
    return apiFetch(`/tasks/${id}/cancel`, {
      method: 'POST'
    })
  },

  async retryTask(id: string): Promise<Task> {
    return apiFetch(`/tasks/${id}/retry`, {
      method: 'POST'
    })
  }
}

// Workflow Management APIs
export const workflowApi = {
  async listWorkflows(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    
    return apiFetch(`/workflows?${queryParams}`)
  },

  async getWorkflow(id: string): Promise<Workflow> {
    return apiFetch(`/workflows/${id}`)
  },

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    return apiFetch('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow)
    })
  },

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow> {
    return apiFetch(`/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  },

  async deleteWorkflow(id: string): Promise<void> {
    return apiFetch(`/workflows/${id}`, {
      method: 'DELETE'
    })
  },

  async executeWorkflow(id: string, params?: any): Promise<WorkflowExecutionResponse> {
    return apiFetch(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ params })
    })
  },

  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecutionResponse[]> {
    return apiFetch(`/workflows/${workflowId}/executions`)
  }
}

// Agent Communication APIs
export const agentCommunication = {
  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<void> {
    return apiFetch('/agents/messages', {
      method: 'POST',
      body: JSON.stringify(message)
    })
  },

  async broadcast(message: Omit<AgentMessage, 'id' | 'timestamp' | 'to'>): Promise<void> {
    return apiFetch('/agents/messages/broadcast', {
      method: 'POST',
      body: JSON.stringify(message)
    })
  },

  async getMessageHistory(agentId: string, limit = 100): Promise<AgentMessage[]> {
    return apiFetch(`/agents/${agentId}/messages?limit=${limit}`)
  }
}

// Helper functions for real-time updates
export const subscribeToAgentUpdates = (agentId: string, callback: (agent: Agent) => void) => {
  agentWebSocket.on(AgentEventType.AGENT_STATUS_CHANGED, (data) => {
    if (data.agentId === agentId) {
      callback(data.agent)
    }
  })
}

export const subscribeToTaskUpdates = (callback: (task: Task) => void) => {
  agentWebSocket.on(AgentEventType.TASK_CREATED, (data) => callback(data.task))
  agentWebSocket.on(AgentEventType.TASK_ASSIGNED, (data) => callback(data.task))
  agentWebSocket.on(AgentEventType.TASK_COMPLETED, (data) => callback(data.task))
  agentWebSocket.on(AgentEventType.TASK_FAILED, (data) => callback(data.task))
}

export const subscribeToSystemMetrics = (callback: (metrics: SystemMetrics) => void) => {
  agentWebSocket.on(AgentEventType.METRICS_UPDATE, callback)
}

// Initialize WebSocket connection when module loads
if (typeof window !== 'undefined') {
  agentWebSocket.connect().catch(console.error)
}