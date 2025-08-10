import React, { memo, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'
import { fetchSettings, updateSettings } from '@utils/api'

// Memoized setting field component
const SettingField = memo<{
  label: string
  type: 'text' | 'number' | 'checkbox' | 'select'
  value: any
  onChange: (value: any) => void
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
}>(({ label, type, value, onChange, options, placeholder, min, max }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
    </div>
    <div className="flex-1 max-w-xs">
      {type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      )}
    </div>
  </div>
))

SettingField.displayName = 'SettingField'

// Memoized settings section component
const SettingsSection = memo<{
  title: string
  children: React.ReactNode
}>(({ title, children }) => (
  <div className="card">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
    <div className="space-y-2">
      {children}
    </div>
  </div>
))

SettingsSection.displayName = 'SettingsSection'

const Settings = () => {
  usePerformanceMonitor('Settings')
  
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Fetch settings with optimized caching
  const { data: settings, isLoading } = useQuery(
    'settings',
    fetchSettings,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    updateSettings,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings')
        setSaveMessage('Settings saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      },
      onError: () => {
        setSaveMessage('Failed to save settings. Please try again.')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    }
  )

  // Local state for form values
  const [formValues, setFormValues] = useState(settings || {})

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormValues(settings)
    }
  }, [settings])

  // Handle form field changes
  const handleFieldChange = useCallback((section: string, field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      await updateSettingsMutation.mutateAsync(formValues)
    } finally {
      setIsSaving(false)
    }
  }, [formValues, updateSettingsMutation])

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    if (settings) {
      setFormValues(settings)
    }
  }, [settings])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="loading-skeleton h-8 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="loading-skeleton h-12"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your AI automation system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={isSaving}
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingField
            label="Email Notifications"
            type="checkbox"
            value={formValues.notifications?.email || false}
            onChange={(value) => handleFieldChange('notifications', 'email', value)}
          />
          <SettingField
            label="Slack Notifications"
            type="checkbox"
            value={formValues.notifications?.slack || false}
            onChange={(value) => handleFieldChange('notifications', 'slack', value)}
          />
          <SettingField
            label="Webhook URL"
            type="text"
            value={formValues.notifications?.webhook || ''}
            onChange={(value) => handleFieldChange('notifications', 'webhook', value)}
            placeholder="https://hooks.slack.com/services/..."
          />
        </SettingsSection>

        {/* Performance Section */}
        <SettingsSection title="Performance">
          <SettingField
            label="Max Concurrent Processes"
            type="number"
            value={formValues.performance?.maxConcurrentProcesses || 10}
            onChange={(value) => handleFieldChange('performance', 'maxConcurrentProcesses', value)}
            min={1}
            max={50}
          />
          <SettingField
            label="Timeout (seconds)"
            type="number"
            value={formValues.performance?.timeoutSeconds || 300}
            onChange={(value) => handleFieldChange('performance', 'timeoutSeconds', value)}
            min={30}
            max={3600}
          />
          <SettingField
            label="Retry Attempts"
            type="number"
            value={formValues.performance?.retryAttempts || 3}
            onChange={(value) => handleFieldChange('performance', 'retryAttempts', value)}
            min={0}
            max={10}
          />
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection title="Security">
          <SettingField
            label="API Key Rotation (days)"
            type="number"
            value={formValues.security?.apiKeyRotation || 30}
            onChange={(value) => handleFieldChange('security', 'apiKeyRotation', value)}
            min={1}
            max={365}
          />
          <SettingField
            label="Session Timeout (minutes)"
            type="number"
            value={formValues.security?.sessionTimeout || 60}
            onChange={(value) => handleFieldChange('security', 'sessionTimeout', value)}
            min={5}
            max={1440}
          />
        </SettingsSection>
      </form>
    </div>
  )
}

export default Settings