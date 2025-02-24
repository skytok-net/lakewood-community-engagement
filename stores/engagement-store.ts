"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface EngagementState {
  likes: Record<string, boolean>
  comments: Record<string, { id: string; content: string; timestamp: number }[]>
  isLoading: boolean
  error: Error | null
}

interface EngagementStore extends EngagementState {
  addLike: (postId: string) => Promise<void>
  removeLike: (postId: string) => Promise<void>
  addComment: (postId: string, comment: string) => Promise<void>
  removeComment: (postId: string, commentId: string) => Promise<void>
  clearError: () => void
}

export const useEngagementStore = create<EngagementStore>()(
  persist(
    (set, get) => ({
      likes: {},
      comments: {},
      isLoading: false,
      error: null,

      addLike: async (postId: string) => {
        try {
          set({ isLoading: true, error: null })
          // Here you would typically make an API call
          set((state) => ({
            likes: { ...state.likes, [postId]: true },
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      removeLike: async (postId: string) => {
        try {
          set({ isLoading: true, error: null })
          // Here you would typically make an API call
          set((state) => {
            const { [postId]: _, ...rest } = state.likes
            return { likes: rest, isLoading: false }
          })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      addComment: async (postId: string, content: string) => {
        try {
          set({ isLoading: true, error: null })
          const comment = {
            id: crypto.randomUUID(),
            content,
            timestamp: Date.now()
          }
          set((state) => ({
            comments: {
              ...state.comments,
              [postId]: [...(state.comments[postId] || []), comment],
            },
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      removeComment: async (postId: string, commentId: string) => {
        try {
          set({ isLoading: true, error: null })
          set((state) => ({
            comments: {
              ...state.comments,
              [postId]: state.comments[postId]?.filter((comment) => comment.id !== commentId) || [],
            },
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: "engagement-store",
      partialize: (state) => ({
        likes: state.likes,
        comments: state.comments,
      })
    }
  )
)