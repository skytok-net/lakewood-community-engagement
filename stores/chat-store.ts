
import type { ChatMessage } from "@/types/chat"
import { create } from "zustand"

interface ChatState {
    messages: ChatMessage[]
    addMessage: (message: ChatMessage) => void
    clearMessages: () => void
    updateMessage: (message: ChatMessage) => void
    deleteMessage: (id: string) => void
    sendMessage: (message: ChatMessage) => void
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    addMessage: (message: ChatMessage) => set((state) => ({ messages: [...state.messages, message] })),
    clearMessages: () => set({ messages: [] }),
    updateMessage: (message: ChatMessage) => set((state) => ({
        messages: state.messages.map((m) => (m.id === message.id ? message : m))
    })),
    deleteMessage: (id: string) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id)
    })),
    sendMessage: (message: ChatMessage) => set((state) => ({
        messages: [...state.messages, message]
    }))
}))
