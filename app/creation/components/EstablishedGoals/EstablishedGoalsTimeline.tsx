"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { BsFillMegaphoneFill } from "react-icons/bs";
import youtube from "../../../../public/youtube.svg";
import facebook from "../../../../public/facebook.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import instagram from "../../../../public/ig.svg";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";
import { CgInfo } from "react-icons/cg";
import { funnels, getPlatformIcon, platformStyles } from "components/data";
import { useCampaigns } from "app/utils/CampaignsContext";
import DraggableChannel from "components/DraggableChannel";
import { useFunnelContext } from "app/utils/FunnelContextType";
import { useDateRange } from "src/date-range-context";
import ResizableChannels from "../molecules/resizeable-elements/ResizableChannels";

interface OutletType {
  name: string;
  icon: StaticImageData;
  color: string;
  bg: string;
  channelName: string;
}

const EstablishedGoalsTimeline = ({ dateList }) => {
  // Manage state separately for each funnel, section, and platform
  const [expanded, setExpanded] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({}); // Track open state per channel
  const [isOpen, setIsOpen] = useState(false);
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  const [platforms, setPlatforms] = useState({});

  const gridRef = useRef(null);

  // Function to toggle campaign dropdown
  const toggleShow = (index, section, platform) => {
    const key = `${index}-${section}-${platform}`;
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle only the clicked channel
    }));
  };

  // Function to toggle Awareness/Consideration/Conversion dropdowns
  const toggleOpen = (index, section) => {
    setOpenSections((prev) => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`],
    }));
  };

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];

    if (channelMix && channelMix?.length > 0) {
      channelMix.forEach((stage: any) => {
        const { funnel_stage, search_engines, display_networks, social_media } =
          stage;

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
        if (Array.isArray(search_engines)) {
          processPlatforms(search_engines, "search_engines");
        }

        // Process display networks
        if (Array.isArray(display_networks)) {
          processPlatforms(display_networks, "display_networks");
        }

        // Process social media
        if (Array.isArray(social_media)) {
          processPlatforms(social_media, "social_media");
        }
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

  return (
    <div
      className="w-full min-h-[494px] relative pb-5 px-[10px]"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(100% / ${dateList.length}) 100%`,
      }}
    >
      {/* Loop through funnels */}
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
       const stage = funnels.find((s) => s.description === stageName);
	   if (!stage) return null;
	   
	   const isOpen = openChannels[stage?.description] || false; // Get open state by ID
	   
	   
	   // Function to safely parse "yyyy-mm-dd" to timestamp, defaulting to grid range
	   const parseDate = (dateString, defaultValue) => {
		 if (!dateString) return defaultValue;
     const [year, month, day] = typeof dateString === 'string' ? dateString.split("-").map(Number) : [null, null, null];
		 return Date.UTC(year, month - 1, day); // Ensure correct month indexing
	   };
	   
	   // Get grid start and end timestamps
	   const gridStart = parseDate(dateList[0], null);
	   const gridEnd = parseDate(dateList[dateList.length - 1], null);
	   
	   // If gridStart or gridEnd is still null, return (avoid errors)
	   if (!gridStart || !gridEnd) return null;

	//    Budget
	   const budget = campaignFormData?.channel_mix?.find((ch)=>ch?.funnel_stage === stage.description)?.stage_budget?.fixed_value
	   
	   // Find stage-specific start & end dates, defaulting to gridStart/gridEnd if missing
	   const funnel_start_date = campaignFormData?.channel_mix?.find(
		 (ch) => ch?.funnel_stage === stage.description
	   )?.funnel_stage_timeline_start_date;
	   
	   const funnel_end_date = campaignFormData?.channel_mix?.find(
		 (ch) => ch?.funnel_stage === stage.description
	   )?.funnel_stage_timeline_end_date;
	   
	   // Use provided dates or fallback to full grid range
	   const stageStart = parseDate(funnel_start_date, gridStart);
	   const stageEnd = parseDate(funnel_end_date, gridEnd);
	   
	   const totalDuration = gridEnd - gridStart; // Total grid time range
	   const eventDuration = stageEnd - stageStart; // Stage duration
	   
	   // Calculate `parentWidth` (scaled to grid width)
	   const gridWidth = 800; // Example grid width, update dynamically
	   const parentWidth = (eventDuration / totalDuration) * gridWidth;
	   const parentLeft = ((stageStart - gridStart) / totalDuration) * gridWidth;
	   
        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
            }}
          >
            <div
              className="mt-6"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 8,
              }}
            >
              {/* Expanded section */}

              <DraggableChannel
                id={stage?.description} // Use description as ID
                openChannel={isOpen} // Pass specific open state
                bg={stage?.bg}
                description={stage?.description}
                setIsOpen={setIsOpen}
                setOpenChannel={() => toggleChannel(stage?.description)} // Toggle only this channel
                Icon={stage?.Icon}
                dateList={range}
                dragConstraints={gridRef}
                disableDrag={true}
                parentWidth={parentWidth} // Use channel-specific width
                // setParentWidth={(width) =>
                //   updateChannelWidth(stage?.description, width)
                // }
                parentLeft={parentLeft}
                // setParentLeft={(left) =>
                //   updateChannelPosition(stage?.description, left)
                // }
				budget={budget}
              />
              {isOpen && ( // Only show this if the specific channel is open
                <div>
                  <ResizableChannels
                    channels={platforms[stage.description]}
                    parentId={stage?.description}
                    parentWidth={parentWidth} // Use channel-specific width
                    parentLeft={parentLeft} // Pass parent's left position
                    setIsOpen={setIsOpen}
                    dateList={range}
                    disableDrag={true}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EstablishedGoalsTimeline;
