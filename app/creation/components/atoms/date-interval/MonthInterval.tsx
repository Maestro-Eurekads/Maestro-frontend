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
  const [daysInMonth, setDaysInEachMonth] = useState([])
  const { campaignFormData } = useCampaigns()
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (getDaysInEachMonth) {
      setDaysInEachMonth(getDaysInEachMonth())
    }
  }, [getDaysInEachMonth])

  // Optimized grid template columns calculation
  const totalDays = Object.values(daysInMonth || {}).reduce((acc, days) => acc + (days as number), 0)

  const monthCount = Object.keys(daysInMonth || {}).length

  const gridTemplateColumns = (() => {
    if (monthCount > 2) {
      // When more than 2 months, each month takes 30% of container
      return Object.keys(daysInMonth || {})
        .map(() => `20%`)
        .join(" ")
    } else {
      // Original proportional logic for 1-2 months
      return Object.values(daysInMonth || {})
        .map((days) => `${Math.round(((days as number) / totalDays) * 100)}%`)
        .join(" ")
    }
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
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }

    const screenWidth = getViewportWidth()
    const contWidth = screenWidth - (disableDrag ? 80 : 367)
    
    if (monthCount > 2) {
      // For multiple months with 30% each, create appropriate grid lines
      const monthWidth = 20 // 30% per month
      return `20% 100%`
    } else {
      // Original background sizing for 1-2 months
      return `100% 100%`
    }
  }, [monthCount])

  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundSize: getBackgroundSize(),
        }}
      >
        {Object.entries(daysInMonth || {}).map(([monthName], i) => (
          <div
            key={i}
            className="flex flex-col items-center relative py-3 border-r border-blue-200 last:border-r-0"
            style={{
              // Ensure consistent spacing within each month column
              minWidth: monthCount > 2 ?`20%` : "auto",
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">{monthName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthInterval
