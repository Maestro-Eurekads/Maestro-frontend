"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "src/date-range-context";
import DraggableChannel from "components/DraggableChannel";
import ResizableChannels from "../molecules/resizeable-elements/ResizableChannels";
import { funnels, getPlatformIcon, platformStyles } from "components/data";
import { addDays, eachDayOfInterval } from "date-fns";

interface OutletType {
  name: string;
  icon: any; // Using any instead of StaticImageData for simplicity
  color: string;
  bg: string;
  channelName: string;
}

interface PlatformsByStage {
  [key: string]: OutletType[];
}

const EstablishedGoalsTimeline = ({}) => {
  // State management
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformsByStage>({});

  // Context hooks
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();


  // Refs
  const gridRef = useRef(null);

  // Toggle channel open/closed state
  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Process platforms from campaign data
  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: PlatformsByStage = {};
    const channelMix = campaignFormData?.channel_mix || [];

    channelMix &&
      channelMix?.length > 0 &&
      channelMix.forEach((stage: any) => {
        const { funnel_stage, search_engines, display_networks, social_media } =
          stage;

        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = [];
        }

        const processPlatforms = (platforms: any[], channelName: string) => {
          if (!Array.isArray(platforms)) return;

          platforms.forEach((platform: any) => {
            const icon = getPlatformIcon(platform?.platform_name);
            if (!icon) return;

            // Find matching style or get a random one
            const style =
              platformStyles.find(
                (style) => style.name === platform.platform_name
              ) ||
              platformStyles[Math.floor(Math.random() * platformStyles.length)];

            platformsByStage[funnel_stage].push({
              name: platform.platform_name,
              icon,
              color: style.color,
              bg: style.bg,
              channelName,
            });
          });
        };

        // Process each channel type
        processPlatforms(search_engines, "search_engines");
        processPlatforms(display_networks, "display_networks");
        processPlatforms(social_media, "social_media");
      });

    return platformsByStage;
  }, [campaignFormData]);

  // Update platforms when campaign data changes
  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      const data = getPlatformsFromStage();
      setPlatforms(data);
    }
  }, [campaignFormData, getPlatformsFromStage]);

  // Helper function to parse dates safely
  const parseDate = (dateString, defaultValue) => {
    if (!dateString) return defaultValue;
    const [year, month, day] =
      typeof dateString === "string"
        ? dateString.split("-").map(Number)
        : [null, null, null];
    return Date.UTC(year, month - 1, day);
  };

  // Get grid start and end timestamps
  const gridStart = parseDate(range[0], null);
  const gridEnd = parseDate(range[range.length - 1], null);
  const totalDuration = gridEnd - gridStart;

  return (
    <div
      className="w-full min-h-[494px] relative pb-5 px-[10px]"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(100% / ${range.length}) 100%`,
      }}
    >
      {/* Loop through funnel stages */}
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = funnels.find((s) => s.description === stageName);
        if (!stage) return null;

        const isChannelOpen = openChannels[stage.description] || false;

        // Find stage data in channel mix
        const stageData = campaignFormData?.channel_mix?.find(
          (ch) => ch?.funnel_stage === stage.description
        );

        if (!stageData) return null;

        // Get budget
        const budget = stageData?.stage_budget?.fixed_value;

        // Get stage timeline dates
        const funnel_start_date = new Date(stageData?.funnel_stage_timeline_start_date ?? campaignFormData?.campaign_timeline_start_date);
        const funnel_end_date = new Date(stageData?.funnel_stage_timeline_end_date ?? campaignFormData?.campaign_timeline_start_date);
		const differenceInDays = Math.ceil(
			(funnel_end_date?.getTime() - funnel_start_date?.getTime()) / (1000 * 60 * 60 * 24)
		  );

		const dateList = eachDayOfInterval({
			start:
			  new Date(funnel_start_date) ||
			  new Date(),
			end:
			  addDays(
				new Date(funnel_end_date),
				differenceInDays
			  ) || addDays(new Date(), 13),
		  });

        console.log({ funnel_start_date, funnel_end_date });

        // Calculate position and width
        const stageStart = parseDate(funnel_start_date, gridStart);
        const stageEnd = parseDate(funnel_end_date, gridEnd);

		console.log({ stageStart, stageEnd });

        if (!gridStart || !gridEnd || !stageStart || !stageEnd) return null;

        const eventDuration = stageEnd - stageStart;
        const gridWidth = 800; // Example grid width, should be dynamic in production
        const parentWidth = (eventDuration / totalDuration) * gridWidth;
        const parentLeft =
          ((stageStart - gridStart) / totalDuration) * gridWidth;

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
              <DraggableChannel
                id={stage.description}
                openChannel={isChannelOpen}
                bg={stage.bg}
                description={stage.description}
                setIsOpen={setIsOpen}
                setOpenChannel={() => toggleChannel(stage.description)}
                Icon={stage.Icon}
                dateList={dateList}
                dragConstraints={gridRef}
                disableDrag={true}
                parentWidth={parentWidth}
                parentLeft={parentLeft}
                budget={budget}
              />

              {isChannelOpen && (
                <div>
                  <ResizableChannels
                    channels={platforms[stage.description] || []}
                    parentId={stage.description}
                    parentWidth={parentWidth}
                    parentLeft={parentLeft}
                    setIsOpen={setIsOpen}
                    dateList={dateList}
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
