"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon, ChevronDown, ExternalLink, X, Share2, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { usePosts } from "@/hooks/use-posts"
import type { Post } from "@/types"
import { toast } from "sonner"

function truncate(str: string, words: number) {
  return str.split(" ").slice(0, words).join(" ") + (str.split(" ").length > words ? "..." : "")
}

interface CommentsDrawerContentProps {
  targetId: string
  targetType: string
}

function CommentsDrawerContent({ targetId, targetType }: CommentsDrawerContentProps) {
  return (
    <div>
      {/* Replace this with your actual comments content */}
      <p>
        Comments for {targetType} with ID: {targetId}
      </p>
    </div>
  )
}

export function PostFeed() {
  const { posts, isLoading, error, hasLoaded } = usePosts()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [popupContent, setPopupContent] = useState<Post | null>(null)
  const [showComments, setShowComments] = useState(false)

  // Don't render anything until loading is complete
  if (!hasLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'An error occurred while loading posts'}
        </AlertDescription>
      </Alert>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Latest Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <InfoIcon className="mr-2 h-4 w-4" />
            <p>No posts available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <ReactMarkdown>
                {expandedItem === post.id ? post.content : truncate(post.content, 50)}
              </ReactMarkdown>
            </div>
            {post.content.split(" ").length > 50 && (
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => setExpandedItem(expandedItem === post.id ? null : post.id)}
              >
                {expandedItem === post.id ? "Show Less" : "Read More"}
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${
                    expandedItem === post.id ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setShowComments(true)
                }}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Comments
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + "/posts/" + post.id)
                  toast.success("Link copied to clipboard")
                }}
              >
                <Share2 className="mr-1 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
