"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { eachDayOfInterval, addDays, format } from "date-fns"
import { useCampaigns } from "app/utils/CampaignsContext"

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
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (getDaysInEachMonth) {
      const daysData = getDaysInEachMonth()
      setDaysInEachMonth(daysData)
    }
  }, [getDaysInEachMonth])

  // Calculate total days and month count
  const totalDays = Object.values(daysInMonth || {}).reduce((acc, days) => acc + days, 0)
  const monthCount = Object.keys(daysInMonth || {}).length

  // Calculate grid template columns based on actual days in each month
  const gridTemplateColumns = useCallback(() => {
    if (monthCount === 0) return "1fr"
    
    if (monthCount > 3) {
      // When more than 3 months, each month takes at least 20% of container
      return Object.values(daysInMonth)
        .map((days) => {
          const proportionalWidth = (days / totalDays) * 100;
          const monthWidth = Math.max(proportionalWidth, 20); // Minimum 20%
          return `${Math.round(monthWidth)}%`;
        })
        .join(" ")
    } else {
      // For 3 or fewer months, use proportional logic
      return Object.values(daysInMonth)
        .map((days) => `${Math.round((days / totalDays) * 100)}%`)
        .join(" ")
    }
  }, [daysInMonth, monthCount, totalDays])

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

  useEffect(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }

    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)
    setContainerWidth(contWidth)
  }, [disableDrag])

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }

    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)

    let dailyWidth: number

    if (monthCount > 0) {
      // Use actual total days from the data
      dailyWidth = contWidth / totalDays
    } else {
      // Fallback to funnel data
      const totalDays = funnelData?.endDay || 30
      dailyWidth = contWidth / totalDays
    }

    // Ensure minimum width constraints
    dailyWidth = Math.max(dailyWidth, 10)

    return Math.round(dailyWidth)
  }, [disableDrag, funnelData?.endDay, monthCount, totalDays])

  const dailyWidth = calculateDailyWidth()

  // Calculate background size based on actual month data
  const getBackgroundSize = useCallback(() => {
    if (monthCount === 0) return "100% 100%"
    
    // No daily grid lines for month view - only month boundaries
    return "100% 100%"
  }, [monthCount])

  // Only render if we have data
  if (monthCount === 0) {
    return (
      <div className="w-full border-y">
        <div className="flex items-center justify-center py-4">
          <span className="text-gray-500">Loading month view...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border-y">
      <div
      className="inline-flex"
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns(),
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3) 1px, transparent 1px)`,
          backgroundSize: getBackgroundSize(),
        }}
      >
        {Object.entries(daysInMonth).map(([monthName, daysCount], i) => (
          <div
            key={i}
            className=" relative pt-3 border-r border-slate-200 last:border-r-0"
          >
            <div className="flex flex-col gap-2 items-center">
              <p className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                {monthName}
              </p>
              <p className="text-[11px] text-gray-400">
                ({daysCount} days)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthInterval
