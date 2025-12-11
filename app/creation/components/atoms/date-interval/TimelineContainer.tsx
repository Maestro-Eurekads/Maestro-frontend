"use client";

import type React from "react";
import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import DayInterval from "./DayInterval";
import DayTimeline from "./DayTimeline";
import WeekInterval from "./WeekInterval";
import MonthInterval from "./MonthInterval";
import MonthTimeline from "./MonthTimeline";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  subMonths,
  addMonths,
  subDays,
  addDays,
  subWeeks,
  addWeeks,
  differenceInMonths,
} from "date-fns";
import YearInterval from "./YearInterval";
import YearTimeline from "./YearTimeline";

// Column widths for each view type
const COLUMN_WIDTHS = {
  Day: 50,
  Week: 50,
  Month: 100, // Week columns in Month view
  Year: 80, // Month columns in Year view
};

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

  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth - 100 : 1200;

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

  const getRequiredColumns = (columnWidth: number) => {
    return Math.ceil(viewportWidth / columnWidth) + 1;
  };

  const { bufferedStartDate, bufferedEndDate, dateList } = useMemo(() => {
    const originalDateList = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    let buffStart = startDate;
    let buffEnd = endDate;

    if (range === "Year") {
      const columnWidth = COLUMN_WIDTHS.Year;
      const requiredColumns = getRequiredColumns(columnWidth);

      const yearStart = startOfYear(startDate);
      const yearEnd = endOfYear(endDate);
      const currentMonths = eachMonthOfInterval({
        start: yearStart,
        end: yearEnd,
      });

      if (currentMonths.length < requiredColumns) {
        const monthsToAdd = Math.ceil(
          (requiredColumns - currentMonths.length) / 2
        );
        buffStart = subMonths(startDate, monthsToAdd);
        buffEnd = addMonths(endDate, monthsToAdd);
      }
    } else if (range === "Month") {
      const columnWidth = COLUMN_WIDTHS.Month;
      const requiredColumns = getRequiredColumns(columnWidth);

      const currentWeeks = eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );

      if (currentWeeks.length < requiredColumns) {
        const weeksToAdd = Math.ceil(
          (requiredColumns - currentWeeks.length) / 2
        );
        buffStart = subWeeks(startDate, weeksToAdd);
        buffEnd = addWeeks(endDate, weeksToAdd);
      }
    } else {
      const columnWidth = COLUMN_WIDTHS.Day;
      const requiredColumns = getRequiredColumns(columnWidth);

      if (originalDateList.length < requiredColumns) {
        const daysToAdd = Math.ceil(
          (requiredColumns - originalDateList.length) / 2
        );
        buffStart = subDays(startDate, daysToAdd);
        buffEnd = addDays(endDate, daysToAdd);
      }
    }

    return {
      bufferedStartDate: buffStart,
      bufferedEndDate: buffEnd,
      dateList: originalDateList,
    };
  }, [startDate, endDate, range, viewportWidth]);

  const bufferedDateList = useMemo(() => {
    return eachDayOfInterval({
      start: bufferedStartDate,
      end: bufferedEndDate,
    });
  }, [bufferedStartDate, bufferedEndDate]);

  const totalDays = bufferedDateList.length;

  const totalWeeks = useMemo(() => {
    return eachWeekOfInterval(
      { start: bufferedStartDate, end: bufferedEndDate },
      { weekStartsOn: 1 }
    ).length;
  }, [bufferedStartDate, bufferedEndDate]);

  const totalMonths = useMemo(() => {
    const yearStart = startOfYear(bufferedStartDate);
    const yearEnd = endOfYear(bufferedEndDate);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd }).length;
  }, [bufferedStartDate, bufferedEndDate]);

  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval
              isInfiniteTimeline={false}
              src="dashboard"
              range={bufferedDateList}
            />
            <DayTimeline
              daysCount={totalDays}
              funnels={funnelsData}
              range={bufferedDateList}
            />
          </>
        );
      case "Month":
        return (
          <>
            <MonthInterval
              range={bufferedDateList}
              isInfiniteTimeline={false}
            />
            <MonthTimeline
              weeksCount={totalWeeks}
              funnels={funnelsData}
              range={bufferedDateList}
            />
          </>
        );
      case "Year":
        return (
          <>
            <YearInterval isInfiniteTimeline={false} range={bufferedDateList} />
            <YearTimeline range={bufferedDateList} funnels={funnelsData} />
          </>
        );
      default: // Week is default
        return (
          <>
            <WeekInterval
              range={bufferedDateList}
              src="dashboard"
              isInfiniteTimeline={false}
            />
            <DayTimeline
              daysCount={totalDays}
              funnels={funnelsData}
              range={bufferedDateList}
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
