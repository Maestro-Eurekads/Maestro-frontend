"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";
import { useCampaigns } from "app/utils/CampaignsContext";
import moment from "moment";
import { useDateRange } from "src/date-context";
import { getCurrencySymbol } from "./data";

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
  parentWidth?: any;
  setParentWidth?: any;
  parentLeft?: any;
  setParentLeft?: any;
  disableDrag?: boolean;
  budget?: number | string;
  setSelectedStage?: any;
  openItems?: any;
  setOpenItems?: any;
  endMonth?: any;
  color?: any;
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
}

const DraggableChannel: React.FC<DraggableChannelProps> = ({
  id,
  bg,
  description,
  setIsOpen,
  openChannel,
  setOpenChannel,
  Icon,
  dateList,
  dragConstraints,
  parentWidth,
  setParentWidth,
  parentLeft,
  setParentLeft,
  disableDrag = false, // Default to false
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
  const { funnelWidths, setFunnelWidth } = useFunnelContext();
  const [position, setPosition] = useState(0);
  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
  } | null>(null);
  const isDragging = useRef<{ startX: number; startPos: number } | null>(null);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { range } = useDateRange();

  // Add tooltip state
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
  });

  useEffect(() => {
    setPosition(parentLeft);
  }, [parentLeft]);

  const pixelToDate = (
    pixel: number,
    containerWidth: number,
    fieldName?: string
  ) => {
    const startDate = dateList[0]; // First date in the range
    const totalDays = dateList.length - 1; // Use totalDays - 1 to match grid intervals

    // Convert pixel to date index
    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate.getDate() + dayIndex);

    if (fieldName === "endDate") {
      calculatedDate.setDate(calculatedDate.getDate() + 1); // Add 1 day to fix the issue
    }

    return calculatedDate;
  };

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    const baseStep = dailyWidth;
    const snapPoints = [];

    // Generate snap points at regular intervals
    for (let i = 0; i <= containerWidth; i += baseStep) {
      snapPoints.push(i);
    }

    // Add the container width as the final snap point
    if (snapPoints[snapPoints.length - 1] !== containerWidth) {
      snapPoints.push(containerWidth);
    }

    // Find the closest snap point
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
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag"
  ) => {
    if (!dateList || dateList.length === 0) return;

    const totalDays = dateList.length - 1;

    const dayStartIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((startPixel / (parentWidth || 100)) * totalDays))
    );
    const dayEndIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((endPixel / (parentWidth || 100)) * totalDays))
    );

    const startDateValue = dateList[dayStartIndex];
    const endDateValue = dateList[dayEndIndex];

    if (!startDateValue || !endDateValue) return;

    const formattedStartDate = startDateValue.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
    const formattedEndDate = endDateValue.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    const containerRect = document
      .querySelector(".grid-container")
      ?.getBoundingClientRect();
    const relativeY = containerRect ? mouseY - containerRect.top : mouseY;

    setTooltip({
      visible: true,
      x: mouseX,
      y: Math.max(0, relativeY),
      content: `${description}: ${formattedStartDate} - ${formattedEndDate}`,
      type,
    });
  };

  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (disableDrag) return;
    e.preventDefault();
    e.stopPropagation();

    // Add tooltip on resize start
    const startPixel = position;
    const endPixel = startPixel + parentWidth;
    updateTooltipWithDates(
      startPixel,
      endPixel,
      e.clientX,
      e.clientY,
      "resize"
    );

    isResizing.current = {
      startX: e.clientX,
      startWidth: parentWidth,
      startPos: position,
      direction,
    };
    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const { startX, startWidth, startPos, direction } = isResizing.current;

    let newWidth = startWidth;
    let newPos = startPos;

    // Get the grid container
    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    // Get container boundaries
    const containerRect = gridContainer.getBoundingClientRect();
    const minX = 0;
    const maxX = containerRect.width - 45;

    if (direction === "left") {
      // Calculate new position and width for left resize
      const deltaX = e.clientX - startX;
      newWidth = Math.max(50, startWidth - deltaX);
      newPos = Math.max(minX, startPos + deltaX);

      // Apply snapping to the left edge position
      const snappedPos = snapToTimeline(newPos, containerRect.width);

      // Adjust width based on the snapped position
      newWidth = startWidth - (snappedPos - startPos);
      newPos = snappedPos;
    } else {
      // For right resize, calculate the new width
      const deltaX = e.clientX - startX;
      const rawNewWidth = startWidth + deltaX;

      // Calculate where the right edge would be
      const rightEdgePos = startPos + rawNewWidth;

      // Snap the right edge to the timeline
      const snappedRightEdge = snapToTimeline(
        rightEdgePos,
        containerRect.width
      );

      // Calculate the new width based on the snapped right edge
      newWidth = Math.max(50, snappedRightEdge - startPos);
    }

    // Convert pixel positions to dates
    const startDate = pixelToDate(newPos, containerRect.width);
    const endDate = pixelToDate(
      newPos + newWidth,
      containerRect.width,
      "endDate"
    );

    const updatedChannelMix = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === description
    );

    if (updatedChannelMix) {
      updatedChannelMix["funnel_stage_timeline_start_date"] =
        moment(startDate).format("YYYY-MM-DD");
      updatedChannelMix["funnel_stage_timeline_end_date"] =
        moment(endDate).format("YYYY-MM-DD");
    }

    setParentWidth(newWidth);
    setParentLeft(newPos);
    setPosition(newPos);

    // Update tooltip during resize
    updateTooltipWithDates(
      newPos,
      newPos + newWidth,
      e.clientX,
      e.clientY,
      "resize"
    );
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableDrag) return;
    e.preventDefault();

    // Add tooltip on drag start
    const startPixel = position;
    const endPixel = startPixel + parentWidth;
    updateTooltipWithDates(startPixel, endPixel, e.clientX, e.clientY, "drag");

    isDragging.current = { startX: e.clientX, startPos: position };
    document.addEventListener("mousemove", handleMouseMoveDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const { startX, startPos } = isDragging.current;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    const minX = 0;
    const maxX = containerRect.width - 45 - parentWidth;

    let newPosition = startPos + (e.clientX - startX);
    newPosition = Math.max(minX, Math.min(newPosition, maxX));

    // Snap to the nearest grid position
    newPosition = snapToTimeline(newPosition, containerRect.width);

    // Smoothly update the position using requestAnimationFrame
    requestAnimationFrame(() => {
      setParentLeft(newPosition);
      setPosition(newPosition);
    });

    // Calculate start and end pixel positions
    const startPixel = newPosition;
    const endPixel = startPixel + parentWidth;

    // Convert pixel positions to dates
    const startDate = pixelToDate(startPixel, containerRect.width);
    const endDate = pixelToDate(endPixel, containerRect.width, "endDate");

    const updatedChannelMix = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === description
    );

    if (updatedChannelMix) {
      updatedChannelMix["funnel_stage_timeline_start_date"] =
        moment(startDate).format("YYYY-MM-DD");
      updatedChannelMix["funnel_stage_timeline_end_date"] =
        moment(endDate).format("YYYY-MM-DD");
      setCampaignFormData((prev) => ({
        ...prev,
        channel_mix: prev.channel_mix.map((ch) =>
          ch.funnel_stage === description ? updatedChannelMix : ch
        ),
      }));
    }

    // Update tooltip during drag
    updateTooltipWithDates(
      newPosition,
      newPosition + parentWidth,
      e.clientX,
      e.clientY,
      "drag"
    );
  };

  const handleMouseUp = () => {
    // Hide tooltip on mouse up
    setTooltip((prev) => ({ ...prev, visible: false }));

    isResizing.current = null;
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mousemove", handleMouseMoveDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const stageBudget = campaignFormData?.channel_mix?.find(
    (fs) => fs?.funnel_stage === description
  )?.stage_budget;

  return (
    <div
      className={`relative w-full h-14 flex select-none rounded-[10px]`}
      style={{
        transform: `translateX(${position + (range === "Month" ? 4 : 0)}px)`,
      }}
    >
      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={`${color} absolute z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none`}
          style={{
            left: `${position}px`,
            top: `-55px`,
            transform: "translate(50%, 50%)",
            border: `1px solid ${bg}`,
            color: "white",
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Draggable Content */}
      <div
        className={`relative ${color} h-full flex justify-between items-center text-white px-4 py-[10px] gap-2 border shadow-md min-w-[50px] ${
          disableDrag ? "cursor-default relative" : "cursor-move"
        } rounded-[10px] `}
        style={{
          width: disableDrag
            ? `${parentWidth + (range === "Month" ? 53 : 43)}px`
            : parentWidth,
          backgroundColor: color,
          transition: "transform 0.2s ease-out",
        }}
        onMouseDown={disableDrag || openItems ? undefined : handleMouseDownDrag}
      >
        {/* Left Resize Handle */}
        {range === "Month" ? (
          <div
            className={`absolute left-0 w-5 h-1/2 bg-opacity-80  ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "left")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute left-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "left")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
        <div />
        <button
          className="flex items-center gap-3 w-fit"
          onClick={() => setOpenChannel?.(!openChannel)}
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

        {!disableDrag && parentWidth >= 350 ? (
          <button
            className="channel-btn mr-10"
            onClick={() => {
              setIsOpen?.(true);
              setSelectedStage(description);
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
            {stageBudget?.fixed_value &&
              Number.parseInt(stageBudget?.fixed_value).toLocaleString()}{" "}
            {getCurrencySymbol(stageBudget?.currency)}
          </div>
        )}
        {/* Right Resize Handle */}
        {range === "Month" ? (
          <div
            className={`absolute right-0 w-5 h-1/2 bg-opacity-80  ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "right")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute right-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "right")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableChannel;
