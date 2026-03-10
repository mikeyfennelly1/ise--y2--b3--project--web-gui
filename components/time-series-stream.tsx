"use client"

import {useEffect} from "react"
import {TimeSeriesChart, type TimeSeriesRecord} from "@/components/time-series-chart"
import {createLogger} from "@/lib/logger"

const logger = createLogger("TimeSeriesStream")

export function TimeSeriesStream({ streamId }: { streamId: string | number }) {


  useEffect(() => {

    return () => {
      es.close()
      logger.info(`SSE connection closed for stream id=${streamId}`)
    }
  }, [streamId])

  return <TimeSeriesChart records={records} />
}

export interface SetRecords {
  setRecords(records: TimeSeriesRecord[]): void;
}