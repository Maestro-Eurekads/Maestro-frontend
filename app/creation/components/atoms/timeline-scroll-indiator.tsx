"use client"

import type React from "react"

import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>
}

const TimelineScrollIndicator: React.FC<ScrollIndicatorProps> = ({ containerRef }) => {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const checkScroll = () => {
      const container = containerRef.current
      if (!container) return

      // Show indicator if content is wider than container
      setShowIndicator(container.scrollWidth > container.clientWidth)
    }

    // Check on mount and when window resizes
    checkScroll()
    window.addEventListener("resize", checkScroll)

    return () => {
      window.removeEventListener("resize", checkScroll)
    }
  }, [containerRef])

  if (!showIndicator) return null

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-l-md shadow-md animate-pulse">
      <ChevronRight className="h-5 w-5 text-gray-500" />
    </div>
  )
}

export default TimelineScrollIndicator
