"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface GraphHeaderProps {
  is3D: boolean
  setIs3D: (value: boolean) => void
}

export default function GraphHeader({ is3D, setIs3D }: GraphHeaderProps) {
  return (
    <header className="flex items-center justify-between w-[20vw] px-6 bg-[#1a1a1a] border-b border-gray-800">
      <div className="flex-1 flex justify-start">
        <Button
          onClick={() => setIs3D(!is3D)}
          className="aspect-square h-12 w-12 font-bold"
          variant={is3D ? "default" : "outline"}
        >
          {is3D ? "3D" : "2D"}
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Image src="/gnoland.svg" alt="Gnoland Logo" width={140} height={50} className="h-12 w-auto" />
      </div>

      <div className="flex-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
            Network <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>test5</DropdownMenuItem>
            <DropdownMenuItem className="text-gray-500">Coming soon</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

