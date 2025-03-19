"use client"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface GraphHeaderProps {
  is3D: boolean
  setIs3D: (value: boolean) => void
}

export default function GraphHeader({ is3D, setIs3D }: GraphHeaderProps) {
  return (
    <header className="flex items-center justify-between w-full px-6 py-3 bg-[#1a1a1a] border-b border-gray-800">
      <div className="flex items-center gap-2">
        <Label htmlFor="view-toggle" className="text-white text-sm">
          2D
        </Label>
        <Switch id="view-toggle" checked={is3D} onCheckedChange={setIs3D} />
        <Label htmlFor="view-toggle" className="text-white text-sm">
          3D
        </Label>
      </div>

      <div className="flex items-center justify-center">
        <Image src="/gnoland.svg" alt="Gnoland Logo" width={120} height={40} className="h-8 w-auto" />
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
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

