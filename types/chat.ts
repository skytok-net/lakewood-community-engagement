

export interface ChatMessage {
    id: string
    sender?: {
        userId?: string
        did?: string
        name: string
        avatar?: string
    }
    role: "user" | "assistant" | "system" | "tool" | "function"
    content: string
    timestamp: Date
    markdown?: boolean
}