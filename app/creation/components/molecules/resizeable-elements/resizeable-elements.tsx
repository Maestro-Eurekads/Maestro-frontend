"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
// import DraggableChannel from "../../../../../components/DraggableChannel";
import ResizableChannels from "./ResizableChannels";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import {
  funnelStages,
  getPlatformIcon,
  platformStyles,
} from "../../../../../components/data";
import { useDateRange } from "src/date-range-context";
import { useDateRange as useRange } from "src/date-context";
import { useCampaigns } from "app/utils/CampaignsContext";
import {
  eachDayOfInterval,
  format,
  isEqual,
  parseISO,
  endOfMonth,
  eachMonthOfInterval,
  differenceInDays,
  startOfYear,
  endOfYear,
} from "date-fns";
import { useComments } from "app/utils/CommentProvider";
import EnhancedDraggableChannel from "components/enhanced-draggable-channel";
import DraggableChannel from "components/DraggableChannel";

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

interface MonthSpan {
  month: string;
  year: string;
  startDay: number;
  endDay: number;
  totalDaysInMonth: number;
  isPartial: boolean;
}

function breakdownByMonth(start: Date, end: Date) {
  const days = eachDayOfInterval({ start, end });
  const map: Record<string, number> = {};

  for (const day of days) {
    const key = format(day, "MMMM yyyy");
    map[key] = map[key] || 0;
  }
  return map;
}

const ResizeableElements = ({
  funnelData,
  disableDrag,
  isOpen,
  setIsOpen,
  selectedStage,
  setSelectedStage,
}: {
  funnelData: any;
  disableDrag?: any;
  isOpen?: boolean;
  setIsOpen?: any;
  selectedStage?: string;
  setSelectedStage?: any;
}) => {
  const { funnelWidths } = useFunnelContext();
  const { close } = useComments();
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});
  const { range } = useDateRange();
  const { range: rrange } = useRange();
  const { campaignFormData, loadingCampaign } = useCampaigns();
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
  const [dailyWidthByView, setDailyWidthByView] = useState<
    Record<string, number>
  >({
    Day: 50,
    Week: 50,
    Month: 0,
    Year: 0,
  });

  const [daysInEachMonth, setDaysInEachMonth] = useState<Record<any, any>>({});
  const [monthsByYear, setMonthsByYear] = useState<
    Record<string, Record<string, number>>
  >({});
  const [yearMonths, setYearMonths] = useState<string[]>([]);

  const toggleChannel = (id: string) => {
    setOpenChannels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateChannelWidth = (channelId: string, width: number) => {
    setChannelWidths((prev) => ({ ...prev, [channelId]: width }));
  };

  const updateChannelPosition = (channelId: string, left: number) => {
    setChannelPositions((prev) => ({ ...prev, [channelId]: left }));
  };

  // New function to calculate which months a phase spans across
  const calculatePhaseMonthSpans = useCallback(
    (startDate: Date, endDate: Date): MonthSpan[] => {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });

      return months.map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = startDate > monthStart ? startDate : monthStart;
        const actualEnd = endDate < monthEnd ? endDate : monthEnd;

        const startDay = differenceInDays(actualStart, monthStart) + 1;
        const endDay = differenceInDays(actualEnd, monthStart) + 1;
        const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;

        return {
          month: format(monthStart, "MMMM"),
          year: format(monthStart, "yyyy"),
          startDay,
          endDay,
          totalDaysInMonth,
          isPartial: actualStart > monthStart || actualEnd < monthEnd,
        };
      });
    },
    []
  );

  // Generate 12 months for year view
  const generateYearMonths = useCallback(() => {
    if (!range || range.length === 0) return [];

    const startDate = startOfYear(range[0]); // Force start to Jan 1
    const endDate = endOfYear(range[range.length - 1]); // Force end to Dec 31

    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map((month) => format(month, "MMMM yyyy"));
  }, [range]);

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
  }, [campaignFormData, channelWidths]);

  const calculateAndCacheDailyWidth = useCallback(
    (
      viewType: string,
      containerWidth: number,
      endMonth: number,
      totalDaysInRange: number
    ) => {
      const getViewportWidth = () => {
        return window.innerWidth || document.documentElement.clientWidth || 0;
      };
      const screenWidth = getViewportWidth();
      const contWidth = screenWidth - (disableDrag ? 80 : close ? 0 : 367);

      let dailyWidth: number;

      if (viewType === "Day" || viewType === "Week") {
        const endPeriod = funnelData?.endDay || 1;
        dailyWidth = contWidth / endPeriod;
        dailyWidth = dailyWidth < 50 ? 50 : dailyWidth;
      } else if (viewType === "Year") {
        // Year view - calculate width per month (12 months)
        const monthWidth = contWidth / 12;
        dailyWidth = Math.max(monthWidth, 60); // Minimum 60px per month
      } else {
        // Month - ensure all months fit within screen width
        const totalDays = totalDaysInRange || funnelData?.endDay || 30;
        dailyWidth = contWidth / totalDays;
        dailyWidth = Math.max(dailyWidth, 10);
      }

      setDailyWidthByView((prev) => ({
        ...prev,
        [viewType]: Math.round(dailyWidth),
      }));

      return Math.round(dailyWidth);
    },
    [disableDrag, funnelData?.endDay, funnelData?.endMonth, close]
  );

  useEffect(() => {
    if (!rrange || !gridRef?.current) return;

    // Calculate days in each month
    const result = getDaysInEachMonth(range);
    setDaysInEachMonth(result);

    // Calculate months organized by year
    const yearMonthResult = getMonthsByYear(range);
    setMonthsByYear(yearMonthResult);

    // Generate year months for year view
    const yearMonthsList = generateYearMonths();
    setYearMonths(yearMonthsList);

    // Calculate total days
    const totalDaysInRange = Object.values(result).reduce(
      (sum: number, days: number) => sum + days,
      0
    );

    // Update container width and daily width
    requestAnimationFrame(() => {
      const gridContainer = document.querySelector(
        ".grid-container"
      ) as HTMLElement;
      if (!gridContainer) return;

      const containerRect = gridContainer.getBoundingClientRect();
      const contWidth = containerRect.width - 75;
      setContainerWidth(contWidth + 75);

      const endMonth = funnelData?.endMonth || 1;
      calculateAndCacheDailyWidth(
        rrange,
        contWidth,
        endMonth,
        totalDaysInRange
      );
    });
  }, [
    rrange,
    funnelData?.endMonth,
    range,
    calculateAndCacheDailyWidth,
    generateYearMonths,
  ]);

  // Enhanced function that returns the number of days in each month using the state range as reference
  const getDaysInEachMonth = useCallback(
    (range: Date[]): Record<string, number> => {
      const daysInMonth: Record<string, number> = {};

      range.forEach((date) => {
        const monthYear = format(date, "MMMM yyyy");
        daysInMonth[monthYear] = (daysInMonth[monthYear] || 0) + 1;
      });

      return daysInMonth;
    },
    []
  );

  // Enhanced function that returns months organized by year
  const getMonthsByYear = useCallback(
    (range: Date[]): Record<string, Record<string, number>> => {
      const monthsByYear: Record<string, Record<string, number>> = {};

      range.forEach((date) => {
        const year = format(date, "yyyy");
        const month = format(date, "MMMM");

        if (!monthsByYear[year]) {
          monthsByYear[year] = {};
        }

        monthsByYear[year][month] = (monthsByYear[year][month] || 0) + 1;
      });
      return monthsByYear;
    },
    []
  );

  // Enhanced function to generate dynamic grid template columns for different views
  const generateGridColumns = useCallback(() => {
    const dailyWidth = dailyWidthByView[rrange] || 50;

    if (rrange === "Day" || rrange === "Week") {
      return `repeat(${funnelData?.endDay || 1}, ${dailyWidth}px)`;
    } else if (rrange === "Year") {
      const startDate = startOfYear(range[0]);
      const endDate = endOfYear(range[range.length - 1]);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return `repeat(${months.length}, ${dailyWidth}px)`;
    } else {
      // Month view - use proportional logic like MonthInterval
      const months = Object.keys(daysInEachMonth);
      if (months.length === 0)
        return `repeat(${funnelData?.endDay || 30}, ${dailyWidth}px)`;

      // Calculate total days for proportional sizing (same as MonthInterval)
      const totalDays = Object.values(daysInEachMonth).reduce(
        (sum: number, days: number) => sum + days,
        0
      );

      // Generate proportional column definitions with minimum width constraint
      const columnDefinitions: string[] = [];
      
      if (months.length > 3) {
        // When more than 3 months, each month takes at least 20% of container
        months.forEach((month) => {
          const daysInThisMonth = daysInEachMonth[month];
          const proportionalWidth = (daysInThisMonth / totalDays) * 100;
          const monthWidth = Math.max(proportionalWidth, 20); // Minimum 20%
          columnDefinitions.push(`${Math.round(monthWidth)}%`);
        });
      } else {
        // For 3 or fewer months, use proportional sizing
        months.forEach((month) => {
          const daysInThisMonth = daysInEachMonth[month];
          const monthWidth = Math.round((daysInThisMonth / totalDays) * 100);
          columnDefinitions.push(`${monthWidth}%`);
        });
      }

      return columnDefinitions.join(" ");
    }
  }, [
    rrange,
    daysInEachMonth,
    monthsByYear,
    dailyWidthByView,
    funnelData?.endDay,
  ]);

  // Enhanced function to get grid column end position for different views
  const getGridColumnEnd = useCallback(() => {
    if (rrange === "Day") {
      return funnelData?.endDay || 1;
    } else if (rrange === "Week") {
      return funnelData?.endDay || 1;
    } else if (rrange === "Year") {
      const startDate = startOfYear(range[0]);
      const endDate = endOfYear(range[range.length - 1]);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return months; // 12 months
    } else {
      // Month view - return number of months for proportional grid
      const months = Object.keys(daysInEachMonth);
      return months.length || 1;
    }
  }, [rrange, funnelData?.endDay, funnelData?.endWeek, daysInEachMonth]);

  const getDailyWidth = useCallback(
    (viewType?: string): number => {
      const currentView = viewType || rrange;
      return dailyWidthByView[currentView] || 50;
    },
    [dailyWidthByView, rrange]
  );

  // Calculate phase positioning for year view
  const calculateYearViewPosition = useCallback(
    (startDate: Date, endDate: Date) => {
      if (!range || range.length === 0)
        return { position: 0, width: 0, spans: [] };

      const monthSpans = calculatePhaseMonthSpans(startDate, endDate);
      const monthWidth = getDailyWidth("Year");

      // Find the starting month index (0-11)
      const startMonth = startDate.getMonth();
      const position = startMonth * monthWidth;

      // Calculate total width across all months the phase spans
      const width = monthSpans.length * monthWidth;

      return { position, width, spans: monthSpans };
    },
    [range, calculatePhaseMonthSpans, getDailyWidth]
  );

  useEffect(() => {
    if (!campaignFormData?.funnel_stages || !containerWidth) return;

    const initialWidths: Record<string, number> = {};
    const initialPositions: Record<string, number> = {};
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const availableWidth = screenWidth - (disableDrag ? 60 : close ? 0 : 367);

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

        if (rrange === "Year" && stageStartDate && stageEndDate) {
          // Year view calculations
          const yearCalc = calculateYearViewPosition(
            stageStartDate,
            stageEndDate
          );
          initialPositions[stageName] = yearCalc.position;
          initialWidths[stageName] = yearCalc.width;
        } else {
          // Existing logic for other views
          const startDateIndex = stageStartDate
            ? range?.findIndex((date) => isEqual(date, stageStartDate)) *
            getDailyWidth()
            : 0;

          const daysBetween =
            stageStartDate && stageEndDate
              ? eachDayOfInterval({ start: stageStartDate, end: stageEndDate })
                .length
              : 0;

          const daysFromStart =
            campaignFormData?.campaign_timeline_start_date &&
              campaignFormData?.campaign_timeline_end_date
              ? eachDayOfInterval({
                start: parseISO(
                  campaignFormData.campaign_timeline_start_date
                ),
                end: parseISO(campaignFormData.campaign_timeline_end_date),
              }).length
              : 0;

          const dailyWidth = getDailyWidth();

          initialWidths[stageName] = (() => {
            if (rrange === "Day" || rrange === "Week") {
              return daysBetween > 0
                ? dailyWidth * daysBetween
                : dailyWidth * daysFromStart - 0;
            } else {
              // Month view
              const totalDaysInRange = Object.values(
                daysInEachMonth || {}
              ).reduce((sum: number, days: number) => sum + days, 0);
              const widthPerDay = Math.round(
                availableWidth / (totalDaysInRange || 30)
              );
              return daysBetween > 0
                ? widthPerDay * daysBetween
                : widthPerDay * daysFromStart - 0;
            }
          })();

          initialPositions[stageName] = startDateIndex;
        }
      }
    });

    setChannelWidths(initialWidths);
    setChannelPositions(initialPositions);
  }, [
    campaignFormData?.funnel_stages,
    containerWidth,
    campaignFormData?.campaign_timeline_start_date,
    campaignFormData?.campaign_timeline_end_date,
    rrange,
    daysInEachMonth,
    disableDrag,
    range,
    getDailyWidth,
    close,
    calculateYearViewPosition,
  ]);

  // Generate background grid for year view
  const generateYearBackground = useCallback(() => {
    if (rrange !== "Year") return {};

    const monthWidth = getDailyWidth("Year");
    return {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
      backgroundSize: `${monthWidth}px 100%`,
    };
  }, [rrange, getDailyWidth]);

  return (
    <div
      className={`w-full  relative pb-5 grid-container overflow-x-hidden`}
      ref={gridRef}
      style={{
        ...(rrange === "Year"
          ? generateYearBackground()
          : {
            backgroundImage: (() => {
              if (rrange === "Day" || rrange === "Week") {
                return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;
              } else if (rrange === "Month") {
                // Month view - only show month boundaries, no daily lines
                return `linear-gradient(to right, rgba(0,0,255,0.3) 1px, transparent 1px)`;
              } else {
                return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;
              }
            })(),
            backgroundSize: (() => {
              const dailyWidth = getDailyWidth();
              if (rrange === "Day" || rrange === "Week") {
                const totalDays = funnelData?.endDay || 1;
                const dailyGridSize = `${dailyWidth}px 100%`;
                if (rrange === "Week") {
                  return dailyGridSize;
                }
                return `${dailyGridSize}, calc(${dailyWidth * totalDays
                  }px) 100%`;
              } else if (rrange === "Month") {
                // Month view - calculate month boundary positions using proportional logic
                const months = Object.keys(daysInEachMonth);
                if (months.length === 0) {
                  return `100% 100%`;
                }

                // Calculate total days for proportional sizing (same as MonthInterval)
                const totalDays = Object.values(daysInEachMonth).reduce(
                  (sum: number, days: number) => sum + days,
                  0
                );

                let cumulativePercentage = 0;
                const monthBoundaryPositions: string[] = [];

                if (months.length > 3) {
                  // When more than 3 months, each month takes at least 20%
                  months.forEach((month, index) => {
                    const daysInThisMonth = daysInEachMonth[month];
                    const proportionalWidth = (daysInThisMonth / totalDays) * 100;
                    const monthPercentage = Math.max(proportionalWidth, 20); // Minimum 20%
                    cumulativePercentage += monthPercentage;

                    if (index < months.length - 1) {
                      // Calculate the position where this month ends using percentage
                      monthBoundaryPositions.push(`${Math.round(cumulativePercentage)}% 100%`);
                    }
                  });
                } else {
                  // For 3 or fewer months, use proportional sizing
                  months.forEach((month, index) => {
                    const daysInThisMonth = daysInEachMonth[month];
                    const monthPercentage = (daysInThisMonth / totalDays) * 100;
                    cumulativePercentage += monthPercentage;

                    if (index < months.length - 1) {
                      // Calculate the position where this month ends using percentage
                      monthBoundaryPositions.push(`${cumulativePercentage}% 100%`);
                    }
                  });
                }

                return monthBoundaryPositions.length > 0 
                  ? monthBoundaryPositions.join(", ")
                  : `100% 100%`;
              } else {
                return `${dailyWidth}px 100%`;
              }
            })(),
          }),
      }}
    >
      {/* Year view month headers */}
      {rrange === "Year" && (
        <div
          className="sticky top-0 z-10 bg-transparent border-b mb-4"
          style={{
            display: "grid",
            gridTemplateColumns: generateGridColumns(),
            gap: "0px",
          }}
        >
          {generateYearMonths().map((monthLabel, index) => (
            <div
              key={index}
              className="text-center text-sm font-medium py-2 border-r border-gray-200"
            >
              <p className="text-blue-500">{monthLabel?.split(" ")[0]}</p>
              <p>{monthLabel?.split(" ")[1]}</p>
            </div>
          ))}
        </div>
      )}

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

          const channelWidth = funnelWidths[stage?.name] || 400;
          const isOpen = openChannels[stage?.name] || false;

          // Get the specific width and position for this channel or use default
          const currentChannelWidth = channelWidths[stage?.name] || 350;
          const currentChannelPosition = channelPositions[stage?.name] || 0;

          return (
            <div
              key={index}
              className="h-full"
              style={{
                display: "grid",
                gridTemplateColumns: generateGridColumns(),
              }}
            >
              <div
                className="flex flex-col mt-6 rounded-[10px] p-4 px-0 justify-between w-fit"
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: getGridColumnEnd() + 1,
                }}
              >
                <DraggableChannel
                  id={stage?.name}
                  openChannel={isOpen}
                  bg={stage?.color?.split("-")[1]}
                  color={stage?.color}
                  description={stage?.name}
                  setIsOpen={setIsOpen}
                  setOpenChannel={() => toggleChannel(stage?.name)}
                  Icon={stage?.activeIcon}
                  dateList={range}
                  dragConstraints={gridRef}
                  parentWidth={currentChannelWidth}
                  setParentWidth={(width) =>
                    updateChannelWidth(stage?.name, width)
                  }
                  parentLeft={currentChannelPosition}
                  setParentLeft={(left) =>
                    updateChannelPosition(stage?.name, left)
                  }
                  setSelectedStage={setSelectedStage}
                  disableDrag={disableDrag}
                  openItems={openItems}
                  setOpenItems={setOpenItems}
                  endMonth={funnelData?.endMonth}
                  endDay={funnelData?.endDay}
                  endWeek={funnelData?.endWeek}
                  dailyWidth={getDailyWidth()}
                />

                {isOpen && (
                  <div>
                    <ResizableChannels
                      channels={platforms[stage.name]}
                      parentId={stage?.name}
                      parentWidth={currentChannelWidth}
                      parentLeft={currentChannelPosition}
                      setIsOpen={setIsOpen}
                      dateList={range}
                      setSelectedStage={setSelectedStage}
                      disableDrag={disableDrag}
                      openItems={openItems}
                      setOpenItems={setOpenItems}
                      endMonth={funnelData?.endMonth}
                      endDay={funnelData?.endDay}
                      endWeek={funnelData?.endWeek}
                      dailyWidth={getDailyWidth()}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ResizeableElements;
