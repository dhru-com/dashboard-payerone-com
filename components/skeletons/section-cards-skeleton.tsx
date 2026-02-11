import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="@container/card overflow-hidden">
          <CardHeader className="gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <div className="absolute top-4 right-4">
               <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 pt-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
