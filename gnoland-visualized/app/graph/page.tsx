import DependencyGraph from "./components/DependencyGraph"
import { PackageProvider } from "@/contexts/PackageContext"
import { PackageInfo } from "./components/PackageInfo"
import { getPackages } from "./api/package-api"

export default async function GraphPage() {
  const packages = await getPackages()

  return (
    <PackageProvider initialPackages={packages}>
      <main className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a]">
        <PackageInfo />
        <div className="h-full w-full">
          <DependencyGraph packages={packages} />
        </div>
      </main>
    </PackageProvider>
  )
}

