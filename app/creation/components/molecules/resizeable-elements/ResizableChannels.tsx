"use client";
import React, { useState, useEffect, useRef } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import whiteplus from "../../../../../public/white-plus.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import { eachDayOfInterval } from "date-fns";
import moment from "moment";
import { getCurrencySymbol, renderUploadedFile } from "components/data";
import arrowUp from "../../../../../public/arrow-g-up.svg";
import arrowDown from "../../../../../public/arrow-g-down.svg";
import axios from "axios";
import { removeKeysRecursively } from "utils/removeID";
import Modal from "components/Modals/Modal";
import AdSetsFlow from "../../../components/common/AdSetsFlow";

interface Channel {
  name: string;
  channelName: string;
  icon: string;
  bg: string;
  color: string;
  ad_sets?: any[];
  format?: any[];
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

const DEFAULT_MEDIA_OPTIONS = [
  { name: "Carousel", icon: "/carousel.svg" },
  { name: "Image", icon: "/Image_format.svg" },
  { name: "Video", icon: "/video_format.svg" },
  { name: "Slideshow", icon: "/slideshow_format.svg" },
  { name: "Collection", icon: "/collection_format.svg" },
];

const ResizableChannels = ({
  channels: initialChannels,
  parentId,
  parentWidth,
  parentLeft,
  setIsOpen,
  dateList,
  disableDrag = false,
}: ResizableChannelsProps) => {
  const { campaignFormData, setCampaignFormData, setCopy, cId } =
    useCampaigns();
  const { funnelWidths } = useFunnelContext(); // Get parent widths
  const draggingDataRef = useRef(null);
  const isDraggingRef = useRef(false);

  const [channels, setChannels] = useState(initialChannels);

  const [openItems, setOpenItems] = useState(null);
  const [openCreatives, setOpenCreatives] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [openAdset, setOpenAdset] = useState(false);

  // Initialize child width based on available parent space and position
  const [channelState, setChannelState] = useState(
    channels?.map(() => ({
      left: parentLeft, // Start at parent's left position
      width: Math.min(160, parentWidth),
    }))
  );

  const [dragging, setDragging] = useState(null);

  const [draggingPosition, setDraggingPosition] = useState(null);

  const toggleChannel = (id) => {
    setOpenItems((prev) => (prev === id ? null : id));
  };

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

  const dRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const pixelToDate = (pixel, containerWidth, index, fieldName) => {
    const totalDays = dRange?.length - 1;

    const dayIndex = Math.min(
      totalDays,
      Math.max(0, Math.round((pixel / containerWidth) * totalDays))
    );

    const calculatedDate = new Date(startDate);
    calculatedDate.setDate(startDate?.getDate() + dayIndex);

    const updatedCampaignFormData = { ...campaignFormData };

    const channelMix = updatedCampaignFormData.channel_mix.find(
      (ch) => ch.funnel_stage === parentId
    );

    if (channelMix) {
      const platform = channelMix[channels[index].channelName]?.find(
        (platform) => platform.platform_name === channels[index].name
      );

      if (platform) {
        if (fieldName === "startDate") {
          platform.campaign_start_date = calculatedDate
            ? moment(calculatedDate).format("YYYY-MM-DD")
            : null;
        } else {
          platform.campaign_end_date = calculatedDate
            ? moment(calculatedDate).format("YYYY-MM-DD")
            : null;
        }
      }
    }

    // Convert the result back to "yyyy-mm-dd" format
    return calculatedDate ? moment(calculatedDate).format("YYYY-MM-DD") : null;
  };

  const handleDragStart = (index) => (event) => {
    if (disableDrag) return;
    setOpenItems(null)
    event.preventDefault();
    setDraggingPosition({
      index,
      startX: event.clientX,
      startLeft: channelState[index]?.left || parentLeft,
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
      const startDate = pixelToDate(
        startPixel,
        parentWidth,
        index,
        "startDate"
      );
      const endDate = pixelToDate(endPixel, parentWidth, index, "endDate");

      draggingDataRef.current = { index };
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
    setOpenItems(null)
    setDragging({ index, direction, startX: event.clientX });
  };

  const handleDeleteChannel = async (indexToDelete) => {
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

      // Call the API with the updated data
      sendUpdatedDataToAPI(updatedData);

      return updatedData;
    });
  };

  const sendUpdatedDataToAPI = async (updatedData) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            ...removeKeysRecursively(updatedData, [
              "id",
              "documentId",
              "createdAt",
              "publishedAt",
              "updatedAt",
            ]),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Campaign data updated successfully", response.data);
    } catch (error) {
      console.error("Error updating campaign data:", error);
    }
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
      setChannelState((prev) => {
        const newState = initialChannels.map((channel, index) => {
          // Check if this channel already exists in prev
          const existingState = prev[index];
          return existingState
            ? {
                ...existingState,
                // Update left position to match parent when it moves
                left: parentLeft,
              }
            : {
                left: parentLeft,
                width: Math.min(150, parentWidth), // Default width for new channels
              };
        });
        return newState;
      });
    }
  }, [initialChannels, parentLeft, parentWidth]);

  useEffect(() => {
    if (!dragging) return;

    const totalDays = dateList.length - 1; // Define totalDays within the scope

    const handleMouseMove = (event) => {
      event.preventDefault();
      const { index, direction, startX } = dragging;
      const deltaX = event.clientX - startX;

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
          const endPixel = startPixel - 1 + newWidth;

          // Convert pixel positions to dates
          const startDate = pixelToDate(
            startPixel,
            parentWidth,
            index,
            "startDate"
          );
          const endDate = pixelToDate(
            endPixel - parentWidth / totalDays,
            parentWidth,
            index,
            "endDate"
          );

          // setCopy(updatedCampaignFormData);

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
    <div
      className={`open_channel_btn_container ${disableDrag && "grid"}`}
      style={{
        gridTemplateColumns: `repeat(${dRange.length}, 1fr)`,
      }}
    >
      {!disableDrag && parentWidth < 350 && (
        <button
          className="channel-btn-blue mt-[12px] mb-[12px] relative w-fit"
          onClick={() => {
            setIsOpen(true);
          }}
          style={{
            left: `${parentLeft}px`,
          }}
        >
          <Image src={whiteplus || "/placeholder.svg"} alt="whiteplus" />
          <p className="whitespace-nowrap">Add channel</p>
        </button>
      )}
      {channels?.map((channel, index) => {
        const getColumnIndex = (date) =>
          dRange.findIndex((d) => d.toISOString().split("T")[0] === date);

        const updatedCampaignFormData = { ...campaignFormData };
        const channelMix = updatedCampaignFormData.channel_mix.find(
          (ch) => ch.funnel_stage === parentId
        );
        let startColumn = 1;
        let endColumn = 3;
        let budget;
        if (channelMix) {
          const platform = channelMix[channels[index].channelName]?.find(
            (platform) => platform.platform_name === channels[index].name
          );

          if (platform) {
            startColumn = getColumnIndex(platform?.campaign_start_date);
            endColumn = getColumnIndex(platform?.campaign_end_date) + 1;
            budget = platform?.budget?.fixed_value;
          }
        }

        return (
          <div
            key={channel.name}
            className={`relative w-full ${!disableDrag ? "h-12" : ""}`}
            style={{
              gridColumnStart: startColumn < 1 ? 1 : startColumn,
              gridColumnEnd: endColumn < 1 ? 1 : endColumn,
            }}
          >
            <div>
              <div
                className={` ${
                  disableDrag ? "relative" : "absolute"
                } top-0 h-full flex ${
                  disableDrag ? "justify-between" : "justify-center cursor-move"
                }  items-center text-white px-4 gap-2 border shadow-md min-w-[150px] overflow-x-hidden `}
                style={{
                  left: `${channelState[index]?.left || parentLeft}px`,
                  width: disableDrag
                    ? "100%"
                    : `${channelState[index]?.width + 30 || 150}px`,
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
                    width={20}
                    height={20}
                  />
                  <span className="font-medium whitespace-nowrap">
                    {channel.name}
                  </span>
                </div>
                {disableDrag && (
                  <div
                    className="rounded-[5px] py-[10px] px-[12px] font-medium bg-opacity-15 text-[15px]"
                    style={{
                      color: "#061237",
                    }}
                  >
                    {Number(budget)?.toFixed(0)}
                    {Number(budget) > 0 &&
                      getCurrencySymbol(
                        campaignFormData?.campaign_budget?.amount
                      )}
                  </div>
                )}
              </div>
            </div>
            {/* Controls */}
            {!disableDrag && (
              <>
                <div
                  className={`absolute top-0 w-5 h-full cursor-ew-resize rounded-l-lg text-white flex items-center justify-center ${
                    disableDrag && "hidden"
                  }`}
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
                  className={`absolute top-0 w-5 h-full cursor-ew-resize rounded-r-lg text-white flex items-center justify-center ${
                    disableDrag && "hidden"
                  }`}
                  style={{
                    left: `${
                      (channelState[index]?.left || parentLeft) +
                      (channelState[index]?.width + 22 || 150)
                    }px`,
                    backgroundColor: channel.color,
                  }}
                  onMouseDown={handleMouseDown(index, "right")}
                >
                  <MdDragHandle className="rotate-90" />
                  {channel?.ad_sets?.length > 0 && (
                    <div className="relative">
                      <div
                        className="absolute top-[-30px] right-[-180px] bg-[#EBFEF4] py-[10px] px-[12px] w-fit mt-[5px] border border-[#00A36C1A] rounded-[8px] flex items-center cursor-pointer"
                        onClick={() => {
                          toggleChannel(`${channel?.name}${index}`);
                          setSelectedCreative(channel?.format);
                        }}
                      >
                        <p className="text-[14px] font-medium text-[#00A36C]">
                          {channel?.ad_sets?.length} ad sets
                        </p>
                        <Image
                          src={
                            openItems &&
                            openItems === `${channel?.name}${index}`
                              ? arrowUp
                              : arrowDown
                          }
                          alt=""
                          width={24}
                          height={24}
                        />
                      </div>
                      {openItems &&
                        openItems === `${channel?.name}${index}` && (
                          <div className=" min-w-[500px] shrink-0 absolute top-[30px] bg-white z-20 left-[70px] rounded-md border shadow-md">
                            <table className="table-auto w-full text-left text-[12px] text-[#061237B2] font-medium border-none hover:cursor-default">
                              <thead className="bg-transparent">
                                <tr>
                                  <th className="px-4 py-2">#</th>
                                  <th className="px-4 py-2">Audience Type</th>
                                  <th className="px-4 py-2">Name</th>
                                  <th className="px-4 py-2 whitespace-nowrap">
                                    Audience size
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {channel?.ad_sets?.map((set, index) => (
                                  <React.Fragment key={index}>
                                    <tr className="border-none">
                                      <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                        Ad Set No.{index + 1}.
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap border-none">
                                        {set?.audience_type}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap border-none">
                                        {set?.name}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap border-none">
                                        {set?.size}
                                      </td>
                                    </tr>
                                    {set?.extra_audiences?.map(
                                      (extra, extraIndex) => (
                                        <tr
                                          key={`${index}-${extraIndex}`}
                                          className="border-none"
                                        >
                                          <td className="px-4 py-2 text-[#3175FF] font-bold whitespace-nowrap border-none">
                                            <div className="l-shape-container-ad">
                                              <div
                                                className={`absolute w-[1px] ${
                                                  extraIndex > 0
                                                    ? "h-[35px] top-[-35px]"
                                                    : "h-[20px] top-[-20px]"
                                                } bg-blue-500 left-[60px] `}
                                              ></div>
                                              <div
                                                className={`absolute w-[60px] h-[1px] bg-blue-500 bottom-[-1px] left-[60px]`}
                                              ></div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap border-none">
                                            {extra?.audience_type}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap border-none">
                                            {extra?.name}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap border-none">
                                            {extra?.size}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </table>
                            <div className="p-2 mt-2 flex justify-between items-center">
                              {/* {channel?.} */}
                              <button
                                className="bg-blue-500 text-white p-2 rounded-md"
                                onClick={() => setOpenCreatives(true)}
                              >
                                View Creatives
                              </button>
                              <button
                                className="bg-blue-500 text-white p-2 rounded-md"
                                onClick={() => setOpenAdset(true)}
                              >
                                Add Adsets
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                  {!disableDrag && (
                    <button
                      className="delete-resizeableBar"
                      onClick={() =>
                        disableDrag ? undefined : handleDeleteChannel(index)
                      }
                    >
                      <Image
                        src={reddelete || "/placeholder.svg"}
                        alt="reddelete"
                      />
                    </button>
                  )}
                  {/* Adset_display */}
                </div>
              </>
            )}
            {/* Ad sets */}
          </div>
        );
      })}
      <Modal isOpen={openCreatives} onClose={() => setOpenCreatives(false)}>
        <div className="bg-white w-[900px] p-2 rounded-lg">
          <button
            className="flex justify-end w-fit ml-auto"
            onClick={() => setOpenCreatives(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                stroke="#717680"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex gap-5 overflow-x-auto">
            {selectedCreative
              ?.filter((cre) => cre?.previews?.length > 0)
              ?.map((format, index) => {
                const option = DEFAULT_MEDIA_OPTIONS?.find(
                  (opt) => opt?.name === format?.format_type
                );
                return (
                  <div key={index} className="shrink-0">
                    <div
                      // onClick={onSelect}
                      className={`relative text-center p-2 rounded-lg border transition border-blue-500 shadow-lg cursor-pointer w-fit`}
                    >
                      <Image
                        src={option.icon || "/placeholder.svg"}
                        width={168}
                        height={132}
                        alt={option.name}
                      />
                      <p className="text-sm font-medium text-gray-700 mt-2">
                        {option.name}
                      </p>
                    </div>
                    <div className="flex max-w-[500px] flex-wrap gap-2 mt-3">
                      {format?.previews?.map((prec, pIndex) => (
                        <div className="w-[168px] h-[150px] border rounded-md">
                          {renderUploadedFile(
                            format?.previews?.map((pre) => pre?.url),
                            format?.format_type,
                            pIndex
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </Modal>
      <Modal isOpen={openAdset} onClose={() => setOpenAdset(false)}>
        <div className="bg-white w-[900px] p-2 rounded-lg">
          <button
            className="flex justify-end w-fit ml-auto"
            onClick={() => setOpenAdset(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                stroke="#717680"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <AdSetsFlow
            stageName={parentId}
            // onEditStart={() => resetInteraction(stage.name)}
            platformName="Facebook"
          />
          <div className="w-fit ml-auto">
            <button
              className="bg-blue-500 text-white rounded-md p-2"
              onClick={() => setOpenAdset(false)}
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResizableChannels;
