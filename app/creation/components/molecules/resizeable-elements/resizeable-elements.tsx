"use client"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import type { StaticImageData } from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import DraggableChannel from "../../../../../components/DraggableChannel"
import ResizableChannels from "./ResizableChannels"
import { useFunnelContext } from "../../../../utils/FunnelContextType"
import { funnelStages, getPlatformIcon, platformStyles } from "../../../../../components/data"
import { useDateRange } from "src/date-range-context"
import { useDateRange as useRange } from "src/date-context"
import { useCampaigns } from "app/utils/CampaignsContext"
import { eachDayOfInterval, format, isEqual, parseISO } from "date-fns"
import { useComments } from "app/utils/CommentProvider"

interface OutletType {
  name: string
  icon: StaticImageData
  color: string
  bg: string
  channelName: string
  ad_sets: any[]
  format: any[]
  start_date: any
  end_date: any
}

function breakdownByMonth(start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end })
  const map: Record<string, number> = {}

  for (const day of days) {
    const key = format(day, "MMMM yyyy")
    map[key] = (map[key] || 0) + 1
  }
  return map
}

const ResizeableElements = ({
  funnelData,
  disableDrag,
  isOpen,
  setIsOpen,
  selectedStage,
  setSelectedStage,
}: {
  funnelData: any
  disableDrag?: any
  isOpen?: boolean
  setIsOpen?: any
  selectedStage?: string
  setSelectedStage?: any
}) => {
  const { funnelWidths } = useFunnelContext()
  const {close} = useComments()
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({})
  const { range } = useDateRange()
  const { range: rrange } = useRange()
  const { campaignFormData, loadingCampaign } = useCampaigns()
  const [channelWidths, setChannelWidths] = useState<Record<string, number>>({})
  const [containerWidth, setContainerWidth] = useState(null)
  const [openItems, setOpenItems] = useState(null)
  const [channelPositions, setChannelPositions] = useState<Record<string, number>>({})
  const [platforms, setPlatforms] = useState({})
  const gridRef = useRef(null)
  const [dailyWidthByView, setDailyWidthByView] = useState<Record<string, number>>({
    Day: 50,
    Week: 50,
    Month: 0,
  })

  const [daysInEachMonth, setDaysInEachMonth] = useState<Record<any, any>>({})

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const updateChannelWidth = (channelId: string, width: number) => {
    setChannelWidths((prev) => ({ ...prev, [channelId]: width }))
  }

  const updateChannelPosition = (channelId: string, left: number) => {
    setChannelPositions((prev) => ({ ...prev, [channelId]: left }))
  }

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {}
    const channelMix = campaignFormData?.channel_mix || []

    if (channelMix.length > 0) {
      channelMix.forEach((stage: any) => {
        const { funnel_stage } = stage
        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = []
        }

        const processPlatforms = (platforms: any[], channelName: string) => {
          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name)
            if (icon) {
              const style =
                platformStyles.find((style) => style.name === platform.platform_name) ||
                platformStyles[Math.floor(Math.random() * platformStyles.length)]
              platformsByStage[funnel_stage].push({
                name: platform.platform_name,
                icon,
                color: style.color,
                bg: style.bg,
                channelName,
                ad_sets: platform.ad_sets,
                format: platform.format,
                start_date: platform?.campaign_start_date,
                end_date: platform?.campaign_end_date,
              })
            }
          })
        }
        ;[
          "social_media",
          "display_networks",
          "search_engines",
          "streaming",
          "ooh",
          "broadcast",
          "messaging",
          "print",
          "e_commerce",
          "in_game",
          "mobile",
        ].forEach((channel) => {
          if (Array.isArray(stage[channel])) {
            processPlatforms(stage[channel], channel)
          }
        })
      })
    }

    return platformsByStage
  }, [campaignFormData])

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const data = getPlatformsFromStage()
      setPlatforms(data)
    }
  }, [campaignFormData])

  const calculateAndCacheDailyWidth = useCallback(
    (viewType: string, containerWidth: number, endMonth: number, totalDaysInRange: number) => {
      const getViewportWidth = () => {
        return window.innerWidth || document.documentElement.clientWidth || 0
      }
      const screenWidth = getViewportWidth()
      const contWidth = screenWidth - (disableDrag ? 80 : close ? 0:367)

      let dailyWidth: number

      if (viewType === "Day" || viewType === "Week") {
        const endPeriod = funnelData?.endDay || 1
        dailyWidth = contWidth / endPeriod
        dailyWidth = dailyWidth < 50 ? 50 : dailyWidth
      } else {
        // Month - ensure all months fit within screen width
        const totalDays = totalDaysInRange || funnelData?.endDay || 30

        // Force fit all days within available width
        dailyWidth = contWidth / totalDays
        // Remove minimum width constraint for month view to ensure everything fits
        dailyWidth = Math.max(dailyWidth, 10) // Very small minimum to prevent invisible columns
      }

      setDailyWidthByView((prev) => ({
        ...prev,
        [viewType]: Math.round(dailyWidth),
      }))

      return Math.round(dailyWidth)
    },
    [disableDrag, funnelData?.endDay, funnelData?.endMonth, close], // Removed daysInEachMonth from dependencies
  )

  useEffect(() => {
    if (!rrange || !gridRef?.current) return

    // First calculate days in each month
    const result = getDaysInEachMonth(range)
    setDaysInEachMonth(result)

    // Then calculate total days
    const totalDaysInRange = Object.values(result).reduce((sum: number, days: number) => sum + days, 0)

    // Finally update container width and daily width
    requestAnimationFrame(() => {
      const gridContainer = document.querySelector(".grid-container") as HTMLElement
      if (!gridContainer) return

      const containerRect = gridContainer.getBoundingClientRect()
      const contWidth = containerRect.width - 75
      setContainerWidth(contWidth + 75)

      // Calculate and cache daily width for current view
      const endMonth = funnelData?.endMonth || 1
      calculateAndCacheDailyWidth(rrange, contWidth, endMonth, totalDaysInRange)
    })
  }, [rrange, funnelData?.endMonth, range, calculateAndCacheDailyWidth]) // Removed calculateAndCacheDailyWidth from dependencies to break circular reference

  // Enhanced function that returns the number of days in each month using the state range as reference
  const getDaysInEachMonth = useCallback((range: Date[]): Record<string, number> => {
    const daysInMonth: Record<string, number> = {}

    range.forEach((date) => {
      const monthYear = format(date, "MMMM yyyy")
      daysInMonth[monthYear] = (daysInMonth[monthYear] || 0) + 1
    })

    return daysInMonth
  }, [])

  // New function to generate dynamic grid template columns for month view
  const generateMonthGridColumns = useCallback(() => {
    if (rrange !== "Month") return ""

    const dailyWidth = dailyWidthByView[rrange] || 50
    const months = Object.keys(daysInEachMonth)

    if (months.length === 0) return `repeat(${funnelData?.endDay || 30}, ${dailyWidth}px)`

    // Create a column definition for each day in each month
    const columnDefinitions: string[] = []

    months.forEach((month) => {
      const daysInThisMonth = daysInEachMonth[month]
      // Add columns for each day in this month
      for (let i = 0; i < daysInThisMonth; i++) {
        columnDefinitions.push(`${dailyWidth}px`)
      }
    })

    return columnDefinitions.join(" ")
  }, [rrange, daysInEachMonth, dailyWidthByView, funnelData?.endDay])

  // Enhanced function to get grid column end position for month view
  const getGridColumnEnd = useCallback(() => {
    if (rrange === "Day") {
      return funnelData?.endDay || 1
    } else if (rrange === "Week") {
      return funnelData?.endDay || 1
    } else {
      // Month view - return total number of days across all months
      const totalDays = Object.values(daysInEachMonth).reduce((sum: number, days: number) => sum + days, 0)
      return totalDays || funnelData?.endDay || 30
    }
  }, [rrange, funnelData?.endDay, funnelData?.endWeek, daysInEachMonth])

  const getDailyWidth = useCallback(
    (viewType?: string): number => {
      const currentView = viewType || rrange
      return dailyWidthByView[currentView] || 50
    },
    [dailyWidthByView, rrange],
  )

  useEffect(() => {
    if (!campaignFormData?.funnel_stages || !containerWidth || Object.keys(daysInEachMonth).length === 0) return

    const initialWidths: Record<string, number> = {}
    const initialPositions: Record<string, number> = {}
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0
    }
    const screenWidth = getViewportWidth()
    const availableWidth = screenWidth - (disableDrag ? 60 : close ? 0:367)

    // //console.log("🚀  ~ Width:", { screenWidth, availableWidth })

    campaignFormData.funnel_stages.forEach((stageName) => {
      const stage = campaignFormData?.channel_mix?.find((s) => s?.funnel_stage === stageName)
      if (stageName && stage) {
        const stageStartDate = stage?.funnel_stage_timeline_start_date
          ? parseISO(stage?.funnel_stage_timeline_start_date)
          : null
        const stageEndDate = stage?.funnel_stage_timeline_end_date
          ? parseISO(stage?.funnel_stage_timeline_end_date)
          : null

        const startDateIndex = stageStartDate
          ? range?.findIndex((date) => isEqual(date, stageStartDate)) * getDailyWidth()
          : 0

        const daysBetween = eachDayOfInterval({ start: stageStartDate, end: stageEndDate }).length - 1

        const daysFromStart = eachDayOfInterval({
          start: campaignFormData?.campaign_timeline_start_date
            ? parseISO(campaignFormData?.campaign_timeline_start_date)
            : null,
          end: campaignFormData?.campaign_timeline_end_date
            ? parseISO(campaignFormData?.campaign_timeline_end_date)
            : null,
        }).length

        const dailyWidth = getDailyWidth()

        initialWidths[stageName] = (() => {
          if (rrange === "Day" || rrange === "Week") {
            return daysBetween > 0 ? dailyWidth * daysBetween : dailyWidth * daysFromStart - 55
          } else {
            // Month view - calculate width based on actual days and ensure it fits within screen
            const totalDaysInRange = Object.values(daysInEachMonth).reduce((sum: number, days: number) => sum + days, 0)
            const widthPerDay = availableWidth / (totalDaysInRange || 30)

            return daysBetween > 0 ? widthPerDay * daysBetween : widthPerDay * daysFromStart - 40
          }
        })()

        initialPositions[stageName] = startDateIndex
      }
    })

    setChannelWidths(initialWidths)
    setChannelPositions(initialPositions)
  }, [
    campaignFormData?.funnel_stages,
    containerWidth,
    campaignFormData?.campaign_timeline_start_date,
    campaignFormData?.campaign_timeline_end_date,
    rrange,
    daysInEachMonth,
    disableDrag,
    range,
    getDailyWidth, // Keep this as it's memoized
    close
  ])

  return (
    <div
      className={`w-full min-h-[494px] relative pb-5 grid-container overflow-x-hidden ${rrange === "Month" && "max-w-[100vw]"}`}
      ref={gridRef}
      style={{
        backgroundImage: (() => {
          if (rrange === "Day" || rrange === "Week") {
            return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`
          } else {
            // Month view - add thicker lines at month boundaries
            const months = Object.keys(daysInEachMonth)
            if (months.length <= 1) {
              return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`
            }

            // Create gradient layers: regular grid, weekly grid, and thick month boundaries
            const regularGrid = `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`
            const weeklyGrid = `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`
            const monthBoundaryGrid = `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)` // 3px thick lines

            return `${regularGrid}, ${monthBoundaryGrid}`
          }
        })(),
        backgroundSize: (() => {
          const dailyWidth = getDailyWidth()
          if (rrange === "Day" || rrange === "Week") {
            const totalDays = funnelData?.endDay || 1
            // For week view, show grid lines for each individual day, not week groupings
            const dailyGridSize = `${dailyWidth}px 100%`
            // For week boundaries, we need to calculate based on actual week structure
            if (rrange === "Week") {
              // Use daily grid for individual day lines
              return dailyGridSize
            }
            return `${dailyGridSize}, calc(${dailyWidth * totalDays}px) 100%`
          } else {
            // Month view - create background pattern with thicker lines at month boundaries
            const months = Object.keys(daysInEachMonth)
            if (months.length === 0) {
              return `calc(${dailyWidth}px) 100%, calc(${dailyWidth * 7}px) 100%`
            }

            // Create background positions for month end lines
            let cumulativeDays = 0
            const monthEndPositions: number[] = []

            months.forEach((month, index) => {
              const daysInThisMonth = daysInEachMonth[month]
              cumulativeDays += daysInThisMonth

              // Add position for month end line (except for the last month)
              if (index < months.length - 1) {
                monthEndPositions.push(cumulativeDays * dailyWidth)
              }
            })

            // Create multiple background layers
            const regularGridSize = `${dailyWidth}px 100%`
            const weeklyGridSize = `${dailyWidth * 7}px 100%`

            // Create month boundary backgrounds
            const monthBoundaryBackgrounds = monthEndPositions.map((position) => `${position}px 100%`).join(", ")

            return monthBoundaryBackgrounds ? `${regularGridSize}, ${monthBoundaryBackgrounds}` : `${regularGridSize}`
          }
        })(),
      }}
    >
      {loadingCampaign ? (
        // Skeleton loading UI
        <div className="w-full p-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="mb-8">
              <Skeleton height={60} width="100%" className="mb-2 rounded-[10px]" />
              <div className="pl-4 mt-2">
                {[1, 2].map((channel) => (
                  <Skeleton key={channel} height={40} width="90%" className="mb-2 rounded-[10px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Original content
        campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = campaignFormData?.custom_funnels?.find((s) => s?.name === stageName)
          const funn = funnelStages?.find((ff) => ff?.name === stageName)
          if (!stage) return null

          const channelWidth = funnelWidths[stage?.name] || 400
          const isOpen = openChannels[stage?.name] || false

          // Get the specific width and position for this channel or use default
          const currentChannelWidth = channelWidths[stage?.name] || 350
          const currentChannelPosition = channelPositions[stage?.name] || 0

          return (
            <div
              key={index}
              className="h-full"
              style={{
                display: "grid",
                gridTemplateColumns: (() => {
                  const dailyWidth = getDailyWidth()
                  if (rrange === "Day" || rrange === "Week") {
                    return `repeat(${funnelData?.endDay || 1}, ${dailyWidth}px)`
                  } else {
                    // Month view - use dynamic grid columns based on actual days in each month
                    return generateMonthGridColumns() || `repeat(${funnelData?.endDay || 30}, ${dailyWidth}px)`
                  }
                })(),
              }}
            >
              <div
                className="flex flex-col mt-6 rounded-[10px] p-4 px-0 justify-between w-fit"
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: getGridColumnEnd() + 1,
                }}
              >
                <DraggableChannel
                  id={stage?.name}
                  openChannel={isOpen}
                  bg={stage?.color?.split("-")[1]}
                  color={stage?.color}
                  description={stage?.name}
                  setIsOpen={setIsOpen}
                  setOpenChannel={() => toggleChannel(stage?.name)}
                  Icon={stage?.activeIcon}
                  dateList={range}
                  dragConstraints={gridRef}
                  parentWidth={currentChannelWidth}
                  setParentWidth={(width) => updateChannelWidth(stage?.name, width)}
                  parentLeft={currentChannelPosition}
                  setParentLeft={(left) => updateChannelPosition(stage?.name, left)}
                  setSelectedStage={setSelectedStage}
                  disableDrag={disableDrag}
                  openItems={openItems}
                  setOpenItems={setOpenItems}
                  endMonth={funnelData?.endMonth}
                  endDay={funnelData?.endDay}
                  endWeek={funnelData?.endWeek}
                  dailyWidth={getDailyWidth()}
                />

                {isOpen && (
                  <div>
                    <ResizableChannels
                      channels={platforms[stage.name]}
                      parentId={stage?.name}
                      parentWidth={currentChannelWidth}
                      parentLeft={currentChannelPosition}
                      setIsOpen={setIsOpen}
                      dateList={range}
                      setSelectedStage={setSelectedStage}
                      disableDrag={disableDrag}
                      openItems={openItems}
                      setOpenItems={setOpenItems}
                      endMonth={funnelData?.endMonth}
                      endDay={funnelData?.endDay}
                      endWeek={funnelData?.endWeek}
                      dailyWidth={getDailyWidth()}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default ResizeableElements
