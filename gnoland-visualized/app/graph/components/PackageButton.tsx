import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { formatAddress } from "@/utils/utils"

interface PackageButtonProps {
  name: string
  dir: string
  onClick: () => void
}

export function PackageButton({ name, dir, onClick }: PackageButtonProps) {
  return (
    <Button
      className="w-full justify-between text-left py-8 px-4 bg-[#28282B] text-white hover:bg-[#3a3a3d]"
      onClick={onClick}
    >
      <div className="flex flex-col items-start overflow-hidden">
        <span className="font-semibold truncate w-full">{name}</span>
        <span className="text-s text-muted-foreground truncate w-full">{formatAddress(dir)}</span>
      </div>
      <ArrowRight className="h-5 w-5 flex-shrink-0 ml-2" />
    </Button>
  )
}
