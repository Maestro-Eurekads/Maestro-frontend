"use client";
// import ResizeableBar from "../../atoms/drag-timeline/drag-timeline";
import Image, { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import DraggableChannel from "../../../../../components/DraggableChannel";
import whiteplus from "../../../../../public/white-plus.svg";
import ResizableChannels from "./ResizableChannels";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import {
  channels,
  funnels,
  funnelStages,
  getPlatformIcon,
} from "../../../../../components/data";
import AddNewChennelsModel from "../../../../../components/Modals/AddNewChennelsModel";
import { useDateRange } from "src/date-range-context";
import { useCampaigns } from "app/utils/CampaignsContext";

interface OutletType {
  name: string;
  icon: StaticImageData;
  color: string;
  bg: string;
}

const ResizeableElements = () => {
  const { funnelWidths } = useFunnelContext(); // Get width for all channels
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({}); // Track open state per channel
  const [isOpen, setIsOpen] = useState(false);
  const { range } = useDateRange();
  const { campaignFormData } = useCampaigns();
  const [width, setWidth] = useState(300);
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

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {};
    const channelMix = campaignFormData?.channel_mix || [];
    const platformStyles = [
      { name: "Facebook", color: "#0866FF", bg: "#F0F6FF" },
      { name: "Instagram", color: "#C13584", bg: "#FEF1F8" },
      { name: "YouTube", color: "#FF0000", bg: "#FFF0F0" },
      { name: "TheTradeDesk", color: "#0099FA", bg: "#F0F9FF" },
      { name: "Quantcast", color: "#000000", bg: "#F7F7F7" },
      { name: "Google", color: "#4285F4", bg: "#F1F6FE" },
    ];

    if (channelMix && channelMix?.length > 0) {
      channelMix.forEach((stage: any) => {
        const { funnel_stage, search_engines, display_networks, social_media } =
          stage;

        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = [];
        }

        const processPlatforms = (platforms: any[]) => {
          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name)
            if (icon) {
              // Find a matching style or get a random one from platformStyles
              const style =
                platformStyles.find((style) => style.name === platform.platform_name) ||
                platformStyles[Math.floor(Math.random() * platformStyles.length)]
        
              platformsByStage[funnel_stage].push({
                name: platform.platform_name,
                icon,
                color: style.color,
                bg: style.bg,
              })
            }
          })
        }

        // Process search engines
        if (Array.isArray(search_engines)) {
          processPlatforms(search_engines);
        }

        // Process display networks
        if (Array.isArray(display_networks)) {
          processPlatforms(display_networks);
        }

        // Process social media
        if (Array.isArray(social_media)) {
          processPlatforms(social_media);
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
      className="w-full min-h-[494px] relative pb-5 grid-container"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(100% / ${range?.length}) 100%`,
      }}
    >
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = funnels.find((s) => s.description === stageName);
        if (!stage) return null;

        const channelWidth = funnelWidths[stage?.description] || 400;

        const isOpen = openChannels[stage?.description] || false; // Get open state by ID

        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${range?.length}, 1fr)`,
            }}
          >
            <div
              className="flex flex-col mt-6 rounded-[10px] p-4 pl-0 justify-between w-fit"
              style={{
                gridColumnStart: 1,
                gridColumnEnd: 8,
              }}
            >
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
              />

              {isOpen && ( // Only show this if the specific channel is open
                <div>
                  {channelWidth < 400 && (
                    <button
                      className="channel-btn-blue mt-[12px] mb-[12px]"
                      onClick={() => {
                        setIsOpen(true);
                      }}
                    >
                      <Image src={whiteplus} alt="whiteplus" />
                      <p className="whitespace-nowrap">Add new channel</p>
                    </button>
                  )}
                  <ResizableChannels
                    channels={platforms[stage.description]}
                    parentId={stage?.description}
                    dragConstraints={parentRef}
                    parentWidth={channelWidth}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <AddNewChennelsModel isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default ResizeableElements;
