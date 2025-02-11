import { Package } from "@/types/Package"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getPackages(): Promise<Package[]> {
  const res = await fetch(`${API_URL}/getAllPackages`)
  if (!res.ok) {
    throw new Error("Failed to fetch packages")
  }
  return res.json()
}