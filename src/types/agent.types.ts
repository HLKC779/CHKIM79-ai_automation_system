// Multi-Agent System Type Definitions

// Agent Core Types
export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]
  config: AgentConfig
  metadata: AgentMetadata
  createdAt: string
  updatedAt: string
}

export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  WORKER = 'worker',
  MONITOR = 'monitor',
  ANALYZER = 'analyzer',
  EXECUTOR = 'executor',
  VALIDATOR = 'validator'
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

export interface AgentConfig {
  maxConcurrentTasks: number
  timeout: number
  retryPolicy: RetryPolicy
  resources: ResourceLimits
  permissions: string[]
}

export interface RetryPolicy {
  maxRetries: number
  backoffMultiplier: number
  initialDelay: number
}

export interface ResourceLimits {
  cpu: number
  memory: number
  maxExecutionTime: number
}

export interface AgentMetadata {
  version: string
  host: string
  port: number
  region?: string
  tags: string[]
}

// Agent Communication Types
export interface AgentMessage {
  id: string
  from: string
  to: string | string[]
  type: MessageType
  payload: any
  timestamp: string
  correlationId?: string
}

export enum MessageType {
  TASK_ASSIGNMENT = 'task_assignment',
  TASK_RESULT = 'task_result',
  STATUS_UPDATE = 'status_update',
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
  COORDINATION = 'coordination'
}

// Task and Workflow Types
export interface Task {
  id: string
  name: string
  type: string
  priority: TaskPriority
  payload: any
  requirements: TaskRequirements
  assignedTo?: string
  status: TaskStatus
  result?: TaskResult
  createdAt: string
  startedAt?: string
  completedAt?: string
}

export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

export interface TaskRequirements {
  capabilities: string[]
  resources: ResourceLimits
  dependencies?: string[]
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TaskResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
  resourceUsage: ResourceUsage
}

export interface ResourceUsage {
  cpu: number
  memory: number
  networkIO?: number
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers: WorkflowTrigger[]
  status: WorkflowStatus
  config: WorkflowConfig
  createdAt: string
  updatedAt: string
}

export interface WorkflowStep {
  id: string
  name: string
  type: string
  agentType?: AgentType
  config: any
  dependencies: string[]
  condition?: StepCondition
}

export interface StepCondition {
  type: 'success' | 'failure' | 'custom'
  expression?: string
}

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'manual' | 'webhook'
  config: any
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled'
}

export interface WorkflowConfig {
  maxRetries: number
  timeout: number
  parallelism: number
  errorHandling: 'stop' | 'continue' | 'rollback'
}

// Agent Orchestration Types
export interface AgentPool {
  id: string
  name: string
  agents: Agent[]
  loadBalancingStrategy: LoadBalancingStrategy
  healthCheckInterval: number
}

export enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  LEAST_LOADED = 'least_loaded',
  CAPABILITY_BASED = 'capability_based',
  RANDOM = 'random'
}

// Monitoring and Metrics Types
export interface AgentMetrics {
  agentId: string
  timestamp: string
  cpu: number
  memory: number
  tasksCompleted: number
  tasksFailed: number
  averageTaskTime: number
  uptime: number
}

export interface SystemMetrics {
  totalAgents: number
  activeAgents: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageCompletionTime: number
  systemLoad: number
}

// WebSocket Event Types
export interface AgentWebSocketEvent {
  event: AgentEventType
  data: any
  timestamp: string
}

export enum AgentEventType {
  AGENT_CONNECTED = 'agent:connected',
  AGENT_DISCONNECTED = 'agent:disconnected',
  AGENT_STATUS_CHANGED = 'agent:status_changed',
  TASK_CREATED = 'task:created',
  TASK_ASSIGNED = 'task:assigned',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  WORKFLOW_STARTED = 'workflow:started',
  WORKFLOW_COMPLETED = 'workflow:completed',
  METRICS_UPDATE = 'metrics:update'
}

// API Response Types for Agent Operations
export interface AgentListResponse {
  agents: Agent[]
  total: number
  page: number
  limit: number
}

export interface TaskQueueResponse {
  tasks: Task[]
  queueLength: number
  processingRate: number
}

export interface WorkflowExecutionResponse {
  executionId: string
  workflowId: string
  status: 'started' | 'completed' | 'failed'
  steps: StepExecution[]
}

export interface StepExecution {
  stepId: string
  status: TaskStatus
  startTime: string
  endTime?: string
  result?: any
  error?: string
}