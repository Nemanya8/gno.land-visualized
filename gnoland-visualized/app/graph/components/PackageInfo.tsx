"use client"

import Image from "next/image"
import { usePackage, usePackages } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageButton } from "./PackageButton"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatAddress } from "@/utils/utils"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ContribButton } from "./ContribButton"
import { GnoScanButton } from "./GnoScanButton"

export function PackageInfo() {
  const { selectedPackage, setSelectedPackage } = usePackage()
  const packages = usePackages()

  const onClose = () => {
    setSelectedPackage(null)
    window.dispatchEvent(new CustomEvent("packageSelect", {}))
  }

  const handlePackageClick = (packageDir: string) => {
    const newPackage = packages.find((pkg) => pkg.Dir === packageDir)
    if (newPackage) {
      setSelectedPackage(newPackage)
      window.dispatchEvent(new CustomEvent("packageSelect", { detail: packageDir }))
    }
  }

  const contributors = [
    { name: "santala", percentage: 58.0 },
    { name: "Blake", percentage: 26.12 },
    { name: "Morgan", percentage: 15.38 },
    { name: "6h057", percentage: 0.25 },
    { name: "santala", percentage: 58.0 },
    { name: "Blake", percentage: 26.12 },
    { name: "Morgan", percentage: 15.38 },
    { name: "6h057", percentage: 0.25 },
  ]

  return (
    <AnimatePresence>
      {selectedPackage && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 bottom-0 w-full sm:w-96 z-50"
        >
          <Card className="h-full overflow-hidden flex flex-col bg-[#18181a] text-gray-300 border-[#18181a] shadow-lg">
            <CardHeader className="flex-shrink-0 py-3 px-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-100 truncate">{selectedPackage.Name}</h2>
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
              <p className="text-sm sm:text-base text-gray-300 overflow-hidden text-ellipsis">
                <span className="block">Directory: {formatAddress(selectedPackage.Dir)}</span>
              </p>
            </div>
            <CardContent className="flex-grow overflow-hidden flex flex-col px-4 py-2">
              <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0">
                  <h3 className="text-sm sm:text-md font-semibold mb-2 text-gray-200">
                    {selectedPackage.Creator === "monorepo" ? "Contributors" : "Creator"}
                  </h3>
                  <div className="w-full h-0.5 bg-[#4ecdc4] mb-2"></div>
                  <ScrollArea className="h-[calc(100%-2rem)]">
                    <div className="pr-4 space-y-2">
                      {selectedPackage.Creator === "monorepo" ? (
                        contributors.map((contributor, index) => (
                          <ContribButton key={index} name={contributor.name} percentage={contributor.percentage} />
                        ))
                      ) : (
                        <GnoScanButton address={selectedPackage.Creator} />
                      )}
                    </div>
                  </ScrollArea>
                </div>
                <div className="flex-1 min-h-0">
                  <h3 className="text-sm sm:text-md font-semibold mb-2 text-gray-200">Imports</h3>
                  <div className="w-full h-0.5 bg-[#c96934] mb-2"></div>
                  <ScrollArea className="h-[calc(100%-2rem)]">
                    <div className="pr-4 space-y-2">
                      {selectedPackage.Imports.map((imp, index) => (
                        <PackageButton
                          key={index}
                          name={imp.split("/").pop() || ""}
                          dir={imp}
                          onClick={() => handlePackageClick(imp)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div className="flex-1 min-h-0">
                  <h3 className="text-sm sm:text-md font-semibold mb-2 text-gray-200">Imported By</h3>
                  <div className="w-full h-0.5 bg-[#4ecdc4] mb-2"></div>
                  <ScrollArea className="h-[calc(100%-2rem)]">
                    <div className="pr-4 space-y-2">
                      {selectedPackage.Imported.map((imp, index) => (
                        <PackageButton
                          key={index}
                          name={imp.split("/").pop() || ""}
                          dir={imp}
                          onClick={() => handlePackageClick(imp)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-shrink-0 space-x-2 p-4">
              <Button
                className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100 text-xs sm:text-sm"
                onClick={() => window.open(`https://test5.${selectedPackage.Dir}`, "_blank")}
              >
                <Image src="/gnoland.svg" alt="Gnoland" width={25} height={25} className="mr-2" />
                <span className="font-bold">See on Gnoweb</span>
              </Button>
              <Button
                className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100 text-xs sm:text-sm"
                onClick={() =>
                  window.open(`https://gno.studio/connect/view/${selectedPackage.Dir}?network=test5`, "_blank")
                }
              >
                <Image src="/gnostudio.svg" alt="Gno Studio" width={25} height={25} className="mr-2" />
                <span className="font-bold">See in Studio</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

