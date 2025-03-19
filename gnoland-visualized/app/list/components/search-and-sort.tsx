"use client"

import { Input } from "@/components/ui/input"
import { Search, ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchAndSortProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  loading?: boolean
}

export function SearchAndSort({ searchTerm, setSearchTerm, sortBy, setSortBy, loading = false }: SearchAndSortProps) {
  return (
    <div className="bg-[#28282B] border border-[#28282B] rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages by name or directory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#3a3a3d] border-[#3a3a3d] text-white"
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <span className="text-sm whitespace-nowrap">Sort by:</span>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-[#3a3a3d] border-[#3a3a3d] text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#28282B] border-[#3a3a3d] text-white">
                <SelectItem value="imported-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Imported (Desc)</span>
                  </div>
                </SelectItem>
                <SelectItem value="imported-asc">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Imported (Asc)</span>
                  </div>
                </SelectItem>
                <SelectItem value="imports-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Imports (Desc)</span>
                  </div>
                </SelectItem>
                <SelectItem value="imports-asc">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Imports (Asc)</span>
                  </div>
                </SelectItem>
                <SelectItem value="alpha-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpAZ className="h-4 w-4" />
                    <span>Alphabetical (A-Z)</span>
                  </div>
                </SelectItem>
                <SelectItem value="alpha-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownAZ className="h-4 w-4" />
                    <span>Alphabetical (Z-A)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  )
}