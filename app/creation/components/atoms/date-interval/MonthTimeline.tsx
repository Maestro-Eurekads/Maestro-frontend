import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { isEqual, parseISO } from "date-fns";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
import moment from "moment";

interface MonthTimelineProps {
  monthsCount: number;
  funnels: any[];
  range?: any;
}

const MonthTimeline: React.FC<MonthTimelineProps> = ({
  monthsCount,
  funnels,
  range,
}) => {
  const monthWidth = 120; // Fixed width for each month in pixels
  const [expanded, setExpanded] = useState({});
  const { campaignFormData, clientCampaignData } = useCampaigns();
  const [openSections, setOpenSections] = useState({});

  // Function to toggle campaign dropdown
  const toggleShow = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Function to toggle Awareness/Consideration/Conversion dropdowns
  const toggleOpen = (index, section) => {
    setOpenSections((prev) => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`],
    }));
  };

  function extractPlatforms(data) {
    const platforms = [];
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
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
        ].forEach((channelType) => {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
            const percentage = (platformBudget / stageBudget) * 100 || 0;
            const existingPlatform = platforms.find(
              (p) => p.platform_name === platformName
            );
            if (!existingPlatform) {
              const style =
                platformStyles.find((style) => style.name === platformName) ||
                platformStyles[
                Math.floor(Math.random() * platformStyles.length)
                ];
              platforms.push({
                platform_name: platformName,
                amount: platformBudget,
                stageName,
                icon: getPlatformIcon(platformName),
                bg: style?.bg,
                startDate: platform.campaign_start_date,
                endDate: platform.campaign_end_date,
              });
            }
          });
        });
      });
    return platforms;
  }

  const calculateGridColumns = (start: any, end: any) => {
    const formattedStart = parseISO(start);
    const formattedEnd = parseISO(end);

    const startDateIndex = formattedStart
      ? range?.findIndex((date) => isEqual(date, formattedStart)) + 1
      : 0;
    const endDateIndex = formattedEnd
      ? range?.findIndex((date) => isEqual(date, formattedEnd)) + 1
      : 0;

    return {
      start: startDateIndex,
      end: endDateIndex,
    };
  };

  const groupDatesByMonth = (dates: Date[]) => {
    const months: string[][] = [];
    let currentMonth: string[] = [];
    let currentMonthKey = "";

    dates.forEach((date, index) => {
      const monthKey = moment(new Date(date)).format("YYYY-MM");
      const dateStr = moment(new Date(date)).format("YYYY-MM-DD");

      if (currentMonthKey === "" || currentMonthKey === monthKey) {
        currentMonth.push(dateStr);
        currentMonthKey = monthKey;
      } else {
        // New month started, save current month and start new one
        if (currentMonth.length > 0) {
          months.push([...currentMonth]);
        }
        currentMonth = [dateStr];
        currentMonthKey = monthKey;
      }

      // If it's the last date, save the current month
      if (index === dates.length - 1 && currentMonth.length > 0) {
        months.push([...currentMonth]);
      }
    });

    return months;
  };

  const datesByMonth = range ? groupDatesByMonth(range) : [];

  const calculateMonthWidths = () => {
    return datesByMonth.map((month) => monthWidth * month.length);
  };

  const monthWidths = calculateMonthWidths();

  // Calculate cumulative positions for month end lines
  const monthEndPositions = () => {
    let cumulativeWidth = 0;
    const positions: number[] = [];

    monthWidths.forEach((width, index) => {
      cumulativeWidth += width;
      // Don't add a line after the last month
      if (index < monthWidths.length - 1) {
        positions.push(cumulativeWidth);
      }
    });

    return positions;
  };

  const endPositions = monthEndPositions();

  // Create grid template columns with individual month widths
  const gridTemplateColumns = monthWidths.map((width) => `${width}px`).join(" ");

  // Create background images and positions for month end lines
  const backgroundImages = endPositions
    .map(
      () =>
        `linear-gradient(to right, transparent calc(100% - 1px), rgba(0,0,255,0.1) calc(100% - 1px), rgba(0,0,255,0.1) 100%)`
    )
    .join(", ");

  const backgroundSizes = endPositions
    .map((position) => `${position}px 100%`)
    .join(", ");
  const backgroundPositions = endPositions
    .map((position) => `${position + 1}px 0`)
    .join(", ");

  return (
    <div className="w-full">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          backgroundImage: backgroundImages,
          backgroundSize: backgroundSizes,
          backgroundPosition: backgroundPositions,
        }}
      >
        {funnels.map((funnel, index) => {
          const platforms = extractPlatforms(campaignFormData);
          const funnelPlatforms = platforms.filter(
            (p) => p.stageName === funnel.name
          );

          return (
            <div
              key={index}
              className="flex flex-col items-center justify-center relative py-4"
              style={{
                width: `${monthWidths[index] || monthWidth}px`,
              }}
            >
              {/* Campaign Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <BsFillMegaphoneFill className="text-blue-500" />
                  <span className="text-sm font-medium">{funnel.name}</span>
                </div>
                <button
                  onClick={() => toggleShow(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expanded[index] ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {expanded[index] && (
                <div className="w-full space-y-2">
                  {funnelPlatforms.map((platform, platformIndex) => {
                    const gridPos = calculateGridColumns(
                      platform.startDate,
                      platform.endDate
                    );

                    return (
                      <div
                        key={platformIndex}
                        className="flex items-center gap-2 p-2 rounded-lg"
                        style={{
                          backgroundColor: platform.bg,
                          color: platform.color,
                          gridColumnStart: gridPos.start,
                          gridColumnEnd: gridPos.end,
                        }}
                      >
                        <Image
                          src={platform.icon || "/placeholder.svg"}
                          alt={platform.platform_name}
                          width={16}
                          height={16}
                        />
                        <span className="text-xs font-medium">
                          {platform.platform_name}
                        </span>
                        <span className="text-xs">
                          {platform.amount?.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthTimeline; 