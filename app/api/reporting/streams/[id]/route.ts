import { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const upstream = await fetch(
    `${process.env.API_BASE_URL}/api/reporting/streams/${id}`,
    {
      headers: { Accept: "text/event-stream" },
      // @ts-expect-error — Node fetch needs this to disable response buffering
      duplex: "half",
    }
  )

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
