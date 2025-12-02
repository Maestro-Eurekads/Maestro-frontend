"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { range, extendedRange, isInfiniteTimeline, campaignRange } = useDateRange();
  const { range: rrange } = useRange();
  const { campaignFormData, loadingCampaign } = useCampaigns();
  
  const gridRange = isInfiniteTimeline ? extendedRange : range;
  const [channelWidths, setChannelWidths] = useState<Record<string, number>>(
    {}
  );
  const [containerWidth, setContainerWidth] = useState(null);
  const [channelPositions, setChannelPositions] = useState<
    Record<string, number>
  >({});

  const [openItems, setOpenItems] = useState(null);

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

  const generateYearMonths = useCallback(() => {
    if (!gridRange || gridRange.length === 0) return [];

    const startDate = startOfYear(gridRange[0]);
    const endDate = endOfYear(gridRange[gridRange.length - 1]);

    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map((month) => format(month, "MMMM yyyy"));
  }, [gridRange]);

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

      if (isInfiniteTimeline) {
        if (viewType === "Day" || viewType === "Week") {
          dailyWidth = 30;
        } else if (viewType === "Year") {
          dailyWidth = 80;
        } else {
          dailyWidth = 15;
        }
      } else {
        if (viewType === "Day" || viewType === "Week") {
          const endPeriod = funnelData?.endDay || 1;
          dailyWidth = contWidth / endPeriod;
          dailyWidth = dailyWidth < 50 ? 50 : dailyWidth;
        } else if (viewType === "Year") {
          const monthWidth = contWidth / 12;
          dailyWidth = Math.max(monthWidth, 60);
        } else {
          const totalDays = totalDaysInRange || funnelData?.endDay || 30;
          dailyWidth = contWidth / totalDays;
          dailyWidth = Math.max(dailyWidth, 10);
        }
      }

      setDailyWidthByView((prev) => ({
        ...prev,
        [viewType]: Math.round(dailyWidth),
      }));

      return Math.round(dailyWidth);
    },
    [disableDrag, funnelData?.endDay, funnelData?.endMonth, close, isInfiniteTimeline]
  );

  useEffect(() => {
    if (!rrange || !gridRef?.current) return;

    const effectiveRange = gridRange && gridRange.length > 0 ? gridRange : range;
    if (!effectiveRange || effectiveRange.length === 0) return;

    const result = getDaysInEachMonth(effectiveRange);
    setDaysInEachMonth(result);

    const yearMonthResult = getMonthsByYear(effectiveRange);
    setMonthsByYear(yearMonthResult);

    const yearMonthsList = generateYearMonths();
    setYearMonths(yearMonthsList);

    const totalDaysInRange = Object.values(result).reduce(
      (sum: number, days: number) => sum + days,
      0
    );

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
    gridRange,
    calculateAndCacheDailyWidth,
    generateYearMonths,
  ]);

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

  const generateGridColumns = useCallback(() => {
    const dailyWidth = dailyWidthByView[rrange] || 50;
    
    const totalDaysForGrid = isInfiniteTimeline && gridRange?.length > 0 
      ? gridRange.length 
      : (funnelData?.endDay || 1);

    if (rrange === "Day" || rrange === "Week") {
      return `repeat(${totalDaysForGrid}, ${dailyWidth}px)`;
    } else if (rrange === "Year") {
      const startDate = startOfYear(gridRange[0]);
      const endDate = endOfYear(gridRange[gridRange.length - 1]);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return `repeat(${months.length}, ${dailyWidth}px)`;
    } else {
      if (Object.keys(monthsByYear).length > 0) {
        const columnDefinitions: string[] = [];
        const sortedYears = Object.keys(monthsByYear).sort();

        sortedYears.forEach((year) => {
          const monthsInYear = monthsByYear[year];
          const monthOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          monthOrder.forEach((month) => {
            if (monthsInYear[month]) {
              const daysInThisMonth = monthsInYear[month];
              for (let i = 0; i < daysInThisMonth; i++) {
                columnDefinitions.push(`${dailyWidth}px`);
              }
            }
          });
        });

        return columnDefinitions.join(" ");
      }

      const months = Object.keys(daysInEachMonth);
      if (months.length === 0)
        return `repeat(${funnelData?.endDay || 30}, ${dailyWidth}px)`;

      const columnDefinitions: string[] = [];
      months.forEach((month) => {
        const daysInThisMonth = daysInEachMonth[month];
        for (let i = 0; i < daysInThisMonth; i++) {
          columnDefinitions.push(`${dailyWidth}px`);
        }
      });

      return columnDefinitions.join(" ");
    }
  }, [
    rrange,
    daysInEachMonth,
    monthsByYear,
    dailyWidthByView,
    funnelData?.endDay,
    isInfiniteTimeline,
    gridRange,
  ]);

  const getGridColumnEnd = useCallback(() => {
    const totalDaysForGrid = isInfiniteTimeline && gridRange?.length > 0 
      ? gridRange.length 
      : (funnelData?.endDay || 1);
      
    if (rrange === "Day") {
      return totalDaysForGrid;
    } else if (rrange === "Week") {
      return totalDaysForGrid;
    } else if (rrange === "Year") {
      const startDate = startOfYear(gridRange[0]);
      const endDate = endOfYear(gridRange[gridRange.length - 1]);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return months.length;
    } else {
      const totalDays = Object.values(daysInEachMonth).reduce(
        (sum: number, days: number) => sum + days,
        0
      );
      return totalDays || funnelData?.endDay || 30;
    }
  }, [rrange, funnelData?.endDay, funnelData?.endWeek, daysInEachMonth, isInfiniteTimeline, gridRange]);

  const getDailyWidth = useCallback(
    (viewType?: string): number => {
      const currentView = viewType || rrange;
      return dailyWidthByView[currentView] || 50;
    },
    [dailyWidthByView, rrange]
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
        const stageStartDate =
          (stage?.funnel_stage_timeline_start_date
            ? parseISO(stage?.funnel_stage_timeline_start_date)
            : null);

        const stageEndDate =
          (stage?.funnel_stage_timeline_end_date
            ? parseISO(stage?.funnel_stage_timeline_end_date)
            : null);

        if (rrange === "Year" && stageStartDate && stageEndDate) {
          const monthWidth = getDailyWidth("Year");
          const timelineStart = startOfYear(gridRange[0]);
          const allMonths = eachMonthOfInterval({ 
            start: timelineStart, 
            end: endOfYear(gridRange[gridRange.length - 1]) 
          });
          
          const startMonthIndex = allMonths.findIndex(m => 
            format(m, "yyyy-MM") === format(stageStartDate, "yyyy-MM")
          );
          const endMonthIndex = allMonths.findIndex(m => 
            format(m, "yyyy-MM") === format(stageEndDate, "yyyy-MM")
          );
          
          const position = startMonthIndex >= 0 ? startMonthIndex * monthWidth : 0;
          const monthsSpanned = endMonthIndex >= startMonthIndex ? endMonthIndex - startMonthIndex + 1 : 1;
          
          initialPositions[stageName] = position;
          initialWidths[stageName] = monthsSpanned * monthWidth;
        } else {
          const effectiveRange = gridRange && gridRange.length > 0 ? gridRange : range;
          const startDateIndex = stageStartDate
            ? effectiveRange?.findIndex((date) => isEqual(date, stageStartDate)) *
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
            if (isInfiniteTimeline) {
              return daysBetween > 0
                ? dailyWidth * daysBetween
                : dailyWidth * daysFromStart;
            } else if (rrange === "Day" || rrange === "Week") {
              return daysBetween > 0
                ? dailyWidth * daysBetween
                : dailyWidth * daysFromStart;
            } else {
              const totalDaysInRange = Object.values(
                daysInEachMonth || {}
              ).reduce((sum: number, days: number) => sum + days, 0);
              const widthPerDay = Math.round(
                availableWidth / (totalDaysInRange || 30)
              );
              return daysBetween > 0
                ? widthPerDay * daysBetween
                : widthPerDay * daysFromStart;
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
    isInfiniteTimeline,
    gridRange,
  ]);

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
      className={isInfiniteTimeline ? `min-w-max min-h-[494px] relative pb-5 grid-container` : `w-full min-h-[494px] relative pb-5 grid-container`}
      ref={gridRef}
      style={{
        ...(rrange === "Year"
          ? generateYearBackground()
          : {
              backgroundImage: (() => {
                if (rrange === "Day" || rrange === "Week") {
                  return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;
                } else {
                  const months = Object.keys(daysInEachMonth);
                  if (months.length <= 1) {
                    return `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;
                  }

                  const regularGrid = `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;
                  const monthBoundaryGrid = `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`;

                  return `${monthBoundaryGrid}`;
                }
              })(),
              backgroundSize: (() => {
                const dailyWidth = getDailyWidth();
                const totalDays = isInfiniteTimeline && gridRange?.length > 0 
                  ? gridRange.length 
                  : (funnelData?.endDay || 1);
                  
                if (isInfiniteTimeline) {
                  return `${dailyWidth}px 100%`;
                }
                  
                if (rrange === "Day" || rrange === "Week") {
                  const dailyGridSize = `${dailyWidth}px 100%`;
                  if (rrange === "Week") {
                    return dailyGridSize;
                  }
                  return `${dailyGridSize}, calc(${
                    dailyWidth * totalDays
                  }px) 100%`;
                } else {
                  if (Object.keys(monthsByYear).length > 0) {
                    const regularGridSize = `${dailyWidth}px 100%`;
                    let cumulativeDays = 0;
                    const boundaryPositions: number[] = [];
                    const sortedYears = Object.keys(monthsByYear).sort();
                    sortedYears.forEach((year, yearIndex) => {
                      const monthsInYear = monthsByYear[year];
                      const monthOrder = [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ];

                      monthOrder.forEach((month, monthIndex) => {
                        if (monthsInYear[month]) {
                          cumulativeDays += monthsInYear[month];
                          if (
                            !(
                              yearIndex === sortedYears.length - 1 &&
                              monthIndex === monthOrder.length - 1
                            )
                          ) {
                            boundaryPositions.push(cumulativeDays * dailyWidth);
                          }
                        }
                      });
                    });

                    const boundaryBackgrounds = boundaryPositions
                      .map((position) => `20% 100%`)
                      .join(", ");
                    return boundaryBackgrounds
                      ? ` ${boundaryBackgrounds}`
                      : regularGridSize;
                  }

                  const months = Object.keys(daysInEachMonth);
                  if (months.length === 0) {
                    return `calc(${dailyWidth}px) 100%, calc(${
                      dailyWidth * 7
                    }px) 100%`;
                  }

                  let cumulativeDays = 0;
                  const monthEndPositions: number[] = [];

                  months.forEach((month, index) => {
                    const daysInThisMonth = daysInEachMonth[month];
                    cumulativeDays += daysInThisMonth;

                    if (index < months.length - 1) {
                      monthEndPositions.push(cumulativeDays * dailyWidth);
                    }
                  });

                  const regularGridSize = `${dailyWidth}px 100%`;
                  const monthBoundaryBackgrounds = monthEndPositions
                    .map((position) => `20% 100%`)
                    .join(", ");

                  return monthBoundaryBackgrounds
                    ? ` ${monthBoundaryBackgrounds}`
                    : regularGridSize;
                }
              })(),
            }),
      }}
    >
     

      {loadingCampaign ? (
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
        campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = campaignFormData?.custom_funnels?.find(
            (s) => s?.name === stageName
          );
          const funn = funnelStages?.find((ff) => ff?.name === stageName);
          if (!stage) return null;

          const channelWidth = funnelWidths[stage?.name] || 400;
          const isOpen = openChannels[stage?.name] || false;

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
                  dateList={gridRange}
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
                      dateList={gridRange}
                      setSelectedStage={setSelectedStage}
                      disableDrag={disableDrag}
                      openItems={openItems}
                      setOpenItems={setOpenItems}
                      endMonth={funnelData?.endMonth}
                      endDay={funnelData?.endDay}
                      endWeek={funnelData?.endWeek}
                      dailyWidth={getDailyWidth()}
                      viewType={rrange}
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
