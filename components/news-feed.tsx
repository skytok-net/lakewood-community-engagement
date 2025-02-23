"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon, ChevronDown, ExternalLink, X, Share2, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"
import * as Accordion from "@radix-ui/react-accordion"
import { motion, AnimatePresence } from "framer-motion"
import { useNews } from "@/hooks/use-news"
import type { NewsItem } from "@/types"

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

export function NewsFeed() {
  const { news, isLoading, error, hasLoaded } = useNews()
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [popupContent, setPopupContent] = useState<NewsItem | null>(null)
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
          {error.message || 'An error occurred while loading news items'}
        </AlertDescription>
      </Alert>
    )
  }

  const handleShare = async (item: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary || undefined,
          url: item.url || undefined,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(item.url || window.location.href)
      // You might want to show a toast notification here
    }
  }

  if (news.length === 0) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>No news items available yet.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion.Root type="single" collapsible onValueChange={(value) => setExpandedItem(value)}>
          {news.map((item) => (
            <Accordion.Item key={item.id} value={item.id} className="mb-4 border-b last:border-b-0">
              <Accordion.Header>
                <Accordion.Trigger className="flex justify-between items-start w-full text-left py-2 group">
                  <div className="flex-grow pr-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div className="prose dark:prose-invert prose-sm">
                        <ReactMarkdown>
                          {item.summary ? truncate(item.summary, 15) : 'No summary available'}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <time className="text-xs text-muted-foreground block mt-1">
                      {item.created_at 
                        ? new Date(item.created_at).toLocaleDateString()
                        : 'No date available'}
                    </time>
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="py-2">
                <div className="prose dark:prose-invert prose-sm">
                  <ReactMarkdown>
                    {item.summary || 'No summary available'}
                  </ReactMarkdown>
                </div>
                <div className="mt-2 space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setPopupContent(item)}>
                    Read Full Article
                  </Button>
                  {item.url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(item.url, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Source
                    </Button>
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </CardContent>

      <AnimatePresence>
        {popupContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setPopupContent(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card text-card-foreground rounded-lg shadow-lg w-full max-w-[90vw] max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Main Content */}
                <motion.div
                  className="flex-1 flex flex-col min-w-0"
                  animate={{
                    width: showComments ? "60%" : "100%",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card/80 backdrop-blur-sm z-10">
                    <h2 className="text-xl font-semibold truncate">{popupContent.title}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setPopupContent(null)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-8rem)]">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                        <time>
                          {popupContent.created_at 
                            ? new Date(popupContent.created_at).toLocaleDateString()
                            : 'No date available'}
                        </time>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(popupContent.url, "_blank")}
                          className="hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Original
                        </Button>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{popupContent.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="sticky bottom-0 border-t p-4 flex items-center justify-between bg-card/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => setShowComments(true)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Comments
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleShare(popupContent)}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </motion.div>

                {/* Comments Drawer - Slides out from the right side of the modal */}
                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "40%", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", damping: 20 }}
                      className="border-l bg-card overflow-hidden h-full"
                    >
                      <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            <h3 className="font-semibold">Comments</h3>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setShowComments(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          <CommentsDrawerContent targetId={popupContent.id} targetType="news_item" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
