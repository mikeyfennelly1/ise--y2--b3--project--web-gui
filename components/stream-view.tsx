"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSeriesChart, type TimeSeriesRecord } from "@/components/time-series-chart"
import createLogger from "@/lib/logger"

const logger = createLogger("StreamView")

interface Producer {
  uuid: string
  producerName: string
}

interface StreamViewProps {
  producers: Producer[]
  streamId: string
}

export function StreamView({ producers, streamId }: StreamViewProps) {
  const [records, setRecords] = useState<TimeSeriesRecord[]>([])
  const [selected, setSelected] = useState<Set<string>>(
    new Set(producers.map((p) => p.producerName))
  )

  useEffect(() => {
    const url = `/api/reporting/streams/${streamId}`
    const es = new EventSource(url)

    logger.info(`SSE connection opened to ${url}`)

    es.onmessage = (event) => {
      console.log(`SSE message for stream id=${streamId}:`, event.data)
    }

    es.addEventListener("history", (event) => {
      console.log(`SSE history event for stream id=${streamId}:`, event.data)
      try {
        const batch: TimeSeriesRecord[] = JSON.parse(event.data)
        logger.debug(`SSE history: ${batch.length} records`)
        setRecords(batch)
      } catch (err) {
        logger.warn(`Failed to parse SSE history event: ${err}`)
      }
    })

    es.addEventListener("update", (event) => {
      console.log(`SSE update event for stream id=${streamId}:`, event.data)
      try {
        const record: TimeSeriesRecord = JSON.parse(event.data)
        logger.debug(`SSE update: key=${record.key} producer=${record.producerName}`)
        setRecords((prev) => [...prev, record])
      } catch (err) {
        logger.warn(`Failed to parse SSE update event: ${err}`)
      }
    })

    es.onerror = () => {
      logger.error(`SSE connection error for stream id=${streamId}`)
    }

    return () => {
      es.close()
      logger.info(`SSE connection closed for stream id=${streamId}`)
    }
  }, [streamId])

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const filtered = records.filter((r) => selected.has(r.producerName))

  return (
    <div className="flex gap-4 items-start">
      <Card className="w-56 shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Producers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {producers.map((p) => (
            <label key={p.uuid} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(p.producerName)}
                onChange={() => toggle(p.producerName)}
                className="accent-primary"
              />
              <span className="text-sm leading-tight">{p.producerName}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardContent className="h-[400px] pt-6">
          <TimeSeriesChart records={filtered} />
        </CardContent>
      </Card>
    </div>
  )
}
