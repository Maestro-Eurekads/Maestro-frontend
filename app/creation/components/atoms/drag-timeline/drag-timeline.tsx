"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconType } from "react-icons";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { useDateRange } from "../../../../../src/date-range-context";
import icroundadd from '../../../../../public/ic_round-add.svg';
import Image from "next/image";

interface ResizeableProps {
  bg: string;
  description: string;
  Icon: IconType;
}

const ResizeableBar = ({ bg, description, Icon }: ResizeableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"left" | "right" | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [openChannel, setOpenChannel] = useState(false);
  const { dateRangeWidth } = useDateRange();
  const [width, setWidth] = useState(dateRangeWidth);
  const minWidth = 150;
  const maxWidth = dateRangeWidth;
  const [left, setLeft] = useState(0);

  // const [selectedChannel, setSelectedChannel] = useState(null);

  console.log('isHovered', isHovered)


  // const handleChannelClick = (channel) => {
  //   setSelectedChannel(channel); // Set the selected channel
  //   setOpenChannel(false); // Close the dropdown
  // };

  const channels = [
    { name: "Facebook", color: "#1877F2", bg: "#F0F6FF" },
    { name: "Instagram", color: "#C13584", bg: "#FEF1F8" },
    { name: "YouTube", color: "#FF0000", bg: "#FFF0F0" },
    { name: "TheTradeDesk", color: "#0059FF", bg: "#F0F9FF" },
    { name: "Quantcast", color: "#000000", bg: "#F7F7F7" },
    { name: "Google", color: "#4285F4", bg: "#F1F6FE" },
  ];

  useEffect(() => {
    setWidth(dateRangeWidth);
  }, [dateRangeWidth]);

  const handleMouseDown = (side: "left" | "right") => {
    setDragging(side);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }, [dragging, handleMouseMove]);
  return (
    <div>
      <div ref={containerRef} className="relative w-full h-14">
        {/* Resizable Bar */}
        <div
          className="absolute top-0 h-full flex justify-between items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
          style={{
            left: `${left}px`,
            width: `${width}px`,
            backgroundColor: bg,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div />
          <div className="flex items-center gap-3" onClick={() => setOpenChannel(!openChannel)}>
            <Icon className="text-lg text-white" />
            <span className="font-medium">{description}</span>
            <MdOutlineKeyboardArrowDown />
          </div>

          {/* Show button only on hover */}
          {/* <div>
            {isHovered && ( */}
          <button className="channel-btn" >
            <Image src={icroundadd} alt="icroundadd" />
            <p>Add new channel</p>
          </button>
          {/* //   )}
          // </div> */}
        </div>

        {/* Left Handle */}
        <div
          className="absolute   top-0 w-5 h-full bg-opacity-50 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
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


      {/* Channel Selection Dropdown */}
      {openChannel && (
        <div className="open_channel_btn_container">
          {channels.map((channel) => (
            <div ref={containerRef} className="relative w-full h-14" key={channel.name}>
              {/* Resizable Bar */}
              <div
                className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
                style={{
                  left: `${left}px`,
                  width: `${width}px`,
                  backgroundColor: channel.bg,
                  color: channel.color,
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >

                <div className="flex items-center gap-3">
                  {/* <Icon className="text-lg text-white" /> */}
                  <span className="font-medium">{channel.name}</span>
                </div>
              </div>

              {/* Left Handle */}
              <div
                className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
                style={{
                  left: `${left}px`,
                  backgroundColor: channel.color, // Dynamic color from channel object
                }}
                onMouseDown={() => handleMouseDown("left")}
              >
                <MdDragHandle className="rotate-90" />
              </div>

              {/* Right Handle */}
              <div
                className="absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
                style={{
                  left: `${left + width - 5}px`,
                  backgroundColor: channel.color, // Corrected dynamic color mapping
                }}
                onMouseDown={() => handleMouseDown("right")}
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






{/* <div ref={containerRef} className="w-full flex h-14">

 
  <button
    className="w-[24px] h-full bg-opacity-50 bg-black cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
    onMouseDown={() => handleMouseDown("left")}
  >
    <MdDragHandle className="rotate-90" />
  </button>

 
  <div
    className="h-full flex items-center justify-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
    style={{
      left: `${left}px`,
      width: `${width}px`,
      backgroundColor: bg,
    }}
  >

    <Icon className="text-lg text-white" />
    <span className="font-medium">{description}</span>
    <MdOutlineKeyboardArrowDown />

    <button className="channel-btn">Add new channel</button>
  </div>

 
  <button
    className="w-[24px] h-full bg-opacity-50 bg-black cursor-ew-resize rounded-r-lg text-white flex items-center justify-center" 
    onMouseDown={() => handleMouseDown("right")}
  >
    <MdDragHandle className="rotate-90" />
  </button>
</div> */}
