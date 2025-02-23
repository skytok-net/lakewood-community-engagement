"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import type { Comment } from "@/types"

export function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const { agent, isAuthenticated } = useAuth()

  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase.schema('dallas').from("comments").select("*").order("created_at", { ascending: false })
      if (error) {
        console.error("Error fetching comments:", error)
        return
      }
      setComments(data || [])
    }
    fetchComments()
  }, [])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const { data, error } = await supabase
      .schema('dallas')
      .from("comments")
      .insert({ content: newComment, user_did: agent?.session?.did })
      .select()
      .single()

    if (error) {
      console.error("Error submitting comment:", error)
      return
    }
    
    if (data) {
      setComments(prev => [data as Comment, ...prev])
      setNewComment("")
    }
  }

  const handleCrossPost = async () => {
    if (isAuthenticated && agent) {
      // Implement cross-posting to BlueSky using AT Protocol
      // This is a placeholder for the actual implementation
      console.log("Cross-posting to BlueSky:", newComment)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Discussion</h2>
      <div className="mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full"
        />
        <div className="flex justify-end mt-2 space-x-2">
          <Button onClick={handleSubmitComment}>Submit Comment</Button>
          {isAuthenticated && (
            <Button onClick={handleCrossPost} variant="outline">
              Cross-post to BlueSky
            </Button>
          )}
        </div>
      </div>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="bg-card p-4 rounded-lg">
            <p>{comment.content}</p>
            <span className="text-sm text-muted-foreground">{comment.created_at!.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
