"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, Reply, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import type { Database } from "@/types/supabase"

type CommentRow = Database['dallas']['Tables']['comments']['Row']
type CommentInsert = Database['dallas']['Tables']['comments']['Insert']
type ReactionRow = Database['dallas']['Tables']['reactions']['Row']

interface Comment extends Omit<CommentRow, 'user'> {
  user: {
    handle: string
    avatar?: string | null
  }
  replies?: Comment[]
  reactions: ReactionRow[]
}

interface CommentsDrawerContentProps {
  targetId: string
  targetType: "news_item" | "post"
}

export function CommentsDrawerContent({ targetId, targetType }: CommentsDrawerContentProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [])

  async function fetchComments() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .schema('dallas')
        .from(targetType === "news_item" ? "news_item_comments" : "post_comments")
        .select(`
          comment:comments (
            id,
            content,
            created_at,
            updated_at,
            user_id,
            parent_id,
            user:users (
              handle,
              avatar
            ),
            reactions (
              id,
              type,
              user_id,
              created_at
            )
          )
        `)
        .eq(targetType === "news_item" ? "news_item_id" : "post_id", targetId)
        .order("created_at", { foreignTable: "comments", ascending: false })

      if (error) throw error

      const commentsData = data?.map(item => ({
        ...item.comment,
        user: item.comment.user || { handle: 'Unknown', avatar: null },
        reactions: item.comment.reactions || []
      })) || []

      const threaded = organizeComments(commentsData as Comment[])
      setComments(threaded)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function organizeComments(commentsData: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>()
    const rootComments: Comment[] = []

    commentsData.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    commentsData.forEach((comment) => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(commentMap.get(comment.id)!)
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!)
      }
    })

    return rootComments
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    try {
      const newCommentData: CommentInsert = {
        content: newComment.trim(),
        user_id: user.id,
        parent_id: replyTo,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .schema('dallas')
        .from("comments")
        .insert([newCommentData])
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          parent_id,
          user:users (
            handle,
            avatar
          )
        `)
        .single()

      if (error) throw error

      if (data) {
        const newComment: Comment = {
          ...data,
          user: data.user || { handle: 'Unknown', avatar: null },
          reactions: []
        }

        // Insert the comment relationship with proper typing
        const relationData = targetType === "news_item" 
          ? { 
              comment_id: newComment.id,
              news_item_id: targetId 
            }
          : { 
              comment_id: newComment.id,
              post_id: targetId 
            }

        const { error: relationError } = await supabase
          .schema('dallas')
          .from(targetType === "news_item" ? "news_item_comments" : "post_comments")
          .insert(relationData)

        if (relationError) throw relationError

        setComments(prev => {
          if (replyTo) {
            return prev.map(comment => {
              if (comment.id === replyTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newComment]
                }
              }
              return comment
            })
          }
          return [newComment, ...prev]
        })

        setNewComment("")
        setReplyTo(null)
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    }
  }

  const handleReply = (commentId: string) => {
    setReplyTo(commentId)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          <Button type="submit" disabled={!isAuthenticated}>
            Post Comment
          </Button>
        </div>
      </form>

      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="space-y-4">
            <div className="bg-card p-4 rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>{comment.user.handle[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.user.handle}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.created_at!).toLocaleString()}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleReply(comment.id)}>
                      Reply
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p>{comment.content}</p>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Like ({comment.reactions.filter(r => r.type === 'like').length})
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleReply(comment.id)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
              <ul className="space-y-4 ml-8">
                {comment.replies.map((reply) => (
                  <li key={reply.id} className="bg-card p-4 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={reply.user.avatar || undefined} />
                          <AvatarFallback>{reply.user.handle[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reply.user.handle}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(reply.created_at!).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>{reply.content}</p>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Like ({reply.reactions.filter(r => r.type === 'like').length})
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
