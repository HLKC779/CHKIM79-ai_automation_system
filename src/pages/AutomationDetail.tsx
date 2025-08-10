import React, { memo, useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { FixedSizeList as List } from 'react-window'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'
import { fetchAutomation, fetchAutomationLogs } from '@utils/api'
import { formatNumber, formatDate, formatDuration, formatLogLevel } from '@utils/formatters'

// Memoized log entry component
const LogEntry = memo<{
  log: any
}>(({ log }) => {
  const { text: levelText, className: levelClassName } = formatLogLevel(log.level)
  
  return (
    <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0">
        <span className={`px-2 py-1 text-xs font-medium rounded ${levelClassName}`}>
          {levelText}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{log.message}</p>
        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
          <span>{formatDate(log.timestamp)}</span>
          <span>{formatDuration(log.executionTime)}</span>
        </div>
      </div>
    </div>
  )
})

LogEntry.displayName = 'LogEntry'

// Virtualized log list item
const VirtualizedLogItem = memo<{
  index: number
  style: React.CSSProperties
  data: any[]
}>(({ index, style, data }) => {
  const log = data[index]
  
  return (
    <div style={style} className="px-4">
      <LogEntry log={log} />
    </div>
  )
})

VirtualizedLogItem.displayName = 'VirtualizedLogItem'

// Memoized status indicator
const StatusIndicator = memo<{
  status: string
}>(({ status }) => {
  const statusConfig = {
    running: { color: 'bg-green-500', text: 'Running', icon: '▶️' },
    stopped: { color: 'bg-red-500', text: 'Stopped', icon: '⏹️' },
    paused: { color: 'bg-yellow-500', text: 'Paused', icon: '⏸️' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.stopped
  
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`} />
      <span className="text-sm font-medium text-gray-900">{config.text}</span>
      <span className="text-lg">{config.icon}</span>
    </div>
  )
})

StatusIndicator.displayName = 'StatusIndicator'

const AutomationDetail = () => {
  usePerformanceMonitor('AutomationDetail')
  
  const { id } = useParams<{ id: string }>()
  const [logsPage, setLogsPage] = useState(1)
  const [logsLimit] = useState(50)

  // Fetch automation details with optimized caching
  const { data: automation, isLoading: automationLoading } = useQuery(
    ['automation', id],
    () => fetchAutomation(id!),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!id
    }
  )

  // Fetch logs with pagination
  const { data: logsData, isLoading: logsLoading } = useQuery(
    ['automationLogs', id, logsPage, logsLimit],
    () => fetchAutomationLogs(id!, logsPage, logsLimit),
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      enabled: !!id
    }
  )

  // Memoized logs for virtual scrolling
  const logs = useMemo(() => logsData?.logs || [], [logsData])

  // Handle pagination
  const handleLoadMore = useCallback(() => {
    setLogsPage(prev => prev + 1)
  }, [])

  // Virtual list configuration
  const LOG_ITEM_SIZE = 80
  const LOGS_HEIGHT = 400

  if (automationLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="loading-skeleton h-8 mb-4"></div>
          <div className="loading-skeleton h-4 mb-2"></div>
          <div className="loading-skeleton h-4"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="loading-skeleton h-6 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="loading-skeleton h-4"></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="loading-skeleton h-6 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="loading-skeleton h-4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!automation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Automation not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{automation.name}</h1>
          <p className="text-gray-600 mt-2">{automation.description}</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary">Edit</button>
          <button className="btn btn-primary">Run Now</button>
        </div>
      </div>

      {/* Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
          <StatusIndicator status={automation.status} />
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Executions</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(automation.executions)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Success Rate</h3>
          <p className="text-2xl font-bold text-gray-900">
            {automation.successRate}%
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Last Run</h3>
          <p className="text-sm text-gray-900">
            {formatDate(automation.lastRun)}
          </p>
        </div>
      </div>

      {/* Configuration and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Triggers</h3>
              <div className="flex flex-wrap gap-2">
                {automation.config.triggers.map((trigger: string) => (
                  <span
                    key={trigger}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {automation.config.actions.map((action: string) => (
                  <span
                    key={action}
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Schedule</h3>
              <p className="text-sm text-gray-900 font-mono">
                {automation.config.schedule}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Logs</h2>
            <button
              onClick={handleLoadMore}
              disabled={logsLoading}
              className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              Load More
            </button>
          </div>
          
          {logsLoading && logs.length === 0 ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="loading-skeleton h-16"></div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="h-[400px]">
              <List
                height={LOGS_HEIGHT}
                itemCount={logs.length}
                itemSize={LOG_ITEM_SIZE}
                itemData={logs}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {VirtualizedLogItem}
              </List>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No logs available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AutomationDetail