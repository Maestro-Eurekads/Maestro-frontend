"use client";
import React, { useState, useEffect } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";

const ResizableChannels = ({
  channels,
  parentId,
  dragConstraints,
  parentWidth,
}) => {
  const { funnelWidths } = useFunnelContext(); // Get parent widths

  // Initialize child width based on available parent space
  const [channelState, setChannelState] = useState(
    channels.map(() => ({ left: 0, width: Math.min(150, parentWidth) })) // Ensure initial width fits
  );

  const [dragging, setDragging] = useState(null);

  const handleMouseDown = (index, direction) => (event) => {
	event.preventDefault();
	setDragging({ index, direction, startX: event.clientX });
  };
  

  // Ensure child width does not exceed parent when the parent resizes
  useEffect(() => {
    setChannelState((prev) =>
      prev.map((state) => ({
        ...state,
        width: Math.min(state.width, parentWidth), // Adjust width if it exceeds parent
      }))
    );
  }, [parentWidth]); // React to parent width changes

  useEffect(() => {
    if (!dragging) return;

	const handleMouseMove = (event) => {
		event.preventDefault();
		if (!dragging || !dragConstraints) return;
	  
		const { index, direction, startX } = dragging;
		const deltaX = event.clientX - startX;
	  
		// 🔥 Get parent boundary values
		const { left: minX, right: maxX } = dragConstraints;
	  
		setChannelState((prev) =>
		  prev.map((state, i) => {
			if (i !== index) return state;
	  
			let newLeft = state.left;
			let newWidth = state.width;
	  
			if (direction === "left") {
			  // Shrinking from the left
			  newLeft = Math.max(0, state.left + deltaX);
			  newWidth = Math.max(50, state.width - deltaX); // Ensure min width of 150px
			} else {
			  // Expanding from the right
			  newWidth = Math.min(state.width + deltaX, maxX - minX - state.left); // Ensure it doesn’t exceed parent
			}
	  
			return { ...state, left: newLeft, width: newWidth };
		  })
		);
	  
		setDragging((prev) => ({ ...prev, startX: event.clientX }));
	  };
	  
    console.log("channelState", channelState);

    const handleMouseUp = () => {
      setDragging(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, parentWidth]); // React when parent width changes
  

  return (
    <div className="open_channel_btn_container">
      {channels.map((channel, index) => (
        <div key={channel.name} className="relative w-full h-12">
          <div
            className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
            style={{
				left: `${channelState[index]?.left || 0}px`, // ✅ Now relative to parent
				width: `${channelState[index]?.width || 150}px`,
              backgroundColor: channel.bg,
              color: channel.color,
              borderColor: channel.color,
              borderRadius: "10px",
            }}
          >
            <div className="flex items-center gap-3">
              <Image src={channel.icon} alt={channel.icon} />
              <span className="font-medium whitespace-nowrap">
                {channel.name}
              </span>
            </div>
          </div>

          <div
            className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
            style={{
              left: `${channelState[index]?.left || 0}px`,
              backgroundColor: channel.color,
            }}
            onMouseDown={handleMouseDown(index, "left")}
          >
            <MdDragHandle className="rotate-90" />
          </div>

          <div
            className="absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center"
            style={{
              left: `${
                (channelState[index]?.left || 0) +
                (channelState[index]?.width || 150) -
                5
              }px`,
              backgroundColor: channel.color,
            }}
            onMouseDown={handleMouseDown(index, "right")}
          >
            <MdDragHandle className="rotate-90" />
            <button className="delete-resizeableBar">
              <Image src={reddelete} alt="reddelete" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResizableChannels;
