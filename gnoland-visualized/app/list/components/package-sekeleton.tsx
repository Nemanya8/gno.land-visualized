import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PackageSkeleton() {
  return (
    <Card className="overflow-hidden bg-[#28282B] border-[#28282B]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}
