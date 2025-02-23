import { useEffect } from 'react'
import { useNewsStore } from '@/stores/news-store'
import { toast } from 'sonner'
import type { NewsItem } from '@/types'

interface UseNewsReturn {
  news: NewsItem[]
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean
}

export function useNews(): UseNewsReturn {
  const store = useNewsStore()
  
  useEffect(() => {
    // Only fetch if we haven't loaded before
    if (!store.hasLoaded) {
      store.fetchNews().catch((error) => {
        console.error('Error in useNews effect:', error)
        toast.error('Failed to load news items')
      })
    }

    // Set up subscription
    store.subscribeToChanges()

    // Cleanup subscription on unmount
    return () => {
      store.unsubscribe()
    }
  }, []) // Empty dependency array since we only want to run this once

  return {
    news: store.news,
    isLoading: store.isLoading,
    error: store.error,
    hasLoaded: store.hasLoaded
  }
}