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
  setOpenItems?: any;
  endMonth?: any;
  endDay?: any;
  endWeek?: any;
  dailyWidth?: any;
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
}: ResizableChannelsProps) => {
  const { campaignFormData, setCampaignFormData, setCopy, cId, campaignData } =
    useCampaigns();
  const { funnelWidths } = useFunnelContext(); // Get parent widths
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

  // Store the initial start date in a ref
  const initialStartDateRef = useRef(null);
  const initialEndDateRef = useRef(null);

  // Initialize child width based on available parent space and position
  const [channelState, setChannelState] = useState(
    channels?.map((ch) => ({
      left: parentLeft, // Start at parent's left position
      width: Math.min(10, parentWidth),
    }))
  );

  const [dragging, setDragging] = useState(null);

  const [draggingPosition, setDraggingPosition] = useState(null);

  const toggleChannel = (id) => {
    setOpenItems((prev) => (prev === id ? null : id));
  };
  const [dRange, setDrange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [endDateOffset, setEndDateOffset] = useState(0);
  const [containerWidth, setContainerWidth] = useState(null);

  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
    index: number;
  } | null>(null);

  const calculateDailyWidth = (
    containerWidth: number,
    endMonth: number
  ): number => {
    const totalDays = endMonth * 31;
    return containerWidth / totalDays;
  };

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    console.log(" ~ dailyWidth:", dailyWidth);
    const baseStep = dailyWidth;
    // console.log("🚀 ~ snapToTimeline ~ baseStep:", baseStep);
    const adjustmentPerStep = 0; // Decrease each next step by 10
    const snapPoints = [];
    // console.log("🚀 ~ snapToTimeline ~ snapPoints:", snapPoints);

    let currentSnap = 0;
    let step = baseStep;

    // Generate snap points with decreasing step size
    while (currentSnap <= containerWidth) {
      snapPoints.push(currentSnap);
      // console.log("🚀 ~ snapToTimeline ~ currentSnap:", currentSnap);
      currentSnap += step;
      step = Math.max(dailyWidth, step - adjustmentPerStep);
    }

    const closestSnap = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition)
        ? curr
        : prev
    );

    // console.log("Closest custom snap:", closestSnap);
    return closestSnap;
  };

  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right",
    index: number
  ) => {
    if (disableDrag) return;
    e.preventDefault();
    isResizing.current = {
      startX: e.clientX,
      startWidth: channelState[index].width,
      startPos: channelState[index].left,
      direction,
      index,
    };
    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const { startX, startWidth, startPos, direction, index } =
      isResizing.current;

    let newWidth = startWidth;
    let newPos = startPos;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    const minX = 0;
    const maxX = containerRect.width;

    if (direction === "left") {
      const deltaX = e.clientX - startX;
      newWidth = Math.max(50, startWidth - deltaX);
      newPos = Math.max(minX, startPos + deltaX);

      const snappedPos = snapToTimeline(newPos, containerRect.width);
      newWidth = startWidth - (snappedPos - startPos);
      newPos = snappedPos;
    } else {
      const rawNewWidth = startWidth + (e.clientX - startX);
      const rightEdgePos = startPos + rawNewWidth;
      const snappedRightEdge = snapToTimeline(
        rightEdgePos,
        containerRect.width
      );
      newWidth = Math.max(50, snappedRightEdge -10 - startPos);
    }

    // Handle parent width constraints
    const parentRightEdge = parentLeft + parentWidth;

    // If channel position is beyond parent bounds, move it to fit within parent
    if (newPos >= parentRightEdge) {
      // Channel is completely outside parent bounds - move it to the right edge
      newPos = Math.max(parentLeft, parentRightEdge - 50); // Minimum width of 50
      newWidth = Math.min(50, parentWidth);
    } else if (newPos < parentLeft) {
      // Channel starts before parent - adjust position to parent start
      newPos = parentLeft;
      newWidth = Math.min(newWidth, parentWidth);
    } else {
      // Channel position is within parent bounds - maintain position, adjust width if needed
      if (newPos + newWidth > parentRightEdge) {
        newWidth = parentRightEdge - newPos;
      }
    }

    // Ensure channel doesn't exceed container bounds
    if (newPos + newWidth > maxX) {
      newWidth = maxX - newPos;
    }

    // Ensure minimum width
    newWidth = Math.max(50, newWidth);

    setChannelState((prev) =>
      prev.map((state, i) =>
        i === index ? { ...state, left: newPos, width: newWidth } : state
      )
    );

    // Update campaign data immediately during resize
    const startPixel = newPos - parentLeft;
    const endPixel = startPixel + newWidth;
    const newStartDate = pixelToDate(
      startPixel,
      parentWidth,
      index,
      "startDate"
    );
    const newEndDate = pixelToDate(endPixel, parentWidth, index, "endDate");
    draggingDataRef.current = { index, newStartDate, newEndDate };
  };

  const handleMouseUp = () => {
    isResizing.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mouseup", handleMouseUp);
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
        // Set the initial date only once
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

      if (!initialStartDateRef.current) {
        // Set the initial date only once
        initialStartDateRef.current = new Date(end);
      }

      setEndDate(end);

      setDrange(
        eachDayOfInterval({
          start: start,
          end: end,
        })
      );
    }
  }, [campaignFormData]);

  // Watch for changes in startDate and calculate the offset
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
    const totalDays = dRange?.length - 1;
// console.log("here",startDate, endDate)
    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate?.getDate() + dayIndex);

    // if (fieldName === "endDate") {
    //   calculatedDate.setDate(calculatedDate.getDate() + 1);
    // }

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
          // For end date, ensure it doesn't exceed the parent timeline's end date
          const endDateToUse =
            endDate && calculatedDate > endDate ? endDate : calculatedDate;
          platform.campaign_end_date = endDateToUse
            ? moment(endDateToUse).format("YYYY-MM-DD")
            : null;
        }
      }
    }

    // For end date, ensure it doesn't exceed the parent timeline's end date
    if (fieldName === "endDate" && endDate && calculatedDate > endDate) {
      return endDate ? moment(endDate).format("YYYY-MM-DD") : null;
    }

    // Convert the result back to "yyyy-mm-dd" format
    return calculatedDate ? moment(calculatedDate).format("YYYY-MM-DD") : null;
  };

  const handleDragStart = (index) => (event) => {
    if (disableDrag) return;
    event.preventDefault();
    setDraggingPosition({
      index,
      startX: event.clientX,
      startLeft: channelState[index]?.left || parentLeft,
    });
  };
  useEffect(() => {
    if (disableDrag || draggingPosition === null) return;

    isDraggingRef.current = true; // Set dragging to true

    const handleDragMove = (event: MouseEvent) => {
      if (!isDraggingRef.current) return; // Skip if not dragging

      event.preventDefault();
      const { index, startX, startLeft } = draggingPosition;

      const deltaX = event.clientX - startX;

      let newLeft = startLeft + deltaX;

      // Restrict movement within parent boundaries
      const maxLeft = parentLeft + parentWidth - channelState[index]?.width;
      newLeft = Math.max(parentLeft, Math.min(newLeft, maxLeft));

      // Snap to timeline grid
      newLeft = snapToTimeline(newLeft - parentLeft, parentWidth) + parentLeft;

      // Update state using functional update to prevent stale values
      setChannelState((prev) =>
        prev.map((state, i) =>
          i === index ? { ...state, left: newLeft } : state
        )
      );

      // Store campaign date updates in ref to prevent re-renders
      const startPixel = newLeft - parentLeft;
      const endPixel = startPixel + channelState[index]?.width;
      const startDate = pixelToDate(
        startPixel,
        parentWidth,
        index,
        "startDate"
      );
      const endDate = pixelToDate(endPixel, parentWidth, index, "endDate");

      draggingDataRef.current = { index, startDate, endDate };
    };

    const handleDragEnd = () => {
      if (draggingDataRef.current) {
        const { index, startDate, endDate } = draggingDataRef.current;

        setCopy(() => {
          const updatedData = JSON.parse(JSON.stringify(campaignFormData)); // Deep copy

          const channelMix = updatedData.channel_mix.find(
            (ch) => ch.funnel_stage === parentId
          );

          if (channelMix) {
            const channelGroup = channelMix[channels[index].channelName];

            if (Array.isArray(channelGroup)) {
              const platform = channelGroup.find(
                (platform) => platform.platform_name === channels[index].name
              );

              if (platform) {
                platform.campaign_start_date = startDate;
                platform.campaign_end_date = endDate;
              }
            }
          }

          return updatedData;
        });

        draggingDataRef.current = null; // Clear ref after update
      }

      // Explicitly reset all drag-related states
      isDraggingRef.current = false;
      setDraggingPosition(null);
      setDragging(null);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    // Ensure cleanup happens properly
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      isDraggingRef.current = false;
      draggingDataRef.current = null;
    };
  }, [draggingPosition, parentLeft, parentWidth, channelState]);

  const handleMouseDown = (index, direction) => (event) => {
    event.preventDefault();
    setDragging({ index, direction, startX: event.clientX });
  };

  const handleDeleteChannel = async (indexToDelete) => {
    const updatedChannels = channels.filter(
      (_, index) => index !== indexToDelete
    );
    const updatedChannelState = channelState.filter(
      (_, index) => index !== indexToDelete
    );

    const updatedCampaignFormData = JSON.parse(
      JSON.stringify(campaignFormData)
    ); // Deep copy

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
          channelGroup.splice(platformIndex, 1); // Remove the platform
        }
      }
    }

    // Await the API call before updating the state
    await sendUpdatedDataToAPI(updatedCampaignFormData);

    // Update the state after the API call is successful
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
              ,
              "_aggregated",
            ]),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      // console.log("Campaign data updated successfully", response.data);
    } catch (error) {
      console.error("Error updating campaign data:", error);
    } finally {
      setDeleting(false);
      setId(null);
    }
  };

  // Update channel state when initialChannels changes
  useEffect(() => {
    if (initialChannels && initialChannels.length > 0) {
      // console.log("🚀 ~ useEffect ~ initialChannels:", initialChannels);
      const gridContainer = document.querySelector(
        ".grid-container"
      ) as HTMLElement;
      if (!gridContainer) return;

      // Get container boundaries
      const containerRect = gridContainer.getBoundingClientRect();
      // console.log("🚀 ~ useEffect ~ containerRect:", containerRect);
      const contWidth = containerRect.width - 75;
      const getViewportWidth = () => {
        return window.innerWidth || document.documentElement.clientWidth || 0;
      };
      const screenWidth = getViewportWidth();
      setContainerWidth(containerWidth + 75);
      setChannels(initialChannels);
      // Initialize new channels with parent's position
      setChannelState((prev) => {
        const newState = initialChannels.map((ch, index) => {
          const stageStartDate = ch?.start_date
            ? parseISO(ch?.start_date)
            : null;
          // console.log({
          //   stageStartDate,
          //   startDate,
          // });

          // Only adjust start date if it's earlier than parent start date
          const adjustedStageStartDate =
            stageStartDate && stageStartDate < startDate
              ? stageStartDate
              : stageStartDate < startDate
              ? startDate // Use parent start date if channel start date is earlier
              : stageStartDate; // Otherwise use the actual channel start date
          // console.log(adjustedStageStartDate, ch?.name);
          const stageEndDate = ch?.end_date ? parseISO(ch?.end_date) : null;

          // Check if the channel's end date exceeds the parent timeline's end date
          const isEndDateExceeded =
            stageEndDate && endDate && stageEndDate > endDate;

          // Only adjust end date if it exceeds parent end date
          const adjustedStageEndDate = isEndDateExceeded
            ? endDate // Use parent end date if channel end date exceeds it
            : stageEndDate; // Otherwise use the actual channel end date

          const startDateIndex = adjustedStageStartDate
            ? dRange?.findIndex((date) =>
                isEqual(date, adjustedStageStartDate)
              ) *
              (rrange === "Day"
                ? dailyWidth
                : rrange === "Week"
                ? dailyWidth
                : Math.round(screenWidth / endMonth / 31))
            : 0;

          // Calculate days between using the adjusted end date
          let daysBetween;
          if (adjustedStageStartDate && adjustedStageEndDate) {
            daysBetween =
              eachDayOfInterval({
                start: adjustedStageStartDate,
                end: adjustedStageEndDate,
              })?.length - 1;
          } else {
            daysBetween =
              eachDayOfInterval({
                start: new Date(ch?.start_date) || null,
                end: isEndDateExceeded
                  ? endDate
                  : new Date(ch?.end_date) || null,
              })?.length - 1;
          }
          console.log(daysBetween, "fdf");
          const endDaysDiff = differenceInCalendarDays(endDate, stageEndDate);
          // Check if this channel already exists in prev
          const existingState = prev[index];
          // console.log("startDateIndex", index, ch.name);
          return existingState
            ? {
                ...existingState,
                // Update left position to match parent when it moves
                left:
                  parentLeft +
                  Math.abs(startDateIndex < 0 ? 0 : startDateIndex),
                width: Math.min(
                  rrange === "Day"
                    ? daysBetween > 0
                      ? dailyWidth * daysBetween
                      : parentWidth
                    : rrange === "Week"
                    ? daysBetween > 0
                      ? dailyWidth * daysBetween
                      : parentWidth
                    : rrange === "Month"
                    ? daysBetween > 0
                      ? Math.round(screenWidth / endMonth / 31) * daysBetween
                      : parentWidth
                    : parentWidth,
                  rrange === "Day"
                    ? daysBetween > 0
                      ? dailyWidth * daysBetween
                      : parentWidth - 25
                    : rrange === "Week"
                    ? daysBetween > 0
                      ? dailyWidth * daysBetween + 10
                      : parentWidth - 9
                    : rrange === "Month"
                    ? daysBetween > 0
                      ? Math.round(screenWidth / endMonth / 31) * daysBetween
                      : parentWidth
                    : parentWidth - 9
                ),
              }
            : {
                left: parentLeft,
                width: parentWidth, // Default width for new channels
              };
        });

        // console.log("new state", dRange)
        return newState;
      });
    }
  }, [
    initialChannels,
    parentLeft,
    parentWidth,
    campaignFormData,
    // openItems,
    // dRange,
  ]);

  useEffect(() => {
    if (!dragging) return;

    const totalDays = dateList.length - 1; // Define totalDays within the scope

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
            // Move the left side while keeping the right side fixed
            newWidth = Math.max(
              50,
              Math.min(
                state.width - deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
            newLeft = state.left + deltaX; // Move the left boundary

            // Prevent movement out of bounds
            newLeft = Math.max(
              parentLeft,
              Math.min(newLeft, parentLeft + parentWidth - newWidth)
            );

            // Recalculate width after adjusting left boundary
            newWidth = state.left + state.width - newLeft;
          } else {
            // Move the right side, increasing width
            const rightEdge = state.left + state.width + deltaX;

            // Prevent movement out of bounds
            const maxRightEdge = parentLeft + parentWidth;
            const adjustedRightEdge = Math.min(rightEdge, maxRightEdge);

            // Calculate new width based on adjusted right edge
            newWidth = Math.max(
              50,
              Math.min(
                adjustedRightEdge - state.left,
                parentWidth - (state.left - parentLeft)
              )
            );
          }

          // Calculate start and end pixel positions
          const startPixel = newLeft - parentLeft; // Adjusted to be relative
          const endPixel = startPixel - 1 + newWidth;

          // Convert pixel positions to dates
          const startDate = pixelToDate(
            startPixel,
            parentWidth,
            index,
            "startDate"
          );

          // Ensure end date doesn't exceed parent timeline's end date
          const rawEndDate = pixelToDate(
            endPixel - parentWidth / totalDays,
            parentWidth,
            index,
            "endDate"
          );

          // If the calculated end date exceeds the parent timeline's end date,
          // adjust the width to match the parent timeline's end date
          if (endDate && new Date(rawEndDate) > endDate) {
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
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, parentWidth]);

  return (
    <div
      className={`open_channel_btn_container `}
      style={{
        gridTemplateColumns: `repeat(${dRange?.length}, 1fr)`,
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
          dRange?.findIndex((d) => d.toISOString().split("T")[0] === date);

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
            <div>
              <div
                className={` relative top-0 h-full flex ${
                  disableDrag
                    ? "justify-between min-w-[50px]"
                    : "justify-center cursor-move"
                }  items-center text-white py-[10px] px-4 gap-2 border shadow-md overflow-x-hidden `}
                style={{
                  left: `${channelState[index]?.left || parentLeft}px`,
                  width: `${
                    channelState[index]?.width +
                      (disableDrag ? 73 : rrange === "Month" ? 40 : 58)
                  }px`,
                  backgroundColor: channel.bg,
                  color: channel.color,
                  borderColor: channel.color,
                  borderRadius: "10px",
                  minWidth:
                    rrange === "Day"
                      ? "50px"
                      : rrange === "Week"
                      ? "50px"
                      : `${channelState[index]?.width}px`,
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
                          campaignFormData?.campaign_budget?.amount
                        )}`}
                  </div>
                )}
              </div>
            </div>
            {/* Controls */}
            {
              <>
                <div
                  className={`absolute top-0 w-5 h-[46px] cursor-ew-resize rounded-l-[10px] text-white flex items-center justify-center ${
                    disableDrag && "hidden"
                  }`}
                  style={{
                    left: `${channelState[index]?.left || parentLeft}px`,
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
                <div
                  className={`absolute top-0 w-5 h-[46px] cursor-ew-resize rounded-r-[10px] text-white flex items-center justify-center ${
                    disableDrag && "hidden"
                  }`}
                  style={{
                    left: `${
                      (channelState[index]?.left || parentLeft) +
                      (channelState[index]?.width +
                        (rrange === "Month" ? 30 : 40) || 150)
                    }px`,
                    backgroundColor: channel.color,
                  }}
                  onMouseDown={(e) =>
                    disableDrag || openItems
                      ? undefined
                      : handleMouseDownResize(e, "right", index)
                  }
                >
                  <MdDragHandle className="rotate-90" />
                </div>
              </>
            }

            {channel?.ad_sets?.length > 0 && (
              <div className="relative max-w-[600px]">
                <div
                  className="relative bg-[#EBFEF4] py-[8px] px-[12px] w-fit mt-[5px] border border-[#00A36C1A] rounded-[8px] flex items-center cursor-pointer"
                  style={{
                    left: `${channelState[index]?.left || parentLeft}px`,
                  }}
                  onClick={() => {
                    toggleChannel(`${channel?.name}${index}`);
                    setSelectedCreative(channel?.format);
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
                      {/* {channel?.} */}
                      <button
                        className="bg-blue-500 text-white p-2 rounded-md"
                        onClick={() => {
                          setOpenCreatives(true);
                          setSelectedChannel(channel?.name);
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
                  }}
                >
                  View Creatives
                </button>
              )}
          </div>
        );
      })}
      <Modal isOpen={openCreatives} onClose={() => setOpenCreatives(false)}>
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
            <FormatSelection
              stageName={parentId}
              platformName={selectedChannel}
            />
          )}
          {/*
           */}
        </div>
      </Modal>
      <Modal isOpen={openAdset} onClose={() => setOpenAdset(false)}>
        <div className="bg-white w-[900px] p-2 rounded-lg max-h-[600px] overflow-y-scroll">
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
          <AdSetsFlow
            stageName={parentId}
            // onEditStart={() => resetInteraction(stage.name)}
            platformName={selectedChannel}
          />
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
    </div>
  );
};

export default ResizableChannels;
