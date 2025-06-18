"use client"

import { format, startOfYear, endOfYear, eachYearOfInterval } from "date-fns"
import { useCampaigns } from "app/utils/CampaignsContext"
import { useState, useEffect } from "react"

interface YearIntervalProps {
  yearsCount: number
  view?: boolean
  getDaysInEachYear?: () => Record<string, number>
  funnelData?: {
    startDay?: number
    endDay?: number
    startWeek?: number
    endWeek?: number
    startMonth?: number
    endMonth?: number
    startYear?: number
    endYear?: number
  }
  disableDrag?: boolean
}

const YearInterval = ({ yearsCount, view, getDaysInEachYear, funnelData, disableDrag }: YearIntervalProps) => {
  const { campaignFormData } = useCampaigns()
  const [daysInEachYear, setDaysInEachYear] = useState<Record<string, number>>({})

  const startDate = campaignFormData?.campaign_timeline_start_date
  const endDate = campaignFormData?.campaign_timeline_end_date

  useEffect(() => {
    if (getDaysInEachYear) {
      setDaysInEachYear(getDaysInEachYear())
    }
  }, [getDaysInEachYear])

  // Generate array of years to display
  const generateYears = () => {
    if (!startDate || !endDate) return []

    const start = new Date(startDate)
    const end = new Date(endDate)

    return eachYearOfInterval({
      start: startOfYear(start),
      end: endOfYear(end),
    })
  }

  const years = generateYears()

  // Calculate width for each year based on days in year
  const getYearWidth = (year: Date) => {
    const yearString = format(year, "yyyy")
    const daysInYear = daysInEachYear[yearString] || 365

    // Base width calculation - you can adjust this multiplier as needed
    const baseWidth = Math.max(200, daysInYear * 0.8)
    return baseWidth
  }

  // Check if a year is a leap year
  const isLeapYear = (year: Date) => {
    const yearNum = year.getFullYear()
    return (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0
  }

  return (
    <div className="year-interval">
      {/* Year Headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {years.map((year, index) => {
          const yearWidth = getYearWidth(year)
          const yearString = format(year, "yyyy")
          const daysCount = daysInEachYear[yearString] || (isLeapYear(year) ? 366 : 365)

          return (
            <div
              key={index}
              className="flex-shrink-0 border-r border-gray-200 last:border-r-0"
              style={{ width: `${yearWidth}px` }}
            >
              <div className="p-4 text-center">
                <div className="font-semibold text-lg text-gray-800">{format(year, "yyyy")}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {daysCount} days
                  {isLeapYear(year) && <span className="ml-1 text-xs text-blue-600">(Leap)</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Year Content Area */}
      <div className="flex min-h-[400px]">
        {years.map((year, index) => {
          const yearWidth = getYearWidth(year)
          const yearString = format(year, "yyyy")

          return (
            <div
              key={index}
              className="flex-shrink-0 border-r border-gray-200 last:border-r-0 relative bg-white hover:bg-gray-50 transition-colors"
              style={{ width: `${yearWidth}px` }}
            >
              {/* Year content area - you can add more content here */}
              <div className="p-4 h-full">
                <div className="text-center text-gray-500 text-sm">{yearString}</div>

                {/* Quarter markers */}
                <div className="flex justify-between mt-4 text-xs text-gray-400">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                </div>

                {/* Visual quarter divisions */}
                <div className="flex mt-2 h-2 bg-gray-100 rounded">
                  <div className="flex-1 bg-blue-200 rounded-l"></div>
                  <div className="flex-1 bg-green-200"></div>
                  <div className="flex-1 bg-yellow-200"></div>
                  <div className="flex-1 bg-red-200 rounded-r"></div>
                </div>
              </div>

              {/* Funnel data indicators */}
              {funnelData && (
                <>
                  {funnelData.startYear === index + 1 && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-green-500 z-10">
                      <div className="absolute -left-2 top-2 w-4 h-4 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                  {funnelData.endYear === index + 1 && (
                    <div className="absolute right-0 top-0 w-1 h-full bg-red-500 z-10">
                      <div className="absolute -right-2 top-2 w-4 h-4 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Year Summary Footer */}
      <div className="flex border-t border-gray-200 bg-gray-50">
        {years.map((year, index) => {
          const yearWidth = getYearWidth(year)
          const yearString = format(year, "yyyy")
          const daysCount = daysInEachYear[yearString] || (isLeapYear(year) ? 366 : 365)

          return (
            <div
              key={index}
              className="flex-shrink-0 border-r border-gray-200 last:border-r-0 p-2 text-center"
              style={{ width: `${yearWidth}px` }}
            >
              <div className="text-xs text-gray-600">
                {format(year, "MMM")} - {format(endOfYear(year), "MMM")}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default YearInterval
