import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
  interactionTime?: number
}

export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now())
  const renderCountRef = useRef<number>(0)

  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Track render performance
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} render:`, renderTime.toFixed(2), 'ms')
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', 'component_render', {
          event_category: 'Performance',
          event_label: componentName,
          value: Math.round(renderTime)
        })
      }
    }
  })

  // Track component mount time
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} mount:`, mountTime, 'ms')
    }
    
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'component_mount', {
        event_category: 'Performance',
        event_label: componentName,
        value: mountTime
      })
    }
  }, [componentName])

  // Track render count for debugging
  useEffect(() => {
    renderCountRef.current += 1
    
    if (process.env.NODE_ENV === 'development' && renderCountRef.current > 10) {
      console.warn(`[Performance] ${componentName} has rendered ${renderCountRef.current} times`)
    }
  })

  return {
    renderCount: renderCountRef.current,
    mountTime: Date.now() - mountTimeRef.current
  }
}

// Hook for tracking user interactions
export const useInteractionTracker = (componentName: string) => {
  const trackInteraction = (action: string, data?: any) => {
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'user_interaction', {
        event_category: 'Interaction',
        event_label: `${componentName}:${action}`,
        custom_parameters: data
      })
    }
  }

  return { trackInteraction }
}

// Hook for measuring function execution time
export const usePerformanceTimer = () => {
  const measureFunction = <T extends (...args: any[]) => any>(
    fn: T,
    functionName: string
  ): T => {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const startTime = performance.now()
      const result = fn(...args)
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${functionName} execution:`, executionTime.toFixed(2), 'ms')
      }
      
      if (process.env.NODE_ENV === 'production' && window.gtag) {
        window.gtag('event', 'function_execution', {
          event_category: 'Performance',
          event_label: functionName,
          value: Math.round(executionTime)
        })
      }
      
      return result
    }) as T
  }

  return { measureFunction }
}