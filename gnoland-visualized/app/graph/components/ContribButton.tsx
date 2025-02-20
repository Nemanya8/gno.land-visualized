"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ContribButtonProps {
  name: string
  percentage: number
}

export function ContribButton({ name, percentage }: ContribButtonProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch(`https://api.github.com/users/${name}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
      })
      .catch((error) => console.error("Error fetching GitHub avatar:", error))
  }, [name])

  const handleClick = () => {
    window.open(`https://github.com/${name}`, "_blank")
  }

  return (
    <Button
      className="w-full justify-between text-left py-4 px-4 bg-[#28282B] text-white hover:bg-[#3a3a3d]"
      onClick={handleClick}
    >
      <div className="flex items-center">
        {avatarUrl && (
          // Using regular img tag instead of Next/Image to avoid domain configuration issues
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt={`${name}'s GitHub avatar`}
            className="w-8 h-8 rounded-full mr-3"
            loading="lazy"
          />
        )}
        <span className="font-semibold truncate">{name}</span>
      </div>
      <div className="flex items-center">
        <span>{percentage.toFixed(2)}%</span>
      </div>
    </Button>
  )
}

