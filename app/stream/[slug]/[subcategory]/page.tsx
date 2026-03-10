import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tag } from "lucide-react"
import createLogger from "@/lib/logger"

const logger = createLogger("SubcategoryPage")

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string; subcategory: string }>
}) {
  const { slug, subcategory } = await params
  const categoryName = decodeURIComponent(slug)
  const subcategoryName = decodeURIComponent(subcategory)

  logger.info(`Rendering subcategory page: category=${categoryName}, subcategory=${subcategoryName}`)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Tag className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{subcategoryName}</h1>
          <p className="text-muted-foreground">{categoryName}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Data for {subcategoryName}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <span className="text-muted-foreground italic">Content for {subcategoryName} goes here</span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
