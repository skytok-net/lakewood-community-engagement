import { useEffect } from 'react'
import { usePostStore } from '@/stores/post-store'
import { toast } from 'sonner'
import type { Post, PostInsert } from '@/types'

interface UsePostsReturn {
  posts: Post[]
  isLoading: boolean
  error: Error | null
  hasLoaded: boolean
  createPost: (postInsert: PostInsert) => Promise<Post | Error>
  deletePost: (id: string) => Promise<Post | Error>
}

export function usePosts(): UsePostsReturn {
  const store = usePostStore()
  
  useEffect(() => {
    // Only fetch if we haven't loaded before
    if (!store.hasLoaded) {
      store.fetchPosts().catch((error) => {
        console.error('Error in usePosts effect:', error)
        toast.error('Failed to load posts')
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
    posts: store.posts,
    isLoading: store.isLoading,
    error: store.error,
    hasLoaded: store.hasLoaded,
    createPost: store.createPost,
    deletePost: store.deletePost
  }
}
