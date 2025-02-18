"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconType } from "react-icons";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDateRange } from "../../../../../src/date-range-context";
import icroundadd from '../../../../../public/ic_round-add.svg';
import Image from "next/image";
import facebook from '../../../../../public/social/facebook.svg';
import youtube from '../../../../../public/social/youtube.svg';
import thetradedesk from '../../../../../public/social/thetradedesk.svg';
import quantcast from '../../../../../public/social/quantcast.svg';
import google from '../../../../../public/social/google.svg';
import ig from '../../../../../public/social/ig.svg';

interface ResizeableProps {
  bg: string;
  description: string;
  Icon: IconType;
}


const ResizeableBar = ({ bg, description, Icon }: ResizeableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ index: number; side: "left" | "right" } | null>(null);
  // const [isHovered, setIsHovered] = useState(false);
  const [openChannel, setOpenChannel] = useState(false);
  const { dateRangeWidth } = useDateRange();
  const minWidth = 150;
  const maxWidth = dateRangeWidth;

  const channels = [
    { icon: facebook, name: "Facebook", color: "#0866FF", bg: "#F0F6FF" },
    { icon: ig, name: "Instagram", color: "#C13584", bg: "#FEF1F8" },
    { icon: youtube, name: "YouTube", color: "#FF0000", bg: "#FFF0F0" },
    { icon: thetradedesk, name: "TheTradeDesk", color: "#0099FA", bg: "#F0F9FF" },
    { icon: quantcast, name: "Quantcast", color: "#000000", bg: "#F7F7F7" },
    { icon: google, name: "Google", color: "#4285F4", bg: "#F1F6FE" },
  ];


  // The state that tracks left and width for both the main bar and dropdown items
  const [channelState, setChannelState] = useState([
    { left: 0, width: dateRangeWidth }, // For the main resizable bar
    ...channels.map(() => ({ left: 0, width: dateRangeWidth })) // For each dropdown item
  ]);

  const handleMouseDown = (index: number, side: "left" | "right") => {
    setDragging({ index, side });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const { index, side } = dragging;
    const rect = containerRef.current.parentElement!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    setChannelState((prevState) => {
      const updated = [...prevState];

      // Ensure index exists before modifying the state
      if (!updated[index]) return updated;

      if (side === "left") {
        const newLeft = Math.max(0, Math.min(updated[index].left + updated[index].width - minWidth, mouseX));
        const newWidth = updated[index].width + (updated[index].left - newLeft);
        updated[index] = {
          left: newLeft,
          width: Math.min(maxWidth, Math.max(minWidth, newWidth)),
        };
      } else if (side === "right") {
        const newWidth = Math.min(maxWidth - updated[index].left, Math.max(minWidth, mouseX - updated[index].left));
        updated[index].width = newWidth;
      }

      // If dragging the main bar, update all dropdown items
      if (index === 0) {
        updated.slice(1).forEach((_, i) => {
          updated[i + 1] = {
            left: updated[0].left,
            width: updated[0].width,
          };
        });
      }

      return updated;
    });
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
    <div>
      {/* Main Resizable Bar */}
      <div ref={containerRef} className="relative w-full h-14">
        <div
          className="absolute top-0 h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
          style={{
            left: `${channelState[0]?.left || 0}px`,
            width: `${channelState[0]?.width || dateRangeWidth}px`,
            backgroundColor: bg,
          }}
        // onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
        >
          <div />
          <div className="flex items-center gap-3" onClick={() => setOpenChannel(!openChannel)}>
            <Icon className="text-lg text-white" />
            <span className="font-medium">{description}</span>
            <MdOutlineKeyboardArrowDown />
          </div>

          <button className="channel-btn">
            <Image src={icroundadd} alt="icroundadd" />
            <p>Add new channel</p>
          </button>
        </div>

        {/* Left Handle for Main Bar */}
        <div
          className="absolute top-0 w-5 h-full bg-opacity-50 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
          style={{ left: `${channelState[0]?.left || 0}px` }}
          onMouseDown={() => handleMouseDown(0, "left")}
        >
          <MdDragHandle className="rotate-90" />
        </div>

        {/* Right Handle for Main Bar */}
        <div
          className="absolute top-0 w-5 h-full bg-opacity-50 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
          style={{
            left: `${(channelState[0]?.left || 0) + (channelState[0]?.width || dateRangeWidth) - 5}px`,
          }}
          onMouseDown={() => handleMouseDown(0, "right")}
        >
          <MdDragHandle className="rotate-90" />
        </div>
      </div>

      {/* Mapped Draggable Dropdowns */}
      {openChannel && (
        <div className="open_channel_btn_container">
          {channels.map((channel, index) => (
            <div key={channel.name} className="relative w-full h-12">
              {/* Draggable Dropdown Item */}
              <div
                className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
                style={{
                  borderColor: channel.color,
                  left: `${channelState[index]?.left || 0}px`,
                  width: `${channelState[index]?.width || 150}px`,
                  backgroundColor: channel.bg,
                  color: channel.color,
                  borderRadius: "5px",
                }}
              >
                <div className="flex items-center gap-3">
                  <Image src={channel.icon} alt={channel.icon} />
                  <span className="font-medium">{channel.name}</span>
                </div>
              </div>

              {/* Left Handle for Dropdown Item */}
              <div
                className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
                style={{
                  left: `${channelState[index]?.left || 0}px`,
                  backgroundColor: channel.color,
                }}
                onMouseDown={() => handleMouseDown(index, "left")}
              >
                <MdDragHandle className="rotate-90" />
              </div>

              {/* Right Handle for Dropdown Item */}
              <div
                className="absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
                style={{
                  left: `${(channelState[index]?.left || 0) + (channelState[index]?.width || 150) - 5}px`,
                  backgroundColor: channel.color,
                }}
                onMouseDown={() => handleMouseDown(index, "right")}
              >
                <MdDragHandle className="rotate-90" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResizeableBar;




