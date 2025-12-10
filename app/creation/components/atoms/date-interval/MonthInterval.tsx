"use client"

import type React from "react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { eachWeekOfInterval, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { useCampaigns } from "app/utils/CampaignsContext"
import { useDateRange } from "src/date-range-context"

interface MonthIntervalProps {
  disableDrag?: any
  range?: any
  isInfiniteTimeline?: boolean
}

const WEEK_WIDTH_PX = 100

const MonthInterval: React.FC<MonthIntervalProps> = ({
  disableDrag,
  range,
  isInfiniteTimeline = true
}) => {
  const { extendedRange } = useDateRange()
  const effectiveRange = isInfiniteTimeline ? extendedRange : range;
  const weeks = useMemo(() => {
    if (!effectiveRange || effectiveRange.length === 0) return []
    
    const startDate = effectiveRange[0]
    const endDate = effectiveRange[effectiveRange.length - 1]
    
    const allWeeks = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    )
    
    return allWeeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      return {
        start: weekStart,
        end: weekEnd,
        label: `${format(weekStart, "d")}-${format(weekEnd, "d")}`,
        month: format(weekStart, "MMM"),
        year: format(weekStart, "yyyy"),
        monthYear: format(weekStart, "MMMM yyyy"),
      }
    })
  }, [effectiveRange])

  const weeksByMonth = useMemo(() => {
    const grouped: Record<string, typeof weeks> = {}
    weeks.forEach((week) => {
      if (!grouped[week.monthYear]) {
        grouped[week.monthYear] = []
      }
      grouped[week.monthYear].push(week)
    })
    return grouped
  }, [weeks])

  const sortedMonths = useMemo(() => {
    return Object.keys(weeksByMonth).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })
  }, [weeksByMonth])

  const yearHeaders = useMemo(() => {
    const headers: Array<{ year: string; span: number }> = []
    let currentYear: string | null = null
    let currentSpan = 0

    sortedMonths.forEach((monthYear) => {
      const year = monthYear.split(" ")[1]
      const weeksInMonth = weeksByMonth[monthYear].length

      if (currentYear === null) {
        currentYear = year
        currentSpan = weeksInMonth
      } else if (currentYear === year) {
        currentSpan += weeksInMonth
      } else {
        headers.push({ year: currentYear, span: currentSpan })
        currentYear = year
        currentSpan = weeksInMonth
      }
    })

    if (currentYear !== null) {
      headers.push({ year: currentYear, span: currentSpan })
    }

    return headers
  }, [sortedMonths, weeksByMonth])

  const totalWeeks = weeks.length

  const calculateContainerWidth = useCallback(() => {
    if (typeof window === "undefined") return 1000
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || 0
    return screenWidth - (disableDrag ? 80 : 367)
  }, [disableDrag])


  const gridTemplateColumns = `repeat(${totalWeeks}, ${WEEK_WIDTH_PX}px)`

  const allWeeksFlat = useMemo(() => {
    const result: Array<{
      week: typeof weeks[0]
      isFirstOfMonth: boolean
      monthName: string
    }> = []

    sortedMonths.forEach((monthYear) => {
      const monthWeeks = weeksByMonth[monthYear]
      monthWeeks.forEach((week, idx) => {
        result.push({
          week,
          isFirstOfMonth: idx === 0,
          monthName: monthYear.split(" ")[0],
        })
      })
    })

    return result
  }, [sortedMonths, weeksByMonth])

  return (
    <div className={isInfiniteTimeline ? "min-w-max border-y relative" : "w-full border-y relative"}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
        }}
        className="border-b border-blue-200"
      >
        {yearHeaders.map((header, idx) => (
          <div
            key={`year-${idx}`}
            style={{
              gridColumn: `span ${header.span}`,
            }}
            className="relative h-full"
          >
            <div
              style={{
                position: "sticky",
                left: 0,
                width: "fit-content",
                backgroundColor: "white",
                paddingRight: "12px",
                zIndex: 10,
              }}
              className="py-2 px-3 border-r border-blue-200/50 h-full flex items-center"
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
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.1) 1px, transparent 1px)`,
          backgroundSize: `${WEEK_WIDTH_PX}px 100%`,
        }}
      >
        {allWeeksFlat.map((item, i) => (
          <div
            key={`week-${i}`}
            className="flex flex-col items-center justify-center relative py-2 last:border-r-0"
         
          >
            {item.isFirstOfMonth && (
              <span className="font-[600] text-[12px] text-[rgba(0,0,0,0.7)] mb-1">
                {item.monthName}
              </span>
            )}
            <span className="font-[400] text-[11px] text-[rgba(0,0,0,0.4)]">
              {item.week.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthInterval
