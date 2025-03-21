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

    // const handleMouseMove = (event) => {
    //   event.preventDefault()
    //   const { index, direction, startX } = dragging
    //   const deltaX = event.clientX - startX

    //   setChannelState((prev) =>
    //     prev.map((state, i) => {
    //       if (i !== index) return state

    //       const newWidth =
    //         direction === "left"
    //           ? Math.max(150, Math.min(state.width - deltaX, parentWidth)) // Ensure it stays within parent width
    //           : Math.max(150, Math.min(state.width + deltaX, parentWidth))

    //       return { ...state, width: newWidth }
    //     }),
    //   )

    //   setDragging((prev) => ({ ...prev, startX: event.clientX }))
    // }

    const handleMouseMove = (event) => {
      event.preventDefault();
      const { index, direction, startX } = dragging;
      let deltaX = event.clientX - startX;

      setChannelState((prev) =>
        prev.map((state, i) => {
          if (i !== index) return state;

          let newWidth;
          if (direction === "left") {
            newWidth = Math.max(
              150,
              Math.min(
                state.width - deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
          } else {
            newWidth = Math.max(
              150,
              Math.min(
                state.width + deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
          }

          return { ...state, width: newWidth };
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
            className="absolute top-0 h-full flex justify-center items-center text-white px-4 gap-2 border shadow-md min-w-[150px]"
            style={{
              left: `${channelState[index]?.left || parentLeft}px`,
              width: `${channelState[index]?.width || 150}px`,
              backgroundColor: channel.bg,
              color: channel.color,
              borderColor: channel.color,
              borderRadius: "10px",
            }}
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
