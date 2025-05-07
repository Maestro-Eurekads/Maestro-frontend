"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import DraggableChannel from "../../../../../components/DraggableChannel";
import whiteplus from "../../../../../public/white-plus.svg";
import ResizableChannels from "./ResizableChannels";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import {
  funnels,
  funnelStages,
  getPlatformIcon,
  platformStyles,
} from "../../../../../components/data";
import AddNewChennelsModel from "../../../../../components/Modals/AddNewChennelsModel";
import { useDateRange } from "src/date-range-context";
import { useDateRange as useRange } from "src/date-context";
import { useCampaigns } from "app/utils/CampaignsContext";

interface OutletType {
  name: string;
  icon: StaticImageData;
  color: string;
  bg: string;
  channelName: string;
}

const ResizeableElements = ({ funnelData }) => {
  const { funnelWidths } = useFunnelContext(); // Get width for all channels
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({}); // Track open state per channel
  const [isOpen, setIsOpen] = useState(false);
  const { range } = useDateRange();
  const { range: rrange } = useRange();
  const { campaignFormData } = useCampaigns();
  // console.log("rr", rrange, funnelData);
  // Replace single parentWidth with a map of widths per channel
  const [channelWidths, setChannelWidths] = useState<Record<string, number>>(
    {}
  );

  // Track left position for each channel
  const [channelPositions, setChannelPositions] = useState<
    Record<string, number>
  >({});

  const [platforms, setPlatforms] = useState({});

  const gridRef = useRef(null); // Create a reference for the grid container
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [parentBounds, setParentBounds] = useState<{
    left: number;
    right: number;
  }>({
    left: 0,
    right: 0,
  });

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle only the clicked channel
    }));
  };

  // Function to update width for a specific channel
  const updateChannelWidth = (channelId: string, width: number) => {
    setChannelWidths((prev) => ({
      ...prev,
      [channelId]: width,
    }));
  };

  // Function to update position for a specific channel
  const updateChannelPosition = (channelId: string, left: number) => {
    setChannelPositions((prev) => ({
      ...prev,
      [channelId]: left,
    }));
  };

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];

    if (channelMix && channelMix?.length > 0) {
      channelMix.forEach((stage: any) => {
        const {
          funnel_stage,
          search_engines,
          display_networks,
          social_media,
          streaming,
          ooh,
          broadcast,
          messaging,
          print,
          e_commerce,
          in_game,
          mobile,
        } = stage;

        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = [];
        }

        const processPlatforms = (platforms: any[], channelName: string) => {
          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name);
            if (icon) {
              // Find a matching style or get a random one from platformStyles
              const style =
                platformStyles.find(
                  (style) => style.name === platform.platform_name
                ) ||
                platformStyles[
                  Math.floor(Math.random() * platformStyles.length)
                ];

              platformsByStage[funnel_stage].push({
                name: platform.platform_name,
                icon,
                color: style.color,
                bg: style.bg,
                channelName,
              });
            }
          });
        };

        // Process search engines
        const channels = [
          "social_media",
          "display_networks",
          "search_engines",
          "streaming",
          "ooh",
          "broadcast",
          "messaging",
          "print",
          "e_commerce",
          "in_game",
          "mobile",
        ];

        channels.forEach((channel) => {
          if (Array.isArray(stage[channel])) {
            processPlatforms(stage[channel], channel);
          }
        });
      });
    }

    return platformsByStage;
  }, [campaignFormData]);

  useEffect(() => {
    if (campaignFormData) {
      if (campaignFormData?.channel_mix) {
        const data = getPlatformsFromStage();
        setPlatforms(data);
      }
    }
  }, [campaignFormData, getPlatformsFromStage]);

  // Initialize default widths and positions for each channel
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const initialWidths: Record<string, number> = {};
      const initialPositions: Record<string, number> = {};
      const gridContainer = document.querySelector(
        ".grid-container"
      ) as HTMLElement;
      if (!gridContainer) return;

      // Get container boundaries
      const containerRect = gridContainer.getBoundingClientRect();
      const containerWidth = containerRect.width -75;
      console.log("🚀 ~ useEffect ~ containerWidth:", containerWidth);

      campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s?.name === stageName
        );
        if (stage) {
          initialWidths[stage.name] =
            rrange === "Day"
              ? 360
              : rrange === "Week"
              ? containerWidth / (funnelData?.endWeek - 1)
              : containerWidth / funnelData?.endMonth; // Default width
          initialPositions[stage.name] = 0; // Default left position
        }
      });
      console.log("intitial width", initialWidths);
      setChannelWidths(initialWidths);
      setChannelPositions(initialPositions);
    }
  }, [campaignFormData?.funnel_stages, rrange]);

  return (
    <div
      className="w-full min-h-[494px] relative pb-5 grid-container"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize:
          rrange === "Day"
            ? `calc(100px) 100%`
            : rrange === "Week"
            ? `calc(100% / ${funnelData?.endWeek - 1}) 100%`
            : `calc(100% / ${funnelData?.endMonth - 1}) 100%`,
      }}
    >
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s?.name === stageName
        );
        const funn = funnelStages?.find((ff) => ff?.name === stageName);
        if (!stage) return null;
        // console.log(stage);
        const channelWidth = funnelWidths[stage?.name] || 400;
        const isOpen = openChannels[stage?.name] || false; // Get open state by ID

        // Get the specific width and position for this channel or use default
        const currentChannelWidth = channelWidths[stage?.name] || 350;
        const currentChannelPosition = channelPositions[stage?.name] || 0;

        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns:
                rrange === "Day"
                  ? `repeat(${funnelData?.endDay - 1 || 1}, 100px)`
                  : rrange === "Week"
                  ? `repeat(${funnelData?.endWeek - 1 || 1}, 100%)`
                  : `repeat(${funnelData?.endMonth - 1 || 1}, 1fr)`,
            }}
          >
            <div
              className="flex flex-col mt-6 rounded-[10px] p-4 px-0 justify-between w-fit"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 8,
              }}
            >
              <DraggableChannel
                id={stage?.name} // Use description as ID
                openChannel={isOpen} // Pass specific open state
                bg={stage?.color?.split("-")[1]}
                description={stage?.name}
                setIsOpen={setIsOpen}
                setOpenChannel={() => toggleChannel(stage?.name)} // Toggle only this channel
                Icon={stage?.activeIcon}
                dateList={range}
                dragConstraints={gridRef}
                parentWidth={currentChannelWidth} // Use channel-specific width
                setParentWidth={(width) =>
                  updateChannelWidth(stage?.name, width)
                } // Update only this channel's width
                // Add props to track and update position
                parentLeft={currentChannelPosition}
                setParentLeft={(left) =>
                  updateChannelPosition(stage?.name, left)
                }
              />

              {isOpen && ( // Only show this if the specific channel is open
                <div>
                  <ResizableChannels
                    channels={platforms[stage.name]}
                    parentId={stage?.name}
                    parentWidth={currentChannelWidth} // Use channel-specific width
                    parentLeft={currentChannelPosition} // Pass parent's left position
                    setIsOpen={setIsOpen}
                    dateList={range}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <AddNewChennelsModel
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setPlatforms={setPlatforms}
      />
    </div>
  );
};

export default ResizeableElements;
