"use client";

import React, { useState, useRef } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";

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
}) => {
  const { funnelWidths, setFunnelWidth } = useFunnelContext();
  const [position, setPosition] = useState(0);
  const [width, setWidth] = useState(300);
  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
  } | null>(null);
  const isDragging = useRef<{ startX: number; startPos: number } | null>(null);

  const pixelToDate = (pixel: number, containerWidth: number) => {
    const startDate = dateList[0]; // First date in the range
    const endDate = dateList[dateList.length - 1]; // Last date in range
    const totalDays = dateList.length; // Number of days in the grid

    // Calculate the corresponding day
    const dayIndex = Math.round((pixel / containerWidth) * totalDays);
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
      startWidth: width,
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
    const minX = 0; // 🔥 Left-most boundary
    const maxX = containerRect.width; // 🔥 Right-most boundary (grid width)

    if (direction === "left") {
      newWidth = Math.max(150, startWidth - (e.clientX - startX));
      newPos = Math.max(minX, startPos + (e.clientX - startX)); // 🔥 Ensure it doesn't move left past grid start
    } else {
      newWidth = Math.max(150, startWidth + (e.clientX - startX));
    }

    // 🔥 Prevent resizing beyond the right boundary
    if (newPos + newWidth > maxX) {
      newWidth = maxX - newPos; // Clamp to prevent overflow
    }

    setWidth(newWidth); // ✅ Update width dynamically
    setPosition(newPos); // ✅ Update position when resizing from left
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

    // Get the grid container
    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;

    // Get container boundaries
    const containerRect = gridContainer.getBoundingClientRect();
    const minX = 0;
    const maxX = containerRect.width - 45 - width;

    // Calculate new position
    let newPosition = startPos + (e.clientX - startX);

    // Clamp position within grid
    newPosition = Math.max(minX, Math.min(newPosition, maxX));

    // Calculate start and end pixel positions
    const startPixel = newPosition;
    const endPixel = startPixel + width;

    // Convert pixel positions to dates
    const startDate = pixelToDate(startPixel, containerRect.width);
    const endDate = pixelToDate(endPixel, containerRect.width);

    console.log("Start Date:", startDate, "End Date:", endDate);

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
        style={{ width, backgroundColor: bg }}
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

        {width >= 350 ? (
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
