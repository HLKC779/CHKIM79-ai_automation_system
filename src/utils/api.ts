// API base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'
const API_TIMEOUT = 10000 // 10 seconds

// Request cache for deduplication
const requestCache = new Map<string, Promise<any>>()

// Performance monitoring
const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', 'api_call', {
      event_category: 'API',
      event_label: endpoint,
      value: Math.round(duration),
      custom_parameters: { success }
    })
  }
}

// Optimized fetch wrapper with caching and timeout
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`
  
  // Check if request is already in progress
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)
  }
  
  const startTime = performance.now()
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)
  
  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }).then(async (response) => {
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    const duration = performance.now() - startTime
    trackApiCall(endpoint, duration, true)
    
    return data
  }).catch((error) => {
    clearTimeout(timeoutId)
    const duration = performance.now() - startTime
    trackApiCall(endpoint, duration, false)
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    
    throw error
  }).finally(() => {
    requestCache.delete(cacheKey)
  })
  
  requestCache.set(cacheKey, fetchPromise)
  return fetchPromise
}

// Dashboard API
export const fetchDashboardData = async () => {
  // Simulate API call with realistic data
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  
  return {
    totalAutomations: 156,
    activeProcesses: 23,
    successRate: 94.2,
    totalExecutions: 12450,
    automationGrowth: 12.5,
    processGrowth: -2.1,
    successRateChange: 1.8,
    executionGrowth: 8.3
  }
}

export const fetchRecentAutomations = async () => {
  // Simulate API call with realistic data
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200))
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `auto-${i + 1}`,
    name: `Automation ${i + 1}`,
    description: `Automated process for task ${i + 1}`,
    status: ['running', 'stopped', 'paused'][Math.floor(Math.random() * 3)],
    executions: Math.floor(Math.random() * 1000) + 10,
    lastRun: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    successRate: Math.floor(Math.random() * 20) + 80
  }))
}

// Automation API
export const fetchAutomation = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150))
  
  return {
    id,
    name: `Automation ${id}`,
    description: `Detailed automation process for ${id}`,
    status: 'running',
    executions: Math.floor(Math.random() * 1000) + 10,
    lastRun: new Date().toISOString(),
    successRate: Math.floor(Math.random() * 20) + 80,
    config: {
      triggers: ['schedule', 'webhook'],
      actions: ['email', 'database', 'api'],
      schedule: '0 */6 * * *'
    }
  }
}

export const fetchAutomationLogs = async (id: string, page = 1, limit = 20) => {
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100))
  
  return {
    logs: Array.from({ length: limit }, (_, i) => ({
      id: `log-${page}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
      message: `Log message ${page}-${i}`,
      executionTime: Math.floor(Math.random() * 5000) + 100
    })),
    total: 1000,
    page,
    limit
  }
}

// Settings API
export const fetchSettings = async () => {
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
  
  return {
    notifications: {
      email: true,
      slack: false,
      webhook: 'https://hooks.slack.com/services/...'
    },
    performance: {
      maxConcurrentProcesses: 10,
      timeoutSeconds: 300,
      retryAttempts: 3
    },
    security: {
      apiKeyRotation: 30,
      sessionTimeout: 60
    }
  }
}

export const updateSettings = async (settings: any) => {
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  
  return { success: true, message: 'Settings updated successfully' }
}

// Utility function to clear request cache
export const clearApiCache = () => {
  requestCache.clear()
}

// Export the base fetch function for custom requests
export { apiFetch }