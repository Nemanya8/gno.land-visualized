"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RangeSlider } from "@/components/ui/range-slider"
import { Skeleton } from "@/components/ui/skeleton"

interface PackageFiltersProps {
  filterP: boolean
  setFilterP: (value: boolean) => void
  filterR: boolean
  setFilterR: (value: boolean) => void
  filterM: boolean
  setFilterM: (value: boolean) => void
  filterD: boolean
  setFilterD: (value: boolean) => void
  importCount: number[]
  setImportCount: (value: number[]) => void
  importedCount: number[]
  setImportedCount: (value: number[]) => void
  maxImports: number
  maxImported: number
  loading?: boolean
}

export function PackageFilters({
  filterP,
  setFilterP,
  filterR,
  setFilterR,
  filterM,
  setFilterM,
  filterD,
  setFilterD,
  importCount,
  setImportCount,
  importedCount,
  setImportedCount,
  maxImports,
  maxImported,
  loading = false,
}: PackageFiltersProps) {
  return (
    <div className="bg-[#28282B] border border-[#28282B] rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex flex-wrap gap-4 md:gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-p"
                checked={filterP}
                onCheckedChange={(checked) => setFilterP(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="filter-p">Package</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-r"
                checked={filterR}
                onCheckedChange={(checked) => setFilterR(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="filter-r">Realm</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-m"
                checked={filterM}
                onCheckedChange={(checked) => setFilterM(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="filter-m">Monorepo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-d"
                checked={filterD}
                onCheckedChange={(checked) => setFilterD(checked as boolean)}
                disabled={loading}
              />
              <Label htmlFor="filter-d">Deployed</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="import-count">
                Imports range: {loading ? "..." : `${importCount[0]} - ${importCount[1]}`}
              </Label>
              <span className="text-sm text-gray-400">Max: {loading ? "..." : maxImports}</span>
            </div>
            {loading ? (
              <Skeleton className="h-5 w-full mb-6" />
            ) : (
              <RangeSlider
                id="import-count"
                min={0}
                max={maxImports}
                step={1}
                value={importCount}
                onValueChange={(value) => setImportCount(value)}
                className="mb-6"
              />
            )}
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="imported-count">
                Imported by range: {loading ? "..." : `${importedCount[0]} - ${importedCount[1]}`}
              </Label>
              <span className="text-sm text-gray-400">Max: {loading ? "..." : maxImported}</span>
            </div>
            {loading ? (
              <Skeleton className="h-5 w-full mb-2" />
            ) : (
              <RangeSlider
                id="imported-count"
                min={0}
                max={maxImported}
                step={1}
                value={importedCount}
                onValueChange={(value) => setImportedCount(value)}
                className="mb-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

