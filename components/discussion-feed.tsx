"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
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

interface Post {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    id: string
    did: string
    handle: string
    display_name: string
    avatar?: string
  } | null
}

export function DiscussionFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [showComments, setShowComments] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .schema('dallas')
        .from("posts")
        .select(`
          id,
          content,
          created_at,
          user_id,
          user:user_id (
            id,
            did,
            handle,
            display_name,
            avatar
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPosts(data || [])
    } catch (error: any) {
      console.error("Error fetching posts:", error)
      setError("Failed to load posts. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitPost = async () => {
    if (!isAuthenticated || !newPost.trim()) return

    try {
      // First, ensure the user profile exists
      const { error: profileError } = await supabase.from("user_profiles").upsert({
        did: user?.did,
        handle: user?.handle || "anonymous",
        avatar: user?.avatar,
      })

      if (profileError) throw profileError

      // Then create the post
      const { error: postError } = await supabase
        .schema('dallas')
        .from("posts")
        .insert({
          content: newPost,
          user_id: user?.id
        })

      if (postError) throw postError

      setNewPost("")
      toast({
        title: "Success",
        description: "Your post has been published.",
      })

      await fetchPosts() // Refresh the posts list
    } catch (error: any) {
      console.error("Error submitting post:", error)
      toast({
        title: "Error",
        description: "Failed to publish your post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Discussion Post",
          text: post.content,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(post.content)
      toast({
        title: "Copied to clipboard",
        description: "The post content has been copied to your clipboard.",
      })
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
            <Button onClick={handleSubmitPost} disabled={!isAuthenticated || !newPost.trim()}>
              Post
            </Button>
          </div>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
                  <AvatarImage src={post.user?.avatar} />
                  <AvatarFallback>{post.user?.handle?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{post.user?.handle || "Anonymous"}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
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
