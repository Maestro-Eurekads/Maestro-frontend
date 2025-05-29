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
  const { funnelWidths } = useFunnelContext();
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const { range } = useDateRange();
  const { range: rrange } = useRange();
  const { campaignFormData, loadingCampaign } = useCampaigns();
  const [selectedStage, setSelectedStage] = useState("");
  const [channelWidths, setChannelWidths] = useState<Record<string, number>>(
    {}
  );
  const [containerWidth, setContainerWidth] = useState(null);
  const [openItems, setOpenItems] = useState(null);
  const [channelPositions, setChannelPositions] = useState<
    Record<string, number>
  >({});
  const [platforms, setPlatforms] = useState({});
  const gridRef = useRef(null);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [parentBounds, setParentBounds] = useState({ left: 0, right: 0 });

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateChannelWidth = (channelId: string, width: number) => {
    setChannelWidths((prev) => ({ ...prev, [channelId]: width }));
  };

  const updateChannelPosition = (channelId: string, left: number) => {
    setChannelPositions((prev) => ({ ...prev, [channelId]: left }));
  };

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];

    if (channelMix.length > 0) {
      channelMix.forEach((stage: any) => {
        const { funnel_stage } = stage;
        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = [];
        }

        const processPlatforms = (platforms: any[], channelName: string) => {
          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name);
            if (icon) {
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

        [
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
        ].forEach((channel) => {
          if (Array.isArray(stage[channel])) {
            // console.log("🚀 ~ ].forEach ~ stage:", stage)
            processPlatforms(stage[channel], channel);
          }
        });
      });
    }

    return platformsByStage;
  }, [campaignFormData]);

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const data = getPlatformsFromStage();
      setPlatforms(data);
    }
  }, [campaignFormData]);

  // useEffect(() => {
  //   setChannelWidths({});
  //   setChannelPositions({});
  // }, [rrange]);

  useEffect(() => {
    if (rrange) {
      requestAnimationFrame(() => {
        const gridContainer = document.querySelector(
          ".grid-container"
        ) as HTMLElement;
        if (!gridContainer) return;
        const containerRect = gridContainer.getBoundingClientRect();
        const contWidth = containerRect.width - 75;
        setContainerWidth(contWidth + 75);
      });
    }
  }, [rrange]);

  useEffect(() => {
    console.log("here");
    if (campaignFormData?.funnel_stages && containerWidth) {
      console.log("here1");
      const initialWidths: Record<string, number> = {};
      const initialPositions: Record<string, number> = {};
      const contWidth = containerWidth - 75;

      campaignFormData.funnel_stages.forEach((stageName) => {
        const stage = campaignFormData?.channel_mix?.find(
          (s) => s?.funnel_stage === stageName
        );
        if (stageName && stage) {
          const stageStartDate = stage?.funnel_stage_timeline_start_date
            ? parseISO(stage?.funnel_stage_timeline_start_date)
            : null;
          const stageEndDate = stage?.funnel_stage_timeline_end_date
            ? parseISO(stage?.funnel_stage_timeline_end_date)
            : null;
          console.log({ stageStartDate, stageEndDate });
          const startDateIndex = stageStartDate
          ? range?.findIndex((date) => isEqual(date, stageStartDate)) *
            (rrange === "Day"
              ? 50
              : rrange === "Week"
              ? 50
              : Math.floor(containerWidth / funnelData?.endMonth / 31))
          : 0;
          const daysBetween =
            eachDayOfInterval({ start: stageStartDate, end: stageEndDate })
              .length - 1;
          console.log("daysBetween", daysBetween);
          const daysFromStart = differenceInCalendarDays(
            stageStartDate,
            campaignFormData?.campaign_timeline_start_date
          );
          const weekIndex = Math.floor(daysFromStart / 7) + 1;

          initialWidths[stageName] = (() => {
            if (rrange === "Day") {
              return daysBetween > 0 ? 50 * daysBetween + 10 : 310;
            } else if (rrange === "Week") {
              return daysBetween > 0 ? 50 * daysBetween + 10 : 310;
            } else {
              const endMonth = funnelData?.endMonth || 1;
              let monthBaseWidth;
              if (endMonth === 1) {
                monthBaseWidth = contWidth;
              } else if (endMonth > 1) {
                monthBaseWidth = contWidth / endMonth;
              }
              return daysBetween > 0
                ? Math.round(monthBaseWidth / 31) * daysBetween - 18
                : 50;
            }
          })();

          initialPositions[stageName] = startDateIndex;
        }
      });
      console.log("initialWidths", initialWidths);
      setChannelWidths(initialWidths);
      setChannelPositions(initialPositions);
    }
  }, [campaignFormData?.funnel_stages, containerWidth]);

  return (
    <div
      className="w-full min-h-[494px] relative pb-5 grid-container"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px)`,
        backgroundSize:
          rrange === "Day"
            ? `calc(50px) 100%, calc(350px) 100%`
            : rrange === "Week"
            ? `calc(50px) 100%, calc(350px) 100%`
            : (function () {
                const gridContainer = document.querySelector(
                  ".grid-container"
                ) as HTMLElement;
                if (!gridContainer) return;
                const endMonth = funnelData?.endMonth || 1;
                const containerRect = gridContainer.getBoundingClientRect();
                const contWidth = containerRect.width; // subtract margin/padding if needed

                const percent = 100 / endMonth; // e.g., 20 if endMonth=5
                const total = (percent / 100) * contWidth; // target total width in px for all days (31 days)

                const dailyWidth = contWidth / (endMonth * 31); // width per day without factor
                const totalLines = dailyWidth * 31; // total width for 31 days without factor

                const diff = total - totalLines; // difference to adjust

                // Calculate factor to scale dailyWidth to reach 'total'
                const factor = total / totalLines; // e.g., if total=500 and totalLines=400, factor=1.25

                console.log("🚀 ~ ResizeableElements ~ factor:", factor);
                const adjustedDailyWidth = dailyWidth * factor;

                return `calc(${adjustedDailyWidth}px) 100%, calc(${
                  adjustedDailyWidth * 31
                }px) 100%`;
              })(),
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
                    ? `repeat(${funnelData?.endDay - 1 || 1}, 50px)`
                    : rrange === "Week"
                    ? `repeat(${(funnelData?.endWeek - 1 || 1) * 7}, 50px)` // 7 columns per week
                    : (function () {
                        const endMonth = funnelData?.endMonth || 1;
                        if (endMonth === 1) return `1fr`;
                        if (endMonth > 1)
                          return `repeat(${endMonth}, ${100 / endMonth}%)`;
                        return `repeat(${endMonth}, ${100 / endMonth}%)`;
                      })(),
              }}
            >
              <div
                className="flex flex-col mt-6 rounded-[10px] p-4 px-0 justify-between w-fit"
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd:
                    rrange === "Day"
                      ? `repeat(${funnelData?.endDay - 1 || 1}, 50px)`
                      : rrange === "Week"
                      ? `repeat(${(funnelData?.endWeek - 1 || 1) * 7}, 50px)` // 7 columns per week
                      : (function () {
                          const endMonth = funnelData?.endMonth || 1;
                          if (endMonth === 1) return `1fr`;
                          if (endMonth > 1)
                            return `repeat(${endMonth}, ${100 / endMonth}%)`;
                          return `repeat(${endMonth}, ${100 / endMonth}%)`;
                        })(),
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
                  endMonth={funnelData?.endMonth}
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
                      endMonth={funnelData?.endMonth}
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
