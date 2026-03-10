import { Tag } from "lucide-react"
import { notFound } from "next/navigation"
import createLogger from "@/lib/logger"
import { StreamView } from "@/components/stream-view"

interface Producer {
  uuid: string
  producerName: string
}

interface Stream {
  uuid: string
  name: string
  children: Stream[]
  producers: Producer[]
}

const logger = createLogger("StreamPage")

async function getStream(name: string): Promise<Stream | null> {
  try {
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reporting/streams?name=${encodeURIComponent(name)}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function StreamPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const name = decodeURIComponent(slug)
  const stream = await getStream(name)

  if (!stream) {
    logger.debug(`no stream found for name=${name}`)
    notFound()
  }

  logger.info(`rendering stream page for name=${stream.name} producers=${stream.producers.length}`)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{stream.name}</h1>
          <p className="text-muted-foreground">
            {stream.producers.length} producer{stream.producers.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {stream.producers.length > 0 ? (
        <StreamView producers={stream.producers} streamId={stream.uuid} />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
          <p className="text-muted-foreground italic">No producers for {stream.name}</p>
        </div>
      )}
    </div>
  )
}
