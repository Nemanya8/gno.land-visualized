import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function PackageButtonSkeleton() {
  return (
    <Button
      className="w-full justify-between text-left py-8 px-4 bg-[#28282B] hover:bg-[#3a3a3d] cursor-default"
      disabled
    >
      <div className="flex flex-col items-start w-full space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-5 w-5 flex-shrink-0 ml-2" />
    </Button>
  )
}

