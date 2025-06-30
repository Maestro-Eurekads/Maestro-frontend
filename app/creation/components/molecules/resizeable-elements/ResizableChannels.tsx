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
  setOpenItems?: any;
  endMonth?: any;
  endDay?: any;
  endWeek?: any;
  dailyWidth?: any;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  type: "resize" | "drag" | null;
  index?: number;
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
  // console.log("this is the initial channels", initialChannels)
  const {
    campaignFormData,
    setCampaignFormData,
    setCopy,
    cId,
    campaignData,
    jwt,
  } = useCampaigns();
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

  // Store the initial start date in a ref
  const initialStartDateRef = useRef(null);
  const initialEndDateRef = useRef(null);

  // Add refs to preserve selection state during recalculation
  const selectionStateRef = useRef({
    openItems: null,
    selectedChannel: "",
    selectedCreative: null,
    openCreatives: false,
    openAdset: false,
  });

  // Add flag to track if we're in the middle of a width adjustment
  const isAdjustingWidthRef = useRef(false);

  // Initialize child width based on available parent space and position
  const [channelState, setChannelState] = useState(
    channels?.map((ch) => ({
      left: parentLeft,
      width: Math.min(10, parentWidth),
    }))
  );

  const [dragging, setDragging] = useState(null);
  const [draggingPosition, setDraggingPosition] = useState(null);

  // Add tooltip state
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
  const [dRange, setDrange] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [endDateOffset, setEndDateOffset] = useState(0);

  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
    index: number;
  } | null>(null);

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    //console.log(" ~ dailyWidth:", dailyWidth)
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

  // Function to update tooltip with date information
  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    index: number,
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag"
  ) => {
    if (!dRange || dRange.length === 0) return;

    const totalDays = dRange.length - 1;

    const dayStartIndex = Math.min(
      totalDays,
      Math.max(0, Math.floor((startPixel / parentWidth) * totalDays))
    );
    const dayEndIndex = Math.min(
      totalDays,
      Math.max(0, Math.floor((endPixel / parentWidth) * totalDays))
    );

    const startDateValue = dRange[dayStartIndex] || startDate;
    const endDateValue = dRange[dayEndIndex] || endDate;

    const formattedStartDate = format(startDateValue, "MMM dd");
    const formattedEndDate = format(endDateValue, "MMM dd");

    const channelName = channels[index]?.name || "Channel";
    const containerRect = document
      .querySelector(
        `.cont-${parentId?.replaceAll(" ", "_")}-${channelName
          ?.replaceAll(" ", "_")
          ?.replace("(", "")
          ?.replace(")", "")}`
      )
      ?.getBoundingClientRect();

    let tooltipX = mouseX - containerRect.left;
    const tooltipY = containerRect.top - 50; // Offset to position above the mouse

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
    // e.stopPropagation();
    isResizing.current = {
      startX: e.clientX,
      startWidth: channelState[index].width,
      startPos: channelState[index].left || 0,
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
      "resize"
    );

    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUpResize);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const { startX, startWidth, startPos, direction, index } =
      isResizing.current;
    console.log({ startX, startWidth, startPos, direction, index });
    let newWidth = startWidth;
    let newLeft = isNaN(startPos) ? 0 : startPos;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    console.log("parentLeft", {parentLeft, parentWidth})
    const parentRightEdge =  parentWidth;

    if (direction === "left") {
      const deltaX = e.clientX - startX;
      newLeft = Math.max(parentLeft, (isNaN(startPos) ? 0 : startPos) + deltaX);
      newWidth = startWidth - (newLeft - (isNaN(startPos) ? 0 : startPos));

      if (newWidth < 50) {
        newWidth = 50;
        newLeft = (isNaN(startPos) ? 0 : startPos) + startWidth - 50;
      }

      const snappedPos =
        snapToTimeline(newLeft - parentLeft, containerRect.width) + parentLeft;
      newWidth = startWidth - (snappedPos - (isNaN(startPos) ? 0 : startPos));
      newLeft = snappedPos;

      // Ensure the right edge does not exceed the parent's right edge
      if (newLeft + newWidth > parentRightEdge) {
        newWidth = parentRightEdge - newLeft;
      }
    } else {
      const deltaX = e.clientX - startX;
      newWidth = Math.max(50, startWidth + deltaX);

      // Ensure the right edge does not exceed the parent's right edge
      if (newLeft + newWidth > parentRightEdge) {
        newWidth = parentRightEdge - newLeft;
      }

      const rightEdgePos = 0 + newWidth;
      const snappedRightEdge =
        snapToTimeline(rightEdgePos - parentLeft, containerRect.width) +
        parentLeft;
console.log("snappedRightEdge", {snappedRightEdge, parentRightEdge})
      // Ensure the snapped right edge does not exceed the parent's right edge
      if (snappedRightEdge > parentRightEdge) {
        console.log("1");
        newWidth = parentRightEdge;
      } else {
        console.log("2");
        newWidth = Math.max(50, snappedRightEdge);
      }

      // Adjust newLeft if snapping causes overlap
      // if (newLeft + newWidth > parentRightEdge) {
      //   console.log("3");
      //   newLeft = parentRightEdge - newWidth;
      // }
    }



    const startPixel = newLeft - parentLeft;
    const endPixel = startPixel + newWidth;
    const newStartDate = pixelToDate(
      startPixel,
      parentWidth,
      index,
      "startDate"
    );
    console.log("🚀 ~ handleMouseMoveResize ~ newStartDate:", newStartDate);
    const newEndDate = pixelToDate(endPixel, parentWidth, index, "endDate");
    draggingDataRef.current = { index, newStartDate, newEndDate };
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
    updateTooltipWithDates(
      startPixel,
      endPixel,
      index,
      e.clientX,
      e.clientY,
      "resize"
    );
        // Update the channel state
        setChannelState((prev) =>
          prev.map((state, i) =>
            i === index ? { ...state, left: newLeft, width: newWidth } : state
          )
        );
  };
  const handleMouseUpResize = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    isResizing.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mouseup", handleMouseUpResize);
    console.log("draggingDataRef", draggingDataRef.current);
    if (draggingDataRef.current) {
      const { index, newStartDate, newEndDate } = draggingDataRef.current;

      // // Update campaignFormData copy
      // setCopy((prevData) => {
      //   const updatedData = JSON.parse(JSON.stringify(prevData));

      //   const channelMix = updatedData.channel_mix.find(
      //     (ch) => ch.funnel_stage === parentId
      //   );

      //   if (channelMix) {
      //     const channelGroup = channelMix[channels[index].channelName];
      //     if (Array.isArray(channelGroup)) {
      //       const platform = channelGroup.find(
      //         (p) => p.platform_name === channels[index].name
      //       );

      //       if (platform) {
      //         platform.campaign_start_date = newStartDate;
      //         platform.campaign_end_date = newEndDate;
      //       }
      //     }
      //   }

      //   return updatedData;
      // });

      draggingDataRef.current = null;
    }
  };

  // console.log("here", isResizing)
  // Separate effect for parentWidth-only changes
  // useEffect(() => {
  //   if (
  //     parentWidth &&
  //     channelState.length > 0 &&
  //     !isAdjustingWidthRef.current
  //   ) {
  //     isAdjustingWidthRef.current = true;

  //     // Save selection state before adjusting
  //     // saveSelectionState();

  //     setChannelState((prev) =>
  //       prev.map((state) => {
  //         // Adjust width proportionally without losing position
  //         const newWidth = Math.min(state.width, parentWidth);
  //         const newLeft = Math.max(
  //           parentLeft,
  //           Math.min(state.left, parentLeft + parentWidth - newWidth)
  //         );

  //         return {
  //           ...state,
  //           left: newLeft,
  //           width: newWidth,
  //         };
  //       })
  //     );

  //     // Restore selection state after a brief delay
  //     setTimeout(() => {
  //       restoreSelectionState();
  //       isAdjustingWidthRef.current = false;
  //     }, 0);
  //   }
  // }, [parentWidth, parentLeft]);

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
      //console.log({ start, end })

      setDrange(
        eachDayOfInterval({
          start: start,
          end: end,
        })
      );
    }
  }, [campaignFormData, parentId]); // Removed parentWidth from dependencies

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
    const totalDays =
      fieldName === "endDate" ? dRange?.length - 1 : dRange?.length;
    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.floor((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate?.getDate() + dayIndex);

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

    // if (fieldName === "endDate" && endDate && calculatedDate > endDate) {
    //   return endDate ? moment(endDate).format("YYYY-MM-DD") : null;
    // }
    // console.log("updatedCampaignFormData", updatedCampaignFormData)
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

    const startPixel = (channelState[index]?.left || parentLeft) - parentLeft;
    const endPixel = startPixel + (channelState[index]?.width || 50);
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

      const startPixel = newLeft - parentLeft;
      const endPixel = startPixel + channelWidth;
      const startDate = pixelToDate(
        startPixel,
        parentWidth,
        index,
        "startDate"
      );
      const endDate = pixelToDate(endPixel, parentWidth, index, "endDate");

      draggingDataRef.current = { index, startDate, endDate };

      updateTooltipWithDates(
        startPixel,
        endPixel,
        index,
        event.clientX,
        event.clientY,
        "drag"
      );
    };

    const handleDragEnd = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));

      if (draggingDataRef.current) {
        const { index, startDate, endDate } = draggingDataRef.current;

        setCopy(() => {
          const updatedData = JSON.parse(JSON.stringify(campaignFormData));

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
      isDraggingRef.current = false;
      draggingDataRef.current = null;
    };
  }, [draggingPosition, parentLeft, channelState]);

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
      console.error("Error updating campaign data:", error);
    } finally {
      setDeleting(false);
      setId(null);
    }
  };

  // Modified effect for initialChannels changes - now excludes parentWidth
  useEffect(() => {
    if (initialChannels && initialChannels.length > 0) {
      setChannels(initialChannels);
      console.log("Called");
      // Initialize new channels with parent's position
      setChannelState((prev) => {
        const findMix = campaignFormData?.channel_mix?.find(
          (chhh) => chhh?.funnel_stage === parentId
        );
        const newState = initialChannels.map((ch, index) => {
          const findChannel = findMix[ch?.channelName]?.find(
            (plt) => plt?.platform_name === ch?.name
          );
          console.log("🚀 ~ newState ~ findChannel:", findChannel);
          const stageStartDate = findChannel?.campaign_start_date
            ? parseISO(findChannel?.campaign_start_date)
            : null;

          // Only adjust start date if it's earlier than parent start date
          const adjustedStageStartDate =
            stageStartDate && stageStartDate < startDate
              ? stageStartDate
              : stageStartDate < startDate
              ? startDate // Use parent start date if channel start date is earlier
              : stageStartDate; // Otherwise use the actual channel start date

          const stageEndDate = findChannel?.campaign_end_date
            ? parseISO(findChannel?.campaign_end_date)
            : null;

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
              ) * dailyWidth
            : 0;

          // Calculate days between using the adjusted end date
          let daysBetween;
          if (adjustedStageStartDate && adjustedStageEndDate) {
            daysBetween = eachDayOfInterval({
              start: adjustedStageStartDate,
              end: adjustedStageEndDate,
            })?.length;
          } else {
            daysBetween = eachDayOfInterval({
              start: new Date(findChannel?.campaign_start_date) || null,
              end: isEndDateExceeded
                ? endDate
                : new Date(findChannel?.campaign_end_date) || null,
            })?.length;
          }

          // Calculate position and width
          let left =
            parentLeft + Math.abs(startDateIndex < 0 ? 0 : startDateIndex);

          // Calculate width based on days between
          let width =
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
                ? dailyWidth * daysBetween
                : parentWidth
              : parentWidth;

          // Ensure width doesn't exceed parent width
          width = Math.min(width, parentWidth);

          // Ensure position + width doesn't exceed parent right edge
          if (left + width > parentLeft + parentWidth) {
            // If channel would extend beyond parent, adjust position first
            if (width <= parentWidth) {
              left = parentLeft + parentWidth - width;
            } else {
              // If width is too large, cap it at parent width and set left to parent left
              width = parentWidth;
              left = parentLeft;
            }
          }

          // Check if this channel already exists in prev
          //@ts-ignore
          const existingState = prev.find((state) => state.id === ch.id);

          return existingState
            ? {
                ...existingState,
                left: left,
                width: width,
              }
            : {
                left: parentLeft,
                width: Math.min(width, 50), // Default width for new channels
              };
        });

        return newState;
      });
    }
  }, [initialChannels, parentLeft, parentWidth, campaignFormData, isResizing]);

  // console.log("The campaginFormData", campaignFormData);

  useEffect(() => {
    if (!dragging) return;

    const totalDays = dateList.length - 1;

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
            endPixel - parentWidth / totalDays,
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
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, parentWidth]);

  console.log("channel state", channels?.map((ch)=>({
    name: ch.name,
    startDate: ch.start_date,
    endDate: ch.end_date,
  })))

  return (
    <div
      className={`open_channel_btn_container relative`}
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
                          // backgroundColor: channel.color,
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
                          // backgroundColor: channel.color,
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
              />
            )
          )}
        </div>
      </Modal>
      <Modal
        isOpen={selectedChannel && openAdset ? true : false}
        onClose={() => setOpenAdset(false)}
      >
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
    </div>
  );
};

export default ResizableChannels;
