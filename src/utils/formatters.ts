import { memoize } from 'lodash-es'

// Memoized number formatter for better performance
export const formatNumber = memoize((num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}, (num: number) => Math.floor(num / 1000)) // Cache by thousands

// Memoized date formatter
export const formatDate = memoize((dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  }
  if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}, (dateString: string) => {
  // Cache by day to avoid excessive cache entries
  const date = new Date(dateString)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
})

// Memoized duration formatter
export const formatDuration = memoize((milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }
  if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`
  }
  if (milliseconds < 3600000) {
    return `${Math.floor(milliseconds / 60000)}m ${Math.floor((milliseconds % 60000) / 1000)}s`
  }
  return `${Math.floor(milliseconds / 3600000)}h ${Math.floor((milliseconds % 3600000) / 60000)}m`
}, (milliseconds: number) => Math.floor(milliseconds / 1000)) // Cache by seconds

// Memoized file size formatter
export const formatFileSize = memoize((bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}, (bytes: number) => Math.floor(Math.log(bytes) / Math.log(1024)))

// Memoized percentage formatter
export const formatPercentage = memoize((value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}, (value: number, decimals = 1) => `${Math.round(value * Math.pow(10, decimals))}-${decimals}`)

// Memoized currency formatter
export const formatCurrency = memoize((amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}, (amount: number, currency = 'USD') => `${Math.round(amount * 100)}-${currency}`)

// Memoized status formatter
export const formatStatus = memoize((status: string): string => {
  const statusMap: Record<string, string> = {
    running: 'Running',
    stopped: 'Stopped',
    paused: 'Paused',
    error: 'Error',
    success: 'Success',
    pending: 'Pending'
  }
  
  return statusMap[status] || status
})

// Memoized log level formatter with color classes
export const formatLogLevel = memoize((level: string): { text: string; className: string } => {
  const levelMap: Record<string, { text: string; className: string }> = {
    info: { text: 'INFO', className: 'text-blue-600 bg-blue-50' },
    warning: { text: 'WARN', className: 'text-yellow-600 bg-yellow-50' },
    error: { text: 'ERROR', className: 'text-red-600 bg-red-50' },
    debug: { text: 'DEBUG', className: 'text-gray-600 bg-gray-50' }
  }
  
  return levelMap[level] || { text: level.toUpperCase(), className: 'text-gray-600 bg-gray-50' }
})

// Memoized relative time formatter
export const formatRelativeTime = memoize((dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 2592000) { // 30 days
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  
  return date.toLocaleDateString()
}, (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
})