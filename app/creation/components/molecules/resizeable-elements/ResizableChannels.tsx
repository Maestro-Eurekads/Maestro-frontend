"use client";
import { useState, useEffect } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import whiteplus from "../../../../../public/white-plus.svg";

const ResizableChannels = ({
  channels: initialChannels,
  parentId,
  parentWidth,
  parentLeft,
  setIsOpen,
  dateList
}) => {
  console.log("🚀 ~ ResizableChannels ~ parentWidth:", parentWidth);
  const { funnelWidths } = useFunnelContext(); // Get parent widths

  const [channels, setChannels] = useState(initialChannels);

  // Initialize child width based on available parent space and position
  const [channelState, setChannelState] = useState(
    channels.map(() => ({
      left: parentLeft, // Start at parent's left position
      width: Math.min(150, parentWidth),
    }))
  );

  const [dragging, setDragging] = useState(null);

  const [draggingPosition, setDraggingPosition] = useState(null);

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

  const handleDragStart = (index) => (event) => {
    event.preventDefault();
    setDraggingPosition({
      index,
      startX: event.clientX,
      startLeft: channelState[index].left,
    });
  };

  useEffect(() => {
    if (draggingPosition === null) return;

    const handleDragMove = (event) => {
      event.preventDefault();
      const { index, startX, startLeft } = draggingPosition;
      const deltaX = event.clientX - startX;

      setChannelState((prev) =>
        prev.map((state, i) => {
          if (i !== index) return state;

          let newLeft = startLeft + deltaX;

          // Restrict movement within parent boundaries
          const maxLeft = parentLeft + parentWidth - state.width;
          newLeft = Math.max(parentLeft, Math.min(newLeft, maxLeft));

          return { ...state, left: newLeft };
        })
      );
    };

    const handleDragEnd = () => {
      setDraggingPosition(null);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [draggingPosition, parentLeft, parentWidth]);

  const handleMouseDown = (index, direction) => (event) => {
    event.preventDefault();
    setDragging({ index, direction, startX: event.clientX });
  };

  const handleDeleteChannel = (indexToDelete) => {
    setChannels(channels.filter((_, index) => index !== indexToDelete));
    setChannelState(channelState.filter((_, index) => index !== indexToDelete));
  };

  // Update channel positions when parent position changes
  useEffect(() => {
    setChannelState((prev) =>
      prev.map((state) => ({
        ...state,
        width: Math.min(state.width, parentWidth), // Adjust width if it exceeds parent
      }))
    );
  }, [parentWidth]);

  // Update channel state when initialChannels changes
  useEffect(() => {
    if (initialChannels && initialChannels.length > 0) {
      setChannels(initialChannels);
      // Initialize new channels with parent's position
      setChannelState((prev) =>
        prev.map((state) => ({
          ...state,
          left: parentLeft,
          width: Math.min(state.width, parentWidth), // Adjust width if it exceeds parent
        }))
      );
    }
  }, [initialChannels, parentLeft, parentWidth]);

  useEffect(() => {
    if (!dragging) return;

	const handleMouseMove = (event) => {
		event.preventDefault();
		const { index, direction, startX } = dragging;
		let deltaX = event.clientX - startX;
	  
		setChannelState((prev) =>
		  prev.map((state, i) => {
			if (i !== index) return state;
	  
			let newLeft = state.left;
			let newWidth = state.width;
	  
			if (direction === "left") {
			  // Move the left side while keeping the right side fixed
			  newLeft = Math.max(parentLeft, state.left + deltaX);
			  newWidth = Math.max(150, state.width - deltaX);
			} else {
			  // Move the right side, increasing width
			  newWidth = Math.max(150, state.width + deltaX);
			}
	  
			// Restrict movement within parent boundaries
			if (newLeft + newWidth > parentLeft + parentWidth) {
			  newWidth = parentLeft + parentWidth - newLeft;
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
  }, [dragging, parentWidth]); // React when parent width changes

  return (
    <div className="open_channel_btn_container">
      {parentWidth < 350 && (
        <button
          className="channel-btn-blue mt-[12px] mb-[12px] relative w-fit"
          onClick={() => {
            setIsOpen(true);
          }}
          style={{
            left: `${channelState[0]?.left || parentLeft}px`,
          }}
        >
          <Image src={whiteplus || "/placeholder.svg"} alt="whiteplus" />
          <p className="whitespace-nowrap">Add new channel</p>
        </button>
      )}
      {channels.map((channel, index) => (
        <div key={channel.name} className="relative w-full h-12">
          <div
            className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px] cursor-move"
            style={{
              left: `${channelState[index]?.left || parentLeft}px`,
              width: `${channelState[index]?.width || 150}px`,
              backgroundColor: channel.bg,
              color: channel.color,
              borderColor: channel.color,
              borderRadius: "10px",
            }}
            onMouseDown={handleDragStart(index)}
          >
            <div className="flex items-center gap-3">
              <Image
                src={channel.icon || "/placeholder.svg"}
                alt={channel.icon}
              />
              <span className="font-medium whitespace-nowrap">
                {channel.name}
              </span>
            </div>
          </div>

          <div
            className="absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center"
            style={{
              left: `${channelState[index]?.left || parentLeft}px`,
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
                (channelState[index]?.left || parentLeft) +
                (channelState[index]?.width || 150) -
                5
              }px`,
              backgroundColor: channel.color,
            }}
            onMouseDown={handleMouseDown(index, "right")}
          >
            <MdDragHandle className="rotate-90" />
            <button
              className="delete-resizeableBar"
              onClick={() => handleDeleteChannel(index)}
            >
              <Image src={reddelete || "/placeholder.svg"} alt="reddelete" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResizableChannels;
