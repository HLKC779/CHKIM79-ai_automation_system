import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { QueryClient, useQueryClient } from 'react-query'
import LoadingSpinner from '@components/LoadingSpinner'
import ErrorBoundary from '@components/ErrorBoundary'
import Navigation from '@components/Navigation'
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor'

// Lazy load components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AutomationList = lazy(() => import('@/pages/AutomationList'))
const AutomationDetail = lazy(() => import('@/pages/AutomationDetail'))
const Settings = lazy(() => import('@/pages/Settings'))

// Performance monitoring hook
const useAppPerformance = () => {
  const queryClient = useQueryClient()
  
  // Monitor query cache performance
  React.useEffect(() => {
    const interval = setInterval(() => {
      const queries = queryClient.getQueryCache().getAll()
      const cacheSize = queries.length
      
      if (cacheSize > 100) {
        console.warn('Large query cache detected:', cacheSize, 'queries')
        // Implement cache cleanup if needed
      }
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [queryClient])
}

function App() {
  useAppPerformance()
  usePerformanceMonitor('App')

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/automations" element={<AutomationList />} />
              <Route path="/automations/:id" element={<AutomationDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App