"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isEqual,
  parseISO,
} from "date-fns";

interface OutletType {
  name: string;
  icon: StaticImageData;
  color: string;
  bg: string;
  channelName: string;
  ad_sets: any[];
  format: any[];
  start_date: any;
  end_date: any;
}

const ResizeableElements = ({ funnelData, disableDrag }) => {
  const { funnelWidths } = useFunnelContext(); // Get width for all channels
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({}); // Track open state per channel
  const [isOpen, setIsOpen] = useState(false);
  const { range } = useDateRange();
  const { range: rrange } = useRange();
  const { campaignFormData, loadingCampaign } = useCampaigns();
  const [selectedStage, setSelectedStage] = useState("");
  // console.log("rr", rrange, funnelData);
  // Replace single parentWidth with a map of widths per channel
  const [channelWidths, setChannelWidths] = useState<Record<string, number>>(
    {}
  );
  const [openItems, setOpenItems] = useState(null);

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
                ad_sets: platform.ad_sets,
                format: platform.format,
                start_date: platform?.campaign_start_date,
                end_date: platform?.campaign_end_date,
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
      // console.log("🚀 ~ useEffect ~ containerRect:", containerRect);
      const containerWidth = containerRect.width - 75;
      console.log("🚀 ~ containerWidth:", containerWidth);
      console.log("🚀 ~ containerWidth:", funnelData?.endMonth);
      console.log(
        "🚀 ~ :",
        funnelData?.endMonth ? containerWidth / (funnelData?.endMonth - 1) : 320
      );

      campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.channel_mix?.find(
          (s) => s?.funnel_stage === stageName
        );
        if (stageName) {
          const stageStartDate = stage?.funnel_stage_timeline_start_date
            ? parseISO(stage?.funnel_stage_timeline_start_date)
            : null;
          const stageEndDate = stage?.funnel_stage_timeline_end_date
            ? parseISO(stage?.funnel_stage_timeline_end_date)
            : null;
          const startDateIndex = stageStartDate
            ? range?.findIndex((date) => isEqual(date, stageStartDate)) * 100
            : 0;
          // console.log("🚀 ~ startDateIndex:", {
          //   stageStartDate,
          //   startDateIndex,
          //   range,
          // });
          const daysBetween =
            eachDayOfInterval({
              start: new Date(stage?.funnel_stage_timeline_start_date) || null,
              end: new Date(stage?.funnel_stage_timeline_end_date) || null,
            })?.length - 1;
          const daysFromStart = differenceInCalendarDays(
            stageStartDate,
            campaignFormData?.campaign_timeline_start_date
          );

          // Calculate the week index (1-based)
          const weekIndex = Math.floor(daysFromStart / 7) + 1;
          console.log("fdfd", weekIndex);
          initialWidths[stageName] =
              daysBetween > 0
                ? 100 * daysBetween + 60
                : 360
          initialPositions[stageName] =
            startDateIndex
        }
      });
      setChannelWidths(initialWidths);
      setChannelPositions(initialPositions);
    }
  }, [campaignFormData?.funnel_stages, rrange]);

  return (
    <div
      className="w-full min-h-[494px] relative pb-5 grid-container"
      style={{
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px)`,
      backgroundSize:
        rrange === "Day"
        ? `calc(100px) 100%, calc(700px) 100%` // Every 7th line is darker
        : rrange === "Week"
        ? `calc(${funnelData?.endWeek - 1} * 7) 100%, calc(${funnelData?.endWeek - 1} * 7 * 7) 100%`
        : `calc(${funnelData?.endMonth - 1} * 31) 100%, calc(${funnelData?.endMonth - 1} * 31 * 7) 100%`,
      }}
    >
      {loadingCampaign ? (
      // Skeleton loading UI
      <div className="w-full p-4">
        {[1, 2, 3].map((item) => (
        <div key={item} className="mb-8">
          <Skeleton
          height={60}
          width="100%"
          className="mb-2 rounded-[10px]"
          />
          <div className="pl-4 mt-2">
          {[1, 2].map((channel) => (
            <Skeleton
            key={channel}
            height={40}
            width="90%"
            className="mb-2 rounded-[10px]"
            />
          ))}
          </div>
        </div>
        ))}
      </div>
      ) : (
      // Original content
      campaignFormData?.funnel_stages?.map((stageName, index) => {
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
            ? `repeat(${(funnelData?.endWeek - 1 || 1) * 7}, 100px)` // 7 columns per week
            : `repeat(${(funnelData?.endMonth - 1 || 1) * 31}, 100px)`,
          }}
        >
          <div
          className="flex flex-col mt-6 rounded-[10px] p-4 px-0 justify-between w-fit"
          style={{
            gridColumnStart: 1,
            gridColumnEnd:
            rrange === "Day"
              ? `repeat(${funnelData?.endDay - 1 || 1}, 100px)`
              : rrange === "Week"
              ? `repeat(${(funnelData?.endWeek || 1) * 7}, 100px)` // 7 columns per week
              : `repeat(${funnelData?.endMonth - 1 || 1}, 1fr)`,
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
            setSelectedStage={setSelectedStage}
            disableDrag={disableDrag}
            openItems={openItems}
            setOpenItems={setOpenItems}
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
              setSelectedStage={setSelectedStage}
              disableDrag={disableDrag}
              openItems={openItems}
              setOpenItems={setOpenItems}
            />
            </div>
          )}
          </div>
        </div>
        );
      })
      )}
      <AddNewChennelsModel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      selectedStage={selectedStage}
      />
    </div>
  );
};

export default ResizeableElements;
