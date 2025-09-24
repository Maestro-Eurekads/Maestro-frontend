"use client";
import React, { useState, useEffect, useRef } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import whiteplus from "../../../../../public/white-plus.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isEqual,
  parseISO,
  format,
} from "date-fns";
import moment from "moment";
import { getCurrencySymbol, renderUploadedFile } from "components/data";
import arrowUp from "../../../../../public/arrow-g-up.svg";
import arrowDown from "../../../../../public/arrow-g-down.svg";
import axios from "axios";
import { removeKeysRecursively } from "utils/removeID";
import Modal from "components/Modals/Modal";
import AdSetsFlow from "../../../components/common/AdSetsFlow";
import FormatSelection from "../../FormatSelection";
import { useDateRange } from "src/date-range-context";
import { useDateRange as DateRange } from "src/date-context";
import { FaSpinner } from "react-icons/fa";

interface Channel {
  name: string;
  channelName: string;
  icon: string;
  bg: string;
  color: string;
  ad_sets?: any[];
  format?: any[];
  start_date?: any;
  end_date?: any;
}

interface ResizableChannelsProps {
  channels: Channel[];
  parentId: string;
  parentWidth?: number;
  parentLeft?: number;
  setIsOpen: (isOpen: boolean) => void;
  dateList: Date[];
  disableDrag?: boolean;
  setSelectedStage?: any;
  openItems?: any;
  setParentCampaignFormData?: (campaignFormData: any) => void;
  setOpenItems?: any;
  endMonth?: any;
  endDay?: any;
  endWeek?: any;
  dailyWidth?: any;
  campaignFormData?: any;
  setCampaignFormData?: any;
  cId?: any;
  campaignData?: any;
  jwt?: any;
  setCopy?: any;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  type: "resize" | "drag" | null;
  index?: number;
}

interface ChannelState {
  left: number;
  width: number;
  startDate?: string;
  endDate?: string;
  id?: string;
}

const DEFAULT_MEDIA_OPTIONS = [
  { name: "Carousel", icon: "/carousel.svg" },
  { name: "Image", icon: "/Image_format.svg" },
  { name: "Video", icon: "/video_format.svg" },
  { name: "Slideshow", icon: "/slideshow_format.svg" },
  { name: "Collection", icon: "/collection_format.svg" },
];

const ResizableChannels = ({
  channels: initialChannels,
  setParentCampaignFormData,
  parentId,
  parentWidth,
  parentLeft,
  setIsOpen,
  dateList,
  disableDrag = false,
  setSelectedStage,
  openItems,
  setOpenItems,
  endMonth,
  endDay,
  endWeek,
  dailyWidth,
  campaignFormData,
  cId,
  setCampaignFormData,
  campaignData,
  jwt,
  setCopy,
}: ResizableChannelsProps) => {
  const { funnelWidths } = useFunnelContext();
  const draggingDataRef = useRef(null);
  const isDraggingRef = useRef(false);
  const { range } = useDateRange();
  const { range: rrange } = DateRange();

  const [channels, setChannels] = useState(initialChannels);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState(null);

  const [openCreatives, setOpenCreatives] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [openAdset, setOpenAdset] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [openView, setOpenView] = useState<"channel" | "adset">("channel");
  // Horizontal shift for the inline pop-over so it stays in viewport
  const [popoverShift, setPopoverShift] = useState(0);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Adjust pop-over horizontally whenever it (re)opens so it never overflows viewport
  useEffect(() => {
    if (!openItems) {
      setPopoverShift(0);
      return;
    }

    // Wait for DOM to paint, then measure
    const id = openItems;
    requestAnimationFrame(() => {
      const pop = popoverRef.current;
      if (!pop) return;

      const rect = pop.getBoundingClientRect();
      const margin = 16;
      let shift = 0;

      const overflowRight = rect.right + margin - window.innerWidth;
      const overflowLeft = margin - rect.left;

      if (overflowRight > 0) {
        shift = -overflowRight;
      } else if (overflowLeft > 0) {
        shift = overflowLeft;
      }

      setPopoverShift(shift);
    });
  }, [openItems]);

  // State for the floating ad-set pop-over (position in viewport) and its owner channel
  const [popoverPosition, setPopoverPosition] = useState<{
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });
  const [selectedPopoverChannelIndex, setSelectedPopoverChannelIndex] =
    useState<number | null>(null);

  const initialStartDateRef = useRef(null);
  const initialEndDateRef = useRef(null);

  const selectionStateRef = useRef({
    openItems: null,
    selectedChannel: "",
    selectedCreative: null,
    openCreatives: false,
    openAdset: false,
  });

  const isAdjustingWidthRef = useRef(false);

  const [channelState, setChannelState] = useState<ChannelState[]>(
    channels?.map((ch) => ({
      left: parentLeft,
      width: Math.min(10, parentWidth),
      startDate: ch.start_date,
      endDate: ch.end_date,
    }))
  );

  // Add flags to prevent position recalculation during user interactions
  const [userIsInteracting, setUserIsInteracting] = useState(false);
  const [manuallyPositioned, setManuallyPositioned] = useState<Set<number>>(
    new Set()
  );

  // Add a ref to store manually positioned channels more reliably
  const manuallyPositionedRef = useRef<Set<number>>(new Set());

  // Add a ref to store the last known positions of manually positioned channels
  const lastManualPositionsRef = useRef<
    Map<number, { left: number; width: number }>
  >(new Map());

  const [draggingPosition, setDraggingPosition] = useState(null);

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
    index: null,
  });

  // Throttling for smoother performance
  const lastUpdateTime = useRef(0);
  const THROTTLE_DELAY = 16; // ~60fps

  const toggleChannel = (id) => {
    setOpenItems((prev) => (prev === id ? null : id));
  };
  const [dRange, setDrange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [endDateOffset, setEndDateOffset] = useState(0);

  const isResizing = useRef<{
    startX: number;
    initialState: ChannelState;
    direction: "left" | "right";
    index: number;
  } | null>(null);

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    // Create array of all valid grid positions based on parent phase card's date range
    const gridPositions = [];
    let numberOfGridColumns;

    if (rrange === "Year") {
      // Year view - calculate based on parent phase card's month range
      if (startDate && endDate) {
        const startMonth = startDate.getMonth();
        const endMonth = endDate.getMonth();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();

        // Calculate months between dates, accounting for different years
        numberOfGridColumns =
          (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
      } else {
        numberOfGridColumns = 12; // Fallback
      }
    } else if (rrange === "Month") {
      // Month view - calculate based on parent phase card's day range
      if (startDate && endDate) {
        const daysBetween =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        numberOfGridColumns = daysBetween;
      } else {
        numberOfGridColumns = dateList?.length || 1;
      }
    } else {
      // Day, Week view - calculate based on parent phase card's day range
      if (startDate && endDate) {
        const daysBetween =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        numberOfGridColumns = daysBetween;
      } else {
        numberOfGridColumns = dateList?.length || 1;
      }
    }

    // Calculate actual step width based on parent phase card width and grid columns
    const actualStepWidth = parentWidth / numberOfGridColumns;

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
      closestPosition = parentWidth; // Snap to the very end of parent phase card
    }

    // Debug logging

    // Ensure the position is within parent phase card bounds
    return Math.max(0, Math.min(closestPosition, parentWidth));
  };

  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    index: number,
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag",
    resizeDirection?: "left" | "right"
  ) => {
    if (!dateList || dateList.length === 0) return;

    // Get the actual channel dates from backend
    const findMix = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === parentId
    );
    const findChannel = findMix?.[channels[index]?.channelName]?.find(
      (plt) => plt?.platform_name === channels[index]?.name
    );

    const channelStartDate = findChannel?.campaign_start_date
      ? parseISO(findChannel?.campaign_start_date)
      : null;
    const channelEndDate = findChannel?.campaign_end_date
      ? parseISO(findChannel?.campaign_end_date)
      : null;

    let startDateValue, endDateValue;

    if (rrange === "Year") {
      // For year view, use calculated dates during drag/resize, backend dates for initial click
      const isDraggingOrResizing = type === "drag" || type === "resize";

      if (isDraggingOrResizing) {
        // Use pixel-based calculation for real-time updates
        const numberOfMonths = 12;
        const monthStartIndex = Math.min(
          numberOfMonths - 1,
          Math.max(0, Math.floor((startPixel / parentWidth) * numberOfMonths))
        );
        const monthEndIndex = Math.min(
          numberOfMonths - 1,
          Math.max(0, Math.round((endPixel / parentWidth) * numberOfMonths) - 1)
        );

        // console.log("Year view date conversion debug:", {
        // startPixel,
        // endPixel,
        // parentWidth,
        // numberOfMonths,
        // monthStartIndex,
        // monthEndIndex,
        // startRatio: startPixel / parentWidth,
        // endRatio: endPixel / parentWidth
        // });

        const year = startDate?.getFullYear() || new Date().getFullYear();
        startDateValue = new Date(year, monthStartIndex, 1);
        endDateValue = new Date(year, monthEndIndex + 1, 0); // Last day of the month
      } else {
        // Use backend dates for initial tooltip
        if (channelStartDate && channelEndDate) {
          startDateValue = channelStartDate;
          endDateValue = channelEndDate;
        } else {
          // Fallback to pixel calculation
          const numberOfMonths = 12;
          const monthStartIndex = Math.min(
            numberOfMonths - 1,
            Math.max(0, Math.floor((startPixel / parentWidth) * numberOfMonths))
          );
          const monthEndIndex = Math.min(
            numberOfMonths - 1,
            Math.max(0, Math.round((endPixel / parentWidth) * numberOfMonths) - 1)
          );

          const year = startDate?.getFullYear() || new Date().getFullYear();
          startDateValue = new Date(year, monthStartIndex, 1);
          endDateValue = new Date(year, monthEndIndex + 1, 0); // Last day of the month
        }
      }
    } else if (rrange === "Month") {
      // Month view - use day-level precision for smooth dragging
      const numberOfGridColumns = dateList.length;
      const stepWidth = parentWidth / numberOfGridColumns;

      const startGridIndex = Math.max(0, Math.min(numberOfGridColumns - 1, Math.floor((startPixel + parentLeft) / dailyWidth)));
      const endGridIndexRaw = Math.floor((endPixel - startPixel) / dailyWidth) + startGridIndex;
      const endGridIndex = Math.max(0, Math.min(numberOfGridColumns - 1, endGridIndexRaw));

      console.log("Date conversion tooltip Month:", {
        startPixel,
        endPixel,
        parentWidth,
        numberOfGridColumns,
        stepWidth,
        startGridIndex,
        endGridIndex
      });

      startDateValue = dateList[startGridIndex] || startDate;
      endDateValue = dateList[endGridIndex - 1] || endDate;
    } else {
      // Day, Week view - calculate based on days
      const numberOfGridColumns = dateList.length;
      const stepWidth = parentWidth / numberOfGridColumns;

      const startGridIndex = Math.max(0, Math.min(numberOfGridColumns - 1, Math.floor(((startPixel + parentLeft) / (stepWidth < 50 ? 50 : stepWidth)))));
      const endGridIndexRaw = Math.floor((endPixel - startPixel) / (stepWidth < 50 ? 50 : stepWidth)) + startGridIndex;
      const endGridIndex = Math.max(0, Math.min(numberOfGridColumns, endGridIndexRaw));

      console.log("Date conversion tooltip FIXED:", {
        startPixel,
        endPixel,
        parentWidth,
        numberOfGridColumns,
        stepWidth,
        startGridIndex,
        endGridIndex
      });

      console.log({ dateList })

      startDateValue = dateList[startGridIndex] || startDate;
      endDateValue = dateList[endGridIndex - 1] || endDate;
    }

    console.log({ startDateValue, endDateValue, type });

    // Debug the actual channel dates
    // console.log("Channel dates from backend:", {
    // channelStartDate: findChannel?.campaign_start_date,
    // channelEndDate: findChannel?.campaign_end_date,
    // calculatedStartDate: startDateValue,
    // calculatedEndDate: endDateValue,
    // startPixel,
    // endPixel,
    // parentWidth,
    // type,
    // });

    let formattedDateRange;

    if (rrange === "Year") {
      // For year view, show month ranges
      const startMonth = format(startDateValue, "MMM");
      const endMonth = format(endDateValue, "MMM");
      const startYear = startDateValue.getFullYear();
      const endYear = endDateValue.getFullYear();

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
    } else if (rrange === "Month") {
      // For month view, show specific dates for smooth dragging
      const formattedStartDate = format(startDateValue, "MMM dd");
      const formattedEndDate = format(endDateValue, "MMM dd");
      formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
    } else {
      // For other views, show specific dates
      console.log({ startDateValue, endDateValue })
      const formattedStartDate = format(startDateValue, "MMM dd");
      const formattedEndDate = format(endDateValue, "MMM dd");
      formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
    }

    const channelName = channels[index]?.name || "Channel";
    const containerRect = document
      .querySelector(
        `.cont-${replaceSpacesAndSpecialCharsWithUnderscore(
          parentId
        )}-${replaceSpacesAndSpecialCharsWithUnderscore(channelName)}`
      )
      ?.getBoundingClientRect();

    const tooltipX = mouseX - containerRect.left;
    const tooltipY = containerRect.top - 50;

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
      content: `${channelName}: ${formattedDateRange}`,
      type,
      index,
    });
  };


  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right",
    index: number
  ) => {
    if (disableDrag) return;
    e.preventDefault();
    e.stopPropagation();

    // Mark as user interacting and manually positioned
    setUserIsInteracting(true);
    setManuallyPositioned((prev) => new Set(prev).add(index));
    manuallyPositionedRef.current.add(index); // Also update the ref

    // Close the adset modal when resizing starts
    setOpenAdset(false);

    // Store the initial state for this resize operation
    isResizing.current = {
      startX: getLayoutXOptimized(e.clientX),
      initialState: { ...channelState[index] },
      direction,
      index,
    };

    const startPixel = channelState[index].left - parentLeft;
    const endPixel = startPixel + channelState[index].width;
    updateTooltipWithDates(
      startPixel,
      endPixel,
      index,
      e.clientX,
      e.clientY,
      "resize",
      direction
    );

    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUpResize);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;

    // Throttle updates for smoother performance
    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
    lastUpdateTime.current = now;

    const { startX, initialState, direction, index } = isResizing.current;
    const deltaX = getLayoutXOptimized(e.clientX) - startX;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    const containerWidth = getUnscaledContainerWidthOptimized();
    const parentRightEdge = parentLeft + parentWidth;

    let newWidth = initialState.width;
    let newLeft = initialState.left;

    // Define minimum width based on view type
    const getMinWidth = () => {
      if (rrange === "Year") {
        // For year view, ensure minimum is at least one month width with better fallback
        const monthWidth = dailyWidth || parentWidth / 12;
        return Math.max(monthWidth, 80); // Increased minimum for better UX
      } else if (rrange === "Month") {
        // For month view, use day-level precision for smooth dragging
        const dayWidth = dailyWidth || parentWidth / dateList.length;
        return Math.max(dayWidth, 8); // Much smaller minimum for day-level dragging
      }
      return 50; // Standard minimum for other views
    };

    const minWidth = getMinWidth();

    if (direction === "left") {
      // Left edge resize - adjust position and width
      const proposedLeft = Math.max(parentLeft, initialState.left + deltaX);
      const proposedWidth =
        initialState.width - (proposedLeft - initialState.left);

      // Ensure minimum width
      if (proposedWidth < minWidth) {
        newWidth = minWidth;
        newLeft = initialState.left + initialState.width - minWidth;
      } else {
        newLeft = proposedLeft;
        newWidth = proposedWidth;
      }

      // Snap the left edge to timeline
      const snappedLeft =
        snapToTimeline(newLeft - parentLeft, containerWidth) + parentLeft;
      newWidth = initialState.left + initialState.width - snappedLeft;
      newLeft = snappedLeft;

      // Ensure we don't exceed parent boundaries
      if (newLeft < parentLeft) {
        newLeft = parentLeft;
        newWidth = initialState.left + initialState.width - parentLeft;
      }

      if (newLeft + newWidth > parentRightEdge) {
        newWidth = parentRightEdge - newLeft;
      }
    } else {
      // Right edge resize - keep left position fixed, adjust width only
      newLeft = initialState.left; // Always use initial left position
      const proposedWidth = Math.max(minWidth, initialState.width + deltaX);

      // Calculate the right edge position
      const rightEdgePos = newLeft + proposedWidth;

      // Snap the right edge to timeline
      const snappedRightEdge =
        snapToTimeline(rightEdgePos - parentLeft, containerWidth) + parentLeft;

      // Ensure the snapped right edge doesn't exceed parent boundaries
      const finalRightEdge = Math.min(snappedRightEdge, parentRightEdge);

      // Calculate final width based on the constrained right edge
      newWidth = Math.max(minWidth, finalRightEdge - newLeft);
    }

    // Convert pixels to dates
    const startPixel = newLeft - parentLeft;
    const endPixel = startPixel + newWidth;
    // console.log({ startPixel, endPixel });
    const currentGridWidth = containerWidth;
    const newStartDate = pixelToDate(
      startPixel,
      currentGridWidth,
      index,
      "startDate"
    );
    const newEndDate = pixelToDate(
      endPixel,
      currentGridWidth,
      index,
      "endDate"
    );
    // console.log({ newStartDate, newEndDate });

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      // Update the channel state
      setChannelState((prev) =>
        prev.map((state, i) =>
          i === index
            ? {
              ...state,
              left: newLeft,
              width: newWidth,
              startDate: newStartDate,
              endDate: newEndDate,
            }
            : state
        )
      );

      // Store the manual position in the ref for persistence
      const currentState = channelState[index];
      if (currentState) {
        lastManualPositionsRef.current.set(index, {
          left: newLeft,
          width: currentState.width,
        });
      }

      // Update channels data
      setChannels((prev) =>
        prev.map((ch, i) =>
          i === index
            ? {
              ...ch,
              start_date: newStartDate,
              end_date: newEndDate,
            }
            : ch
        )
      );
    });

    updateTooltipWithDates(
      startPixel,
      endPixel,
      index,
      e.clientX,
      e.clientY,
      "resize",
      direction
    );

    // Store data for final update
    draggingDataRef.current = { index, newStartDate, newEndDate };
  };

  const handleMouseUpResize = async () => {
    // console.log("Resize ended");
    // console.log(isResizing.current, "isResizing state on mouse up");
    setTooltip((prev) => ({ ...prev, visible: false }));

    // Clear interaction flag
    setUserIsInteracting(false);

    // IMMEDIATELY remove event listeners to stop any further dragging
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mouseup", handleMouseUpResize);

    if (draggingDataRef.current) {
      const { index, newStartDate, newEndDate } =
        draggingDataRef.current as any;
      // console.log({ index, newStartDate, newEndDate });

      // Store the final manual position in the ref for persistence
      const currentState = channelState[index];
      if (currentState) {
        lastManualPositionsRef.current.set(index, {
          left: currentState.left,
          width: currentState.width,
        });
      }

      // Final update to campaign data
      try {
        const updated = updateCampaignFormWithChannelDates(
          campaignFormData,
          index,
          newStartDate,
          newEndDate
        );
        setCampaignFormData(updated);
        setParentCampaignFormData(updated);

        // Force immediate localStorage save
        if (typeof window !== "undefined" && cId) {
          console.log("setting the local storage 1");
          localStorage.setItem(
            `campaignFormData_${cId}`,
            JSON.stringify(updated)
          );
          localStorage.setItem(
            `campaignFormData_${cId}_timestamp`,
            Date.now().toString()
          );
        }

        await sendUpdatedDataToAPI(updated);
      } catch (err) {
        console.error("Failed to persist channel resize", err);
      }
      draggingDataRef.current = null;
    }

    isResizing.current = null;
  };

  useEffect(() => {
    if (campaignFormData) {
      const start = campaignFormData?.channel_mix?.find(
        (ch) => ch?.funnel_stage === parentId
      )?.funnel_stage_timeline_start_date
        ? new Date(
          campaignFormData?.channel_mix?.find(
            (ch) => ch?.funnel_stage === parentId
          )?.funnel_stage_timeline_start_date
        )
        : new Date(campaignFormData?.campaign_timeline_start_date);

      if (!initialStartDateRef.current) {
        initialStartDateRef.current = new Date(start);
      }

      setStartDate(start);

      const end = campaignFormData?.channel_mix?.find(
        (ch) => ch?.funnel_stage === parentId
      )?.funnel_stage_timeline_end_date
        ? new Date(
          campaignFormData?.channel_mix?.find(
            (ch) => ch?.funnel_stage === parentId
          )?.funnel_stage_timeline_end_date
        )
        : new Date(campaignFormData?.campaign_timeline_end_date);

      if (!initialEndDateRef.current) {
        initialEndDateRef.current = new Date(end);
      }

      setEndDate(end);

      setDrange(
        eachDayOfInterval({
          start: start,
          end: end,
        })
      );
    }
  }, [campaignFormData, parentId]);

  useEffect(() => {
    if (startDate && initialStartDateRef.current) {
      const difference = differenceInCalendarDays(
        startDate,
        initialStartDateRef.current
      );
      setDateOffset(difference);
    }
    if (endDate && initialEndDateRef.current) {
      const difference = differenceInCalendarDays(
        endDate,
        initialEndDateRef.current
      );
      setEndDateOffset(difference);
    }
  }, [startDate, endDate]);

  const pixelToDate = (pixel, containerWidth, index, fieldName) => {
    let calculatedDate;

    if (rrange === "Year") {
      // Year view - calculate based on parent phase card's month range
      if (startDate && endDate) {
        const startMonth = startDate.getMonth();
        const endMonth = endDate.getMonth();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();

        // Calculate months between dates, accounting for different years
        const numberOfMonths =
          (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        const actualStepWidth = parentWidth / numberOfMonths;
        const monthIndex = Math.min(
          numberOfMonths - 1,
          Math.max(0, Math.floor(pixel / actualStepWidth))
        );
        const year = startDate.getFullYear();

        console.log("pixelToDate Year debug (Parent-based):", {
          pixel,
          parentWidth,
          numberOfMonths,
          actualStepWidth,
          monthIndex,
          fieldName,
          startDate,
          endDate,
          endDateCalculated: new Date(year, startMonth + monthIndex + 1, 0),
          startDateCalculated: new Date(year, startMonth + monthIndex, 1),
        });

        if (fieldName === "endDate") {
          // Last day of the target month
          if (pixel === parentWidth) {
            calculatedDate = new Date(year, startMonth + monthIndex + 1, 0);
          } else {
            // Last day of the target month
            calculatedDate = new Date(year, startMonth + monthIndex, 0);
          }
        } else {
          // First day of the target month
          calculatedDate = new Date(year, startMonth + monthIndex, 1);
        }
      } else {
        // Fallback to original logic
        const numberOfMonths = 12;
        const actualStepWidth = containerWidth / numberOfMonths;
        const monthIndex = Math.min(
          numberOfMonths - 1,
          Math.max(0, Math.floor(pixel / actualStepWidth))
        );

        const year = startDate?.getFullYear() || new Date().getFullYear();

        if (fieldName === "endDate") {
          calculatedDate = new Date(year, monthIndex + 1, 0);
        } else {
          calculatedDate = new Date(year, monthIndex, 1);
        }
      }
    } else if (rrange === "Month") {
      // Month view - calculate based on parent phase card's day range
      if (startDate && endDate) {
        const daysBetween =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        const stepWidth = parentWidth / daysBetween;

        // Determine if pixel is at the very end of the parent phase card
        const isAtEnd = pixel >= parentWidth - stepWidth / 2;

        let gridIndex;
        if (isAtEnd) {
          // Use the last date
          gridIndex = daysBetween - 1;
        } else {
          gridIndex = Math.max(
            0,
            Math.min(daysBetween - 1, Math.floor(pixel / stepWidth))
          );

          // Ensure inclusive end date (if exactly on grid line, step back one index)
          if (
            fieldName === "endDate" &&
            pixel % stepWidth === 0 &&
            gridIndex > 0 &&
            !isAtEnd
          ) {
            gridIndex -= 1;
          }
        }

        // console.log("pixelToDate Month debug (Parent-based):", {
        //   pixel,
        //   parentWidth,
        //   daysBetween,
        //   stepWidth,
        //   gridIndex,
        //   fieldName,
        //   isAtEnd,
        //   startDate,
        //   endDate
        // });

        // Calculate the date by adding gridIndex days to the start date
        calculatedDate = new Date(
          startDate.getTime() + gridIndex * 24 * 60 * 60 * 1000
        );
      } else {
        // Fallback to original logic
        const numberOfGridColumns = dRange?.length || dateList?.length || 1;
        const stepWidth = containerWidth / numberOfGridColumns;
        const isAtEnd = pixel >= containerWidth - stepWidth / 2;

        let gridIndex;
        if (isAtEnd) {
          gridIndex = numberOfGridColumns - 1;
        } else {
          gridIndex = Math.max(
            0,
            Math.min(numberOfGridColumns - 1, Math.floor(pixel / stepWidth))
          );

          if (
            fieldName === "endDate" &&
            pixel % stepWidth === 0 &&
            gridIndex > 0 &&
            !isAtEnd
          ) {
            gridIndex -= 1;
          }
        }

        const dateToUse =
          dRange?.[gridIndex] || dateList?.[gridIndex] || startDate;

        calculatedDate = new Date(dateToUse);
      }
    } else {
      // Day, Week view - calculate based on parent phase card's day range
      if (startDate && endDate) {
        const daysBetween =
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
        const stepWidth = parentWidth / daysBetween;

        // Determine if pixel is at the very end of the parent phase card
        const isAtEnd = pixel >= parentWidth - stepWidth / 2;

        let gridIndex;
        if (isAtEnd) {
          // Use the last date
          gridIndex = daysBetween - 1;
        } else {
          gridIndex = Math.max(
            0,
            Math.min(daysBetween - 1, Math.floor(pixel / stepWidth))
          );

          // Ensure inclusive end date (if exactly on grid line, step back one index)
          if (
            fieldName === "endDate" &&
            pixel % stepWidth === 0 &&
            gridIndex > 0 &&
            !isAtEnd
          ) {
            gridIndex -= 1;
          }
        }

        // console.log("pixelToDate Day debug (Parent-based):", {
        //   pixel,
        //   parentWidth,
        //   daysBetween,
        //   stepWidth,
        //   gridIndex,
        //   fieldName,
        //   isAtEnd,
        //   startDate,
        //   endDate
        // });

        // Calculate the date by adding gridIndex days to the start date
        calculatedDate = new Date(
          startDate.getTime() + gridIndex * 24 * 60 * 60 * 1000
        );
      } else {
        // Fallback to original logic
        const numberOfGridColumns = dRange?.length || dateList?.length || 1;
        const stepWidth = containerWidth / numberOfGridColumns;
        const isAtEnd = pixel >= containerWidth - stepWidth / 2;

        let gridIndex;
        if (isAtEnd) {
          gridIndex = numberOfGridColumns - 1;
        } else {
          gridIndex = Math.max(
            0,
            Math.min(numberOfGridColumns - 1, Math.floor(pixel / stepWidth))
          );

          if (
            fieldName === "endDate" &&
            pixel % stepWidth === 0 &&
            gridIndex > 0 &&
            !isAtEnd
          ) {
            gridIndex -= 1;
          }
        }

        const dateToUse =
          dRange?.[gridIndex] || dateList?.[gridIndex] || startDate;

        calculatedDate = new Date(dateToUse);
      }
    }

    const updatedCampaignFormData = { ...campaignFormData };

    const channelMix = updatedCampaignFormData.channel_mix.find(
      (ch) => ch.funnel_stage === parentId
    );

    if (channelMix) {
      const platform = channelMix[channels[index].channelName]?.find(
        (platform) => platform.platform_name === channels[index].name
      );

      if (platform) {
        if (fieldName === "startDate") {
          platform.campaign_start_date = calculatedDate
            ? moment(calculatedDate).format("YYYY-MM-DD")
            : null;
        } else {
          const endDateToUse =
            endDate && calculatedDate > endDate ? endDate : calculatedDate;
          platform.campaign_end_date = endDateToUse
            ? moment(endDateToUse).format("YYYY-MM-DD")
            : null;
        }
      }
    }

    return calculatedDate ? moment(calculatedDate).format("YYYY-MM-DD") : null;
  };

  // Helper to commit child channel dates into campaignFormData
  const updateCampaignFormWithChannelDates = (
    baseData: any,
    index: number,
    startDateStr: string | null,
    endDateStr: string | null
  ) => {
    const updated = JSON.parse(JSON.stringify(baseData));
    const channelMix = updated?.channel_mix?.find(
      (ch) => ch?.funnel_stage === parentId
    );
    if (!channelMix) return updated;

    const list = channelMix?.[channels[index]?.channelName];
    if (!Array.isArray(list)) return updated;

    const plat = list.find(
      (p: any) => p?.platform_name === channels[index]?.name
    );
    if (!plat) return updated;

    plat.campaign_start_date = startDateStr;
    plat.campaign_end_date = endDateStr;
    return updated;
  };

  const handleDragStart = (index) => (event) => {
    if (disableDrag) return;
    event.preventDefault();

    // Mark as user interacting and manually positioned
    setUserIsInteracting(true);
    setManuallyPositioned((prev) => new Set(prev).add(index));
    manuallyPositionedRef.current.add(index); // Also update the ref

    // Close the adset modal when dragging starts
    setOpenAdset(false);

    setDraggingPosition({
      index,
      startX: getLayoutXOptimized(event.clientX),
      startLeft: channelState[index]?.left || parentLeft,
    });

    const startPixel = (channelState[index]?.left || parentLeft) - parentLeft;
    const endPixel =
      startPixel +
      (channelState[index]?.width || (rrange === "Year" ? dailyWidth : 50));
    updateTooltipWithDates(
      startPixel,
      endPixel,
      index,
      event.clientX,
      event.clientY,
      "drag"
    );
  };

  useEffect(() => {
    if (disableDrag || draggingPosition === null) return;

    isDraggingRef.current = true;

    const handleDragMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      // Throttle updates for smoother performance
      const now = Date.now();
      if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
      lastUpdateTime.current = now;

      event.preventDefault();
      const { index, startX, startLeft } = draggingPosition;

      const deltaX = getLayoutXOptimized(event.clientX) - startX;
      let newLeft = startLeft + deltaX;

      const channelWidth =
        channelState[index]?.width ||
        (rrange === "Year" ? dailyWidth || parentWidth / 12 : 50);

      newLeft = Math.max(
        parentLeft,
        Math.min(newLeft, parentLeft + parentWidth - channelWidth)
      );

      // Snap to the nearest grid edge
      const relativePosition = newLeft - parentLeft;
      const snappedRelativePosition = snapToTimeline(
        relativePosition,
        parentWidth
      );
      newLeft = snappedRelativePosition + parentLeft;

      requestAnimationFrame(() => {
        setChannelState((prev) =>
          prev.map((state, i) =>
            i === index ? { ...state, left: newLeft } : state
          )
        );
      });

      const startPixel = newLeft - parentLeft;
      const endPixel = startPixel + channelWidth;
      const gridWidth = getUnscaledContainerWidthOptimized();
      const startDate = pixelToDate(startPixel, gridWidth, index, "startDate");
      const endDate = pixelToDate(endPixel, gridWidth, index, "endDate");

      draggingDataRef.current = { index, startDate, endDate } as any;

      updateTooltipWithDates(
        startPixel,
        endPixel,
        index,
        event.clientX,
        event.clientY,
        "drag"
      );
    };

    const handleDragEnd = async () => {
      setTooltip((prev) => ({ ...prev, visible: false }));

      // Clear interaction flag
      setUserIsInteracting(false);

      // IMMEDIATELY remove event listeners to stop any further dragging
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);

      if (draggingDataRef.current) {
        const { index, startDate, endDate } = draggingDataRef.current as any;

        setChannels((prevChannels) =>
          prevChannels.map((ch, i) =>
            i === index
              ? {
                ...ch,
                start_date: startDate,
                end_date: endDate,
              }
              : ch
          )
        );

        // Store the final manual position in the ref for persistence
        const currentState = channelState[index];
        if (currentState) {
          lastManualPositionsRef.current.set(index, {
            left: currentState.left,
            width: currentState.width,
          });
        }

        try {
          const updated = updateCampaignFormWithChannelDates(
            campaignFormData,
            index,
            startDate,
            endDate
          );
          setCampaignFormData(updated);
          setParentCampaignFormData(updated);

          // Force immediate localStorage save
          if (typeof window !== "undefined" && cId) {
            console.log("setting the local storage 1");
            localStorage.setItem(
              `campaignFormData_${cId}`,
              JSON.stringify(updated)
            );
            localStorage.setItem(
              `campaignFormData_${cId}_timestamp`,
              Date.now().toString()
            );
          }

          await sendUpdatedDataToAPI(updated);
        } catch (err) {
          console.error("Failed to persist channel drag", err);
        }

        draggingDataRef.current = null;
      }

      isDraggingRef.current = false;
      setDraggingPosition(null);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      isDraggingRef.current = false;
      draggingDataRef.current = null;
    };
  }, [draggingPosition, parentLeft]); // Remove channelState from dependencies

  const handleDeleteChannel = async (indexToDelete) => {
    const updatedChannels = channels.filter(
      (_, index) => index !== indexToDelete
    );
    const updatedChannelState = channelState.filter(
      (_, index) => index !== indexToDelete
    );

    // Clean up stored manual positions for the deleted channel
    manuallyPositionedRef.current.delete(indexToDelete);
    lastManualPositionsRef.current.delete(indexToDelete);

    const updatedCampaignFormData = JSON.parse(
      JSON.stringify(campaignFormData)
    );

    const channelMix = updatedCampaignFormData.channel_mix.find(
      (ch) => ch.funnel_stage === parentId
    );

    if (channelMix) {
      const channelGroup = channelMix[channels[indexToDelete].channelName];

      if (Array.isArray(channelGroup)) {
        const platformIndex = channelGroup.findIndex(
          (platform) => platform.platform_name === channels[indexToDelete].name
        );

        if (platformIndex !== -1) {
          channelGroup.splice(platformIndex, 1);
        }
      }
    }

    await sendUpdatedDataToAPI(updatedCampaignFormData);

    setChannels(updatedChannels);
    setChannelState(updatedChannelState);
    setCampaignFormData(updatedCampaignFormData);
    setParentCampaignFormData(updatedCampaignFormData);
  };



  const sendUpdatedDataToAPI = async (updatedData) => {
    try {
      setDeleting(true);
      const response = await axios.put(
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
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setDeleting(false);
      setId(null);
    }
  };

  useEffect(() => {
    // CRITICAL: Only recalculate positions when NOT user interacting
    if (userIsInteracting) {
      return; // Exit early to prevent overriding user actions
    }

    if (
      initialChannels &&
      initialChannels.length > 0 &&
      parentLeft !== undefined &&
      parentWidth !== undefined
    ) {
      // console.log("Recalculating channel positions:", {
      //   parentLeft,
      //   parentWidth,
      //   rrange,
      //   dailyWidth,
      //   startDate,
      //   endDate,
      //   userIsInteracting,

      //   manuallyPositionedSize: manuallyPositioned.size,
      //   storedPositionsCount: lastManualPositionsRef.current.size,
      //   storedPositions: Array.from(lastManualPositionsRef.current.entries()),
      // });

      console.log("this is the initial channels", initialChannels);

      setChannels(initialChannels);
      setChannelState((prev) => {
        const findMix = campaignFormData?.channel_mix?.find(
          (chhh) => chhh?.funnel_stage === parentId
        );
        const newState = initialChannels.map((ch, index) => {
          // Skip recalculation if this channel was manually positioned
          // Use both state and ref for more reliable checking
          const isManuallyPositioned =
            manuallyPositioned.has(index) ||
            manuallyPositionedRef.current.has(index);
          if (isManuallyPositioned && prev[index]) {
            // console.log(`Preserving manual position for channel ${index}:`, {
            //   left: prev[index].left,
            //   width: prev[index].width,
            //   fromState: manuallyPositioned.has(index),
            //   fromRef: manuallyPositionedRef.current.has(index),
            // });
            return prev[index];
          }

          // Check if we have a stored manual position for this channel
          const storedPosition = lastManualPositionsRef.current.get(index);
          if (storedPosition && prev[index]) {
            // console.log(`Using stored manual position for channel ${index}:`, storedPosition);
            return {
              ...prev[index],
              left: storedPosition.left,
              width: storedPosition.width,
            };
          }

          const findChannel = findMix[ch?.channelName]?.find(
            (plt) => plt?.platform_name === ch?.name
          );

          const stageStartDate = findChannel?.campaign_start_date
            ? parseISO(findChannel?.campaign_start_date)
            : null;

          // Clamp start within parent phase bounds
          const adjustedStageStartDate = stageStartDate
            ? startDate
              ? stageStartDate < startDate
                ? startDate
                : stageStartDate
              : stageStartDate
            : null;

          const stageEndDate = findChannel?.campaign_end_date
            ? parseISO(findChannel?.campaign_end_date)
            : null;

          const isEndDateExceeded =
            stageEndDate && endDate && stageEndDate > endDate;

          // Clamp end within parent phase bounds
          const adjustedStageEndDate = stageEndDate
            ? endDate
              ? stageEndDate > endDate
                ? endDate
                : stageEndDate
              : stageEndDate
            : null;

          let left, width;

          if (rrange === "Year") {
            // Year view calculations - based on months relative to parent start month
            if (
              adjustedStageStartDate &&
              adjustedStageEndDate &&
              startDate &&
              endDate
            ) {
              const startMonthIdx =
                (adjustedStageStartDate.getFullYear() -
                  startDate.getFullYear()) *
                12 +
                (adjustedStageStartDate.getMonth() - startDate.getMonth());
              const endMonthIdx =
                (adjustedStageEndDate.getFullYear() - startDate.getFullYear()) *
                12 +
                (adjustedStageEndDate.getMonth() - startDate.getMonth());

              const monthsBetween = endMonthIdx - startMonthIdx + 1; // inclusive

              const monthWidth =
                dailyWidth ||
                parentWidth /
                Math.max(
                  1,
                  (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                  (endDate.getMonth() - startDate.getMonth()) +
                  1
                );

              left = parentLeft + Math.max(0, startMonthIdx) * monthWidth;
              width = Math.max(monthWidth, monthsBetween * monthWidth);
            } else {
              // Fallback to default positioning when dates are not available
              left = parentLeft;
              const monthWidth = dailyWidth || parentWidth / 12;
              width = Math.max(monthWidth, 80);
            }

            // Ensure the calculated position is within parent bounds
            if (left < parentLeft) {
              left = parentLeft;
            }
            if (left + width > parentLeft + parentWidth) {
              if (width <= parentWidth) {
                left = parentLeft + parentWidth - width;
              } else {
                width = parentWidth;
                left = parentLeft;
              }
            }
          } else if (rrange === "Month") {
            // Month view calculations - compute offset relative to parent start using date differences
            if (startDate) {
              const offsetDays = adjustedStageStartDate
                ? Math.max(
                  0,
                  differenceInCalendarDays(adjustedStageStartDate, startDate)
                )
                : 0;

              const daysBetween =
                adjustedStageStartDate && adjustedStageEndDate
                  ? Math.max(
                    1,
                    differenceInCalendarDays(
                      adjustedStageEndDate,
                      adjustedStageStartDate
                    ) + 1
                  )
                  : stageStartDate && stageEndDate
                    ? Math.max(
                      1,
                      differenceInCalendarDays(
                        isEndDateExceeded ? endDate : stageEndDate,
                        stageStartDate
                      ) + 1
                    )
                    : 0;

              const step =
                dailyWidth ||
                parentWidth /
                Math.max(
                  1,
                  endDate && startDate
                    ? differenceInCalendarDays(endDate, startDate) + 1
                    : dateList?.length || 1
                );

              left = parentLeft + offsetDays * step;
              width = daysBetween > 0 ? step * daysBetween : parentWidth;
            } else {
              left = parentLeft;
              width = parentWidth;
            }
          } else {
            // Day, Week view calculations - compute offset relative to parent start using date differences
            if (startDate) {
              const offsetDays = adjustedStageStartDate
                ? Math.max(
                  0,
                  differenceInCalendarDays(adjustedStageStartDate, startDate)
                )
                : 0;

              const daysBetween =
                adjustedStageStartDate && adjustedStageEndDate
                  ? Math.max(
                    1,
                    differenceInCalendarDays(
                      adjustedStageEndDate,
                      adjustedStageStartDate
                    ) + 1
                  )
                  : stageStartDate && stageEndDate
                    ? Math.max(
                      1,
                      differenceInCalendarDays(
                        isEndDateExceeded ? endDate : stageEndDate,
                        stageStartDate
                      ) + 1
                    )
                    : 0;

              const step =
                dailyWidth ||
                parentWidth /
                Math.max(
                  1,
                  endDate && startDate
                    ? differenceInCalendarDays(endDate, startDate) + 1
                    : dateList?.length || 1
                );

              left = parentLeft + offsetDays * step;
              width = daysBetween > 0 ? step * daysBetween : parentWidth;
            } else {
              left = parentLeft;
              width = parentWidth;
            }
          }

          // Ensure minimum width constraints
          const getMinWidthForView = () => {
            if (rrange === "Year") {
              const monthWidth = dailyWidth || parentWidth / 12;
              return Math.max(monthWidth, 80);
            } else if (rrange === "Month") {
              // For month view, use day-level precision for smooth dragging
              const dayWidth =
                dailyWidth || parentWidth / Math.max(1, dateList.length);
              return Math.max(dayWidth, 8);
            }
            return 50;
          };

          const minChannelWidth = getMinWidthForView();

          // Ensure width doesn't exceed parent width
          width = Math.min(width, parentWidth);

          // Ensure the channel stays within parent boundaries
          if (left < parentLeft) {
            left = parentLeft;
          }

          if (left + width > parentLeft + parentWidth) {
            if (width <= parentWidth) {
              left = parentLeft + parentWidth - width;
            } else {
              width = parentWidth;
              left = parentLeft;
            }
          }

          const existingState = prev[index];

          // console.log(`Channel ${ch.name} calculated position:`, {
          //   left,
          //   width,
          //   parentLeft,
          //   parentWidth,
          //   rrange,
          // });

          return existingState
            ? {
              ...existingState,
              left: left,
              width: width,
            }
            : {
              left: parentLeft,
              width: Math.min(width, minChannelWidth),
            };
        });

        console.log("this is the new state", newState);
        return newState;
      });
    }
  }, [
    initialChannels,
    parentLeft,
    parentWidth,
    campaignFormData,
    rrange,
    startDate,
    endDate,
    dailyWidth,
    dateList,
    userIsInteracting, // Add this to dependencies
    manuallyPositioned, // Add this to dependencies
  ]);

  // Additional useEffect to ensure channels stay within parent boundaries
  useEffect(() => {
    if (
      channelState.length > 0 &&
      parentLeft !== undefined &&
      parentWidth !== undefined
    ) {
      setChannelState((prev) =>
        prev.map((state) => {
          let newLeft = state.left;
          let newWidth = state.width;

          // Ensure left position is within parent bounds
          if (newLeft < parentLeft) {
            newLeft = parentLeft;
          }

          // Ensure width doesn't exceed parent width
          newWidth = Math.min(newWidth, parentWidth);

          // Ensure the channel doesn't extend beyond parent right edge
          if (newLeft + newWidth > parentLeft + parentWidth) {
            if (newWidth <= parentWidth) {
              newLeft = parentLeft + parentWidth - newWidth;
            } else {
              newWidth = parentWidth;
              newLeft = parentLeft;
            }
          }

          return {
            ...state,
            left: newLeft,
            width: newWidth,
          };
        })
      );
    }
  }, [channelState.length, parentLeft, parentWidth]);

  // REMOVED: Second drag system that was causing conflicts
  // This useEffect was interfering with the main drag system
  // and causing dragging to continue after mouse release

  function replaceSpacesAndSpecialCharsWithUnderscore(str) {
    // Replace all spaces, special characters, and symbols except underscores with underscores
    return str.replace(/[^\w_]/g, "_");
  }

  // Ensure element stays within the viewport (or grid container) horizontally
  const getSafeLeftPosition = (
    desiredLeft: number,
    elementWidth: number = 600,
    margin: number = 16
  ) => {
    if (typeof window === "undefined") return desiredLeft;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement | null;

    if (!gridContainer) return desiredLeft;

    const containerRect = gridContainer.getBoundingClientRect();
    const absoluteLeft = containerRect.left + desiredLeft; // position in viewport

    // Calculate shift needed if popover would overflow right or left
    let shift = 0;
    const overflowRight =
      absoluteLeft + elementWidth + margin - window.innerWidth;
    const overflowLeft = margin - absoluteLeft; // positive if too far left

    if (overflowRight > 0) {
      shift = -overflowRight;
    } else if (overflowLeft > 0) {
      shift = overflowLeft;
    }

    return desiredLeft + shift;
  };

  // Helper: convert screen (scaled) X to layout X (unscaled)
  const getLayoutX = (clientX: number) => {
    const grid = document.querySelector(
      ".grid-container"
    ) as HTMLElement | null;
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
    const grid = document.querySelector(
      ".grid-container"
    ) as HTMLElement | null;
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

  // Cache for zoom level to avoid repeated DOM queries
  let cachedZoomLevel = 1;
  let cachedContainerWidth = 0;
  let lastCacheTime = 0;
  const CACHE_DURATION = 100; // Cache for 100ms

  // Helper to get cached zoom level
  const getCachedZoomLevel = () => {
    const now = Date.now();
    if (now - lastCacheTime > CACHE_DURATION) {
      const grid = document.querySelector(
        ".grid-container"
      ) as HTMLElement | null;
      if (grid) {
        const timelineContainer = grid.closest(
          '[style*="transform: scale"]'
        ) as HTMLElement;
        if (timelineContainer) {
          const transform = timelineContainer.style.transform;
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            cachedZoomLevel = parseFloat(scaleMatch[1]);
          } else {
            cachedZoomLevel = 1;
          }
        } else {
          cachedZoomLevel = 1;
        }
        cachedContainerWidth = grid.offsetWidth;
        lastCacheTime = now;
      }
    }
    return cachedZoomLevel;
  };

  // Optimized coordinate conversion using cached zoom
  const getLayoutXOptimized = (clientX: number) => {
    const zoomLevel = getCachedZoomLevel();
    return clientX / zoomLevel;
  };

  // Optimized container width getter
  const getUnscaledContainerWidthOptimized = () => {
    getCachedZoomLevel(); // This updates the cache
    return cachedContainerWidth;
  };

  // console.log(isResizing, "isResizing state")

  return (
    <div
      className={`open_channel_btn_container relative`}
      style={{
        gridTemplateColumns: `repeat(${dateList?.length}, 1fr)`,
      }}
    >
      {!disableDrag && parentWidth < 350 && (
        <button
          className="channel-btn-blue mt-[12px] mb-[12px] relative w-fit"
          onClick={() => {
            setIsOpen(true);
            setSelectedStage(parentId);
          }}
          style={{
            left: `${parentLeft}px`,
          }}
        >
          <Image src={whiteplus || "/placeholder.svg"} alt="whiteplus" />
          <p className="whitespace-nowrap">Add channel</p>
        </button>
      )}
      {channels?.map((channel, index) => {
        // console.log(channel, "channel");
        const getColumnIndex = (date) =>
          dateList?.findIndex((d) => d.toISOString().split("T")[0] === date);

        const updatedCampaignFormData = { ...campaignFormData };
        const channelMix = updatedCampaignFormData?.channel_mix?.find(
          (ch) => ch.funnel_stage === parentId
        );
        let startColumn = 1;
        let endColumn = 3;
        let budget;
        if (channelMix) {
          const platform = channelMix[channels[index].channelName]?.find(
            (platform) => platform.platform_name === channels[index].name
          );

          if (platform) {
            startColumn = getColumnIndex(platform?.campaign_start_date);
            endColumn = getColumnIndex(platform?.campaign_end_date) + 1;
            budget = platform?.budget?.fixed_value;
          }
        }

        return (
          <div
            key={channel.name}
            className={`relative w-full ${!disableDrag ? "min-h-[46px]" : ""
              } min-h-[46px]`}
            style={{
              gridColumnStart: startColumn < 1 ? 1 : startColumn,
              gridColumnEnd: endColumn < 1 ? 1 : endColumn,
            }}
          >
            <div
              className={`relative cont-${replaceSpacesAndSpecialCharsWithUnderscore(
                parentId
              )}-${replaceSpacesAndSpecialCharsWithUnderscore(channel?.name)}`}
            >
              {tooltip.visible && tooltip.index === index && (
                <div
                  className="absolute top-0 z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none w-fit"
                  style={{
                    left: `${tooltip.x}px`,
                    top: `0px`,
                    transform: `translate(-${tooltip.x + 100 >= (channelState[index]?.width || 0)
                        ? 100
                        : 0
                      }%, -100%)`,
                    border: `1px solid ${channels[tooltip.index]?.color}`,
                    backgroundColor: `${channels[tooltip.index]?.bg}`,
                    color: `${channels[tooltip.index]?.color}`,
                  }}
                >
                  {tooltip.content}
                </div>
              )}
              <div
                className={`relative h-full flex ${disableDrag
                    ? "justify-between min-w-[50px]"
                    : "justify-center cursor-move"
                  }   text-white py-[10px] px-2 gap-2 border shadow-md overflow-x-hidden ${parentWidth <= 350 || channelState[index]?.width <= 350
                    ? "flex-col justify-center items-center"
                    : "flex-row items-center"
                  }`}
                style={{
                  left: `${channelState[index]?.left || parentLeft}px`,
                  width: `${channelState[index]?.width +
                    (disableDrag ? 0 : rrange === "Month" ? 0 : 0)
                    }px`,
                  backgroundColor: channel.bg,
                  color: channel.color,
                  borderColor: channel.color,
                  borderRadius: "10px",
                  minWidth: `${dailyWidth}px`,
                }}
                onMouseDown={
                  disableDrag || openItems ? undefined : handleDragStart(index)
                }
              >
                <div className={`flex items-center gap-3`}>
                  <Image
                    src={channel.icon || "/placeholder.svg"}
                    alt={channel.icon}
                    width={20}
                    height={20}
                    className={`${parentWidth <= 350 || channelState[index]?.width <= 350
                        ? "hidden"
                        : "block"
                      }`}
                  />
                  <span className="font-medium whitespace-nowrap break-words text-wrap">
                    {channel.name}
                  </span>
                </div>
                {!disableDrag && (
                  <button
                    className="delete-resizeableBar z-[20]"
                    onClick={() => {
                      if (
                        disableDrag ||
                        openItems === `${channel?.name}${index}`
                      ) {
                        return;
                      }
                      handleDeleteChannel(index);
                      setId(index);
                    }}
                  >
                    {deleting && id === index ? (
                      <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-red-600">
                        <FaSpinner className="animate-spin text-white" />
                      </div>
                    ) : (
                      <Image
                        src={reddelete || "/placeholder.svg"}
                        alt="reddelete"
                      />
                    )}
                  </button>
                )}
                {disableDrag && (
                  <div
                    className="rounded-[5px] px-[2px] font-medium bg-opacity-15 text-[15px]"
                    style={{
                      color: "#061237",
                    }}
                  >
                    {isNaN(Number(budget)) || Number(budget) <= 0
                      ? ""
                      : `${Number(
                        budget
                      )?.toLocaleString()} ${getCurrencySymbol(
                        campaignFormData?.campaign_budget?.currency
                      )}`}
                  </div>
                )}
                {
                  <>
                    {rrange === "Month" ? (
                      <div
                        className={`absolute top-0 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${disableDrag && "hidden"
                          }`}
                        style={{
                          left: `0px`,
                        }}
                        onMouseDown={(e) =>
                          disableDrag || openItems
                            ? undefined
                            : handleMouseDownResize(e, "left", index)
                        }
                      >
                        <MdDragHandle
                          className="rotate-90"
                          color={channel.color}
                        />
                      </div>
                    ) : (
                      <div
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${disableDrag && "hidden"
                          }`}
                        style={{
                          left: `0px`,
                          backgroundColor: channel.color,
                        }}
                        onMouseDown={(e) =>
                          disableDrag || openItems
                            ? undefined
                            : handleMouseDownResize(e, "left", index)
                        }
                      >
                        <MdDragHandle className="rotate-90" />
                      </div>
                    )}
                    {rrange === "Month" ? (
                      <div
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${disableDrag && "hidden"
                          }`}
                        style={{
                          right: "0px",
                        }}
                        onMouseDown={(e) => {
                          disableDrag || openItems
                            ? undefined
                            : handleMouseDownResize(e, "right", index);
                        }}
                      >
                        <MdDragHandle
                          className="rotate-90"
                          color={channel?.color}
                        />
                      </div>
                    ) : (
                      <div
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${disableDrag && "hidden"
                          }`}
                        style={{
                          right: "0px",
                          backgroundColor: channel.color,
                        }}
                        onMouseDown={(e) => {
                          disableDrag || openItems
                            ? undefined
                            : handleMouseDownResize(e, "right", index);
                        }}
                      >
                        <MdDragHandle className="rotate-90" />
                      </div>
                    )}
                  </>
                }
              </div>
            </div>

            {(channel?.ad_sets || []).filter(
              (set) =>
                Boolean(set?.audience_type?.toString().trim()) ||
                Boolean(set?.name?.toString().trim()) ||
                Boolean(set?.size?.toString().trim()) ||
                Boolean(set?.description?.toString().trim())
            ).length > 0 && (
                <div
                  className="relative"
                  style={{
                    left: `${channelState[index]?.left || parentLeft}px`,
                  }}
                >
                  <div
                    className="relative bg-[#EBFEF4] py-[8px] px-[12px] w-fit mt-[5px] border border-[#00A36C1A] rounded-[8px] flex items-center cursor-pointer"
                    onClick={(e) => {
                      toggleChannel(`${channel?.name}${index}`);
                      setSelectedCreative(channel?.format);

                      // Measure and adjust popover so it doesn't overflow viewport right edge
                      // no-op
                    }}
                  >
                    <p className="text-[14px] font-medium text-[#00A36C]">
                      {
                        (channel?.ad_sets || []).filter(
                          (set) =>
                            Boolean(set?.audience_type?.toString().trim()) ||
                            Boolean(set?.name?.toString().trim()) ||
                            Boolean(set?.size?.toString().trim()) ||
                            Boolean(set?.description?.toString().trim())
                        ).length
                      }{" "}
                      ad sets
                    </p>
                    <Image
                      src={
                        openItems && openItems === `${channel?.name}${index}`
                          ? arrowUp
                          : arrowDown
                      }
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  {openItems && openItems === `${channel?.name}${index}` && (
                    <div
                      ref={popoverRef}
                      className="absolute top-full left-0 mt-2 bg-white z-50 rounded-md border shadow-md w-[600px] max-w-[90vw]"
                      style={{ transform: `translateX(${popoverShift}px)` }}
                    >
                      <table className="table-auto w-full text-left text-[12px] text-[#061237B2] font-medium border-none hover:cursor-default">
                        <thead className="bg-transparent">
                          <tr>
                            <th className="px-4 py-2">#</th>
                            <th className="px-4 py-2">Audience Type</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2 whitespace-nowrap">
                              Audience size
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {channel?.ad_sets?.map((set, idx) => (
                            <React.Fragment key={idx}>
                              <tr className="border-none">
                                <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                  Ad Set No.{idx + 1}.
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap border-none">
                                  {set?.audience_type}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap border-none">
                                  {set?.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap border-none hover:no-underline">
                                  {Number(set?.size).toLocaleString()}
                                </td>
                              </tr>
                              {set?.extra_audiences?.map((extra, extraIndex) => (
                                <tr
                                  key={`${idx}-${extraIndex}`}
                                  className="border-none"
                                >
                                  <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                    <div className="l-shape-container-ad">
                                      <div
                                        className={`absolute w-[1px] ${extraIndex > 0
                                            ? "h-[35px] top-[-35px]"
                                            : "h-[20px] top-[-20px]"
                                          } bg-blue-500 left-[60px]`}
                                      ></div>
                                      <div className="absolute w-[60px] h-[1px] bg-blue-500 bottom-[-1px] left-[60px]"></div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap border-none">
                                    {extra?.audience_type}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap border-none">
                                    {extra?.name}
                                  </td>
                                  <td className="px-4 py-2 whitespace-nowrap border-none">
                                    {Number(extra?.size).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-2 mt-2 flex justify-between items-center">
                        <button
                          className="bg-blue-500 text-white p-2 rounded-md"
                          onClick={() => {
                            setOpenCreatives(true);
                            setSelectedChannel(channel?.name);
                            setOpenView("adset");
                          }}
                        >
                          View Creatives
                        </button>
                        {!disableDrag && (
                          <button
                            className="bg-blue-500 text-white p-2 rounded-md"
                            onClick={() => {
                              setOpenAdset(true);
                              setSelectedChannel(channel?.name);
                            }}
                          >
                            Add Adsets
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            {(channel?.ad_sets === undefined || channel?.ad_sets?.length < 1) &&
              channel?.format?.some((f) => f?.previews?.length > 0) && (
                <button
                  className="bg-blue-500 text-white p-2 rounded-md relative mt-2"
                  style={{
                    left: `${channelState[index]?.left || parentLeft}px`,
                  }}
                  onClick={() => {
                    setOpenCreatives(true);
                    setSelectedChannel(channel?.name);
                    setOpenView("channel");
                  }}
                >
                  View Creatives
                </button>
              )}
          </div>
        );
      })}

      {/* Removed global fixed pop-over */}
      <Modal
        isOpen={selectedChannel && openCreatives}
        onClose={() => setOpenCreatives(false)}
      >
        <div className="bg-white w-[900px] p-6 rounded-lg h-[600px] overflow-y-auto">
          <button
            className="flex justify-end w-fit ml-auto"
            onClick={() => setOpenCreatives(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                stroke="#717680"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {disableDrag ? (
            <div>
              {channels
                ?.filter((ch) => ch?.name === selectedChannel)
                ?.map((channel) => (
                  <div key={channel.name} className="mb-6">
                    <h2 className="font-semibold text-lg mb-2">
                      {channel.name}
                    </h2>
                    <div className="flex flex-wrap gap-4">
                      {channel?.format?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-semibold text-sm mb-2">
                            Channel Formats
                          </h3>
                          <div className="text-sm text-gray-600">
                            {channel.format.map((format, index) => (
                              <div
                                key={index}
                                className="p-4 bg-gray-100 rounded-lg shadow-sm"
                              >
                                <p className="font-medium">
                                  Format Type: {format?.format_type}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Previews:
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {format?.previews?.map((preview, id) => (
                                    <div
                                      key={id}
                                      className="block w-[140px] h-[140px]"
                                    >
                                      {renderUploadedFile(
                                        format?.previews?.map((pp) => pp?.url),
                                        format?.format_type,
                                        id
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {channel?.ad_sets?.some(
                        (adSet) => adSet?.format?.length > 0
                      ) && (
                          <div>
                            <h3 className="font-semibold text-sm mb-2">
                              Ad Set Formats
                            </h3>
                            {channel.ad_sets
                              ?.filter((adSet) => adSet?.format?.length > 0)
                              .map((adSet, adSetIndex) => (
                                <div
                                  key={adSetIndex}
                                  className="mt-3 p-2 bg-white rounded border border-gray-200"
                                >
                                  <div className="font-medium text-sm">
                                    {adSet.name || "Unnamed Ad Set"}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-2">
                                    {adSet.audience_type} • Size:{" "}
                                    {Number(adSet.size).toLocaleString()}
                                  </div>
                                  {adSet.format?.length > 0 ? (
                                    <div className="text-sm text-gray-600">
                                      {adSet.format.map((format, formatIndex) => (
                                        <div
                                          key={formatIndex}
                                          className="p-4 bg-gray-100 rounded-lg shadow-sm"
                                        >
                                          <p className="font-medium">
                                            Format Type: {format?.format_type}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            Previews:
                                          </p>
                                          <div className="grid grid-cols-2 gap-2 mt-2">
                                            {format?.previews?.map(
                                              (preview, id) => (
                                                <div
                                                  key={id}
                                                  className="block w-[140px] h-[140px]"
                                                >
                                                  {renderUploadedFile(
                                                    format?.previews?.map(
                                                      (pp) => pp?.url
                                                    ),
                                                    format?.format_type,
                                                    id
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-500">
                                      No formats configured
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            openCreatives && (
              <FormatSelection
                stageName={parentId}
                platformName={selectedChannel}
                view={openView}
              />
            )
          )}
        </div>
      </Modal>
      {openAdset && (
        <Modal
          isOpen={selectedChannel && openAdset ? true : false}
          onClose={() => setOpenAdset(false)}
        >
          <div className="bg-white w-[950px] p-2 rounded-lg max-h-[600px] overflow-y-scroll">
            <button
              className="flex justify-end w-fit ml-auto"
              onClick={() => setOpenAdset(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                  stroke="#717680"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <AdSetsFlow stageName={parentId} platformName={selectedChannel} />
            <div className="w-fit ml-auto">
              <button
                className="bg-blue-500 text-white rounded-md p-2 flex justify-center items-center"
                onClick={async () => {
                  await sendUpdatedDataToAPI(campaignFormData);
                  await setOpenAdset(false);
                }}
                disabled={deleting}
              >
                {deleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Confirm Changes"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ResizableChannels;
