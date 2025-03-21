"use client";
import { useState, useEffect, useRef } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import whiteplus from "../../../../../public/white-plus.svg";
import { useCampaigns } from "app/utils/CampaignsContext";

interface Channel {
  name: string;
  channelName: string;
  icon: string;
  bg: string;
  color: string;
}

interface ResizableChannelsProps {
  channels: Channel[];
  parentId: string;
  parentWidth?: number;
  parentLeft?: number;
  setIsOpen: (isOpen: boolean) => void;
  dateList: Date[];
  disableDrag?: boolean;
}

const ResizableChannels = ({
  channels: initialChannels,
  parentId,
  parentWidth,
  parentLeft,
  setIsOpen,
  dateList,
  disableDrag = false,
}: ResizableChannelsProps) => {
  console.log("🚀 ~ ResizableChannels ~ parentWidth:", parentWidth);
  const { campaignFormData, setCampaignFormData, setCopy } = useCampaigns();
  const { funnelWidths } = useFunnelContext(); // Get parent widths
  const draggingDataRef = useRef(null);
  const isDraggingRef = useRef(false);

  const [channels, setChannels] = useState(initialChannels);

  // Initialize child width based on available parent space and position
  const [channelState, setChannelState] = useState(
    channels?.map(() => ({
      left: parentLeft, // Start at parent's left position
      width: Math.min(150, parentWidth),
    }))
  );

  const [dragging, setDragging] = useState(null);

  const [draggingPosition, setDraggingPosition] = useState(null);

  const pixelToDate = (pixel, containerWidth, roundFn = Math.round) => {
    const startDate = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === parentId
    )?.funnel_stage_timeline_start_date
      ? new Date(
          campaignFormData?.channel_mix?.find(
            (ch) => ch?.funnel_stage === parentId
          )?.funnel_stage_timeline_start_date
        )
      : campaignFormData?.campaign_time_start_date;

    const endDate = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === parentId
    )?.funnel_stage_timeline_end_date
      ? new Date(
          campaignFormData?.channel_mix?.find(
            (ch) => ch?.funnel_stage === parentId
          )?.funnel_stage_timeline_end_date
        )
      : campaignFormData?.campaign_time_end_date;

    console.log({ startDate, endDate });

    const totalDays =
      (endDate?.getTime() - startDate?.getTime()) / (1000 * 60 * 60 * 24); // Convert ms to days
    const dayIndex = Math.min(
      totalDays,
      Math.max(0, roundFn((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate?.getDate() + dayIndex);

    // Convert the result back to "yyyy-mm-dd" format
    return calculatedDate?.toISOString()?.split("T")[0];
  };

  const handleDragStart = (index) => (event) => {
    console.log("bfjdfd", index);
    if (disableDrag) return;
    event.preventDefault();
    setDraggingPosition({
      index,
      startX: event.clientX,
      startLeft: channelState[index].left,
    });
  };
  useEffect(() => {
    if (disableDrag || draggingPosition === null) return;

    isDraggingRef.current = true; // Set dragging to true

    const handleDragMove = (event: MouseEvent) => {
      event.preventDefault();
      const { index, startX, startLeft } = draggingPosition;
      const deltaX = event.clientX - startX;

      let newLeft = startLeft + deltaX;

      // Restrict movement within parent boundaries
      const maxLeft = parentLeft + parentWidth - channelState[index]?.width;
      newLeft = Math.max(parentLeft, Math.min(newLeft, maxLeft));

      // Update state using functional update to prevent stale values
      setChannelState((prev) =>
        prev.map((state, i) =>
          i === index ? { ...state, left: newLeft } : state
        )
      );

      // Store campaign date updates in ref to prevent re-renders
      const startPixel = newLeft - parentLeft;
      const endPixel = startPixel + channelState[index]?.width;
      const startDate = pixelToDate(startPixel, parentWidth, Math.floor);
      const endDate = pixelToDate(endPixel, parentWidth, Math.ceil);

      draggingDataRef.current = { index, startDate, endDate };
    };

    const handleDragEnd = () => {
      if (draggingDataRef.current) {
        const { index, startDate, endDate } = draggingDataRef.current;

        setCopy(() => {
          const updatedData = JSON.parse(JSON.stringify(campaignFormData)); // Deep copy

          const channelMix = updatedData.channel_mix.find(
            (ch) => ch.funnel_stage === parentId
          );

          if (channelMix) {
            const channelGroup = channelMix[channels[index].channelName];

            if (Array.isArray(channelGroup)) {
              const platform = channelGroup.find(
                (platform) => platform.platform_name === channels[index].name
              );

              if (platform) {
                platform.campaign_start_date = startDate;
                platform.campaign_end_date = endDate;
              }
            }
          }

          return updatedData;
        });

        draggingDataRef.current = null; // Clear ref after update
      }

      isDraggingRef.current = false; // Reset dragging state
      setDraggingPosition(null);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [draggingPosition, parentLeft, parentWidth]); //

  const handleMouseDown = (index, direction) => (event) => {
    event.preventDefault();
    setDragging({ index, direction, startX: event.clientX });
  };

  const handleDeleteChannel = (indexToDelete) => {
    setChannels(channels.filter((_, index) => index !== indexToDelete));
    setChannelState(channelState.filter((_, index) => index !== indexToDelete));
    setCampaignFormData((prev) => {
      const updatedData = JSON.parse(JSON.stringify(prev)); // Deep copy

      const channelMix = updatedData.channel_mix.find(
        (ch) => ch.funnel_stage === parentId
      );

      if (channelMix) {
        const channelGroup = channelMix[channels[indexToDelete].channelName];

        if (Array.isArray(channelGroup)) {
          const platformIndex = channelGroup.findIndex(
            (platform) =>
              platform.platform_name === channels[indexToDelete].name
          );

          if (platformIndex !== -1) {
            channelGroup.splice(platformIndex, 1); // Remove the platform
          }
        }
      }

      return updatedData;
    });
  };

  // Update channel positions when parent position changes
  useEffect(() => {
    setChannelState((prev) =>
      prev?.map((state) => ({
        ...state,
        width: Math.min(state?.width, parentWidth), // Adjust width if it exceeds parent
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

    const totalDays = dateList.length - 1; // Define totalDays within the scope

    const handleMouseMove = (event) => {
      event.preventDefault();
      const { index, direction, startX } = dragging;
      let deltaX = event.clientX - startX;

      setChannelState((prev) =>
        prev.map((state, i) => {
          if (i !== index) return state;

          let newWidth,
            newLeft = state.left;

          if (direction === "left") {
            // Move the left side while keeping the right side fixed
            newWidth = Math.max(
              150,
              Math.min(
                state.width - deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
            newLeft = state.left + deltaX; // Move the left boundary
          } else {
            // Move the right side, increasing width
            newWidth = Math.max(
              150,
              Math.min(
                state.width + deltaX,
                parentWidth - (state.left - parentLeft)
              )
            );
          }

          // Prevent movement out of bounds
          newLeft = Math.max(
            parentLeft,
            Math.min(newLeft, parentLeft + parentWidth - newWidth)
          );

          // Calculate start and end pixel positions
          const startPixel = newLeft - parentLeft; // Adjusted to be relative
          const endPixel = startPixel + newWidth;

          // Convert pixel positions to dates
          const startDate = pixelToDate(startPixel, parentWidth);
          const endDate = pixelToDate(
            endPixel - parentWidth / totalDays,
            parentWidth
          );

          const updatedCampaignFormData = { ...campaignFormData };

          const channelMix = updatedCampaignFormData.channel_mix.find(
            (ch) => ch.funnel_stage === parentId
          );

          if (channelMix) {
            const platform = channelMix[channels[index].channelName]?.find(
              (platform) => platform.platform_name === channels[index].name
            );

            if (platform) {
              platform.campaign_start_date = startDate;
              platform.campaign_end_date = endDate;
            }
          }

          setCopy(updatedCampaignFormData);

          console.log("Start Date:", startDate, "End Date:", endDate);

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
      {!disableDrag && parentWidth < 350 && (
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
      {channels?.map((channel, index) => (
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
            onMouseDown={disableDrag ? undefined : handleDragStart(index)}
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
            className={`absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${disableDrag && "hidden"}`}
            style={{
              left: `${channelState[index]?.left || parentLeft}px`,
              backgroundColor: channel.color,
            }}
            onMouseDown={
              disableDrag ? undefined : handleMouseDown(index, "left")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>

          <div
            className={`absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${disableDrag && "hidden"}`}
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
            {!disableDrag && (
              <button
                className="delete-resizeableBar"
                onClick={() =>
                  disableDrag ? undefined : handleDeleteChannel(index)
                }
              >
                <Image src={reddelete || "/placeholder.svg"} alt="reddelete" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResizableChannels;
