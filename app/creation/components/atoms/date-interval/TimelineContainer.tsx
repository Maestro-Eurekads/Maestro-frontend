"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import DayInterval from "./DayInterval"
import DayTimeline from "./DayTimeline"
import WeekInterval from "./WeekInterval"
import WeekTimeline from "./WeekTimeline"
import MonthInterval from "./MonthInterval"
import MonthTimeline from "./MonthTimeline"

interface TimelineContainerProps {
  range: string
  dayDifference: number
  weekDifference: number
  monthDifference: number
  funnelsData: any[]
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  range,
  dayDifference,
  weekDifference,
  monthDifference,
  funnelsData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)

  // Check if we need to show the scroll indicator
  useEffect(() => {
    if (!containerRef.current) return

    const checkScroll = () => {
      const container = containerRef.current
      if (!container) return
      setShowScrollIndicator(container.scrollWidth > container.clientWidth)
    }

    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [range, dayDifference, weekDifference, monthDifference])



  // Render the appropriate timeline components based on the range
  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval daysCount={dayDifference} />
            <DayTimeline daysCount={dayDifference} funnels={funnelsData} />
          </>
        )
      case "Month":
        return (
          <>
            <MonthInterval monthsCount={monthDifference} />
            <MonthTimeline monthsCount={monthDifference} funnels={funnelsData} />
          </>
        )
      default: // Week is default
        return (
          <>
            <WeekInterval weeksCount={weekDifference} />
            <WeekTimeline weeksCount={weekDifference} funnels={funnelsData} />
          </>
        )
    }
  }

  return (
    <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative">
      <div className="overflow-x-auto" ref={containerRef}>
        <div className="min-w-max">{renderTimeline()}</div>
      </div>
      {showScrollIndicator && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-l-md shadow-md animate-pulse">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </div>
      )}
    </div>
  )
}

export default TimelineContainer
