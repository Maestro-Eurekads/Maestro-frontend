"use client"

import { useCampaigns } from "app/utils/CampaignsContext"
import { useDateRange } from "../../../../../src/date-context"
import DateComponent from "../../molecules/date-component/date-component"
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements"
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  eachWeekOfInterval,
  format,
  isSameWeek,
  parseISO,
} from "date-fns"
import DayInterval from "../../atoms/date-interval/DayInterval"
import MonthInterval from "../../atoms/date-interval/MonthInterval"
import WeekInterval from "../../atoms/date-interval/WeekInterval"
import { useState, useEffect, useCallback } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import AddNewChennelsModel from "components/Modals/AddNewChennelsModel"
import { useDateRange as useRange } from "src/date-range-context"
import YearInterval from "../../atoms/date-interval/YearInterval"
import { useActive } from "app/utils/ActiveContext"
import { useComments } from "app/utils/CommentProvider"

const MainSection = ({
  hideDate,
  disableDrag,
  view,
}: {
  hideDate?: boolean
  disableDrag?: boolean
  view?: boolean
}) => {
  const { clientCampaignData, campaignFormData } = useCampaigns()
  const { range: rrange } = useRange()
  const [daysInEachMonth, setDaysInEachMonth] = useState<Record<any, any>>({})
  const { range } = useDateRange()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState("")
  const { active, subStep } = useActive()
  const { setClose } = useComments()

  // Zoom state management
  const [zoomLevel, setZoomLevel] = useState(1)
  const minZoom = 0.1
  const maxZoom = 3
  const zoomStep = 0.05

  const startDates = campaignFormData?.campaign_timeline_start_date
    ? campaignFormData?.campaign_timeline_start_date
    : ""
  const endDates = campaignFormData?.campaign_timeline_end_date ? campaignFormData?.campaign_timeline_end_date : ""

  const dayDifference = differenceInCalendarDays(endDates, startDates)
  const weekDifference =
    startDates && endDates
      ? eachWeekOfInterval({ start: new Date(startDates), end: new Date(endDates) }, { weekStartsOn: 1 }).length
      : 0
  const monthDifference = differenceInCalendarMonths(endDates, startDates)
  const yearDifference = differenceInCalendarYears(endDates, startDates)

  const isValidDateFormat = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date)

  const start = campaignFormData?.campaign_timeline_start_date
    ? typeof campaignFormData.campaign_timeline_start_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_start_date)
      ? parseISO(campaignFormData.campaign_timeline_start_date)
      : campaignFormData.campaign_timeline_start_date
    : null

  const end = campaignFormData?.campaign_timeline_end_date
    ? typeof campaignFormData.campaign_timeline_end_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_end_date)
      ? parseISO(campaignFormData.campaign_timeline_end_date)
      : campaignFormData.campaign_timeline_end_date
    : null

  // Get the list of weeks
  const allWeeks =
    startDates && endDates
      ? eachWeekOfInterval({ start: new Date(startDates), end: new Date(endDates) }, { weekStartsOn: 1 })
      : []

  // Helper to get week index in the range
  const findWeekIndex = (date: Date | null) =>
    allWeeks.findIndex((weekStart) => (date ? isSameWeek(weekStart, date, { weekStartsOn: 1 }) : false)) + 1

  // Calculate positions for different time ranges
  const startDay = differenceInCalendarDays(start, startDates) + 1
  const endDay = differenceInCalendarDays(end, startDates) + 1
  const startWeek = findWeekIndex(start) - 1
  const endWeek = findWeekIndex(end) - 1
  const startMonth = differenceInCalendarMonths(start, startDates) + 1
  const endMonth = differenceInCalendarMonths(end, startDates) + 1
  const startYear = differenceInCalendarYears(start, startDates) + 1
  const endYear = differenceInCalendarYears(end, startDates) + 1

  const funnelsData = {
    startDay,
    endDay,
    startWeek,
    endWeek,
    startMonth,
    endMonth,
    startYear,
    endYear,
  }

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + zoomStep, maxZoom))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - zoomStep, minZoom))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "=" || event.key === "+") {
          event.preventDefault()
          zoomIn()
        } else if (event.key === "-") {
          event.preventDefault()
          zoomOut()
        } else if (event.key === "0") {
          event.preventDefault()
          resetZoom()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [zoomIn, zoomOut, resetZoom])

  function getDaysInEachMonth(): Record<string, number> {
    const daysInMonth: Record<string, number> = {}
    rrange?.forEach((date) => {
      const monthYear = format(date, "MMMM yyyy")
      daysInMonth[monthYear] = (daysInMonth[monthYear] || 0) + 1
    })
    return daysInMonth
  }

  useEffect(() => {
    if (active === 7) {
      if (subStep === 1) {
        setClose(true)
      }
    }
  }, [active, subStep, close])

  function getDaysInEachYear(): Record<string, number> {
    const daysInYear: Record<string, number> = {}
    rrange?.forEach((date) => {
      const year = format(date, "yyyy")
      daysInYear[year] = (daysInYear[year] || 0) + 1
    })
    return daysInYear
  }

  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval daysCount={dayDifference + 1} src="campaign" />
          </>
        )
      case "Month":
        return (
          <>
            <MonthInterval
              monthsCount={monthDifference === 0 ? 1 : monthDifference + 1}
              view={view}
              getDaysInEachMonth={getDaysInEachMonth}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
          </>
        )
      case "Year":
        return (
          <>
            <YearInterval
              yearsCount={yearDifference === 0 ? 1 : yearDifference + 1}
              view={view}
              getDaysInEachYear={getDaysInEachYear}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
          </>
        )
      default: // Week is default
        return (
          <>
            <WeekInterval
              weeksCount={weekDifference === 0 ? 1 : weekDifference - 1}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
          </>
        )
    }
  }

  return (
    <div className="mt-[32px] w-full">
      {!hideDate && <DateComponent useDate={true} />}

      {/* Zoom Controls */}
      <div className="flex items-center justify-between mb-4 pl-4">
        <div className="flex items-center gap-2 bg-white border rounded-lg p-2 shadow-sm">
          <button
            onClick={zoomOut}
            disabled={zoomLevel <= minZoom}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out (Ctrl + -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            disabled={zoomLevel >= maxZoom}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In (Ctrl + +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button onClick={resetZoom} className="p-1 rounded hover:bg-gray-100" title="Reset Zoom (Ctrl + 0)">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="w-full h-auto bg-white border-b-2 relative mt-4 overflow-hidden">
        <div
          className="w-full h-full overflow-x-auto overflow-y-hidden hide-vertical-scrollbar"
          style={{
            maxWidth: "100vw",
          }}
        >
          <div
            className="relative bg-white transition-transform duration-200 ease-out px-2"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "left top",
              width: "fit-content",
              minWidth: "100%",
            }}
          >
            {/* Timeline Content */}
            <div className="relative w-full">
              <div className="bg-white w-full">{renderTimeline()}</div>
            </div>

            {/* Side indicators */}
            <div className="absolute right-[4px] top-18 w-1 bg-orange-500 z-20" style={{ height: "94%" }} />
            <div className="absolute left-[8px] top-18 w-1 bg-orange-500 z-20" style={{ height: "94%" }} />

            {/* Resizable Elements */}
            <ResizeableElements
              funnelData={funnelsData}
              disableDrag={disableDrag}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && <AddNewChennelsModel isOpen={isOpen} setIsOpen={setIsOpen} selectedStage={selectedStage} />}
    </div>
  )
}

export default MainSection
