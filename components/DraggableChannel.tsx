"use client";

import React, { useState, useRef, useEffect } from "react";
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
  color
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

  useEffect(() => {
    setPosition(parentLeft);
  }, [parentLeft]);

  const pixelToDate = (pixel: number, containerWidth: number) => {
    const startDate = dateList[0]; // First date in the range
    const totalDays = dateList.length - 1; // Use totalDays - 1 to match grid intervals

    // Convert pixel to date index
    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate.getDate() + dayIndex);

    return calculatedDate;
  };

  function calculateDailyWidth(
    containerWidth: number,
    endMonth: number
  ): number {
    const adjustedWidth = containerWidth; // adjust for padding/margin if needed
    const totalDays = endMonth * 31;

    // Base daily width without factor
    const baseDailyWidth = adjustedWidth / totalDays;

    // Final adjusted daily width
    return baseDailyWidth;
  }

  const snapToTimeline = (currentPosition: number, containerWidth: number) => {
    const dailyWidth = calculateDailyWidth(containerWidth, endMonth);
    console.log("🚀 ~ snapToTimeline ~ dailyWidth:", dailyWidth);
    const baseStep = range === "Month" ? dailyWidth : 50;
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
      step = Math.max(
        range === "Month" ? dailyWidth : 50,
        step - adjustmentPerStep
      );
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
    direction: "left" | "right"
  ) => {
    if (disableDrag) return;
    e.preventDefault();
    e.stopPropagation();
    // setOpenChannel(false)
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
      newWidth = Math.max(50, startWidth - (e.clientX - startX));
      newPos = Math.max(minX, startPos + (e.clientX - startX));
    } else {
      newWidth = Math.max(50, startWidth + (e.clientX - startX));
    }

    if (newPos + newWidth > maxX) {
      newWidth = maxX - newPos;
    }

    // Snap to grid position
    newPos = snapToTimeline(newPos, containerRect.width);

    // Convert pixel positions to dates
    const startDate = pixelToDate(newPos, containerRect.width);
    const endDate = pixelToDate(newPos + newWidth, containerRect.width);

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

    setParentWidth(newWidth);
    setParentLeft(newPos);
    setPosition(newPos);
  };

  const handleMouseUp = () => {
    isResizing.current = null;
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mousemove", handleMouseMoveDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableDrag) return;
    e.preventDefault();
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
    const endDate = pixelToDate(endPixel, containerRect.width);

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
  };
  const stageBudget = campaignFormData?.channel_mix?.find(
    (fs) => fs?.funnel_stage === description
  )?.stage_budget;





  return (
    <div
      className={`relative w-full h-14 flex select-none ${disableDrag ? "rounded-[10px]" : "rounded-none"
        }`}
      style={{
        transform: `translateX(${position + (range === "Month" ? 4 : 0)}px)`,
      }}
    >
      {/* Left Resize Handle */}
      <div
        className={`w-5 h-full bg-opacity-80 bg-black ${disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
          } rounded-l-lg text-white flex items-center justify-center`}
        onMouseDown={(e) =>
          disableDrag || openItems
            ? undefined
            : handleMouseDownResize(e, "left")
        }
      >
        <MdDragHandle className="rotate-90" />
      </div>

      {/* Draggable Content */}
      <div
        className={`${color} h-full flex justify-between items-center text-white px-4 py-[10px] gap-2 border shadow-md min-w-[50px] ${disableDrag ? "cursor-default rounded-[10px] relative" : "cursor-move"
          }`}
        style={{
          width: disableDrag
            ? `${parentWidth + (range === "Month" ? 53 : 43)}px`
            : parentWidth,
          // backgroundColor: bg,
          transition: "transform 0.2s ease-out",
        }}
        onMouseDown={disableDrag || openItems ? undefined : handleMouseDownDrag}
      >
        <div />
        <button
          className="flex items-center gap-3 w-fit"
          onClick={() => setOpenChannel?.(!openChannel)}
        >
          {Icon?.src ? (
            <Image src={Icon?.src} alt="" width={20} height={20} />
          ) : (
            Icon
          )}
          <span className="font-medium">{description}</span>
          <MdOutlineKeyboardArrowDown />
        </button>

        {!disableDrag && parentWidth >= 350 ? (
          <button
            className="channel-btn"
            onClick={() => {
              setIsOpen?.(true);
              setSelectedStage(description);
            }}
          >
            <Image src={icroundadd} alt="icroundadd" />
            <p className="whitespace-nowrap text-[11px]">Add channel</p>
          </button>
        ) : (
          <div />
        )}

        {disableDrag && stageBudget?.fixed_value > 0 && (
          <div className="bg-[#FFFFFF26] rounded-[5px] py-[10px] px-[12px] font-medium">
            {(stageBudget?.fixed_value && parseInt(stageBudget?.fixed_value).toLocaleString())}{" "}
            {getCurrencySymbol(stageBudget?.currency)}
          </div>
        )}
      </div>

      {/* Right Resize Handle */}
      <div
        className={`w-5 h-full bg-opacity-80 bg-black ${disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
          } rounded-r-lg text-white flex items-center justify-center`}
        onMouseDown={(e) =>
          disableDrag || openItems
            ? undefined
            : handleMouseDownResize(e, "right")
        }
      >
        <MdDragHandle className="rotate-90" />
      </div>
    </div>
  );
};

export default DraggableChannel;
