"use client"

import { useState, useEffect, useCallback } from "react"
import { usePackage, usePackages } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageButton } from "./PackageButton"
import { PackageButtonSkeleton } from "./PackageButtonSkeleton"
import { X, ChevronLeft, User, ArrowRight, Check, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { getFilteredPackages } from "../api/package-api"
import type { Package, Contributor } from "@/types/Package"
import Link from "next/link"

export function PackageFilters() {
  const { setSelectedPackage } = usePackage()
  const packages = usePackages()
  const [isOpen, setIsOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [displayedPackages, setDisplayedPackages] = useState<Package[]>([])
  const [typeFilters, setTypeFilters] = useState({ r: true, p: true })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null)
  const [contributorMap, setContributorMap] = useState<Record<string, Package[]>>({})
  const [contributorSearchTerm, setContributorSearchTerm] = useState("")
  const [sortedContributors, setSortedContributors] = useState<[string, Package[]][]>([])

  useEffect(() => {
    const newContributorMap: Record<string, Package[]> = {}
    packages.forEach((pkg) => {
      pkg.Contributors.forEach((contributor) => {
        if (!newContributorMap[contributor.Name]) {
          newContributorMap[contributor.Name] = []
        }
        newContributorMap[contributor.Name].push(pkg)
      })
    })
    setContributorMap(newContributorMap)
  }, [packages])

  useEffect(() => {
    const sorted = Object.entries(contributorMap)
      .sort((a, b) => b[1].length - a[1].length)
      .filter(([contributor]) => contributor.toLowerCase().includes(contributorSearchTerm.toLowerCase()))

    setSortedContributors(sorted)
  }, [contributorMap, contributorSearchTerm])

  const onClose = () => {
    setIsOpen(false)
  }

  const handleTypeFilterChange = (type: "r" | "p") => {
    setTypeFilters((prev) => {
      const newFilters = { ...prev, [type]: !prev[type] }
      return newFilters
    })
  }

  const handlePackageClick = (packageDir: string) => {
    const newPackage = packages.find((pkg) => pkg.Dir === packageDir)
    if (newPackage) {
      setSelectedPackage(newPackage)
      window.dispatchEvent(new CustomEvent("packageSelect", { detail: packageDir }))
    }
  }

  const clearContributorSelection = () => {
    setSelectedContributor(null)
    window.dispatchEvent(
      new CustomEvent("contributorSelect", {
        detail: { contributorName: null },
      }),
    )
  }

  const fetchFilteredPackages = useCallback(async () => {
    setIsLoading(true)
    try {
      let results: Package[] = []

      if (typeFilters.r && typeFilters.p) {
        results = [...packages]
      } else if (typeFilters.r) {
        try {
          results = await getFilteredPackages("r")
        } catch (error) {
          console.error("Error fetching r packages:", error)
          results = packages.filter((pkg) => pkg.Dir.startsWith("r/"))
        }
      } else if (typeFilters.p) {
        try {
          results = await getFilteredPackages("p")
        } catch (error) {
          console.error("Error fetching p packages:", error)
          results = packages.filter((pkg) => pkg.Dir.startsWith("p/"))
        }
      }

      if (selectedContributor) {
        results = results.filter((pkg) => pkg.Contributors.some((c) => c.Name === selectedContributor.Name))
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        results = results.filter((pkg) => pkg.Name.toLowerCase().includes(term) || pkg.Dir.toLowerCase().includes(term))
      }

      setFilteredPackages(results)
      setDisplayedPackages(results)
    } catch (error) {
      console.error("Error in fetchFilteredPackages:", error)
      setFilteredPackages([])
      setDisplayedPackages([])
    } finally {
      setIsLoading(false)
    }
  }, [typeFilters, packages, selectedContributor, searchTerm])

  useEffect(() => {
    fetchFilteredPackages()
  }, [fetchFilteredPackages])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setDisplayedPackages(filteredPackages)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = filteredPackages.filter(
        (pkg) => pkg.Name.toLowerCase().includes(term) || pkg.Dir.toLowerCase().includes(term),
      )
      setDisplayedPackages(filtered)
    }
  }, [searchTerm, filteredPackages])

  useEffect(() => {
    const handleContributorSelectEvent = (event: CustomEvent) => {
      const contributorName = event.detail.contributorName

      if (!contributorName) {
        clearContributorSelection()
        return
      }

      let foundContributor: Contributor | null = null
      for (const pkg of packages) {
        const contributor = pkg.Contributors.find((c) => c.Name === contributorName)
        if (contributor) {
          foundContributor = contributor
          break
        }
      }

      setSelectedContributor(foundContributor)
      fetchFilteredPackages()
      setIsOpen(true)
    }

    window.addEventListener("contributorSelect", handleContributorSelectEvent as EventListener)

    return () => {
      window.removeEventListener("contributorSelect", handleContributorSelectEvent as EventListener)
    }
  }, [packages, fetchFilteredPackages])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50"
          >
            <Card className="h-full overflow-hidden flex flex-col bg-[#18181a] text-gray-300 border-[#18181a] shadow-lg">
              <CardHeader className="flex-shrink-0 py-3 px-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-100 truncate">Package Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-100 hover:bg-[#28282B]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <div className="flex-shrink-0 px-4 pb-2">
                <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex space-x-4 justify-center">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={typeFilters.r} onCheckedChange={() => handleTypeFilterChange("r")} />
                    <span>Realms</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={typeFilters.p} onCheckedChange={() => handleTypeFilterChange("p")} />
                    <span>Packages</span>
                  </label>
                </div>
              </div>

              <CardContent className="flex-grow overflow-hidden flex flex-col px-4 py-2">
                <div className="mb-4">
                  <h3 className="text-md font-semibold mb-2 text-gray-200">
                    {selectedContributor
                      ? `Packages by ${selectedContributor.Name}`
                      : `All Packages (${displayedPackages.length})`}
                  </h3>
                  <div className="w-full h-0.5 bg-[#9c59b6] mb-2"></div>

                  <ScrollArea className="h-[35vh]">
                    <div className="grid grid-cols-1 gap-2 pr-2">
                      {isLoading && !selectedContributor ? (
                        Array.from({ length: 5 }).map((_, index) => <PackageButtonSkeleton key={index} />)
                      ) : displayedPackages.length > 0 ? (
                        displayedPackages.map((pkg, index) => (
                          <PackageButton
                            key={index}
                            name={pkg.Name}
                            dir={pkg.Dir}
                            onClick={() => handlePackageClick(pkg.Dir)}
                          />
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full py-4">
                          <p className="text-gray-400">
                            {selectedContributor
                              ? "This contributor hasn't worked on any packages yet."
                              : "No packages found. Try adjusting your search or filters."}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-200">Contributors</h3>
                    <div className="flex items-center gap-2">
                      {selectedContributor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-400 hover:bg-[#28282B] hover:text-gray-100 h-8 px-2"
                          onClick={clearContributorSelection}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </div>
                  <Input
                    placeholder="Search contributors..."
                    value={contributorSearchTerm}
                    onChange={(e) => setContributorSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="w-full h-0.5 bg-[#9c59b6] mb-2"></div>

                  <ScrollArea className="h-[25vh]">
                    <div className="grid grid-cols-1 gap-2 pr-2">
                      {sortedContributors.map(([contributor, packages]) => {
                        const isSelected = selectedContributor?.Name === contributor
                        return (
                          <Button
                            key={contributor}
                            variant="ghost"
                            className={`w-full justify-between text-left py-2 px-3 ${
                              isSelected
                                ? "bg-[#3a3a3d] text-white hover:bg-[#444447]"
                                : "bg-[#28282B] text-white hover:bg-[#3a3a3d] hover:text-white"
                            } flex items-center`}
                            onClick={() => {
                              if (isSelected) {
                                clearContributorSelection()
                              } else {
                                const foundContributor = packages[0]?.Contributors.find((c) => c.Name === contributor)
                                setSelectedContributor(foundContributor || null)
                                window.dispatchEvent(
                                  new CustomEvent("contributorSelect", {
                                    detail: { contributorName: contributor },
                                  }),
                                )
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <User className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#9c59b6]"}`} />
                              <span className="font-medium truncate">{contributor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">{packages.length}</span>
                              {isSelected ? (
                                <Check className="h-3 w-3 text-[#9c59b6]" />
                              ) : (
                                <ArrowRight className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </Button>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center mt-4 px-4 pb-4">
                <Link href="/list" className="w-full">
                  <Button className="flex items-center gap-2 bg-[#28282B] text-white hover:bg-[#3a3a3d] w-full">
                    <BarChart2 size={16} />
                    Data Panel
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#18181a] text-gray-400 hover:text-gray-100 hover:bg-[#28282B] px-2 py-8 rounded-l-lg shadow-lg"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
    </>
  )
}