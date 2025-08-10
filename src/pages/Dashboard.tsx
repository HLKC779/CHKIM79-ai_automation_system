import React, { memo, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { FixedSizeList as List } from 'react-window'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'
import { usePerformanceTimer } from '@hooks/usePerformanceMonitor'
import { fetchDashboardData, fetchRecentAutomations } from '@utils/api'
import { formatNumber, formatDate } from '@utils/formatters'
import { debounce } from 'lodash-es'

// Memoized stat card component
const StatCard = memo<{
  title: string
  value: string | number
  change?: number
  icon: string
}>(({ title, value, change, icon }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
))

StatCard.displayName = 'StatCard'

// Virtualized automation row component
const AutomationRow = memo<{
  index: number
  style: React.CSSProperties
  data: any[]
}>(({ index, style, data }) => {
  const automation = data[index]
  
  return (
    <div style={style} className="border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            automation.status === 'running' ? 'bg-green-500' :
            automation.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <div>
            <h3 className="font-medium text-gray-900">{automation.name}</h3>
            <p className="text-sm text-gray-500">{automation.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatNumber(automation.executions)}
          </p>
          <p className="text-xs text-gray-500">
            Last run: {formatDate(automation.lastRun)}
          </p>
        </div>
      </div>
    </div>
  )
})

AutomationRow.displayName = 'AutomationRow'

const Dashboard = () => {
  usePerformanceMonitor('Dashboard')
  const { measureFunction } = usePerformanceTimer()

  // Optimized data fetching with caching
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'dashboard',
    measureFunction(fetchDashboardData, 'fetchDashboardData'),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const { data: automations, isLoading: automationsLoading } = useQuery(
    'recentAutomations',
    measureFunction(fetchRecentAutomations, 'fetchRecentAutomations'),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Memoized stats data
  const stats = useMemo(() => {
    if (!dashboardData) return []
    
    return [
      {
        title: 'Total Automations',
        value: dashboardData.totalAutomations,
        change: dashboardData.automationGrowth,
        icon: '🤖'
      },
      {
        title: 'Active Processes',
        value: dashboardData.activeProcesses,
        change: dashboardData.processGrowth,
        icon: '⚡'
      },
      {
        title: 'Success Rate',
        value: `${dashboardData.successRate}%`,
        change: dashboardData.successRateChange,
        icon: '📈'
      },
      {
        title: 'Total Executions',
        value: formatNumber(dashboardData.totalExecutions),
        change: dashboardData.executionGrowth,
        icon: '🔄'
      }
    ]
  }, [dashboardData])

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((query: string) => {
      // Implement search logic
      console.log('Searching for:', query)
    }, 300),
    []
  )

  // Virtual list item size
  const ITEM_SIZE = 80

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="loading-skeleton h-20"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Monitor your AI automation performance</p>
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search automations..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="btn btn-primary">
            New Automation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Automations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Automations</h2>
        
        {automationsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="loading-skeleton h-16"></div>
            ))}
          </div>
        ) : automations && automations.length > 0 ? (
          <div className="h-96">
            <List
              height={384}
              itemCount={automations.length}
              itemSize={ITEM_SIZE}
              itemData={automations}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {AutomationRow}
            </List>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No automations found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard