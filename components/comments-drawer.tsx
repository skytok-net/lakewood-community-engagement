"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Reply, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabaseClient"

interface Comment {
  id: string
  content: string
  created_at: string
  user_did: string
  parent_id: string | null
  user: {
    handle: string
    avatar?: string
  }
  replies?: Comment[]
  reactions: {
    type: string
    count: number
  }[]
}

interface CommentsDrawerProps {
  targetId: string
  targetType: "news_item" | "post"
  isOpen: boolean
  onClose: () => void
}

export function CommentsDrawer({ targetId, targetType, isOpen, onClose }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && targetId) {
      fetchComments()
    }
  }, [isOpen, targetId])

  async function fetchComments() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from(targetType === "news_item" ? "news_item_comments" : "post_comments")
        .select(`
          comment:comments (
            id,
            content,
            created_at,
            user_did,
            parent_id,
            user:user_did (
              handle,
              avatar
            ),
            reactions (
              type,
              count:reactions_count
            )
          )
        `)
        .eq(targetType === "news_item" ? "news_item_id" : "post_id", targetId)
        .order("created_at", { foreignTable: "comments", ascending: false })

      if (error) throw error

      const commentsData = data.map((item) => item.comment)

      // Organize comments into threads
      const threaded = commentsData.reduce((acc: { [key: string]: Comment }, comment: Comment) => {
        if (!comment.parent_id) {
          comment.replies = []
          acc[comment.id] = comment
        } else {
          const parent = acc[comment.parent_id]
          if (parent) {
            parent.replies = parent.replies || []
            parent.replies.push(comment)
          }
        }
        return acc
      }, {})

      setComments(Object.values(threaded))
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !newComment.trim()) return

    try {
      const { data: commentData, error: commentError } = await supabase
        .from("comments")
        .insert({
          content: newComment,
          user_did: user?.did,
          parent_id: replyTo,
        })
        .select()
        .single()

      if (commentError) throw commentError

      const { error: junctionError } = await supabase
        .from(targetType === "news_item" ? "news_item_comments" : "post_comments")
        .insert({
          [targetType === "news_item" ? "news_item_id" : "post_id"]: targetId,
          comment_id: commentData.id,
        })

      if (junctionError) throw junctionError

      setNewComment("")
      setReplyTo(null)
      fetchComments()
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  const handleReaction = async (commentId: string, reactionType: string) => {
    if (!isAuthenticated) return

    try {
      await supabase.rpc("add_comment_reaction", {
        p_comment_id: commentId,
        p_user_did: user?.did,
        p_reaction_type: reactionType,
      })
      fetchComments()
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const CommentComponent = ({ comment }: { comment: Comment }) => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatar} />
          <AvatarFallback>{comment.user?.handle?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.user?.handle}</span>
              <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                {user?.did === comment.user_did && (
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-4">
            {["👍", "❤️", "😂", "😮"].map((reaction) => (
              <Button
                key={reaction}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleReaction(comment.id, reaction)}
              >
                {reaction} {comment.reactions.find((r) => r.type === reaction)?.count || 0}
              </Button>
            ))}
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setReplyTo(comment.id)}>
              <Reply className="h-4 w-4 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="ml-12">
          <CommentComponent comment={reply} />
        </div>
      ))}
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background border-l z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h3 className="font-semibold">Comments</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Reply className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            {replyTo && (
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Replying to comment...</span>
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isAuthenticated ? "Write a comment..." : "Login to comment"}
                disabled={!isAuthenticated}
                className="flex-1"
                rows={2}
              />
              <Button onClick={handleSubmitComment} disabled={!isAuthenticated || !newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

