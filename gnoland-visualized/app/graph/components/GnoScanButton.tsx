import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface GnoScanButtonProps {
  address: string
}

export function GnoScanButton({ address }: GnoScanButtonProps) {
  const shortenAddress = (addr: string) => {
    if (addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleClick = () => {
    window.open(`https://gnoscan.io/accounts/${address}?chainId=test5`, "_blank")
  }

  return (
    <Button
      className="w-full justify-between text-left py-6 px-4 bg-[#28282B] text-white hover:bg-[#3a3a3d]"
      onClick={handleClick}
    >
      <span className="font-semibold truncate">{shortenAddress(address)}</span>
      <ExternalLink className="h-4 w-4 flex-shrink-0" />
    </Button>
  )
}

