"use client";
import React, { useState, useEffect, useRef } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import whiteplus from "../../../../../public/white-plus.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isEqual,
  parseISO,
  format,
  startOfYear,
  endOfYear,
  startOfMonth,
  startOfWeek,
  endOfWeek,
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
import { useDateRange as DateRange } from "src/date-context";
import { FaSpinner } from "react-icons/fa";
import { pixelToDate as pixelToDateUtil } from "utils/pixelToDate";

interface Channel {
  id?: number;
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
  setOpenItems?: any;
  endMonth?: any;
  endDay?: any;
  endWeek?: any;
  dailyWidth?: any;
  viewType?: string;
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
}

const ResizableChannels = ({
  channels: initialChannels,
  parentId,
  parentWidth,
  parentLeft,
  setIsOpen,
  dateList,
  disableDrag = false,
  setSelectedStage,
  openItems,
  setOpenItems,
  dailyWidth,
  viewType,
}: ResizableChannelsProps) => {
  const { campaignFormData, setCampaignFormData, cId, campaignData, jwt } =
    useCampaigns();
  const draggingDataRef = useRef(null);
  const isDraggingRef = useRef(false);
  const { range: rrange } = DateRange();

  const [channels, setChannels] = useState(initialChannels);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState(null);

  const [openCreatives, setOpenCreatives] = useState(false);
  const [openAdset, setOpenAdset] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [openView, setOpenView] = useState<"channel" | "adset">("channel");

  const initialStartDateRef = useRef(null);
  const initialEndDateRef = useRef(null);

  const [channelState, setChannelState] = useState<ChannelState[]>(
    channels?.map((ch) => ({
      left: parentLeft,
      width: Math.min(10, parentWidth),
      startDate: ch.start_date,
      endDate: ch.end_date,
    }))
  );

  const [dragging, setDragging] = useState(null);
  const [draggingPosition, setDraggingPosition] = useState(null);

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
    index: null,
  });

  const toggleChannel = (id) => {
    setOpenItems((prev) => (prev === id ? null : id));
  };
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Simple helper to save channel dates to campaignFormData
  const saveChannelDates = (
    index: number,
    newStartDate: Date,
    newEndDate: Date
  ) => {
    if (!channels[index]) return;

    const updatedFormData = JSON.parse(JSON.stringify(campaignFormData));
    const channelMix = updatedFormData.channel_mix?.find(
      (ch) => ch.funnel_stage === parentId
    );

    if (channelMix) {
      const platform = channelMix[channels[index].channelName]?.find(
        (p) => p.platform_name === channels[index].name
      );

      if (platform) {
        const formattedStart = moment(newStartDate).format("YYYY-MM-DD");
        const formattedEnd = moment(newEndDate).format("YYYY-MM-DD");

        console.log("=== SAVING CHANNEL DATES ===");
        console.log("Channel:", channels[index].name);
        console.log("Parent stage:", parentId);
        console.log("Saving start_date:", formattedStart);
        console.log("Saving end_date:", formattedEnd);
        console.log("Current channelState left:", channelState[index]?.left);
        console.log("Current channelState width:", channelState[index]?.width);
        console.log("parentLeft:", parentLeft);
        console.log("dailyWidth:", dailyWidth);
        console.log("viewType:", viewType);

        platform.campaign_start_date = formattedStart;
        platform.campaign_end_date = formattedEnd;
        setCampaignFormData(updatedFormData);
      }
    }
  };

  const isResizing = useRef<{
    startX: number;
    initialState: ChannelState;
    direction: "left" | "right";
    index: number;
  } | null>(null);

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    const baseStep = dailyWidth;
    const adjustmentPerStep = 0;
    const snapPoints = [];

    let currentSnap = 0;
    let step = baseStep;

    while (currentSnap <= containerWidth) {
      snapPoints.push(currentSnap);
      currentSnap += step;
      step = Math.max(dailyWidth, step - adjustmentPerStep);
    }

    const closestSnap = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition)
        ? curr
        : prev
    );

    return closestSnap;
  };

  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    index: number,
    mouseX: number,
    type: "resize" | "drag"
  ) => {
    if (!dateList || dateList.length === 0) return;

    let startDateValue: Date;
    let endDateValue: Date;
    let formattedStartDate: string;
    let formattedEndDate: string;

    if (viewType === "Year") {
      const timelineStart = startOfYear(dateList[0]);
      const timelineEnd = endOfYear(dateList[dateList.length - 1]);
      const allMonths = eachMonthOfInterval({
        start: timelineStart,
        end: timelineEnd,
      });

      const startIdx = Math.min(
        allMonths.length - 1,
        Math.max(0, Math.floor(startPixel / dailyWidth))
      );
      const endIdx = Math.min(
        allMonths.length - 1,
        Math.max(0, Math.floor(endPixel / dailyWidth))
      );

      startDateValue = allMonths[startIdx] || startDate;
      endDateValue = allMonths[endIdx] || endDate;
      formattedStartDate = format(startDateValue, "MMM yyyy");
      formattedEndDate = format(endDateValue, "MMM yyyy");
    } else if (viewType === "Month") {
      const allWeeks = eachWeekOfInterval(
        { start: dateList[0], end: dateList[dateList.length - 1] },
        { weekStartsOn: 1 }
      );

      const startIdx = Math.min(
        allWeeks.length - 1,
        Math.max(0, Math.floor(startPixel / dailyWidth))
      );
      const endIdx = Math.min(
        allWeeks.length - 1,
        Math.max(0, Math.floor(endPixel / dailyWidth))
      );

      startDateValue = allWeeks[startIdx] || startDate;
      endDateValue =
        endOfWeek(allWeeks[endIdx], { weekStartsOn: 1 }) || endDate;
      formattedStartDate = format(startDateValue, "MMM d");
      formattedEndDate = format(endDateValue, "MMM d");
    } else {
      const totalDays = dateList.length - 1;
      const startIdx = Math.min(
        totalDays,
        Math.max(0, Math.floor(startPixel / dailyWidth))
      );
      const endIdx = Math.min(
        totalDays,
        Math.max(0, Math.floor(endPixel / dailyWidth))
      );

      startDateValue = dateList[startIdx] || startDate;
      endDateValue = dateList[endIdx] || endDate;
      formattedStartDate = format(startDateValue, "MMM dd");
      formattedEndDate = format(endDateValue, "MMM dd");
    }

    const channelName = channels[index]?.name || "Channel";
    const containerRect = document
      .querySelector(
        `.cont-${parentId?.replaceAll(" ", "_")}-${channelName
          ?.replaceAll(" ", "_")
          ?.replace("(", "")
          ?.replace(")", "")}`
      )
      ?.getBoundingClientRect();

    const tooltipX = mouseX - containerRect.left;
    const tooltipY = containerRect.top - 50;

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
      content: `${channelName}: ${formattedStartDate} - ${formattedEndDate}`,
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

    // Store the initial state for this resize operation
    isResizing.current = {
      startX: e.clientX,
      initialState: { ...channelState[index] },
      direction,
      index,
    };

    const startPixel = channelState[index].left - parentLeft;
    const endPixel = startPixel + channelState[index].width;
    updateTooltipWithDates(startPixel, endPixel, index, e.clientX, "resize");

    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUpResize);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const { startX, initialState, direction, index } = isResizing.current;
    const deltaX = e.clientX - startX;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    const parentRightEdge = parentLeft + parentWidth;

    let newWidth = initialState.width;
    let newLeft = initialState.left;

    if (direction === "left") {
      // Left edge resize - adjust position and width
      const proposedLeft = Math.max(parentLeft, initialState.left + deltaX);
      const proposedWidth =
        initialState.width - (proposedLeft - initialState.left);

      // Ensure minimum width
      if (proposedWidth < 50) {
        newWidth = 50;
        newLeft = initialState.left + initialState.width - 50;
      } else {
        newLeft = proposedLeft;
        newWidth = proposedWidth;
      }

      // Snap the left edge to timeline
      const snappedLeft =
        snapToTimeline(newLeft - parentLeft, containerRect.width) + parentLeft;
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
      const proposedWidth = Math.max(50, initialState.width + deltaX);

      // Calculate the right edge position
      const rightEdgePos = newLeft + proposedWidth;

      // Snap the right edge to timeline
      const snappedRightEdge =
        snapToTimeline(rightEdgePos - parentLeft, containerRect.width) +
        parentLeft;

      // Ensure the snapped right edge doesn't exceed parent boundaries
      const finalRightEdge = Math.min(snappedRightEdge, parentRightEdge);

      // Calculate final width based on the constrained right edge
      newWidth = Math.max(50, finalRightEdge - newLeft);
    }

    // Use ABSOLUTE pixel positions for date calculation
    const newStartDate = pixelToDateUtil({
      dateList,
      viewType,
      pixel: newLeft,
      containerWidth: parentWidth,
      dailyWidth,
    });
    const newEndDate = pixelToDateUtil({
      dateList,
      viewType,
      pixel: newLeft + newWidth,
      containerWidth: parentWidth,
      fieldName: "endDate",
      dailyWidth,
    });

    console.log("=== RESIZE MOVE ===");
    console.log("newLeft (absolute pixel):", newLeft);
    console.log("newWidth:", newWidth);
    console.log("Calculated newStartDate:", newStartDate);
    console.log("Calculated newEndDate:", newEndDate);

    setChannelState((prev) =>
      prev.map((state, i) =>
        i === index
          ? {
              ...state,
              left: newLeft,
              width: newWidth,
              startDate: newStartDate
                ? moment(newStartDate).format("YYYY-MM-DD")
                : state.startDate,
              endDate: newEndDate
                ? moment(newEndDate).format("YYYY-MM-DD")
                : state.endDate,
            }
          : state
      )
    );

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

    // For tooltip, use relative pixels (visual display)
    const relativeStart = newLeft - parentLeft;
    updateTooltipWithDates(
      relativeStart,
      relativeStart + newWidth,
      index,
      e.clientX,
      "resize"
    );

    // Store data for final update
    draggingDataRef.current = { index, newStartDate, newEndDate };
  };

  const handleMouseUpResize = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));

    if (draggingDataRef.current) {
      const { index, newStartDate, newEndDate } = draggingDataRef.current;
      if (newStartDate && newEndDate) {
        saveChannelDates(index, newStartDate, newEndDate);
      }
      draggingDataRef.current = null;
    }

    isResizing.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mouseup", handleMouseUpResize);
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
    }
  }, [campaignFormData, parentId]);

  const pixelToDate = (
    pixel,
    containerWidth,
    index,
    fieldName,
    shouldUpdate = false
  ) => {
    let calculatedDate: Date | null = null;
    if (!dateList || dateList.length === 0) return null;
    let adjustedPixel = pixel;
    if (fieldName === "endDate") {
      adjustedPixel = Math.max(0, pixel - 1);
    }

    if (viewType === "Year") {
      const timelineStart = startOfYear(dateList[0]);
      const timelineEnd = endOfYear(dateList[dateList.length - 1]);
      const allMonths = eachMonthOfInterval({
        start: timelineStart,
        end: timelineEnd,
      });

      const monthIndex = Math.min(
        allMonths.length - 1,
        Math.max(0, Math.floor(adjustedPixel / dailyWidth))
      );

      if (fieldName === "endDate") {
        const endMonth = allMonths[monthIndex];
        const lastDayOfMonth = new Date(
          endMonth.getFullYear(),
          endMonth.getMonth() + 1,
          0
        );
        calculatedDate = lastDayOfMonth;
      } else {
        calculatedDate = startOfMonth(allMonths[monthIndex]);
      }
    } else if (viewType === "Month") {
      const allWeeks = eachWeekOfInterval(
        { start: dateList[0], end: dateList[dateList.length - 1] },
        { weekStartsOn: 1 }
      );

      const weekIndex = Math.min(
        allWeeks.length - 1,
        Math.max(0, Math.floor(adjustedPixel / dailyWidth))
      );

      if (fieldName === "endDate") {
        const weekEnd = endOfWeek(allWeeks[weekIndex], { weekStartsOn: 1 });
        calculatedDate = weekEnd;
      } else {
        calculatedDate = startOfWeek(allWeeks[weekIndex], { weekStartsOn: 1 });
      }
    } else {
      const totalDays = dateList.length;
      const dayIndex = Math.min(
        totalDays - 1,
        Math.max(0, Math.floor(adjustedPixel / dailyWidth))
      );
      calculatedDate = dateList[dayIndex];
    }

    if (shouldUpdate && calculatedDate) {
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
            platform.campaign_start_date =
              moment(calculatedDate).format("YYYY-MM-DD");
          } else {
            const endDateToUse =
              endDate && calculatedDate > endDate ? endDate : calculatedDate;
            platform.campaign_end_date =
              moment(endDateToUse).format("YYYY-MM-DD");
          }
        }
      }
    }

    return calculatedDate ? calculatedDate : null;
  };

  const handleDragStart = (index) => (event) => {
    if (disableDrag) return;
    event.preventDefault();
    setDraggingPosition({
      index,
      startX: event.clientX,
      startLeft: channelState[index]?.left || parentLeft,
    });

    const startPixel = (channelState[index]?.left || parentLeft) - parentLeft;
    const endPixel = startPixel + (channelState[index]?.width || 50);
    updateTooltipWithDates(startPixel, endPixel, index, event.clientX, "drag");
  };

  useEffect(() => {
    if (disableDrag || draggingPosition === null) return;

    isDraggingRef.current = true;

    const handleDragMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return;

      event.preventDefault();
      const { index, startX, startLeft } = draggingPosition;

      const deltaX = event.clientX - startX;
      let newLeft = startLeft + deltaX;
      const channelWidth = channelState[index]?.width || 50;

      newLeft = Math.max(
        parentLeft,
        Math.min(newLeft, parentLeft + parentWidth - channelWidth)
      );

      newLeft = snapToTimeline(newLeft - parentLeft, parentWidth) + parentLeft;

      setChannelState((prev) =>
        prev.map((state, i) =>
          i === index ? { ...state, left: newLeft } : state
        )
      );

      // Use ABSOLUTE pixel positions for date calculation
      const startDate = pixelToDateUtil({
        dateList,
        viewType,
        pixel: newLeft,
        containerWidth: parentWidth,
        dailyWidth,
      });
      const endDate = pixelToDateUtil({
        dateList,
        viewType,
        pixel: newLeft + channelWidth,
        containerWidth: parentWidth,
        fieldName: "endDate",
        dailyWidth,
      });

      console.log("=== DRAG MOVE ===");
      console.log("newLeft (absolute pixel):", newLeft);
      console.log("channelWidth:", channelWidth);
      console.log("Calculated startDate:", startDate);
      console.log("Calculated endDate:", endDate);

      draggingDataRef.current = { index, startDate, endDate };

      // For tooltip, still use relative pixels (visual display)
      const relativeStart = newLeft - parentLeft;
      updateTooltipWithDates(
        relativeStart,
        relativeStart + channelWidth,
        index,
        event.clientX,
        "drag"
      );
    };

    const handleDragEnd = () => {
      console.log("=== DRAG END CALLED ===");
      console.log("draggingDataRef.current:", draggingDataRef.current);
      console.log("channels:", channels);

      setTooltip((prev) => ({ ...prev, visible: false }));

      if (draggingDataRef.current) {
        const {
          index,
          startDate: newStart,
          endDate: newEnd,
        } = draggingDataRef.current;

        console.log(
          "Extracted values - index:",
          index,
          "newStart:",
          newStart,
          "newEnd:",
          newEnd
        );
        console.log("channels[index]:", channels[index]);

        setChannels((prevChannels) =>
          prevChannels.map((ch, i) =>
            i === index
              ? {
                  ...ch,
                  start_date: newStart,
                  end_date: newEnd,
                }
              : ch
          )
        );

        // Save to campaignFormData directly (avoid stale closure)
        console.log(
          "Checking condition - newStart:",
          !!newStart,
          "newEnd:",
          !!newEnd,
          "channels[index]:",
          !!channels[index]
        );
        if (newStart && newEnd && channels[index]) {
          console.log("Condition passed! Proceeding to save...");
          const updatedFormData = JSON.parse(JSON.stringify(campaignFormData));
          const channelMix = updatedFormData.channel_mix?.find(
            (ch) => ch.funnel_stage === parentId
          );

          if (channelMix) {
            const platform = channelMix[channels[index].channelName]?.find(
              (p) => p.platform_name === channels[index].name
            );

            if (platform) {
              console.log("=== DRAG END SAVING ===");
              console.log("Channel:", channels[index].name);
              console.log(
                "Saving:",
                moment(newStart).format("YYYY-MM-DD"),
                "to",
                moment(newEnd).format("YYYY-MM-DD")
              );

              platform.campaign_start_date =
                moment(newStart).format("YYYY-MM-DD");
              platform.campaign_end_date = moment(newEnd).format("YYYY-MM-DD");
              setCampaignFormData(updatedFormData);
            }
          }
        }

        draggingDataRef.current = null;
      }

      isDraggingRef.current = false;
      setDraggingPosition(null);
      setDragging(null);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      // Don't clear refs here - they're needed by handleDragEnd even after cleanup
    };
  }, [
    draggingPosition,
    parentLeft,
    channelState,
    channels,
    campaignFormData,
    parentId,
    setCampaignFormData,
  ]);

  const handleDeleteChannel = async (indexToDelete) => {
    const updatedChannels = channels.filter(
      (_, index) => index !== indexToDelete
    );
    const updatedChannelState = channelState.filter(
      (_, index) => index !== indexToDelete
    );

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

  const hasInitializedRef = useRef(false);
  const prevViewTypeRef = useRef(viewType);
  const prevParentLeftRef = useRef(parentLeft);
  const prevParentWidthRef = useRef(parentWidth);

  // Sync children visuals when parent is dragged or resized
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (!channelState || channelState.length === 0) return;

    const prevLeft = prevParentLeftRef.current;
    const prevWidth = prevParentWidthRef.current;
    const deltaLeft = parentLeft - prevLeft;
    const parentRightEdge = parentLeft + parentWidth;

    // Only update if parent actually moved or resized
    if (deltaLeft !== 0 || prevWidth !== parentWidth) {
      setChannelState((prev) =>
        prev.map((state) => {
          let newLeft = state.left + deltaLeft;
          let newWidth = state.width;

          // Clamp to parent boundaries
          if (newLeft < parentLeft) {
            newLeft = parentLeft;
          }
          if (newLeft + newWidth > parentRightEdge) {
            // If channel exceeds right edge, shrink it or move it
            if (newWidth > parentWidth) {
              newWidth = parentWidth;
              newLeft = parentLeft;
            } else {
              newLeft = parentRightEdge - newWidth;
            }
          }

          return { ...state, left: newLeft, width: newWidth };
        })
      );
    }

    prevParentLeftRef.current = parentLeft;
    prevParentWidthRef.current = parentWidth;
  }, [parentLeft, parentWidth]);

  useEffect(() => {
    if (!initialChannels || initialChannels.length === 0) return;
    if (!parentWidth || !dailyWidth || !dateList || dateList.length === 0)
      return;
    // Wait for parent dates to be set
    if (!startDate || !endDate) return;

    const viewChanged = prevViewTypeRef.current !== viewType;
    prevViewTypeRef.current = viewType;

    if (hasInitializedRef.current && !viewChanged) return;

    setChannels(initialChannels);
    setChannelState((prev) => {
      const findMix = campaignFormData?.channel_mix?.find(
        (chhh) => chhh?.funnel_stage === parentId
      );
      if (!findMix) return prev;

      console.log("=== LOADING CHANNEL POSITIONS ===");
      console.log("Parent stage:", parentId);
      console.log("parentLeft:", parentLeft);
      console.log("parentWidth:", parentWidth);
      console.log("dailyWidth:", dailyWidth);
      console.log("viewType:", viewType);

      const newState = initialChannels.map((ch, index) => {
        const findChannel = findMix[ch?.channelName]?.find(
          (plt) => plt?.platform_name === ch?.name
        );

        console.log("--- Channel:", ch?.name, "---");
        console.log(
          "Loaded campaign_start_date:",
          findChannel?.campaign_start_date
        );
        console.log(
          "Loaded campaign_end_date:",
          findChannel?.campaign_end_date
        );

        const stageStartDate = findChannel?.campaign_start_date
          ? parseISO(findChannel?.campaign_start_date)
          : null;

        // Use channel's start date, clamp to parent start if before parent
        const adjustedStageStartDate = stageStartDate
          ? stageStartDate < startDate
            ? startDate
            : stageStartDate
          : startDate;

        const stageEndDate = findChannel?.campaign_end_date
          ? parseISO(findChannel?.campaign_end_date)
          : null;

        // Use channel's end date, clamp to parent end if after parent
        const adjustedStageEndDate = stageEndDate
          ? stageEndDate > endDate
            ? endDate
            : stageEndDate
          : endDate;

        let startDateIndex = 0;
        let width = parentWidth;

        if (viewType === "Year" && dateList && dateList.length > 0) {
          const timelineStart = startOfYear(dateList[0]);
          const timelineEnd = endOfYear(dateList[dateList.length - 1]);
          const allMonths = eachMonthOfInterval({
            start: timelineStart,
            end: timelineEnd,
          });

          const startMonthIndex = adjustedStageStartDate
            ? allMonths.findIndex(
                (m) =>
                  format(m, "yyyy-MM") ===
                  format(adjustedStageStartDate, "yyyy-MM")
              )
            : 0;
          const endMonthIndex = adjustedStageEndDate
            ? allMonths.findIndex(
                (m) =>
                  format(m, "yyyy-MM") ===
                  format(adjustedStageEndDate, "yyyy-MM")
              )
            : startMonthIndex;

          startDateIndex =
            startMonthIndex >= 0 ? startMonthIndex * dailyWidth : 0;
          const monthsSpanned =
            endMonthIndex >= startMonthIndex
              ? endMonthIndex - startMonthIndex + 1
              : 1;
          width = monthsSpanned * dailyWidth;
        } else if (viewType === "Month" && dateList && dateList.length > 0) {
          const allWeeks = eachWeekOfInterval(
            { start: dateList[0], end: dateList[dateList.length - 1] },
            { weekStartsOn: 1 }
          );

          const startWeekIndex = adjustedStageStartDate
            ? allWeeks.findIndex((weekStart) => {
                const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                return (
                  adjustedStageStartDate >= weekStart &&
                  adjustedStageStartDate <= weekEnd
                );
              })
            : 0;
          const endWeekIndex = adjustedStageEndDate
            ? allWeeks.findIndex((weekStart) => {
                const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                return (
                  adjustedStageEndDate >= weekStart &&
                  adjustedStageEndDate <= weekEnd
                );
              })
            : startWeekIndex;

          startDateIndex =
            startWeekIndex >= 0 ? startWeekIndex * dailyWidth : 0;
          const weeksSpanned =
            endWeekIndex >= startWeekIndex
              ? endWeekIndex - startWeekIndex + 1
              : 1;
          width = weeksSpanned * dailyWidth;
        } else {
          // Use format to compare dates (ignores time component)
          const channelStartStr = adjustedStageStartDate
            ? format(adjustedStageStartDate, "yyyy-MM-dd")
            : null;

          const foundIndex = channelStartStr
            ? dateList?.findIndex(
                (date) => format(date, "yyyy-MM-dd") === channelStartStr
              )
            : -1;

          console.log(
            "findIndex result:",
            foundIndex,
            "for date:",
            channelStartStr
          );
          console.log(
            "dateList[0]:",
            dateList?.[0] ? format(dateList[0], "yyyy-MM-dd") : "N/A"
          );

          startDateIndex = foundIndex >= 0 ? foundIndex * dailyWidth : 0;

          let daysBetween = 0;
          if (adjustedStageStartDate && adjustedStageEndDate) {
            daysBetween = eachDayOfInterval({
              start: adjustedStageStartDate,
              end: adjustedStageEndDate,
            })?.length;
          }

          width = daysBetween > 0 ? dailyWidth * daysBetween : parentWidth;
        }

        let left = Math.max(
          parentLeft || 0,
          startDateIndex < 0 ? parentLeft || 0 : startDateIndex
        );

        width = Math.min(width, parentWidth || 0);

        const parentRight = (parentLeft || 0) + (parentWidth || 0);
        if (left + width > parentRight) {
          if (width <= (parentWidth || 0)) {
            left = Math.max(parentLeft || 0, parentRight - width);
          } else {
            width = parentWidth || 0;
            left = parentLeft || 0;
          }
        }

        if (left < (parentLeft || 0)) {
          left = parentLeft || 0;
        }

        console.log("Calculated left:", left);
        console.log("Calculated width:", width);
        console.log("startDateIndex:", startDateIndex);

        return {
          left: left,
          width: width,
          id: ch.id,
        };
      });

      hasInitializedRef.current = true;
      return newState;
    });
  }, [
    initialChannels,
    parentLeft,
    parentWidth,
    viewType,
    dailyWidth,
    dateList,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (!dragging) return;

    let totalUnits = dateList.length - 1;
    if (viewType === "Year" && dateList && dateList.length > 0) {
      const timelineStart = startOfYear(dateList[0]);
      const timelineEnd = endOfYear(dateList[dateList.length - 1]);
      const allMonths = eachMonthOfInterval({
        start: timelineStart,
        end: timelineEnd,
      });
      totalUnits = allMonths.length - 1;
    } else if (viewType === "Month" && dateList && dateList.length > 0) {
      const allWeeks = eachWeekOfInterval(
        { start: dateList[0], end: dateList[dateList.length - 1] },
        { weekStartsOn: 1 }
      );
      totalUnits = allWeeks.length - 1;
    }

    const handleMouseMove = (event) => {
      event.preventDefault();
      const { index, direction, startX } = dragging;
      const deltaX = event.clientX - startX;
      setChannelState((prev) =>
        prev.map((state, i) => {
          if (i !== index) return state;

          let newWidth,
            newLeft = state.left;

          if (direction === "left") {
            newWidth = Math.max(
              50,
              Math.min(
                state.width - deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
            newLeft = state.left + deltaX;

            newLeft = Math.max(
              parentLeft,
              Math.min(newLeft, parentLeft + parentWidth - newWidth)
            );

            newWidth = state.left + state.width - newLeft;
          } else {
            const rightEdge = state.left + state.width + deltaX;
            const maxRightEdge = parentLeft + parentWidth;
            const adjustedRightEdge = Math.min(rightEdge, maxRightEdge);

            newWidth = Math.max(
              50,
              Math.min(
                adjustedRightEdge - state.left,
                parentWidth - (state.left - parentLeft)
              )
            );
          }

          const startPixel = newLeft - parentLeft;
          const endPixel = startPixel - 1 + newWidth;

          const startDate = pixelToDate(
            startPixel,
            parentWidth,
            index,
            "startDate"
          );

          const rawEndDate = pixelToDate(
            endPixel - parentWidth / totalUnits,
            parentWidth,
            index,
            "endDate"
          );

          if (endDate > endDate) {
            const parentEndPixel = parentWidth;
            const maxWidth = parentEndPixel - startPixel + parentLeft;
            newWidth = Math.min(newWidth, maxWidth);
          }

          return { ...state, left: newLeft, width: newWidth };
        })
      );

      setDragging((prev) => ({ ...prev, startX: event.clientX }));
    };

    const handleMouseUp = () => {
      if (dragging) {
        const { index } = dragging;
        const state = channelState[index];
        if (state) {
          const startPixel = state.left - parentLeft;
          const endPixel = startPixel + state.width;
          pixelToDate(startPixel, parentWidth, index, "startDate", true);
          pixelToDate(endPixel, parentWidth, index, "endDate", true);
        }
      }
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, parentWidth, viewType, dateList, dailyWidth]);

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
        const getColumnIndex = (date) =>
          dateList?.findIndex((d) => d.toISOString().split("T")[0] === date);

        const updatedCampaignFormData = { ...campaignFormData };
        const channelMix = updatedCampaignFormData.channel_mix.find(
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
            className={`relative w-full ${
              !disableDrag ? "min-h-[46px]" : ""
            } min-h-[46px]`}
            style={{
              gridColumnStart: startColumn < 1 ? 1 : startColumn,
              gridColumnEnd: endColumn < 1 ? 1 : endColumn,
            }}
          >
            <div
              className={`relative cont-${parentId?.replaceAll(
                " ",
                "_"
              )}-${channel?.name
                ?.replaceAll(" ", "_")
                ?.replace("(", "")
                ?.replace(")", "")}`}
            >
              {tooltip.visible && tooltip.index === index && (
                <div
                  className="absolute top-0 z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none w-fit"
                  style={{
                    left: `${tooltip.x}px`,
                    top: `0px`,
                    transform: `translate(-${
                      tooltip.x + 100 >= (channelState[index]?.width || 0)
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
                className={`relative h-full flex ${
                  disableDrag
                    ? "justify-between min-w-[50px]"
                    : "justify-center cursor-move"
                }  items-center text-white py-[10px] px-4 gap-2 border shadow-md overflow-x-hidden`}
                style={{
                  left: `${channelState[index]?.left || parentLeft}px`,
                  width: `${
                    channelState[index]?.width +
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
                <div className="flex items-center gap-3">
                  <Image
                    src={channel.icon || "/placeholder.svg"}
                    alt={channel.icon}
                    width={20}
                    height={20}
                  />
                  <span className="font-medium whitespace-nowrap">
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
                    className="rounded-[5px] px-[12px] font-medium bg-opacity-15 text-[15px]"
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
                        className={`absolute top-0 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${
                          disableDrag && "hidden"
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
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${
                          disableDrag && "hidden"
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
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${
                          disableDrag && "hidden"
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
                        className={`absolute top-0 w-4 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${
                          disableDrag && "hidden"
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

            {channel?.ad_sets?.length > 0 && (
              <div className="relative max-w-[600px]">
                <div
                  className="relative bg-[#EBFEF4] py-[8px] px-[12px] w-fit mt-[5px] border border-[#00A36C1A] rounded-[8px] flex items-center cursor-pointer"
                  style={{
                    left: `${channelState[index]?.left || parentLeft}px`,
                  }}
                  onClick={() => {
                    toggleChannel(`${channel?.name}${index}`);
                  }}
                >
                  <p className="text-[14px] font-medium text-[#00A36C]">
                    {channel?.ad_sets?.length} ad sets
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
                    className="relative shrink-0 mt-4 bg-white z-20 rounded-md border shadow-md"
                    style={{
                      left: `${channelState[index]?.left || parentLeft}px`,
                    }}
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
                        {channel?.ad_sets?.map((set, index) => (
                          <React.Fragment key={index}>
                            <tr className="border-none">
                              <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                Ad Set No.{index + 1}.
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
                                key={`${index}-${extraIndex}`}
                                className="border-none"
                              >
                                <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                  <div className="l-shape-container-ad">
                                    <div
                                      className={`absolute w-[1px] ${
                                        extraIndex > 0
                                          ? "h-[35px] top-[-35px]"
                                          : "h-[20px] top-[-20px]"
                                      } bg-blue-500 left-[60px] `}
                                    ></div>
                                    <div
                                      className={`absolute w-[60px] h-[1px] bg-blue-500 bottom-[-1px] left-[60px]`}
                                    ></div>
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
            {channel?.ad_sets?.length < 1 &&
              channel?.format?.some(
                (format) => format?.previews?.length > 0
              ) && (
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
                shouldOpenSidebar={false}
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
