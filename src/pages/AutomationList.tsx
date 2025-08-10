import React, { memo, useState, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { FixedSizeList as List } from 'react-window'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'
import { fetchRecentAutomations } from '@utils/api'
import { formatNumber, formatDate, formatStatus } from '@utils/formatters'
import { debounce } from 'lodash-es'

// Memoized automation card component
const AutomationCard = memo<{
  automation: any
  onSelect: (id: string) => void
}>(({ automation, onSelect }) => (
  <div 
    className="card cursor-pointer hover:shadow-md transition-shadow duration-200"
    onClick={() => onSelect(automation.id)}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`w-3 h-3 rounded-full ${
          automation.status === 'running' ? 'bg-green-500' :
          automation.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
        <div>
          <h3 className="font-semibold text-gray-900">{automation.name}</h3>
          <p className="text-sm text-gray-600">{automation.description}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatNumber(automation.executions)} executions
        </p>
        <p className="text-xs text-gray-500">
          Last run: {formatDate(automation.lastRun)}
        </p>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        automation.status === 'running' ? 'bg-green-100 text-green-800' :
        automation.status === 'stopped' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {formatStatus(automation.status)}
      </span>
      <span className="text-sm text-gray-500">
        {automation.successRate}% success rate
      </span>
    </div>
  </div>
))

AutomationCard.displayName = 'AutomationCard'

// Virtualized list item component
const VirtualizedAutomationItem = memo<{
  index: number
  style: React.CSSProperties
  data: { automations: any[]; onSelect: (id: string) => void }
}>(({ index, style, data }) => {
  const automation = data.automations[index]
  
  return (
    <div style={style} className="px-4">
      <AutomationCard 
        automation={automation} 
        onSelect={data.onSelect}
      />
    </div>
  )
})

VirtualizedAutomationItem.displayName = 'VirtualizedAutomationItem'

const AutomationList = () => {
  usePerformanceMonitor('AutomationList')
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Fetch automations with optimized caching
  const { data: automations = [], isLoading } = useQuery(
    'automations',
    fetchRecentAutomations,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Memoized filtered and sorted automations
  const filteredAutomations = useMemo(() => {
    let filtered = automations

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(automation =>
        automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        automation.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(automation => automation.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'executions':
          return b.executions - a.executions
        case 'lastRun':
          return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime()
        case 'successRate':
          return b.successRate - a.successRate
        default:
          return 0
      }
    })

    return filtered
  }, [automations, searchQuery, statusFilter, sortBy])

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
    }, 300),
    []
  )

  // Handle automation selection
  const handleAutomationSelect = useCallback((id: string) => {
    // Navigate to automation detail page
    window.location.href = `/automations/${id}`
  }, [])

  // Virtual list configuration
  const ITEM_SIZE = 120
  const LIST_HEIGHT = 600

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
          <button className="btn btn-primary">New Automation</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card">
              <div className="loading-skeleton h-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-600">
            {filteredAutomations.length} of {automations.length} automations
          </p>
        </div>
        <button className="btn btn-primary">New Automation</button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search automations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="paused">Paused</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="executions">Sort by Executions</option>
            <option value="lastRun">Sort by Last Run</option>
            <option value="successRate">Sort by Success Rate</option>
          </select>
        </div>
      </div>

      {/* Automation List */}
      <div className="card">
        {filteredAutomations.length > 0 ? (
          <div className="h-[600px]">
            <List
              height={LIST_HEIGHT}
              itemCount={filteredAutomations.length}
              itemSize={ITEM_SIZE}
              itemData={{ automations: filteredAutomations, onSelect: handleAutomationSelect }}
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              {VirtualizedAutomationItem}
            </List>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No automations found</p>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AutomationList