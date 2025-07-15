"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md"
import Image from "next/image"
import icroundadd from "../public/ic_round-add.svg"
import { useFunnelContext } from "../app/utils/FunnelContextType"
import { useCampaigns } from "app/utils/CampaignsContext"
import moment from "moment"
import { useDateRange as useDRange } from "src/date-context"
import { useDateRange  } from "src/date-range-context"
import { getCurrencySymbol } from "./data"
import { addDays, format, subDays } from "date-fns"

interface DraggableChannelProps {
  id?: string
  bg?: string
  description?: string
  setIsOpen?: (show: boolean) => void
  openChannel?: boolean
  setOpenChannel?: (open: boolean) => void
  Icon?: any
  dateList?: Date[]
  dragConstraints?: any
  parentWidth?: number
  setParentWidth?: (width: number) => void
  parentLeft?: number
  setParentLeft?: (left: number) => void
  disableDrag?: boolean
  budget?: number | string
  setSelectedStage?: any
  openItems?: any
  setOpenItems?: any
  endMonth?: any
  color?: any
  endDay?: any
  endWeek?: any
  dailyWidth?: number
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: string
  type: "resize" | "drag" | null
}

const DraggableChannel: React.FC<DraggableChannelProps> = ({
  id,
  bg,
  description,
  setIsOpen,
  openChannel,
  setOpenChannel,
  Icon,
  dateList = [],
  dragConstraints,
  parentWidth,
  setParentWidth,
  parentLeft,
  setParentLeft,
  disableDrag = false,
  budget,
  setSelectedStage,
  openItems,
  setOpenItems,
  endMonth,
  color,
  endDay,
  endWeek,
  dailyWidth,
}) => {
  const { funnelWidths, setFunnelWidth } = useFunnelContext()
  const [position, setPosition] = useState(parentLeft || 0)
  const isResizing = useRef<{
    startX: number
    startWidth: number
    startPos: number
    direction: "left" | "right"
  } | null>(null)
  const isDragging = useRef<{ startX: number; startPos: number } | null>(null)
  const draftCampaignFormRef = useRef<any>(null)
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const { range } = useDRange()
  const {range:rrange, extendRange} = useDateRange()

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
  })

  useEffect(() => {
    setPosition(parentLeft || 0)
  }, [parentLeft])

  const pixelToDate = (pixel: number, containerWidth: number, fieldName?: string) => {
    if (!dateList.length) return new Date()

    const startDate = dateList[0]
    const totalDays = dateList.length - 1

    if (range === "Year") {
      const totalMonths = 12
      const clampedPixel = Math.max(0, Math.min(pixel, containerWidth))
      const monthFraction = clampedPixel / containerWidth
      const monthIndex = Math.round(monthFraction * totalMonths)
      const year = startDate.getFullYear()

      if (fieldName === "endDate") {
        return new Date(year, Math.min(11, monthIndex), 0)
      }
      return new Date(year, Math.min(11, monthIndex), 1)
    }

    const dayIndex = Math.min(totalDays, Math.max(0, Math.round((pixel / containerWidth) * totalDays)))
    const calculatedDate = new Date(startDate)
    calculatedDate.setDate(startDate.getDate() + dayIndex)

    return calculatedDate
  }

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    if (range === "Year") {
      const monthWidth = containerWidth / 12
      const monthIndex = Math.round(currentPosition / monthWidth)
      return Math.min(monthIndex * monthWidth, containerWidth)
    }

    const baseStep = dailyWidth || containerWidth / (dateList.length - 1)
    const snapPoints = []
    for (let i = 0; i <= containerWidth; i += baseStep) {
      snapPoints.push(i)
    }

    const closestSnap = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev
    )

    return closestSnap
  }

  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag",
  ) => {
    if (!dateList.length) return

    const totalDays = dateList.length - 1
    const containerWidth = parentWidth || 100

    const dayStartIndex = Math.min(totalDays, Math.max(0, Math.round((startPixel / containerWidth) * totalDays)))
    const dayEndIndex = Math.min(totalDays, Math.max(0, Math.round((endPixel / containerWidth) * totalDays)))

    const startDateValue = dateList[dayStartIndex] || dateList[0]
    const endDateValue = dateList[dayEndIndex] || dateList[totalDays]

    const formattedStartDate =
      range === "Year"
        ? startDateValue.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : startDateValue.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })

    const formattedEndDate =
      range === "Year"
        ? endDateValue.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : endDateValue.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })

    const container = document.querySelector(`.cont-${id?.replaceAll(" ", "_")}`) as HTMLElement
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const tooltipX = mouseX - containerRect.left
    const tooltipY = mouseY - containerRect.top - 50

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
      content: `${description}: ${formattedStartDate} - ${formattedEndDate}`,
      type,
    })
  }

  const handleMouseDownResize = (e: React.MouseEvent<HTMLDivElement>, direction: "left" | "right") => {
    if (disableDrag || openItems) return
    e.preventDefault()
    e.stopPropagation()

    const startPixel = position
    const endPixel = startPixel + (parentWidth || 0)
    updateTooltipWithDates(startPixel, endPixel, e.clientX, e.clientY, "resize")

    isResizing.current = {
      startX: e.clientX,
      startWidth: parentWidth || 0,
      startPos: position,
      direction,
    }
    document.addEventListener("mousemove", handleMouseMoveResize)
    document.addEventListener("mouseup", handleMouseUp)
  }
  // const handleMouseMoveResize = (e: MouseEvent) => {
  //   if (!isResizing.current) return
  //   const { startX, startWidth, startPos, direction } = isResizing.current

  //   let newWidth = startWidth
  //   let newPos = startPos

  //   const gridContainer = document.querySelector(".grid-container") as HTMLElement
  //   if (!gridContainer) return

  //   const containerRect = gridContainer.getBoundingClientRect()
  //   const minX = 0
  //   const maxX = containerRect.width - 45

  //   if (direction === "left") {
  //     const deltaX = e.clientX - startX
  //     newWidth = Math.max(50, startWidth - deltaX)
  //     newPos = Math.max(minX, startPos + deltaX)

  //     const snappedPos = snapToTimeline(newPos, containerRect.width)
  //     newWidth = startWidth - (snappedPos - startPos)
  //     newPos = snappedPos
  //   } else {
  //     // 👉 Right resize: lock position, grow width only
  //     const deltaX = e.clientX - startX
  //     const rawNewWidth = startWidth + deltaX

  //     const rightEdgePos = startPos + rawNewWidth
  //     const snappedRightEdge = snapToTimeline(rightEdgePos, containerRect.width)

  //     newWidth = Math.max(50, snappedRightEdge - startPos)
  //     newPos = startPos // ⚠️ lock left edge
  //   }

  //   // Convert pixel positions to dates
  //   const startDate = pixelToDate(newPos, containerRect.width)
  //   const endDate = pixelToDate(newPos + newWidth, containerRect.width, "endDate")

  //   if ((startDate) < rrange[0] || endDate > rrange[rrange.length - 1]) {
  //     extendRange(format(startDate, "yyyy-MM-dd"), format(endDate, "yyyy-MM-dd"));
  //   }

  //   // Prepare updated channel mix
  //   const updatedChannelMix = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === description)

  //   if (updatedChannelMix) {
  //     updatedChannelMix.funnel_stage_timeline_start_date = moment(startDate).format("YYYY-MM-DD")
  //     updatedChannelMix.funnel_stage_timeline_end_date = moment(endDate).format("YYYY-MM-DD")

  //     const mediaTypes = [
  //       "social_media",
  //       "display_networks",
  //       "search_engines",
  //       "streaming",
  //       "ooh",
  //       "broadcast",
  //       "messaging",
  //       "print",
  //       "e_commerce",
  //       "in_game",
  //       "mobile",
  //     ]

  //     mediaTypes.forEach((type) => {
  //       const platforms = updatedChannelMix[type]
  //       if (platforms && Array.isArray(platforms)) {
  //         platforms.forEach((platform) => {
  //           platform.campaign_start_date = moment(startDate).format("YYYY-MM-DD")
  //           platform.campaign_end_date = moment(endDate).format("YYYY-MM-DD")
  //         })
  //       }
  //     })
  //   }

  //   const allStartDates = campaignFormData?.channel_mix
  //     ?.map((ch) => ch?.funnel_stage_timeline_start_date && moment(ch.funnel_stage_timeline_start_date))
  //     .filter((date) => date) // Filter out null or undefined dates

  //   const allEndDates = campaignFormData?.channel_mix
  //     ?.map((ch) => ch?.funnel_stage_timeline_end_date && moment(ch.funnel_stage_timeline_end_date))
  //     .filter((date) => date) // Filter out null or undefined dates

  //   const minStartDate = moment.min(allStartDates).format("YYYY-MM-DD")
  //   // console.log("🚀 ~ handleMouseMoveResize ~ minStartDate:", minStartDate)
  //   const maxEndDate = moment.max(allEndDates).format("YYYY-MM-DD")
  //   // console.log("🚀 ~ handleMouseMoveResize ~ maxEndDate:", maxEndDate)

  //   // 💡 Only buffer the data here; flush on mouseup
  //   draftCampaignFormRef.current = {
  //     ...campaignFormData,
  //     channel_mix: campaignFormData.channel_mix.map((ch) => (ch.funnel_stage === description ? updatedChannelMix : ch)),
  //     ...(range === "Year" && {
  //       campaign_timeline_start_date: minStartDate,
  //       campaign_timeline_end_date: maxEndDate,
  //     }),
  //   }

  //   // Update visual size/position immediately
  //   setParentWidth(newWidth)
  //   setParentLeft(newPos)
  //   setPosition(newPos)

  //   updateTooltipWithDates(newPos, newPos + newWidth, e.clientX, e.clientY, "resize")
  // }

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const { startX, startWidth, startPos, direction } = isResizing.current;
  
    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;
  
    const containerRect = gridContainer.getBoundingClientRect();
    let newWidth = startWidth;
    let newPos = startPos;
  
    const mouseX = e.clientX - containerRect.left;
  
    const rangeStart = rrange[0];
    const rangeEnd = rrange[rrange.length - 1];
  
    if (direction === "left") {
      const deltaX = e.clientX - startX;
      newPos = Math.max(0, startPos + deltaX);
      newWidth = Math.max(50, startWidth - deltaX);
      newPos = snapToTimeline(newPos, containerRect.width);
      newWidth = startWidth - (newPos - startPos);
  
      if (mouseX < 0) {
        const newRangeStart = subDays(rangeStart, 2);
        extendRange(
          newRangeStart.toISOString().split("T")[0],
          rangeEnd.toISOString().split("T")[0]
        );
      }
    } else {
      const deltaX = e.clientX - startX;
      const rightEdgePos = startPos + startWidth + deltaX;
      const snappedRightEdge = snapToTimeline(rightEdgePos, containerRect.width);
      newWidth = Math.max(50, snappedRightEdge - startPos);
  
      if (mouseX > containerRect.width) {
        const newRangeEnd = addDays(rangeEnd, 2);
        extendRange(
          rangeStart.toISOString().split("T")[0],
          newRangeEnd.toISOString().split("T")[0]
        );
      }
    }
  
    const startDate = pixelToDate(newPos, containerRect.width);
    const endDate = pixelToDate(newPos + newWidth, containerRect.width);

      //   const updatedChannelMix = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === description)

  //   if (updatedChannelMix) {
  //     updatedChannelMix.funnel_stage_timeline_start_date = moment(startDate).format("YYYY-MM-DD")
  //     updatedChannelMix.funnel_stage_timeline_end_date = moment(endDate).format("YYYY-MM-DD")

  //     const mediaTypes = [
  //       "social_media",
  //       "display_networks",
  //       "search_engines",
  //       "streaming",
  //       "ooh",
  //       "broadcast",
  //       "messaging",
  //       "print",
  //       "e_commerce",
  //       "in_game",
  //       "mobile",
  //     ]

  //     mediaTypes.forEach((type) => {
  //       const platforms = updatedChannelMix[type]
  //       if (platforms && Array.isArray(platforms)) {
  //         platforms.forEach((platform) => {
  //           platform.campaign_start_date = moment(startDate).format("YYYY-MM-DD")
  //           platform.campaign_end_date = moment(endDate).format("YYYY-MM-DD")
  //         })
  //       }
  //     })
  //   }

  //   const allStartDates = campaignFormData?.channel_mix
  //     ?.map((ch) => ch?.funnel_stage_timeline_start_date && moment(ch.funnel_stage_timeline_start_date))
  //     .filter((date) => date) // Filter out null or undefined dates

  //   const allEndDates = campaignFormData?.channel_mix
  //     ?.map((ch) => ch?.funnel_stage_timeline_end_date && moment(ch.funnel_stage_timeline_end_date))
  //     .filter((date) => date) // Filter out null or undefined dates

  //   const minStartDate = moment.min(allStartDates).format("YYYY-MM-DD")
  //   // console.log("🚀 ~ handleMouseMoveResize ~ minStartDate:", minStartDate)
  //   const maxEndDate = moment.max(allEndDates).format("YYYY-MM-DD")
  //   // console.log("🚀 ~ handleMouseMoveResize ~ maxEndDate:", maxEndDate)

  //   // 💡 Only buffer the data here; flush on mouseup
  //   draftCampaignFormRef.current = {
  //     ...campaignFormData,
  //     channel_mix: campaignFormData.channel_mix.map((ch) => (ch.funnel_stage === description ? updatedChannelMix : ch)),
  //     ...(range === "Year" && {
  //       campaign_timeline_start_date: minStartDate,
  //       campaign_timeline_end_date: maxEndDate,
  //     }),
  //   }
  
    setParentWidth(newWidth);
    setParentLeft(newPos);
    setPosition(newPos);
  
    updateTooltipWithDates(newPos, newPos + newWidth, e.clientX, e.clientY, "resize");
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    // setOpenChannel(false)
    if (disableDrag) return
    e.preventDefault()

    // Add tooltip on drag start
    const startPixel = position
    const endPixel = startPixel + parentWidth
    updateTooltipWithDates(startPixel, endPixel, e.clientX, e.clientY, "drag")

    isDragging.current = { startX: e.clientX, startPos: position }
    document.addEventListener("mousemove", handleMouseMoveDrag)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // const handleMouseMoveDrag = (e: MouseEvent) => {
  //   // setOpenChannel(false)
  //   if (!isDragging.current) return
  //   const { startX, startPos } = isDragging.current

  //   const gridContainer = document.querySelector(".grid-container") as HTMLElement
  //   if (!gridContainer) return

  //   const containerRect = gridContainer.getBoundingClientRect()
  //   const minX = 0
  //   const maxX = containerRect.width - 45 - parentWidth

  //   let newPosition = startPos + (e.clientX - startX)
  //   newPosition = Math.max(minX, Math.min(newPosition, maxX))

  //   // Snap to the nearest grid position
  //   newPosition = snapToTimeline(newPosition, containerRect.width)

  //   // Smoothly update the position using requestAnimationFrame
  //   requestAnimationFrame(() => {
  //     setParentLeft(newPosition)
  //     setPosition(newPosition)
  //   })

  //   // Calculate start and end pixel positions
  //   const startPixel = newPosition
  //   const endPixel = startPixel + parentWidth

  //   // Convert pixel positions to dates
  //   const startDate = pixelToDate(startPixel, containerRect.width)
  //   const endDate = pixelToDate(endPixel, containerRect.width, "endDate")

  //   const updatedChannelMix = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === description)

  //   if (updatedChannelMix) {
  //     updatedChannelMix["funnel_stage_timeline_start_date"] = moment(startDate).format("YYYY-MM-DD")
  //     updatedChannelMix["funnel_stage_timeline_end_date"] = moment(endDate).format("YYYY-MM-DD")

  //     const allStartDates = campaignFormData?.channel_mix?.map((ch) => moment(ch.funnel_stage_timeline_start_date))
  //     const allEndDates = campaignFormData?.channel_mix?.map((ch) => moment(ch.funnel_stage_timeline_end_date))

  //     const minStartDate = moment.min(allStartDates).format("YYYY-MM-DD")
  //     // console.log("🚀 ~ handleMouseMoveDrag ~ minStartDate:", minStartDate)
  //     const maxEndDate = moment.max(allEndDates).format("YYYY-MM-DD")
  //     // console.log("🚀 ~ handleMouseMoveDrag ~ maxEndDate:", maxEndDate)

  //     draftCampaignFormRef.current = {
  //       ...campaignFormData,
  //       channel_mix: campaignFormData.channel_mix.map((ch) =>
  //         ch.funnel_stage === description ? updatedChannelMix : ch,
  //       ),
  //       ...(range === "Year" && {
  //         campaign_timeline_start_date: minStartDate,
  //         campaign_timeline_end_date: maxEndDate,
  //       }),
  //     }
  //   }

  //   // Update tooltip during drag
  //   updateTooltipWithDates(newPosition, newPosition + parentWidth, e.clientX, e.clientY, "drag")
  // }

  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const { startX, startPos } = isDragging.current;
  
    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;
  
    const containerRect = gridContainer.getBoundingClientRect();
    const minX = 0;
    const maxX = containerRect.width - parentWidth;
  
    const mouseX = e.clientX - containerRect.left;
  
    let newPosition = startPos + (e.clientX - startX);
    newPosition = Math.max(minX, Math.min(newPosition, maxX));
    newPosition = snapToTimeline(newPosition, containerRect.width);
  
    const rangeStart = rrange[0];
    const rangeEnd = rrange[rrange.length - 1];
  
    if (mouseX < 50) {
      const newRangeStart = subDays(rangeStart, 2);
      extendRange(
        newRangeStart.toISOString().split("T")[0],
        rangeEnd.toISOString().split("T")[0]
      );
    }
  
    if (mouseX > containerRect.width - 50) {
      const newRangeEnd = addDays(rangeEnd, 2);
      extendRange(
        rangeStart.toISOString().split("T")[0],
        newRangeEnd.toISOString().split("T")[0]
      );
    }
  
    const startDate = pixelToDate(newPosition, containerRect.width);
    const endDate = pixelToDate(newPosition + parentWidth, containerRect.width);
  
    setParentLeft(newPosition);
    setPosition(newPosition);
  
    updateTooltipWithDates(newPosition, newPosition + parentWidth, e.clientX, e.clientY, "drag");
  };

  const handleMouseUp = () => {
    setTooltip((prev) => ({ ...prev, visible: false }))
    if (draftCampaignFormRef.current) {
      setCampaignFormData(draftCampaignFormRef.current)
      draftCampaignFormRef.current = null
    }
    isResizing.current = null
    isDragging.current = null
    document.removeEventListener("mousemove", handleMouseMoveResize)
    document.removeEventListener("mousemove", handleMouseMoveDrag)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  const stageBudget = campaignFormData?.channel_mix?.find((fs) => fs?.funnel_stage === description)?.stage_budget

  return (
    <div
      className={`relative px-[1px] w-full h-14 flex select-none rounded-[10px] cont-${id?.replaceAll(" ", "_")}`}
      style={{
        transform: `translateX(${position + (range === "Month" ? 4 : 0)}px)`,
      }}
    >
      {tooltip.visible && (
        <div
          className={`${color} fixed top-0 z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none`}
          style={{
            left: `${tooltip.x}px`,
            top: `0px`,
            transform: `translate(-${tooltip.x + 100 >= (parentWidth || 0) ? 100 : 0}%, -100%)`,
            border: `1px solid ${bg}`,
            color: "white",
          }}
        >
          {tooltip.content}
        </div>
      )}
      <div
        className={`relative ${color} h-full flex  justify-between items-center text-white px-4 py-[10px] gap-2 border shadow-md min-w-[50px] ${
          disableDrag ? "cursor-default relative" : "cursor-pointer"
        } rounded-[10px] cont-${id?.replaceAll(" ", "_")}`}
        style={{
          width: disableDrag ? `${parentWidth + (range === "Month" ? 0 : 0)}px` : parentWidth,
          backgroundColor: color,
          transition: "transform 0.2s ease-out",
        }}
        onClick={() => setOpenChannel?.(!openChannel)}
        onMouseDown={disableDrag || openItems ? undefined : handleMouseDownDrag}
      >
        {range === "Month" ? (
          <div
            className={`absolute left-0 w-5 h-1/2 bg-opacity-80 ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) => (disableDrag || openItems ? undefined : handleMouseDownResize(e, "left"))}
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute left-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) => (disableDrag || openItems ? undefined : handleMouseDownResize(e, "left"))}
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
        <div />
        <button className="flex items-center gap-3 w-fit">
          {Icon?.src ? <Image src={Icon?.src || "/placeholder.svg"} alt="" width={20} height={20} /> : Icon}
          <span className="font-medium">{description}</span>
          <MdOutlineKeyboardArrowDown />
        </button>
        {!disableDrag && parentWidth && parentWidth >= 350 ? (
          <button
            className="channel-btn mr-10"
            onClick={() => {
              setIsOpen?.(true)
              setSelectedStage(description)
            }}
          >
            <Image src={icroundadd || "/placeholder.svg"} alt="icroundadd" />
            <p className="whitespace-nowrap text-[11px]">Add channel</p>
          </button>
        ) : (
          <div />
        )}
        {disableDrag && stageBudget?.fixed_value > 0 && (
          <div className="bg-[#FFFFFF26] rounded-[5px] py-[10px] px-[12px] font-medium">
            {stageBudget?.fixed_value && Number.parseInt(stageBudget?.fixed_value).toLocaleString()}{" "}
            {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
          </div>
        )}
        {range === "Month" ? (
          <div
            className={`absolute right-0 w-5 h-1/2 bg-opacity-80 ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) => (disableDrag || openItems ? undefined : handleMouseDownResize(e, "right"))}
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute right-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) => (disableDrag || openItems ? undefined : handleMouseDownResize(e, "right"))}
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
      </div>
    </div>
  )
}

export default DraggableChannel