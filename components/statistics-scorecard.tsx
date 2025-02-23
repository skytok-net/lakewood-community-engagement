"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabaseClient"

interface Statistics {
  total: number
  for: number
  against: number
  notResponded: number
}

export function StatisticsScorecard() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatistics() {
      try {
        const { data, error } = await supabase
          .schema('dallas')
          .from("properties")
          .select("reply")

        if (error) throw error

        const total = data.length
        const forCount = data.filter((p) => p.reply === true).length
        const againstCount = data.filter((p) => p.reply === false).length
        const notRespondedCount = data.filter((p) => p.reply === null).length

        setStats({
          total,
          for: forCount,
          against: againstCount,
          notResponded: notRespondedCount,
        })
      } catch (error) {
        console.error("Error fetching statistics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />
  }

  if (!stats) {
    return <div>Failed to load statistics.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lakewood Conservation District Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <div>Total Houses</div>
            <div className="font-bold">{stats.total}</div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <div>For</div>
              <div className="font-bold">
                {stats.for} ({((stats.for / stats.total) * 100).toFixed(1)}%)
              </div>
            </div>
            <Progress value={(stats.for / stats.total) * 100} className="bg-muted [&>div]:bg-[#22c55e]" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <div>Against</div>
              <div className="font-bold">
                {stats.against} ({((stats.against / stats.total) * 100).toFixed(1)}%)
              </div>
            </div>
            <Progress value={(stats.against / stats.total) * 100} className="bg-muted [&>div]:bg-[#ef4444]" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <div>Not Responded</div>
              <div className="font-bold">
                {stats.notResponded} ({((stats.notResponded / stats.total) * 100).toFixed(1)}%)
              </div>
            </div>
            <Progress value={(stats.notResponded / stats.total) * 100} className="bg-muted [&>div]:bg-[#94a3b8]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
