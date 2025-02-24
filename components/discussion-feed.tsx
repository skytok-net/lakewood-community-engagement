"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Share2, AlertCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/hooks/use-auth"
import { CommentsDrawer } from "./comments-drawer"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { usePosts } from "@/hooks/use-posts"
import type { Post } from "@/types"
import { z } from "zod"

const postSchema = z.object({
  content: z.string()
    .min(1, "Post content cannot be empty")
    .max(2000, "Post content cannot exceed 2000 characters"),
  title: z.string()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters"),
  user_id: z.string().uuid("Invalid user ID")
})

type PostInput = z.infer<typeof postSchema>

export function DiscussionFeed() {
  const { posts, isLoading, error, createPost, deletePost } = usePosts()
  const [newPost, setNewPost] = useState("")
  const [showComments, setShowComments] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const handleSubmitPost = async () => {
    if (!isAuthenticated || !user?.id) return

    try {
      // Generate a title from the first few words of the content
      const title = newPost.split(' ').slice(0, 5).join(' ') + '...'

      // Validate the input data
      const validatedData = postSchema.parse({
        content: newPost.trim(),
        title,
        user_id: user.id
      })

      const result = await createPost(validatedData)

      if (result instanceof Error) throw result

      setNewPost("")
      toast({
        title: "Success",
        description: "Your post has been published!",
      })
    } catch (error) {
      console.error("Error creating post:", error)
      
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(", ")
        toast({
          title: "Validation Error",
          description: errorMessages,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      const result = await deletePost(postId)
      if (result instanceof Error) throw result
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: `Post by ${user?.handle || 'Anonymous'}`,
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`
      })
    } catch (error) {
      // Only show error if it's not a user cancellation
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share the post. Try copying the link instead.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={isAuthenticated ? "Start a discussion..." : "Login to post"}
            disabled={!isAuthenticated}
            className="w-full"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSubmitPost} disabled={!isAuthenticated || !newPost.trim() || !user?.id}>
              Post
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.message || 'An error occurred while loading posts'}</AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No posts yet. Be the first to start a discussion!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-6 border-b pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.handle?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{user?.handle || "Anonymous"}</span>
                    <span className="text-sm text-muted-foreground">
                      {post.created_at 
                        ? new Date(post.created_at).toLocaleDateString()
                        : 'Date not available'}
                    </span>
                  </div>
                  <div className="mt-2 prose dark:prose-invert">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(post.id)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Comments
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-2"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {showComments && (
          <CommentsDrawer
            targetId={showComments}
            targetType="post"
            isOpen={!!showComments}
            onClose={() => setShowComments(null)}
          />
        )}
      </CardContent>
    </Card>
  )
}
