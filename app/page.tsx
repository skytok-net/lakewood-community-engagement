"use client"

import MapSection from "@/components/map-section"
import { NewsFeed } from "@/components/news-feed"
import { DiscussionFeed } from "@/components/discussion-feed"
import { StatisticsScorecard } from "@/components/statistics-scorecard"
import AiChat from "@/components/ai-chat"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Lakewood Conservation District Expansion</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <MapSection />
          <DiscussionFeed />
        </div>
        <div className="lg:w-1/3 space-y-8">
          <StatisticsScorecard />
          <NewsFeed />
        </div>
      </div>
      <AiChat />
    </main>
  )
}
