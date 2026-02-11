import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
      <Card className="@container/card lg:col-span-3 sm:py-6">
        <CardHeader className="relative flex flex-col items-start gap-4 px-4 pb-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col items-end gap-2 self-end sm:flex-row sm:items-center sm:self-auto">
            <Skeleton className="h-9 w-[180px]" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4 lg:gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="flex-1">
            <CardHeader className="relative pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <div className="absolute right-4 top-4">
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
    </div>
  )
}
