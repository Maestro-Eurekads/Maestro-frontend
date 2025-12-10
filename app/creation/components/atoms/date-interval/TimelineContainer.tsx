"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import DayInterval from "./DayInterval";
import DayTimeline from "./DayTimeline";
import WeekInterval from "./WeekInterval";
import MonthInterval from "./MonthInterval";
import MonthTimeline from "./MonthTimeline";
import { addDays, differenceInDays, eachDayOfInterval, format } from "date-fns";
import YearInterval from "./YearInterval";
import YearTimeline from "./YearTimeline";

interface TimelineContainerProps {
  range: string;
  dayDifference: number;
  weekDifference: number;
  monthDifference: number;
  funnelsData: any[];
  startDate?: any;
  endDate?: any;
  yearDifference?: any;
}

const TimelineContainer: React.FC<TimelineContainerProps> = ({
  range,
  dayDifference,
  weekDifference,
  monthDifference,
  funnelsData,
  startDate,
  endDate,
  yearDifference,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Check if we need to show the scroll indicator
  useEffect(() => {
    if (!containerRef.current) return;

    const checkScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      setShowScrollIndicator(container.scrollWidth > container.clientWidth);
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [range, dayDifference, weekDifference, monthDifference]);

  const differenceInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const dateList = eachDayOfInterval({
    start: startDate,
    end: addDays(endDate, 0),
  });

  console.log('dateList',dateList)

  // Render the appropriate timeline components based on the range
  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval
              isInfiniteTimeline={false}
              src="dashboard"
              range={dateList}
            />
            <DayTimeline
              daysCount={dayDifference}
              funnels={funnelsData}
              range={dateList}
            />
          </>
        );
      case "Month":
        return (
          <>
            <MonthInterval
              range={dateList}
              isInfiniteTimeline={false}
            />
            <MonthTimeline
              monthsCount={monthDifference}
              funnels={funnelsData}
              range={dateList}
            />
          </>
        );
      case "Year":
        return (
          <>
            <YearInterval
              isInfiniteTimeline={false}
              range={dateList}
            />
            <YearTimeline range={dateList} funnels={funnelsData} />
          </>
        );
      default: // Week is default
        return (
          <>
            <WeekInterval
              range={dateList}
              src="dashboard"
              isInfiniteTimeline={false}
            />
            <DayTimeline
              daysCount={dayDifference}
              funnels={funnelsData}
              range={dateList}
            />
          </>
        );
    }
  };

  return (
    <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative px-2">
      <div className="overflow-x-auto" ref={containerRef}>
        <div className="min-w-max">{renderTimeline()}</div>
      </div>
      {showScrollIndicator && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-l-md shadow-md animate-pulse">
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </div>
      )}
    </div>
  );
};

export default TimelineContainer;
