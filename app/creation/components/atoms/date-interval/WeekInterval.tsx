"use client";
import { useComments } from "app/utils/CommentProvider";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { useDateRange } from "src/date-range-context";
import { format } from "date-fns";

const WeekInterval = ({
  funnelData,
  disableDrag,
  range,
  src,
  isInfiniteTimeline = true,
}: {
  funnelData?: any;
  disableDrag?: any;
  range?: any;
  src?: any;
  isInfiniteTimeline?: boolean;
}) => {
  const { extendedRange } = useDateRange();
  const { close } = useComments();
  const effectiveRange = isInfiniteTimeline ? extendedRange : range;

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

  const weekWidths = useMemo(() => {
    const dailyWidth = 50;
    return datesByWeek.map((week) => dailyWidth * week.length);
  }, [datesByWeek]);

  const weekEndPositions = useMemo(() => {
    let cumulativeWidth = 0;
    const positions: number[] = [];

    weekWidths.forEach((width, index) => {
      cumulativeWidth += width;
      if (index < weekWidths.length - 1) {
        positions.push(cumulativeWidth);
      }
    });

    return positions;
  }, [weekWidths]);

  const gridTemplateColumns = weekWidths.map((width) => `${width}px`).join(" ");

  const yearHeaders = useMemo(() => {
    const headers: Array<{ year: string; span: number }> = [];
    let currentYear: string | null = null;
    let currentSpan = 0;

    datesByWeek.forEach((week) => {
      if (week && week.length > 0) {
        const weekDate = moment(week[0]).toDate();
        const year = format(weekDate, "yyyy");

        if (currentYear === null) {
          currentYear = year;
          currentSpan = 1;
        } else if (currentYear === year) {
          currentSpan += 1;
        } else {
          headers.push({ year: currentYear, span: currentSpan });
          currentYear = year;
          currentSpan = 1;
        }
      }
    });

    if (currentYear !== null) {
      headers.push({ year: currentYear, span: currentSpan });
    }

    return headers;
  }, [datesByWeek]);

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
      className={
        isInfiniteTimeline
          ? "min-w-max border-y relative"
          : "w-full border-y relative"
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
        }}
        className="border-b border-blue-200"
      >
        {yearHeaders.map((header, idx) => (
          <div
            key={`year-${idx}`}
            style={{
              gridColumn: `span ${header.span}`,
            }}
            className="relative h-full"
          >
            <div
              style={{
                position: "sticky",
                left: 0,
                width: "fit-content",
                backgroundColor: "white",
                paddingRight: "12px",
                zIndex: 10,
              }}
              className="py-2 px-3 border-r border-blue-200/50 h-full flex items-center"
            >
              <span className="font-[600] text-[16px] text-[rgba(0,0,0,0.7)]">
                {header.year}
              </span>
            </div>
          </div>
        ))}
      </div>

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
