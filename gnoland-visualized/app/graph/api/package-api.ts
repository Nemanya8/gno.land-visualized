import { Package } from "@/types/Package"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function getPackages(): Promise<Package[]> {
  const res = await fetch(`${API_URL}/getAllPackages`)
  if (!res.ok) {
    throw new Error("Failed to fetch packages")
  }
  return res.json()
}

export async function getFilteredPackages(type: "p" | "r"): Promise<Package[]> {
  const res = await fetch(`${API_URL}/filterPackages?type=${type}`)
  if (!res.ok) {
    throw new Error("Failed to fetch filtered packages")
  }
  return res.json()
}