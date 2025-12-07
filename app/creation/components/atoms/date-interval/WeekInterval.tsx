"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { useDateRange } from "src/date-range-context";

const WeekInterval = ({
  weeksCount,
  funnelData,
  disableDrag,
  range,
  src,
}: {
  weeksCount: any;
  funnelData?: any;
  disableDrag?: any;
  range?: any;
  src?: any;
}) => {
  const { campaignFormData } = useCampaigns();
  const { range: ddRange, extendedRange, isInfiniteTimeline } = useDateRange();
  const { close } = useComments();

  // Use extended range for infinite timeline
  const effectiveRange = isInfiniteTimeline ? extendedRange : ddRange;

  const groupDatesByWeek = (dates: Date[]) => {
    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    dates.forEach((date, index) => {
      currentWeek.push(moment(new Date(date)).format("YYYY-MM-DD"));

      // Check if it's the 6th index or the last date
      const isSixthIndex = currentWeek.length === 7; // 7 days in a week
      const isLastDate = index === dates.length - 1;

      if (isSixthIndex || isLastDate) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const datesByWeek =
    src === "dashboard"
      ? range
        ? groupDatesByWeek(range)
        : []
      : effectiveRange
      ? groupDatesByWeek(effectiveRange)
      : [];

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth - (disableDrag ? 80 : close ? 0 : 367);

    if (isInfiniteTimeline && effectiveRange && effectiveRange.length > 0) {
      return 50;
    }

    const totalDays = funnelData?.endDay || 30;
    let dailyWidth = contWidth / totalDays;

    // Ensure minimum width constraints
    dailyWidth = Math.max(dailyWidth, 50);

    return Math.round(dailyWidth);
  }, [
    disableDrag,
    funnelData?.endDay,
    close,
    isInfiniteTimeline,
    effectiveRange,
  ]);

  // Calculate individual week widths based on actual days in each week
  const weekWidths = useMemo(() => {
    const dailyWidth = calculateDailyWidth();
    return datesByWeek.map((week) => dailyWidth * week.length);
  }, [datesByWeek, calculateDailyWidth]);

  // Calculate cumulative positions for week end lines
  const weekEndPositions = useMemo(() => {
    let cumulativeWidth = 0;
    const positions: number[] = [];

    weekWidths.forEach((width, index) => {
      cumulativeWidth += width;
      // Don't add a line after the last week
      if (index < weekWidths.length - 1) {
        positions.push(cumulativeWidth);
      }
    });

    return positions;
  }, [weekWidths]);

  //console.log("Week End Positions:", weekEndPositions);

  const dailyWidth = calculateDailyWidth();

  // Create grid template columns with individual week widths
  const gridTemplateColumns = weekWidths.map((width) => `${width}px`).join(" ");

  // Create background images and positions for week end lines
  const backgroundImages = weekEndPositions
    .map(
      () =>
        `linear-gradient(to right, transparent calc(100% - 1px), rgba(0,0,255,0.1) calc(100% - 1px), rgba(0,0,255,0.1) 100%)`
    )
    .join(", ");

  const backgroundSizes = weekEndPositions
    .map((position) => `${position}px 100%`)
    .join(", ");
  const backgroundPositions = weekEndPositions
    .map((position) => `${position + 1}px 0`)
    .join(", ");

  return (
    <div
      className={isInfiniteTimeline ? "min-w-max border-y" : "w-full border-y"}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          backgroundImage: backgroundImages,
          // backgroundRepeat: "no-repeat",
          backgroundSize: backgroundSizes,
          backgroundPosition: backgroundPositions,
        }}
      >
        {datesByWeek.map((week, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center relative py-2"
            style={{
              width: `${weekWidths[i]}px`,
            }}
          >
            {/* Week Label */}
            <div>
              <div className="font-[500] text-[13px] flex gap-2 items-center">
                {datesByWeek[i] && (
                  <div className="flex flex-row gap-2 items-center justify-center">
                    <p>{moment(datesByWeek[i][0]).format("DD")}</p>
                    <span className="text-blue-500">
                      {moment(datesByWeek[i][0]).format("MMM")}
                    </span>
                  </div>
                )}
                -
                {datesByWeek[i] && (
                  <p className="flex items-center gap-1">
                    {`${moment(
                      datesByWeek[i][datesByWeek[i].length - 1]
                    ).format("DD")}`}

                    <span className="text-blue-500">
                      {moment(datesByWeek[i][datesByWeek[i].length - 1]).format(
                        "MMM"
                      )}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekInterval;
