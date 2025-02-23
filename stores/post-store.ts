"use client"

import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Post } from '@/types'
import { toast } from 'sonner'

// Helper function to validate Post type
const isValidPost = (item: unknown): item is Post => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'content' in item &&
    'created_at' in item &&
    'user_id' in item
  )
}

// Define a type for our realtime payloads
type PostChangePayload = RealtimePostgresChangesPayload<{
  old: Post | null
  new: Post | null
}>

interface PostState {
  posts: Post[]
  post: Post | null
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean
  subscription: RealtimeChannel | null
  setPost: (post: Post) => void
  setPosts: (posts: Post[]) => void
  setError: (error: Error | null) => void
  fetchPosts: () => Promise<void>
  fetchPost: (id: string) => Promise<void>
  subscribeToChanges: () => void
  unsubscribe: () => void
  handlePostChange: (post: Post) => void
  handlePostDelete: (id: string) => void
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  post: null,
  isLoading: false,
  error: null,
  hasLoaded: false,
  subscription: null,

  setPost: (post) => set({ post }),
  setPosts: (posts) => set({ posts }),
  setError: (error) => set({ error }),

  handlePostChange: (post) => {
    const { posts } = get()
    const updatedPosts = posts.map(p => 
      p.id === post.id ? post : p
    )
    set({ posts: updatedPosts })
    toast.success('Post updated')
  },

  handlePostDelete: (id) => {
    const { posts } = get()
    const updatedPosts = posts.filter(p => p.id !== id)
    set({ posts: updatedPosts })
    toast.info('Post removed')
  },

  fetchPosts: async () => {
    const { hasLoaded, error } = get()
    // Only return if already loaded and no error
    if (hasLoaded && !error) return

    try {
      set({ isLoading: true, error: null })
      console.log('Fetching posts...') // Debug log
      
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError
      
      // Ensure all required fields are present in the data
      const validData = data?.filter(isValidPost) || []
      
      set({ 
        posts: validData,
        isLoading: false,
        hasLoaded: true
      })

      // Start subscription after initial load
      get().subscribeToChanges()
    } catch (error) {
      console.error('Error fetching posts:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch posts')
      set({ 
        error: err,
        isLoading: false 
      })
      toast.error(err.message)
    }
  },

  fetchPost: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error: fetchError } = await supabase
        .schema('dallas')
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Validate the post data
      if (data && isValidPost(data)) {
        set({ post: data, isLoading: false })
      } else {
        throw new Error('Invalid post data received')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      const err = error instanceof Error ? error : new Error('Failed to fetch post')
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

    console.log('Setting up posts subscription...') // Debug log

    const channel = supabase.channel('posts_changes')
    const subscription = channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'dallas',
        table: 'posts'
      }, (payload: PostChangePayload) => {
        if (payload.new && isValidPost(payload.new)) {
          const { posts } = get()
          set({ posts: [...posts, payload.new] })
          toast.success('New post added')
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'dallas',
        table: 'posts'
      }, (payload: PostChangePayload) => {
        if (payload.new && isValidPost(payload.new)) {
          get().handlePostChange(payload.new)
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'dallas',
        table: 'posts'
      }, (payload: PostChangePayload) => {
        if (payload.old && isValidPost(payload.old)) {
          get().handlePostDelete(payload.old.id)
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
