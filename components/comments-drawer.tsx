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

type Comment = {
  id: string
  content: string
  created_at: string | null
  user_id: string | null
  parent_id: string | null
  user: {
    id: string
    handle: string
    avatar: string | null
  } | null
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
        .schema('dallas')
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          parent_id,
          user:users!user_id (
            id,
            handle,
            avatar
          ),
          reactions:comment_reactions (
            type,
            count:count
          )
        `)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match our Comment type
      const commentsData = data.map((item): Comment => {
        // Ensure reactions is always an array of the correct shape
        const reactions = Array.isArray(item.reactions) 
          ? item.reactions.map(r => ({
              type: String(r.type),
              count: Number(r.count) || 0
            }))
          : [];

        // Ensure user object is properly typed
        const user = item.user ? {
          id: item.user.id,
          handle: item.user.handle,
          avatar: item.user.avatar || null
        } : null;

        return {
          id: item.id,
          content: item.content,
          created_at: item.created_at || null,
          user_id: item.user_id || null,
          parent_id: item.parent_id || null,
          user,
          reactions
        };
      });

      // Organize comments into threads
      const threaded = commentsData.reduce<{ [key: string]: Comment }>((acc, comment) => {
        if (!comment.parent_id) {
          // This is a root comment
          acc[comment.id] = { ...comment, replies: [] };
        } else {
          // This is a reply
          const parent = acc[comment.parent_id];
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        }
        return acc;
      }, {});

      setComments(Object.values(threaded))
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !isAuthenticated || !user?.id || !user?.did) return

    try {
      const { data: commentData, error: commentError } = await supabase
        .schema('dallas')
        .from('comments')
        .insert({
          content: newComment,  
          user_id: user.id,
          user_did: user.did,
          parent_id: replyTo,
          target_id: targetId,
          target_type: targetType,
        })
        .select()
        .single()

      if (commentError) throw commentError

      setNewComment("")
      setReplyTo(null)
      fetchComments()
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  const handleReaction = async (commentId: string, reactionType: string) => {
    if (!isAuthenticated || !user?.id || !user?.did) return

    try {
      await supabase
        .schema('dallas')
        .rpc("add_comment_reaction", {
          p_comment_id: commentId,
          p_user_id: user.id,
          p_user_did: user.did,
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
          <AvatarImage src={comment.user?.avatar || undefined} />
          <AvatarFallback>{comment.user?.handle?.[0]?.toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.user?.handle || 'Anonymous'}</span>
              <span className="text-xs text-muted-foreground">
                {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Unknown date'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                {user?.id === comment.user_id && (
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
