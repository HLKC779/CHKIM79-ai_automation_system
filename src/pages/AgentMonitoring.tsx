import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  agentApi, 
  taskApi, 
  subscribeToAgentUpdates, 
  subscribeToTaskUpdates,
  subscribeToSystemMetrics,
  agentWebSocket
} from '../utils/agentApi'
import type { 
  Agent, 
  Task, 
  SystemMetrics, 
  AgentStatus,
  AgentType
} from '../types/agent.types'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'

export default function AgentMonitoring() {
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)

  // Fetch agents list
  const { data: agentsData, isLoading: agentsLoading } = useQuery(
    'agents',
    () => agentApi.listAgents(),
    {
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  )

  // Fetch tasks
  const { data: tasksData } = useQuery(
    'tasks',
    () => taskApi.listTasks(),
    {
      refetchInterval: 3000,
    }
  )

  // Agent control mutations
  const startAgentMutation = useMutation(
    (agentId: string) => agentApi.startAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents')
      }
    }
  )

  const stopAgentMutation = useMutation(
    (agentId: string) => agentApi.stopAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents')
      }
    }
  )

  const restartAgentMutation = useMutation(
    (agentId: string) => agentApi.restartAgent(agentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('agents')
      }
    }
  )

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to system metrics
    const unsubscribeMetrics = subscribeToSystemMetrics((metrics) => {
      setSystemMetrics(metrics)
    })

    // Subscribe to agent updates
    const handleAgentUpdate = (agent: Agent) => {
      queryClient.setQueryData('agents', (old: any) => {
        if (!old) return old
        return {
          ...old,
          agents: old.agents.map((a: Agent) => 
            a.id === agent.id ? agent : a
          )
        }
      })
    }

    agentsData?.agents.forEach(agent => {
      subscribeToAgentUpdates(agent.id, handleAgentUpdate)
    })

    // Subscribe to task updates
    subscribeToTaskUpdates((task) => {
      queryClient.invalidateQueries('tasks')
    })

    return () => {
      // Cleanup subscriptions
      agentWebSocket.disconnect()
    }
  }, [agentsData, queryClient])

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'idle': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      case 'maintenance': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getAgentTypeIcon = (type: AgentType) => {
    switch (type) {
      case 'orchestrator': return '🎭'
      case 'worker': return '⚙️'
      case 'monitor': return '👁️'
      case 'analyzer': return '📊'
      case 'executor': return '🚀'
      case 'validator': return '✓'
      default: return '🤖'
    }
  }

  if (agentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with System Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Agent Monitoring Dashboard</h1>
        
        {systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
              <div className="text-2xl font-semibold">{systemMetrics.totalAgents}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
              <div className="text-2xl font-semibold text-green-600">{systemMetrics.activeAgents}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              <div className="text-2xl font-semibold">{systemMetrics.totalTasks}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              <div className="text-2xl font-semibold text-green-600">{systemMetrics.completedTasks}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
              <div className="text-2xl font-semibold text-red-600">{systemMetrics.failedTasks}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">System Load</div>
              <div className="text-2xl font-semibold">{systemMetrics.systemLoad.toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agentsData?.agents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getAgentTypeIcon(agent.type)}</span>
                <div>
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{agent.type}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
            </div>

            {/* Agent Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium capitalize">{agent.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Capabilities:</span>
                <span className="font-medium">{agent.capabilities.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Max Tasks:</span>
                <span className="font-medium">{agent.config.maxConcurrentTasks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(agent.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Agent Metadata */}
            <div className="border-t pt-3 mb-4">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div>Host: {agent.metadata.host}:{agent.metadata.port}</div>
                <div>Version: {agent.metadata.version}</div>
                {agent.metadata.region && <div>Region: {agent.metadata.region}</div>}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-2">
              {agent.status === 'offline' ? (
                <button
                  onClick={() => startAgentMutation.mutate(agent.id)}
                  disabled={startAgentMutation.isLoading}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {startAgentMutation.isLoading ? 'Starting...' : 'Start'}
                </button>
              ) : (
                <button
                  onClick={() => stopAgentMutation.mutate(agent.id)}
                  disabled={stopAgentMutation.isLoading}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {stopAgentMutation.isLoading ? 'Stopping...' : 'Stop'}
                </button>
              )}
              <button
                onClick={() => restartAgentMutation.mutate(agent.id)}
                disabled={restartAgentMutation.isLoading || agent.status === 'offline'}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {restartAgentMutation.isLoading ? 'Restarting...' : 'Restart'}
              </button>
              <button
                onClick={() => setSelectedAgent(agent.id)}
                className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Queue Overview */}
      {tasksData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Task Queue</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Queue Length</span>
              <span className="text-lg font-semibold">{tasksData.queueLength}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium">Processing Rate</span>
              <span className="text-lg font-semibold">{tasksData.processingRate} tasks/min</span>
            </div>
          </div>
          
          {/* Recent Tasks */}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Recent Tasks</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasksData.tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'failed' ? 'bg-red-500' :
                      task.status === 'in_progress' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="font-medium">{task.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 dark:text-gray-400">Priority: {task.priority}</span>
                    <span className="capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}