"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconType } from "react-icons";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDateRange } from "../../../../../src/date-range-context";

interface ResizeableProps {
  bg: string;
  description: string;
  Icon: IconType;
}

const ResizeableBar = ({ bg, description, Icon }: ResizeableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"left" | "right" | null>(null);
  const { dateRangeWidth } = useDateRange();
  const [width, setWidth] = useState(dateRangeWidth);
  const minWidth = 150;
  const maxWidth = dateRangeWidth;
  const [left, setLeft] = useState(0);

  useEffect(() => {
    setWidth(dateRangeWidth);
  }, [dateRangeWidth]);

  const handleMouseDown = (side: "left" | "right") => {
    setDragging(side);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.parentElement!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (dragging === "left") {
      const newLeft = Math.max(0, Math.min(left + width - minWidth, mouseX));
      const newWidth = width + (left - newLeft);
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
      setLeft(newLeft);
    } else if (dragging === "right") {
      const newWidth = Math.min(
        maxWidth - left,
        Math.max(minWidth, mouseX - left)
      );
      setWidth(newWidth);
    }
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);
  return (
    <div ref={containerRef} className="relative w-full h-14">
      {/* Resizable Bar */}
      <div
        className="absolute top-0 h-full flex items-center justify-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
        style={{
          left: `${left}px`,
          width: `${width}px`,
          backgroundColor: bg,
        }}
      >
        <Icon className="text-lg text-white" />
        <span className="font-medium">{description}</span>
        <MdOutlineKeyboardArrowDown />
      </div>

      {/* Left Handle */}
      <div
        className="absolute top-0 w-5 h-full bg-opacity-50 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
        style={{ left: `${left}px` }}
        onMouseDown={() => handleMouseDown("left")}
      >
        <MdDragHandle className="rotate-90" />
      </div>

      {/* Right Handle */}
      <div
        className="absolute top-0 w-5 h-full bg-opacity-50 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
        style={{ left: `${left + width - 5}px` }}
        onMouseDown={() => handleMouseDown("right")}
      >
        <MdDragHandle className="rotate-90" />
      </div>
    </div>
  );
};

export default ResizeableBar;
