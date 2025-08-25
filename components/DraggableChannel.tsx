"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";
import { useCampaigns } from "app/utils/CampaignsContext";
import moment from "moment";
import { useDateRange as useDRange } from "src/date-context";
import { useDateRange } from "src/date-range-context";
import { getCurrencySymbol } from "./data";
import { addDays, subDays, format } from "date-fns";
import axios from "axios";
import { removeKeysRecursively } from "utils/removeID";

// Helper to convert screen X (scaled) to layout X
const getLayoutX = (clientX: number) => {
  const grid = document.querySelector(".grid-container") as HTMLElement | null;
  if (!grid) return clientX;

  // Get the zoom level from the parent container
  const timelineContainer = grid.closest(
    '[style*="transform: scale"]'
  ) as HTMLElement;
  if (timelineContainer) {
    const transform = timelineContainer.style.transform;
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      const scale = parseFloat(scaleMatch[1]);
      // Convert screen coordinates to unscaled coordinates
      return clientX / scale;
    }
  }

  // Fallback to original logic if no custom zoom detected
  const layoutW = grid.offsetWidth || 1;
  const visualW = grid.getBoundingClientRect().width || layoutW;
  const scale = visualW / layoutW;
  return clientX / scale;
};

// Helper to get unscaled container width
const getUnscaledContainerWidth = () => {
  const grid = document.querySelector(".grid-container") as HTMLElement | null;
  if (!grid) return 0;

  // Get the zoom level from the parent container
  const timelineContainer = grid.closest(
    '[style*="transform: scale"]'
  ) as HTMLElement;
  if (timelineContainer) {
    const transform = timelineContainer.style.transform;
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
      // Return the unscaled width
      return grid.offsetWidth;
    }
  }

  // Fallback to getBoundingClientRect width
  return grid.getBoundingClientRect().width;
};

interface DraggableChannelProps {
  id?: string;
  bg?: string;
  description?: string;
  setIsOpen?: (show: boolean) => void;
  openChannel?: boolean;
  setOpenChannel?: (open: boolean) => void;
  Icon?: any;
  dateList?: Date[];
  dragConstraints?: any;
  parentWidth?: number;
  setParentWidth?: (width: number) => void;
  parentLeft?: number;
  setParentLeft?: (left: number) => void;
  disableDrag?: boolean;
  budget?: number | string;
  setSelectedStage?: any;
  openItems?: any;
  setOpenItems?: any;
  endMonth?: any;
  color?: any;
  endDay?: any;
  campaignFormData?: any;
  setCampaignFormData?: any;
  cId?: any;
  campaignData?: any;
  jwt?: any;
  endWeek?: any;
  dailyWidth?: number;
  rangeType?: string; // Add range type prop
  yearMonthsLength?: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  type: "resize" | "drag" | null;
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
  rangeType,
  yearMonthsLength,
  campaignFormData,
  setCampaignFormData,
  cId,
  campaignData,
  jwt,
}) => {
  const {
    campaignFormData: hookCampaignFormData,
    setCampaignFormData: hookSetCampaignFormData,
  } = useCampaigns();
  const { funnelWidths, setFunnelWidth } = useFunnelContext();
  const [position, setPosition] = useState(parentLeft || 0);

  // Add flags to prevent position override during user interactions
  const [userIsInteracting, setUserIsInteracting] = useState(false);

  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
  } | null>(null);
  const isDragging = useRef<{ startX: number; startPos: number } | null>(null);
  const newDatesRef = useRef<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  const { range } = useDRange();
  const { range: rrange, extendRange } = useDateRange();
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
  });

  const campaignFormDataRef = useRef(hookCampaignFormData);

  useEffect(() => {
    campaignFormDataRef.current = hookCampaignFormData;
  }, [hookCampaignFormData]);

  useEffect(() => {
    // Only update position automatically when user is NOT interacting
    if (!userIsInteracting) {
      setPosition(parentLeft || 0);
    }
  }, [parentLeft, userIsInteracting]);

  const pixelToDate = (
    pixel: number,
    containerWidth: number,
    fieldName?: string
  ) => {
    if (!dateList.length) return new Date();

    if (rangeType === "Year") {
      // Year view - consistent with ResizableChannels
      const numberOfMonths = yearMonthsLength;
      const actualStepWidth = containerWidth / numberOfMonths;
      // FIXED: Use Math.floor for consistent month calculation
      let monthIndex = Math.min(
        numberOfMonths - 1,
        Math.max(0, Math.floor(pixel / actualStepWidth))
      );

      if (pixel >= containerWidth - containerWidth / numberOfMonths / 2) {
        monthIndex = numberOfMonths; // December (month 11)
      }

      // console.log("DraggableChannel pixelToDate Year debug:", {
      //   pixel,
      //   containerWidth,
      //   numberOfMonths,
      //   actualStepWidth,
      //   monthIndex,
      //   fieldName,
      // });

      const year = dateList[0]?.getFullYear() || new Date().getFullYear();

      // console.log(
      //   "these are the new dates from tooltip dates",
      //   new Date(year, monthIndex + 1, 0),
      //   new Date(year, monthIndex, 1)
      // );
      if (fieldName === "endDate") {
        // For end date, return the last day of the target month
        return new Date(year, monthIndex, 0);
      } else if (fieldName === "startDate") {
        // For start date, return the first day of the target month
        return new Date(year, monthIndex, 1);
      } else {
        // Default to first day of the month
        return new Date(year, monthIndex, 1);
      }
    } else if (rangeType === "Month") {
      // Month view - map by day (dateList) not by month
      const numDays = dateList.length;
      const dayWidth = containerWidth / numDays;

      const isEnd = fieldName === "endDate";
      // clamp pixel into [0, containerWidth-1] and use -1 for end to keep it inclusive
      const p = Math.max(
        0,
        Math.min(containerWidth - 1, isEnd ? pixel - 1 : pixel)
      );

      const dayIndex = Math.max(
        0,
        Math.min(
          numDays - 1,
          fieldName === "endDate"
            ? Math.floor(p / dayWidth)
            : Math.round(p / dayWidth)
        )
      );

      // console.log(
      //   "This is the dayIndex, fieldName",
      //   dayIndex,
      //   dateList[dayIndex],
      //   fieldName
      // );
      return dateList[dayIndex] || dateList[0];
    } else {
      // Day, Week view - consistent grid-based calculation
      const numberOfGridColumns = dateList.length;
      const stepWidth = containerWidth / numberOfGridColumns;

      // Check if we're at the very end of the timeline
      const isAtEnd = pixel >= containerWidth - stepWidth / 2;

      let gridIndex;
      if (isAtEnd) {
        // If we're at the end, use the last date
        gridIndex = numberOfGridColumns - 1;
      } else {
        gridIndex = Math.max(
          0,
          Math.min(numberOfGridColumns - 1, Math.floor(pixel / stepWidth))
        );

        // For endDate ensure inclusive: if pixel lands exactly on grid line >0 subtract 1 (but not for the final edge)
        if (
          fieldName === "endDate" &&
          pixel % stepWidth === 0 &&
          gridIndex > 0 &&
          !isAtEnd
        ) {
          gridIndex -= 1;
        }
      }

      // console.log("DraggableChannel pixelToDate Day debug:", {
      //   pixel,
      //   containerWidth,
      //   numberOfGridColumns,
      //   stepWidth,
      //   gridIndex,
      //   fieldName,
      //   isAtEnd,
      // });

      return dateList[gridIndex] || dateList[0];
    }
  };

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    // Create array of all valid grid positions based on actual container dimensions
    const gridPositions = [];
    let numberOfGridColumns;

    if (rangeType === "Year") {
      // Year view - 12 months
      numberOfGridColumns = yearMonthsLength;
    } else if (rangeType === "Month") {
      // Month view - use the full dateList for smooth day-level dragging
      numberOfGridColumns = dateList.length;
    } else {
      // Day, Week view - based on dateList length
      numberOfGridColumns = dateList?.length || 1;
    }

    // Calculate actual step width based on container and grid columns
    const actualStepWidth = containerWidth / numberOfGridColumns;

    // Generate grid positions - include the final edge position
    for (let i = 0; i <= numberOfGridColumns; i++) {
      gridPositions.push(i * actualStepWidth);
    }

    // Find the closest grid position
    let closestPosition = gridPositions[0];
    let smallestDistance = Math.abs(currentPosition - gridPositions[0]);
    let closestIndex = 0;

    for (let i = 1; i < gridPositions.length; i++) {
      const distance = Math.abs(currentPosition - gridPositions[i]);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestPosition = gridPositions[i];
        closestIndex = i;
      }
    }

    // Special handling for the final edge position
    // If we're snapping to the very end (last grid line), ensure we stay there
    if (
      closestIndex === numberOfGridColumns &&
      currentPosition >= closestPosition - actualStepWidth / 2
    ) {
      closestPosition = containerWidth; // Snap to the very end
    }

    // Debug logging
    // console.log("DraggableChannel Snap Debug:", {
    //   currentPosition,
    //   containerWidth,
    //   range,
    //   numberOfGridColumns,
    //   actualStepWidth,
    //   dailyWidth, // Compare with actual step width
    //   closestIndex,
    //   closestPosition,
    //   isFinalEdge: closestIndex === numberOfGridColumns,
    // });

    // Ensure the position is within bounds
    return Math.max(0, Math.min(closestPosition, containerWidth));
  };

  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag",
    resizeDirection?: "left" | "right"
  ) => {
    if (!dateList.length) {
      return;
    }

    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) {
      return;
    }

    const containerWidth = getUnscaledContainerWidth();

    let startDateValue: Date;
    let endDateValue: Date;

    if (rangeType === "Year") {
      // Year view - consistent with ResizableChannels
      const numberOfMonths = yearMonthsLength;
      const monthStartIndex = Math.min(
        numberOfMonths - 1,
        Math.max(0, Math.floor((startPixel / containerWidth) * numberOfMonths))
      );
      // FIXED: Subtract 1 to compensate for the +1 in date calculation
      let monthEndIndex = Math.min(
        numberOfMonths - 1,
        Math.max(0, Math.floor((endPixel / containerWidth) * numberOfMonths))
      );

      if (endPixel >= containerWidth - containerWidth / numberOfMonths / 2) {
        monthEndIndex = numberOfMonths; // December (month 11)
      }

      // console.log("DraggableChannel Year view date conversion debug:", {
      //   startPixel,
      //   endPixel,
      //   containerWidth,
      //   numberOfMonths,
      //   monthStartIndex,
      //   monthEndIndex,
      //   type,
      // });

      const year = dateList[0]?.getFullYear() || new Date().getFullYear();
      // console.log("the month end index", monthEndIndex);
      startDateValue = new Date(year, monthStartIndex, 1);
      endDateValue = new Date(year, monthEndIndex, 0); // Last day of the month

      // console.log("endDateValue", endDateValue);
      // console.log("startDateValue", startDateValue);
    } else if (rangeType === "Month") {
      // Month view - use day-level precision for smooth dragging
      const numberOfGridColumns = dateList.length;
      const stepWidth = containerWidth / numberOfGridColumns;

      // console.log(
      //   "This is the stepWidth",
      //   stepWidth,
      //   numberOfGridColumns,
      //   startPixel,
      //   endPixel
      // );

      const startGridIndex = Math.max(
        0,
        Math.min(numberOfGridColumns - 1, Math.round(startPixel / stepWidth))
      );

      // console.log(
      //   "This is the startGridIndex",
      //   startGridIndex,
      //   dateList[startGridIndex]
      // );
      const endGridIndexRaw = Math.floor((endPixel - 1) / stepWidth);
      const endGridIndex = Math.max(
        0,
        Math.min(numberOfGridColumns - 1, endGridIndexRaw)
      );

      // console.log("DraggableChannel Month view date conversion debug:", {
      //   startPixel,
      //   endPixel,
      //   stepWidth,
      //   containerWidth,
      //   numberOfGridColumns,
      //   startGridIndex,
      //   endGridIndex,
      //   type,
      // });

      startDateValue = dateList[startGridIndex] || dateList[0];
      endDateValue =
        dateList[endGridIndex] || dateList[numberOfGridColumns - 1];

      // console.log(
      //   "This is the startDateValue and endDateValue",
      //   startDateValue,
      //   endDateValue,
      //   dateList
      // );
    } else {
      // Day, Week view - use same logic as ResizableChannels
      const numberOfGridColumns = dateList.length;

      // Day, Week view - compute grid indices using floor for correct mapping
      const stepWidth = containerWidth / numberOfGridColumns;
      const startGridIndex = Math.max(
        0,
        Math.min(numberOfGridColumns - 1, Math.floor(startPixel / stepWidth))
      );
      // Use (endPixel-1) so that exact edge aligns with previous day, giving inclusive range
      const endGridIndexRaw = Math.floor((endPixel - 1) / stepWidth);
      const endGridIndex = Math.max(
        0,
        Math.min(numberOfGridColumns - 1, endGridIndexRaw)
      );

      startDateValue = dateList[startGridIndex] || dateList[0];
      endDateValue =
        dateList[endGridIndex] || dateList[numberOfGridColumns - 1];
    }

    // Safety checks for dates
    if (
      !startDateValue ||
      !endDateValue ||
      isNaN(startDateValue.getTime()) ||
      isNaN(endDateValue.getTime())
    ) {
      return;
    }

    let formattedDateRange;

    if (rangeType === "Year") {
      // For year view, show month ranges
      const startMonth = startDateValue?.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const endMonth = endDateValue?.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const startYear = startDateValue?.getFullYear();
      const endYear = endDateValue?.getFullYear();

      if (startMonth === endMonth && startYear === endYear) {
        // Same month and year - show just the month
        formattedDateRange = startMonth;
      } else if (startYear === endYear) {
        // Same year, different months - show "Feb - Mar" format
        formattedDateRange = `${startMonth} - ${endMonth}`;
      } else {
        // Different years - show "Feb 25 - Mar 25" format
        formattedDateRange = `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
      }
    } else if (rangeType === "Month") {
      // For month view, show specific dates for smooth dragging
      const formattedStartDate = startDateValue?.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const formattedEndDate = endDateValue?.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
    } else {
      // For other views, show specific dates
      const formattedStartDate = startDateValue?.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      const formattedEndDate = endDateValue?.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
    }

    const container = document.querySelector(
      `.cont-${id?.replaceAll(" ", "_")}`
    ) as HTMLElement;
    if (!container) {
      return;
    }

    const containerRect2 = container.getBoundingClientRect();
    const tooltipX = mouseX - containerRect2.left;
    const tooltipY = mouseY - containerRect2.top - 50;

    // Safety check for description - use id as fallback if description is undefined
    const safeDescription = description || id || "Phase";

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
      content: `${safeDescription}: ${formattedDateRange}`,
      type,
    });
  };

  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (disableDrag || openItems) return;
    e.preventDefault();
    e.stopPropagation();

    // Mark user as interacting
    setUserIsInteracting(true);

    // Hide channels when starting resize
    setOpenChannel?.(false);

    const startPixel = position;
    const endPixel = startPixel + (parentWidth || 0);
    updateTooltipWithDates(
      startPixel,
      endPixel,
      e.clientX,
      e.clientY,
      "resize",
      direction
    );

    isResizing.current = {
      startX: getLayoutX(e.clientX),
      startWidth: parentWidth || 0,
      startPos: position,
      direction,
    };

    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const { startX, startWidth, startPos, direction } = isResizing.current;
    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;

    const containerWidth = getUnscaledContainerWidth();
    let newWidth = startWidth;
    let newPos = startPos;
    const mouseX = getLayoutX(e.clientX);

    const rangeStart = rrange[0];
    const rangeEnd = rrange[rrange.length - 1];

    if (direction === "left") {
      const deltaX = getLayoutX(e.clientX) - startX;
      newPos = Math.max(0, startPos + deltaX);

      // Calculate minimum width based on view type
      const getMinWidth = () => {
        if (range === "Year") {
          const monthWidth = dailyWidth || containerWidth / yearMonthsLength;
          return Math.max(monthWidth, 100); // Increased minimum for Year view
        }
        return 50; // Standard minimum for other views
      };

      const minWidth = getMinWidth();
      newWidth = Math.max(minWidth, startWidth - deltaX);

      // Snap the left edge to grid boundary
      newPos = snapToTimeline(newPos, containerWidth);
      newWidth = startWidth - (newPos - startPos);

      if (mouseX < 0) {
        const newRangeStart = subDays(rangeStart, 2);
        extendRange(
          newRangeStart.toISOString().split("T")[0],
          rangeEnd.toISOString().split("T")[0]
        );
      }
    } else {
      const deltaX = getLayoutX(e.clientX) - startX;
      const proposedRightEdge = startPos + startWidth + deltaX;

      // Snap the right edge to grid boundary
      const snappedRightEdge = snapToTimeline(
        proposedRightEdge,
        containerWidth
      );

      // Calculate minimum width based on view type
      const getMinWidth = () => {
        if (rangeType === "Year") {
          const monthWidth = dailyWidth || containerWidth / yearMonthsLength;
          return Math.max(monthWidth, 100); // Increased minimum for Year view
        }
        return rangeType === "Month" ? 5 : 50; // Standard minimum for other views
      };

      const minWidth = getMinWidth();
      newWidth = Math.max(minWidth, snappedRightEdge - startPos);

      if (mouseX > containerWidth) {
        const newRangeEnd = addDays(rangeEnd, 2);
        extendRange(
          rangeStart.toISOString().split("T")[0],
          newRangeEnd.toISOString().split("T")[0]
        );
      }
    }

    const startDate = pixelToDate(newPos, containerWidth, "startDate");
    const endDate = pixelToDate(newPos + newWidth, containerWidth, "endDate");

    // console.log(
    //   "these are the new dates from handleMouseMoveResize",
    //   startDate,
    //   endDate
    // );
    newDatesRef.current = { startDate, endDate };

    setParentWidth?.(newWidth);
    setParentLeft?.(newPos);
    setPosition(newPos);

    updateTooltipWithDates(
      newPos,
      newPos + newWidth,
      e.clientX,
      e.clientY,
      "resize",
      direction
    );
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableDrag) return;
    e.preventDefault();

    // Mark user as interacting
    setUserIsInteracting(true);

    dragStartRef.current = { x: getLayoutX(e.clientX), y: e.clientY };

    const startPixel = position;
    const endPixel = startPixel + (parentWidth || 0);
    updateTooltipWithDates(startPixel, endPixel, e.clientX, e.clientY, "drag");

    isDragging.current = { startX: getLayoutX(e.clientX), startPos: position };

    document.addEventListener("mousemove", handleMouseMoveDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const { startX, startPos } = isDragging.current;

    if (dragStartRef.current) {
      const deltaX = Math.abs(getLayoutX(e.clientX) - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        setOpenChannel?.(false);
        dragStartRef.current = null;
      }
    }

    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;

    const containerWidth = getUnscaledContainerWidth();
    const minX = 0;
    const maxX = containerWidth - (parentWidth || 0);
    const mouseX = getLayoutX(e.clientX);

    let newPosition = startPos + (getLayoutX(e.clientX) - startX);
    newPosition = Math.max(minX, Math.min(newPosition, maxX));

    // Snap to the nearest grid edge
    newPosition = snapToTimeline(newPosition, containerWidth);

    const rangeStart = rrange[0];
    const rangeEnd = rrange[rrange.length - 1];

    if (mouseX < 50) {
      const newRangeStart = subDays(rangeStart, 2);
      extendRange(
        newRangeStart.toISOString().split("T")[0],
        rangeEnd.toISOString().split("T")[0]
      );
    }

    if (mouseX > containerWidth - 50) {
      const newRangeEnd = addDays(rangeEnd, 2);
      extendRange(
        rangeStart.toISOString().split("T")[0],
        newRangeEnd.toISOString().split("T")[0]
      );
    }

    const startDate = pixelToDate(newPosition, containerWidth, "startDate");
    const endDate = pixelToDate(
      newPosition + (parentWidth || 0),
      containerWidth,
      "endDate"
    );
    newDatesRef.current = { startDate, endDate };

    setParentLeft?.(newPosition);
    setPosition(newPosition);

    updateTooltipWithDates(
      newPosition,
      newPosition + (parentWidth || 0),
      e.clientX,
      e.clientY,
      "drag"
    );
  };

  const handleMouseUp = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    dragStartRef.current = null;

    // Clear user interaction flag
    setUserIsInteracting(false);

    // Only proceed if we have new dates
    if (newDatesRef.current.startDate && newDatesRef.current.endDate) {
      const { startDate, endDate } = newDatesRef.current;

      // Get the current dates from the channel
      const currentStage = hookCampaignFormData?.channel_mix?.find(
        (ch: any) => ch?.funnel_stage === description
      );

      const currentStartDate = currentStage?.funnel_stage_timeline_start_date;
      const currentEndDate = currentStage?.funnel_stage_timeline_end_date;

      const newStartDateStr = moment(startDate).format("YYYY-MM-DD");
      const newEndDateStr = moment(endDate).format("YYYY-MM-DD");

      console.log(
        "this is the new start date and end date",
        newStartDateStr,
        newEndDateStr,
        currentStartDate,
        currentEndDate
      );

      // Only proceed if the dates have actually changed
      if (rangeType === "Year") {
        // For Year view, compare by month and year only
        const currentStartMonth = moment(currentStartDate).format("YYYY-MM");
        const currentEndMonth = moment(currentEndDate).format("YYYY-MM");
        const newStartMonth = moment(newStartDateStr).format("YYYY-MM");
        const newEndMonth = moment(newEndDateStr).format("YYYY-MM");

        if (
          currentStartMonth === newStartMonth &&
          currentEndMonth === newEndMonth
        ) {
          // No change in months, just clean up
          newDatesRef.current = { startDate: null, endDate: null };
          isResizing.current = null;
          isDragging.current = null;
          document.removeEventListener("mousemove", handleMouseMoveResize);
          document.removeEventListener("mousemove", handleMouseMoveDrag);
          document.removeEventListener("mouseup", handleMouseUp);
          return;
        }
      } else {
        // For other views, compare by exact date
        if (
          currentStartDate === newStartDateStr &&
          currentEndDate === newEndDateStr
        ) {
          // No change in dates, just clean up
          newDatesRef.current = { startDate: null, endDate: null };
          isResizing.current = null;
          isDragging.current = null;
          document.removeEventListener("mousemove", handleMouseMoveResize);
          document.removeEventListener("mousemove", handleMouseMoveDrag);
          document.removeEventListener("mouseup", handleMouseUp);
          return;
        }
      }

      // Dates have changed, proceed with the update
      console.log(
        "hookCampaignFormData before clone:",
        JSON.stringify(hookCampaignFormData, null, 2)
      );

      const updated: any = JSON.parse(
        JSON.stringify(campaignFormDataRef.current || {})
      );

      // Also log the specific field that's different
      console.log(
        "Updated Instagram campaign_start_date:",
        updated?.channel_mix?.[0]?.social_media?.[0]?.campaign_start_date
      );
      console.log(
        "Hook Instagram campaign_start_date:",
        hookCampaignFormData?.channel_mix?.[0]?.social_media?.[0]
          ?.campaign_start_date
      );
      console.log(
        "Prop Instagram campaign_start_date:",
        campaignFormData?.channel_mix?.[0]?.social_media?.[0]
          ?.campaign_start_date
      );

      console.log(
        "this is the updated on useffect",
        updated,
        campaignFormData,
        hookCampaignFormData
      );
      console.log("updated after clone:", JSON.stringify(updated, null, 2));
      console.log(
        "Are they equal?",
        JSON.stringify(hookCampaignFormData) === JSON.stringify(updated)
      );
      const updatedStage = updated?.channel_mix?.find(
        (ch: any) => ch?.funnel_stage === description
      );

      if (updatedStage) {
        updatedStage.funnel_stage_timeline_start_date =
          moment(startDate).format("YYYY-MM-DD");
        updatedStage.funnel_stage_timeline_end_date =
          moment(endDate).format("YYYY-MM-DD");

        const mediaTypes = [
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
        ];

        mediaTypes.forEach((type) => {
          const platforms = updatedStage[type];
          if (platforms && Array.isArray(platforms)) {
            platforms.forEach((platform: any) => {
              platform.campaign_start_date =
                moment(startDate).format("YYYY-MM-DD");
              platform.campaign_end_date = moment(endDate).format("YYYY-MM-DD");
            });
          }
        });

        if (range === "Year") {
          const allStartDates = updated?.channel_mix
            ?.map(
              (ch: any) =>
                ch?.funnel_stage_timeline_start_date &&
                moment(ch.funnel_stage_timeline_start_date)
            )
            .filter((date: any) => date);

          const allEndDates = updated?.channel_mix
            ?.map(
              (ch: any) =>
                ch?.funnel_stage_timeline_end_date &&
                moment(ch.funnel_stage_timeline_end_date)
            )
            .filter((date: any) => date);

          if (allStartDates?.length && allEndDates?.length) {
            updated.campaign_timeline_start_date = moment
              .min(allStartDates)
              .format("YYYY-MM-DD");
            updated.campaign_timeline_end_date = moment
              .max(allEndDates)
              .format("YYYY-MM-DD");
          }
        }

        console.log(
          "this is the updated after modifications",
          updated,
          campaignFormData
        );

        setCampaignFormData(updated);

        if (typeof window !== "undefined" && cId) {
          localStorage.setItem(
            `campaignFormData_${cId}`,
            JSON.stringify(updated)
          );
          localStorage.setItem(
            `campaignFormData_${cId}_timestamp`,
            Date.now().toString()
          );
        }

        // Persist to API
        sendUpdatedDataToAPI(updated);
      }

      newDatesRef.current = { startDate: null, endDate: null };
    }

    isResizing.current = null;
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mousemove", handleMouseMoveDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const stageBudget = campaignFormData?.channel_mix?.find(
    (fs) => fs?.funnel_stage === description
  )?.stage_budget;

  // Helper to persist updates to API
  const sendUpdatedDataToAPI = async (updatedData: any) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            ...removeKeysRecursively(campaignData, [
              "id",
              "documentId",
              "createdAt",
              "publishedAt",
              "updatedAt",
              "_aggregated",
            ]),
            channel_mix: removeKeysRecursively(updatedData?.channel_mix, [
              "id",
              "isValidated",
              "validatedStages",
              "documentId",
              "_aggregated",
            ]),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
    } catch (e) {
      // Silently ignore; global 401 handler dispatches an event
    }
  };

  return (
    <div
      className={`relative px-[1px] w-full ${
        disableDrag ? "h-auto" : "h-14"
      } flex select-none rounded-[10px] cont-${id?.replaceAll(" ", "_")}`}
      style={{
        transform: `translateX(${position}px)`,
      }}
    >
      {tooltip.visible && (
        <div
          className={`${color} fixed top-0 z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none`}
          style={{
            left: `${tooltip.x}px`,
            top: `0px`,
            transform: `translate(-${
              tooltip.x + 100 >= (parentWidth || 0) ? 100 : 0
            }%, -100%)`,
            border: `1px solid ${bg}`,
            color: "white",
          }}
        >
          {tooltip.content}
        </div>
      )}

      <div
        className={` ${color} ${disableDrag ? "min-h-14" : "h-14"} flex ${
          disableDrag && range === "Year" && (parentWidth || 0) < 150
            ? "flex-col"
            : "flex-row"
        } justify-between items-center text-white px-4 py-[10px] gap-2 border shadow-md min-w-[50px] ${
          disableDrag ? "cursor-default relative" : "cursor-pointer"
        } rounded-[10px] cont-${id?.replaceAll(" ", "_")} z-50`}
        style={{
          width: disableDrag
            ? `${(parentWidth || 0) + (rangeType === "Month" ? 0 : 0)}px`
            : parentWidth,
          backgroundColor: color,
          transition: "transform 0.2s ease-out",
        }}
        onMouseDown={disableDrag || openItems ? undefined : handleMouseDownDrag}
      >
        {/* Left resize handle */}
        <div
          className={`absolute left-0 w-5 h-full bg-opacity-80 bg-black ${
            disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
          } rounded-l-lg text-white flex items-center justify-center z-50`}
          onMouseDown={(e) => {
            if (disableDrag) return;
            handleMouseDownResize(e, "left");
          }}
        >
          <MdDragHandle className="rotate-90" />
        </div>

        <div />

        {/* Main content */}
        <div
          className={`flex justify-center items-center w-full ${
            disableDrag && parentWidth <= 350
              ? "flex-col gap-1"
              : "flex-row gap-5"
          }`}
        >
          <button
            className="flex justify-center items-center gap-5 w-full"
            onClick={() => {
              // if (!disableDrag) {
              setOpenChannel?.(!openChannel);
              // }
            }}
          >
            {Icon?.src ? (
              <Image
                src={Icon?.src || "/placeholder.svg"}
                alt=""
                width={20}
                height={20}
              />
            ) : (
              Icon
            )}
            <span className="font-medium">{description}</span>
            <MdOutlineKeyboardArrowDown />
          </button>

          {!disableDrag && parentWidth && parentWidth >= 350 ? (
            <button
              className="channel-btn mr-2 w-fit shrink-0"
              onClick={() => {
                setIsOpen?.(true);
                setSelectedStage?.(description);
              }}
            >
              <Image src={icroundadd || "/placeholder.svg"} alt="icroundadd" />
              <p className="whitespace-nowrap text-[11px]">Add channel</p>
            </button>
          ) : (
            <div />
          )}

          {disableDrag && stageBudget?.fixed_value > 0 && (
            <div className="bg-[#FFFFFF26] rounded-[5px] py-[10px] px-2 font-medium flex items-center space-x-1">
              <span>
                {Number.parseInt(stageBudget.fixed_value).toLocaleString()}
              </span>
              <span>
                {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Right resize handle */}
        <div
          className={`absolute right-0 w-5 h-full bg-opacity-80 bg-black ${
            disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
          } rounded-r-lg text-white flex items-center justify-center`}
          onMouseDown={(e) => {
            if (disableDrag || openItems) return;
            handleMouseDownResize(e, "right");
          }}
        >
          <MdDragHandle className="rotate-90" />
        </div>
      </div>
    </div>
  );
};

export default DraggableChannel;
