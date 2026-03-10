"use client"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface TimeSeriesRecord {
  id: string
  key: string
  value: number
  producerName: string
  readTime: string
}

const LINE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6"]

/**
 * Pivots flat records into the shape recharts expects:
 * [{ readTime, key1: value, key2: value, ... }, ...]
 */
function pivotRecords(records: TimeSeriesRecord[]) {
  const keys = [...new Set(records.map((r) => r.key))]

  const byTime = new Map<string, Record<string, number>>()
  for (const record of records) {
    if (!byTime.has(record.readTime)) byTime.set(record.readTime, {})
    byTime.get(record.readTime)![record.key] = record.value
  }

  const data = [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([readTime, values]) => ({ readTime, ...values }))

  return { data, keys }
}

export function TimeSeriesChart({ records }: { records: TimeSeriesRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground italic">No data available</p>
      </div>
    )
  }

  const { data, keys } = pivotRecords(records)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="readTime"
          tickFormatter={(v) => new Date(v).toLocaleTimeString()}
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          labelFormatter={(v) => new Date(v as string).toLocaleString()}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        />
        <Legend />
        {keys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            dot={false}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
