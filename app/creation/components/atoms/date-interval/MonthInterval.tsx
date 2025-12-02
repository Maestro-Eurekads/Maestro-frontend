"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { eachDayOfInterval, addDays, format, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns"
import { useCampaigns } from "app/utils/CampaignsContext"
import { useDateRange } from "src/date-range-context"

interface MonthIntervalProps {
  monthsCount: number
  view?: boolean
  getDaysInEachMonth?: any
  funnelData?: any
  disableDrag?: any
}

const MonthInterval: React.FC<MonthIntervalProps> = ({
  monthsCount,
  view,
  getDaysInEachMonth,
  disableDrag,
  funnelData,
}) => {
  const [monthNames, setSetMonthName] = useState([])
  const [daysInMonth, setDaysInEachMonth] = useState<Record<string, number>>({})
  const { campaignFormData } = useCampaigns()
  const { extendedRange, isInfiniteTimeline, bufferMonths } = useDateRange()
  const [containerWidth, setContainerWidth] = useState(0)

  // Calculate days in each month from extended range
  useEffect(() => {
    // Always use extended range when available (for infinite timeline)
    if (extendedRange && extendedRange.length > 0) {
      const daysInMonthMap: Record<string, number> = {}
      extendedRange.forEach((date) => {
        const monthYear = format(date, "MMMM yyyy")
        daysInMonthMap[monthYear] = (daysInMonthMap[monthYear] || 0) + 1
      })
      setDaysInEachMonth(daysInMonthMap)
    } else if (getDaysInEachMonth) {
      setDaysInEachMonth(getDaysInEachMonth())
    }
  }, [extendedRange, isInfiniteTimeline])

  // Optimized grid template columns calculation
  const totalDays = Object.values(daysInMonth || {}).reduce((acc, days) => acc + (days as number), 0)

  const monthCount = Object.keys(daysInMonth || {}).length

  const calculateDailyWidthForGrid = useCallback(() => {
      if (isInfiniteTimeline) {
      return 15
    }
    
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }
    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)
    const dailyWidth = contWidth / (totalDays || 30)
    return Math.max(dailyWidth, 10)
  }, [disableDrag, totalDays, isInfiniteTimeline])

  const dailyWidthForGrid = calculateDailyWidthForGrid()

  const gridTemplateColumns = (() => {
    let result: string;
    // Always use pixel widths when infinite timeline is enabled (regardless of month count)
    if (isInfiniteTimeline) {
      // For infinite timeline: use pixel widths based on days in each month
      result = Object.values(daysInMonth || {})
        .map((days) => `${(days as number) * dailyWidthForGrid}px`)
        .join(" ")
    } else if (monthCount > 2) {
      // When more than 2 months but not infinite, each month takes 20% of container
      result = Object.keys(daysInMonth || {})
        .map(() => `20%`)
        .join(" ")
    } else {
      // Original proportional logic for 1-2 months
      result = Object.values(daysInMonth || {})
        .map((days) => `${Math.round(((days as number) / totalDays) * 100)}%`)
        .join(" ")
    }
    return result
  })()

  useEffect(() => {
    if (campaignFormData) {
      const startDate = new Date(campaignFormData?.campaign_timeline_start_date)
      const endDate = new Date(campaignFormData?.campaign_timeline_end_date)

      const differenceInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      const dateList = eachDayOfInterval({
        start: new Date(campaignFormData?.campaign_timeline_start_date) || new Date(),
        end:
          addDays(new Date(campaignFormData?.campaign_timeline_start_date), differenceInDays) ||
          addDays(new Date(), 13),
      })

      // Extract month names
      const names = Array.from(new Set(dateList.map((date) => format(date, "MMMM"))))
      setSetMonthName(names)
    }
  }, [campaignFormData])

  useEffect(()=>{
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }

    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)
    setContainerWidth(contWidth)
  }, [])

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }

    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)

    let dailyWidth: number

    if (monthCount > 2) {
      // When more than 2 months, each month takes 30% of container
      const monthWidth = contWidth
      const avgDaysPerMonth = totalDays / monthCount
      dailyWidth = monthWidth / avgDaysPerMonth
    } else {
      // Original logic for 1-2 months
      const totalDays = funnelData?.endDay || 30
      dailyWidth = contWidth / totalDays
    }

    // Ensure minimum width constraints
    dailyWidth = Math.max(dailyWidth, 10)

    return Math.round(dailyWidth)
  }, [disableDrag, funnelData?.endDay, monthCount, totalDays])

  const dailyWidth = calculateDailyWidth()

  // Calculate background size based on month count
  const getBackgroundSize = useCallback(() => {
    if (isInfiniteTimeline && monthCount > 2) {
      // For infinite timeline, use pixel-based background
      return `${dailyWidthForGrid}px 100%`
    } else if (monthCount > 2) {
      // For multiple months with percentage-based
      return `20% 100%`
    } else {
      // Original background sizing for 1-2 months
      return `100% 100%`
    }
  }, [monthCount, isInfiniteTimeline, dailyWidthForGrid])

  const monthEntries = Object.entries(daysInMonth || {})
  const yearHeaders: Array<{ year: string, startIndex: number, span: number }> = []
  let currentYear: string | null = null
  let currentStartIndex = 0
  let currentSpan = 0

  monthEntries.forEach(([monthName], index) => {
    const parts = monthName.split(' ')
    const year = parts.length > 1 ? parts[parts.length - 1] : new Date().getFullYear().toString()
    
    if (currentYear === null) {
      currentYear = year
      currentStartIndex = index
      currentSpan = 1
    } else if (currentYear === year) {
      currentSpan++
    } else {
      yearHeaders.push({
        year: currentYear,
        startIndex: currentStartIndex,
        span: currentSpan
      })
      currentYear = year
      currentStartIndex = index
      currentSpan = 1
    }
  })
  
  if (currentYear !== null) {
    yearHeaders.push({
      year: currentYear,
      startIndex: currentStartIndex,
      span: currentSpan
    })
  }

  const yearStartIndices = new Map<number, string>()
  yearHeaders.forEach(header => {
    yearStartIndices.set(header.startIndex, header.year)
  })

return (
  <div className={isInfiniteTimeline ? "min-w-max border-y relative" : "w-full border-y relative"}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        position: "relative",
        zIndex: 20, 
      }}
      className="border-b border-blue-200"
    >
      {yearHeaders.map((header, idx) => (
        <div
          key={`year-${idx}`}
          style={{
            gridColumn: `span ${header.span}`,
            position: "relative", 
          }}
          className="h-full" 
        >
          <div
            style={{
              position: "sticky",
              left: 0,
              width: "fit-content",
              zIndex: 10,
              backgroundColor: "white", 
              paddingRight: "12px", 
            }}
            className="py-2 px-2 border-r border-blue-200/50 h-full flex items-center"
          >
            <span className="font-[600] text-[16px] text-[rgba(0,0,0,0.7)]">
              {header.year}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns,
        backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
        backgroundSize: getBackgroundSize(),
        zIndex: 0, 
      }}
    >
      {Object.entries(daysInMonth || {}).map(([monthName], i) => {
        const monthOnly = monthName.split(" ")[0]
        const isYearBoundary = i > 0 && yearStartIndices.has(i)

        return (
          <div
            key={i}
            className="flex flex-col items-center relative py-3 border-r border-blue-200 last:border-r-0"
            style={{
              borderLeft: isYearBoundary ? "2px solid rgba(0,0,255,0.3)" : "none",
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                {monthOnly}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)
}
export default MonthInterval

