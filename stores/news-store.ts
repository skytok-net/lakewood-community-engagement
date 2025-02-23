"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabaseClient'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { NewsItem } from '@/types'
import { toast } from 'sonner'

// Helper function to validate NewsItem type
const isValidNewsItem = (item: unknown): item is NewsItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'content' in item &&
    'created_at' in item &&
    'source' in item
  )
}

// Define a type for our realtime payloads
type NewsChangePayload = RealtimePostgresChangesPayload<{
  old: NewsItem | null
  new: NewsItem | null
}>

interface NewsState {
  news: NewsItem[]
  newsItem: NewsItem | null
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean
  subscription: RealtimeChannel | null
  setNewsItem: (newsItem: NewsItem) => void
  setNews: (news: NewsItem[]) => void
  setError: (error: Error | null) => void
  fetchNews: () => Promise<void>
  fetchNewsItem: (id: string) => Promise<void>
  subscribeToChanges: () => void
  unsubscribe: () => void
  handleNewsChange: (newsItem: NewsItem) => void
  handleNewsDelete: (id: string) => void
}

export const useNewsStore = create<NewsState>((set, get) => ({
  news: [],
  newsItem: null,
  isLoading: false,
  error: null,
  hasLoaded: false,
  subscription: null,

  setNewsItem: (newsItem) => set({ newsItem }),
  setNews: (news) => set({ news }),
  setError: (error) => set({ error }),

  handleNewsChange: (newsItem) => {
    const { news } = get()
    const updatedNews = news.map(n => 
      n.id === newsItem.id ? newsItem : n
    )
    set({ news: updatedNews })
    toast.success('News updated')
  },

  handleNewsDelete: (id) => {
    const { news } = get()
    const updatedNews = news.filter(n => n.id !== id)
    set({ news: updatedNews })
    toast.info('News item removed')
  },

  fetchNews: async () => {
    const { hasLoaded, error } = get()
    // Only return if already loaded and no error
    if (hasLoaded && !error) return

    try {
      set({ isLoading: true, error: null })
      console.log('Fetching news items...') // Debug log
      
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError
      
      // Ensure all required fields are present in the data
      const validData = data?.filter(isValidNewsItem) || []
      
      set({ 
        news: validData,
        isLoading: false,
        hasLoaded: true
      })

      // Start subscription after initial load
      get().subscribeToChanges()
    } catch (error) {
      console.error('Error fetching news:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch news')
      set({ 
        error: err,
        isLoading: false 
      })
      toast.error(err.message)
    }
  },

  fetchNewsItem: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('news_items')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Validate the news data
      if (data && isValidNewsItem(data)) {
        set({ newsItem: data, isLoading: false })
      } else {
        throw new Error('Invalid news data received')
      }
    } catch (error) {
      console.error('Error fetching news item:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch news item')
      set({ 
        error: err,
        isLoading: false 
      })
      toast.error(err.message)
    }
  },

  subscribeToChanges: () => {
    const state = get()
    // Clean up existing subscription
    state.unsubscribe()

    console.log('Setting up news subscription...') // Debug log

    const channel = supabase.channel('news_changes')
    const subscription = channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'dallas',
        table: 'news_items'
      }, (payload: NewsChangePayload) => {
        if (payload.new && isValidNewsItem(payload.new)) {
          const { news } = get()
          set({ news: [...news, payload.new] })
          toast.success('New news item added')
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'dallas',
        table: 'news_items'
      }, (payload: NewsChangePayload) => {
        if (payload.new && isValidNewsItem(payload.new)) {
          get().handleNewsChange(payload.new)
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'dallas',
        table: 'news_items'
      }, (payload: NewsChangePayload) => {
        if (payload.old && isValidNewsItem(payload.old)) {
          get().handleNewsDelete(payload.old.id)
        }
      })
      .subscribe((status, err) => {
        console.log('Subscription status:', status, err) // Debug log
        if (err) {
          console.error('Subscription error:', err)
          toast.error(err.message)
          // Retry subscription after error
          setTimeout(() => get().subscribeToChanges(), 5000)
        }
      })

    set({ subscription })
  },

  unsubscribe: () => {
    const { subscription } = get()
    if (subscription) {
      subscription.unsubscribe()
      set({ subscription: null })
    }
  }
}))
