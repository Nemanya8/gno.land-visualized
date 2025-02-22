import { Button } from "@/components/ui/button"
import type { Contributor } from "@/types/Package"

export function ContribButton({ Name, LOC, Percentage }: Contributor) {
  const handleClick = () => {
    // TODO: Open GitHub account
  }

  return (
    <Button
      className="w-full justify-between text-left py-6 px-4 bg-[#28282B] text-white hover:bg-[#3a3a3d]"
      onClick={handleClick}
    >
      <div className="flex flex-col">
        <span className="font-bold">{Name}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-bold">{Percentage.toFixed(2)}%</span>
        <span className="text-sm text-gray-400">{LOC} LOC</span>
      </div>
    </Button>
  )
}

