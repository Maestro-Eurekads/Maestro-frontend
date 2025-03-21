"use client";

import React, { useState, useRef } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";
import { useCampaigns } from "app/utils/CampaignsContext";
import moment from "moment";

interface DraggableChannelProps {
  id: string;
  bg: string;
  description: string;
  setIsOpen: (show: boolean) => void;
  openChannel: boolean;
  setOpenChannel: (open: boolean) => void;
  Icon: React.ReactNode;
  dateList: Date[];
  dragConstraints: any;
  parentWidth: any;
  setParentWidth: any;
  parentLeft: any;
  setParentLeft: any;
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

  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    e.preventDefault();
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
    const maxX = containerRect.width;

    if (direction === "left") {
      newWidth = Math.max(150, startWidth - (e.clientX - startX));
      newPos = Math.max(minX, startPos + (e.clientX - startX));
    } else {
      newWidth = Math.max(150, startWidth + (e.clientX - startX));
    }

    if (newPos + newWidth > maxX) {
      newWidth = maxX - newPos;
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
      updatedChannelMix["funnel_stage_timeline_start_date"] = moment(startDate).format("YYYY-MM-DD");
      updatedChannelMix["funnel_stage_timeline_end_date"] = moment(endDate).format("YYYY-MM-DD");
      setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: prev.channel_mix.map((ch) =>
        ch.funnel_stage === description ? updatedChannelMix : ch
      ),
      }));
    }

    console.log({ startDate, endDate });
    setParentLeft(newPosition);
    setPosition(newPosition);
  };

  return (
    <div
      className="relative w-full h-14 flex select-none"
      style={{ transform: `translateX(${position}px)` }}
    >
      {/* Left Resize Handle */}
      <div
        className="w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
        onMouseDown={(e) => handleMouseDownResize(e, "left")}
      >
        <MdDragHandle className="rotate-90" />
      </div>

      {/* Draggable Content */}
      <div
        className="h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px] cursor-move"
        style={{ width: parentWidth, backgroundColor: bg }}
        onMouseDown={handleMouseDownDrag}
      >
        <div />
        <button
          className="flex items-center gap-3"
          onClick={() => setOpenChannel(!openChannel)}
        >
          {Icon}
          <span className="font-medium">{description}</span>
          <MdOutlineKeyboardArrowDown />
        </button>

        {parentWidth >= 350 ? (
          <button
            className="channel-btn"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <Image src={icroundadd} alt="icroundadd" />
            <p className="whitespace-nowrap">Add new channel</p>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Right Resize Handle */}
      <div
        className="w-5 h-full bg-opacity-80 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
        onMouseDown={(e) => handleMouseDownResize(e, "right")}
      >
        <MdDragHandle className="rotate-90" />
      </div>
    </div>
  );
};

export default DraggableChannel;
