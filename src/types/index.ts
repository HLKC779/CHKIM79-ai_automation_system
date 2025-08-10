// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// API Response Types
export interface DashboardData {
  totalAutomations: number
  activeProcesses: number
  successRate: number
  totalExecutions: number
  automationGrowth: number
  processGrowth: number
  successRateChange: number
  executionGrowth: number
}

export interface Automation {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'paused'
  executions: number
  lastRun: string
  successRate: number
  config: AutomationConfig
}

export interface AutomationConfig {
  triggers: string[]
  actions: string[]
  schedule: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  executionTime: number
}

export interface LogsResponse {
  logs: LogEntry[]
  total: number
  page: number
  limit: number
}

export interface Settings {
  notifications: NotificationSettings
  performance: PerformanceSettings
  security: SecuritySettings
}

export interface NotificationSettings {
  email: boolean
  slack: boolean
  webhook: string
}

export interface PerformanceSettings {
  maxConcurrentProcesses: number
  timeoutSeconds: number
  retryAttempts: number
}

export interface SecuritySettings {
  apiKeyRotation: number
  sessionTimeout: number
}

// Component Props Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: string
}

export interface AutomationCardProps {
  automation: Automation
  onSelect: (id: string) => void
}

export interface LogEntryProps {
  log: LogEntry
}

export interface StatusIndicatorProps {
  status: string
}

export interface SettingFieldProps {
  label: string
  type: 'text' | 'number' | 'checkbox' | 'select'
  value: any
  onChange: (value: any) => void
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}

// Performance Monitoring Types
export interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
  interactionTime?: number
}

export interface WebVitalsMetric {
  name: string
  value: number
  id: string
}

// Virtual List Types
export interface VirtualizedItemProps {
  index: number
  style: React.CSSProperties
  data: any[]
}

// API Error Types
export interface ApiError {
  message: string
  status: number
  code?: string
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// Cache Types
export interface CacheConfig {
  staleTime: number
  cacheTime: number
  retry: number
  refetchOnWindowFocus: boolean
  refetchOnReconnect: boolean
}

// Navigation Types
export interface NavItem {
  path: string
  label: string
  icon: string
  requiresAuth?: boolean
}

// Theme Types
export interface Theme {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  error: string
  warning: string
  success: string
}

// User Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  permissions: string[]
  lastLogin?: string
}

// Pagination Types
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationParams
}

// Search and Filter Types
export interface SearchParams {
  query: string
  filters: Record<string, any>
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

// Event Types
export interface AppEvent {
  type: string
  payload: any
  timestamp: string
  userId?: string
}

// Performance Optimization Types
export interface MemoizationConfig {
  maxSize: number
  ttl: number
  keyGenerator?: (args: any[]) => string
}

export interface LazyLoadConfig {
  threshold: number
  rootMargin: string
  fallback?: React.ReactNode
}

// Error Boundary Types
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}