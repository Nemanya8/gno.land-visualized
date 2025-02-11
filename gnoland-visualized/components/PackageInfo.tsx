"use client"

import { usePackage, usePackages } from "@/contexts/PackageContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageButton } from "./PackageButton"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatAddress } from "@/utils/utils"
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card"
import { motion, AnimatePresence } from "framer-motion"

export function PackageInfo() {
  const { selectedPackage, setSelectedPackage } = usePackage()
  const packages = usePackages()

  const onClose = () => setSelectedPackage(null)

  const handlePackageClick = (packageDir: string) => {
    const newPackage = packages.find((pkg) => pkg.Dir === packageDir)
    if (newPackage) {
      setSelectedPackage(newPackage)
      window.dispatchEvent(new CustomEvent("packageSelect", { detail: packageDir }))
    }
  }

  return (
    <AnimatePresence>
      {selectedPackage && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-4 top-4 bottom-4 w-96 z-50 drop-shadow-2xl"
        >
          <Card className="h-full overflow-hidden flex flex-col bg-[#18181a] text-gray-300 border-[#18181a] shadow-lg">
            <CardHeader className="flex-shrink-0 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-100">{selectedPackage.Name}</h2>
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
            <div className="flex-shrink-0 p-6">
              <p className="text-base text-gray-300 overflow-hidden text-ellipsis">
                <span className="block mb-2">Directory: {formatAddress(selectedPackage.Dir)}</span>
                <span className="block">Creator: {formatAddress(selectedPackage.Creator)}</span>
              </p>
            </div>
            <CardContent className="flex-grow overflow-hidden flex flex-col p-6">
              <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
                <div className="flex-1 min-h-0">
                  <h3 className="text-md font-semibold mb-2 text-gray-200">Imports</h3>
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
                  <h3 className="text-md font-semibold mb-2 text-gray-200">Imported By</h3>
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
            <CardFooter className="flex-shrink-0 space-x-2 py-3">
              <Button
                className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100"
                onClick={() => window.open(`https://test5.${selectedPackage.Dir}`, "_blank")}
              >
                See on Gnoweb
              </Button>
              <Button
                className="flex-1 bg-[#28282B] hover:bg-[#3a3a3d] text-gray-100"
                onClick={() =>
                  window.open(`https://gno.studio/connect/view/${selectedPackage.Dir}?network=test5`, "_blank")
                }
              >
                See in Studio
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

