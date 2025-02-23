"use client"

import { create, type StateCreator } from "zustand"
import { persist, createJSONStorage, type PersistOptions } from "zustand/middleware"

export interface EngagementState {
  likes: Record<string, boolean>
  comments: Record<string, string[]>
  isLoading: boolean
  error: Error | null
}

// Type for the persisted portion of the state
type PersistedEngagementState = Pick<EngagementState, 'likes' | 'comments'>

interface EngagementStore extends EngagementState {
  addLike: (postId: string) => void
  removeLike: (postId: string) => void
  addComment: (postId: string, comment: string) => void
  removeComment: (postId: string, commentId: string) => void
}

type EngagementPersist = (
  config: StateCreator<EngagementStore>,
  options: PersistOptions<EngagementStore, PersistedEngagementState>
) => StateCreator<EngagementStore>

export const useEngagementStore = create<EngagementStore>()(
  (persist as EngagementPersist)(
    (set) => ({
      likes: {},
      comments: {},
      isLoading: false,
      error: null,

      addLike: (postId: string) =>
        set((state) => ({
          likes: { ...state.likes, [postId]: true },
        })),

      removeLike: (postId: string) =>
        set((state) => {
          const { [postId]: _, ...rest } = state.likes
          return { likes: rest }
        }),

      addComment: (postId: string, comment: string) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: [...(state.comments[postId] || []), comment],
          },
        })),

      removeComment: (postId: string, commentId: string) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [postId]: state.comments[postId]?.filter((id) => id !== commentId) || [],
          },
        })),
    }),
    {
      name: "engagement-store",
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
      }),
      partialize: (state): PersistedEngagementState => ({
        likes: state.likes,
        comments: state.comments,
      }),
    }
  )
)