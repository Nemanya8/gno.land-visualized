"use client"

import type { Package } from "@/types/Package"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, PackageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface PackageCardProps {
  pkg: Package
  isExpanded: boolean
  onToggleExpand: () => void
}

export function PackageCard({ pkg, isExpanded, onToggleExpand }: PackageCardProps) {
  return (
    <Card className="overflow-hidden bg-[#28282B] border-[#28282B]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <PackageIcon className="h-5 w-5" />
              {pkg.Name}
            </CardTitle>
            <CardDescription className="truncate mt-1 text-gray-400">{pkg.Dir}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-[#3a3a3d]"
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex gap-2 mb-2">
          <Badge variant="outline" className="text-xs bg-transparent text-gray-300 border-gray-600">
            Imports: {pkg.Imports.length}
          </Badge>
          <Badge variant="outline" className="text-xs bg-transparent text-gray-300 border-gray-600">
            Imported by: {pkg.Imported.length}
          </Badge>
          {pkg.Draft && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
              Draft
            </Badge>
          )}
        </div>
      </CardContent>

      {isExpanded && (
        <CardFooter className="flex flex-col items-start border-t border-gray-700 pt-4">
          <div className="w-full space-y-3">
            <div>
              {pkg.Creator !== "monorepo" && (
                <>
                  <h3 className="text-sm font-medium text-gray-300">Creator</h3>
                  <p className="text-sm text-gray-400">{pkg.Creator || "Not specified"}</p>
                </>
              )}
            </div>

            {pkg.Contributors && pkg.Contributors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300">Contributors</h3>
                <ul className="text-sm text-gray-400">
                  {pkg.Contributors.map((contributor, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{contributor.Name}</span>
                      <span>{contributor.Percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pkg.Imports.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300">Imports</h3>
                <ScrollArea className="h-24 w-full mt-1 rounded border border-bg-[#3a3a3d] p-2">
                  <div className="flex flex-wrap gap-1">
                    {pkg.Imports.map((imp, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-[#3a3a3d] text-gray-300 hover:bg-[#3a3a3d]"
                      >
                        {imp}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {pkg.Imported.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300">Imported by</h3>
                <ScrollArea className="h-24 w-full mt-1 rounded border border-bg-[#3a3a3d] p-2">
                  <div className="flex flex-wrap gap-1">
                    {pkg.Imported.map((imp, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-[#3a3a3d] text-gray-300 hover:bg-[#3a3a3d]"
                      >
                        {imp}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <div className="w-full mt-4 flex gap-2">
            <Button
              className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100 text-xs sm:text-sm"
              onClick={() => window.open(`https://test5.${pkg.Dir}`, "_blank")}
            >
              <Image src="/gnoland.svg" alt="Gnoland" width={25} height={25} className="mr-2" />
              <span className="font-bold">See on Gnoweb</span>
            </Button>
            <Button
              className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100 text-xs sm:text-sm"
              onClick={() => window.open(`https://gno.studio/connect/view/${pkg.Dir}?network=test5`, "_blank")}
            >
              <Image src="/gnostudio.svg" alt="Gno Studio" width={25} height={25} className="mr-2" />
              <span className="font-bold">See in Studio</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

