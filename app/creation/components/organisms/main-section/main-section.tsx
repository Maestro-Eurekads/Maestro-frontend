"use client";

import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "../../../../../src/date-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  differenceInCalendarWeeks,
  eachWeekOfInterval,
  format,
  isSameWeek,
  parseISO,
  startOfYear,
} from "date-fns";
import DayInterval from "../../atoms/date-interval/DayInterval";
import MonthInterval from "../../atoms/date-interval/MonthInterval";
import WeekInterval from "../../atoms/date-interval/WeekInterval";
import { useState, useEffect, useRef, useCallback } from "react";
import AddNewChennelsModel from "components/Modals/AddNewChennelsModel";
import { useDateRange as useRange } from "src/date-range-context";
import YearInterval from "../../atoms/date-interval/YearInterval";
import { useActive } from "app/utils/ActiveContext";
import { useComments } from "app/utils/CommentProvider";

const MainSection = ({
  hideDate,
  disableDrag,
  view,
}: {
  hideDate?: boolean;
  disableDrag?: boolean;
  view?: boolean;
}) => {
  const { campaignFormData } = useCampaigns();
  const {
    range: rrange,
    extendTimelineBefore,
    extendTimelineAfter,
    timelineStart,
  } = useRange();
  const { range } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const { active, subStep } = useActive();
  const { setClose } = useComments();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isExtendingRef = useRef(false);
  const hasScrolledToInitial = useRef(false);
  const prevViewType = useRef<string | null>(null);

  const getWidthForView = useCallback((viewType: string) => {
    switch (viewType) {
      case "Day":
      case "Week":
        return 50;
      case "Year":
        return 80;
      case "Month":
        return 100;
      default:
        return 50;
    }
  }, []);

  const getScrollTriggerDistance = useCallback((viewType: string) => {
    switch (viewType) {
      case "Year":
        return 400;
      case "Month":
        return 500;
      default:
        return 500;
    }
  }, []);

  const getFocusDate = useCallback((): Date | null => {
    if (campaignFormData?.channel_mix?.length > 0) {
      const stageDates = campaignFormData.channel_mix
        .map((stage: any) => stage.funnel_stage_timeline_start_date)
        .filter(Boolean)
        .map((d: string) => new Date(d))
        .filter((d: Date) => !isNaN(d.getTime()));

      if (stageDates.length > 0) {
        return stageDates.reduce((earliest: Date, current: Date) =>
          current < earliest ? current : earliest
        );
      }
    }

    if (campaignFormData?.campaign_timeline_start_date) {
      const date = new Date(campaignFormData.campaign_timeline_start_date);
      if (!isNaN(date.getTime())) return date;
    }

    return timelineStart ? new Date(timelineStart) : null;
  }, [
    campaignFormData?.channel_mix,
    campaignFormData?.campaign_timeline_start_date,
    timelineStart,
  ]);

  const calculateScrollPosition = useCallback(
    (focusDate: Date, viewType: string, tlStart: Date): number => {
      if (!tlStart || !focusDate) return 0;

      const unitWidth = getWidthForView(viewType);

      if (viewType === "Year") {
        const yearStart = startOfYear(tlStart);
        const months = differenceInCalendarMonths(focusDate, yearStart);
        return Math.max(0, months * unitWidth - 150);
      }

      if (viewType === "Month") {
        const weeks = differenceInCalendarWeeks(focusDate, tlStart, {
          weekStartsOn: 1,
        });
        return Math.max(0, weeks * unitWidth - 150);
      }

      const days = differenceInCalendarDays(focusDate, tlStart);
      return Math.max(0, days * unitWidth - 150);
    },
    [getWidthForView]
  );

  const scrollToFocusDate = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !timelineStart || !rrange?.length) return false;

    const focusDate = getFocusDate();
    if (!focusDate) return false;

    const scrollPos = calculateScrollPosition(focusDate, range, timelineStart);
    container.scrollLeft = scrollPos;
    return true;
  }, [
    timelineStart,
    rrange?.length,
    range,
    getFocusDate,
    calculateScrollPosition,
  ]);

  useEffect(() => {
    if (hasScrolledToInitial.current || !timelineStart || !rrange?.length) {
      return;
    }

    const timer = setTimeout(() => {
      if (scrollToFocusDate()) {
        hasScrolledToInitial.current = true;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [timelineStart, rrange?.length]);

  useEffect(() => {
    if (prevViewType.current !== null && prevViewType.current !== range) {
      setTimeout(() => {
        scrollToFocusDate();
      }, 50);
    }
    prevViewType.current = range;
  }, [range]);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isExtendingRef.current) {
      return;
    }

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const trigger = getScrollTriggerDistance(range);

    if (scrollLeft < trigger) {
      isExtendingRef.current = true;
      const oldWidth = scrollWidth;
      const oldScroll = scrollLeft;

      extendTimelineBefore();

      requestAnimationFrame(() => {
        const newWidth = container.scrollWidth;
        const added = newWidth - oldWidth;
        if (added > 0) {
          container.scrollLeft = oldScroll + added;
        }
        isExtendingRef.current = false;
      });
      return;
    }

    if (scrollWidth - scrollLeft - clientWidth < trigger) {
      isExtendingRef.current = true;
      extendTimelineAfter();

      requestAnimationFrame(() => {
        isExtendingRef.current = false;
      });
    }
  }, [
    range,
    extendTimelineBefore,
    extendTimelineAfter,
    getScrollTriggerDistance,
  ]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scroll", debouncedScroll);
    return () => {
      container.removeEventListener("scroll", debouncedScroll);
      clearTimeout(scrollTimeout);
    };
  }, [handleScroll]);

  const startDates = campaignFormData?.campaign_timeline_start_date
    ? campaignFormData?.campaign_timeline_start_date
    : null;

  const endDates = campaignFormData?.campaign_timeline_end_date
    ? campaignFormData?.campaign_timeline_end_date
    : null;

  const dayDifference = differenceInCalendarDays(endDates, startDates);
  const weekDifference =
    startDates && endDates
      ? eachWeekOfInterval(
          { start: new Date(startDates), end: new Date(endDates) },
          { weekStartsOn: 1 } // Optional: set Monday as start of week (0 = Sunday)
        ).length
      : 0;
  const monthDifference = differenceInCalendarMonths(endDates, startDates);
  const yearDifference = differenceInCalendarYears(endDates, startDates);

  const isValidDateFormat = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const start = campaignFormData?.campaign_timeline_start_date
    ? typeof campaignFormData.campaign_timeline_start_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_start_date)
      ? parseISO(campaignFormData.campaign_timeline_start_date)
      : campaignFormData.campaign_timeline_start_date
    : null;

  const end = campaignFormData?.campaign_timeline_end_date
    ? typeof campaignFormData.campaign_timeline_end_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_end_date)
      ? parseISO(campaignFormData.campaign_timeline_end_date)
      : campaignFormData.campaign_timeline_end_date
    : null;

  // Get the list of weeks
  const allWeeks =
    startDates && endDates
      ? eachWeekOfInterval(
          { start: new Date(startDates), end: new Date(endDates) },
          { weekStartsOn: 1 } // set week start as needed
        )
      : [];

  // Helper to get week index in the range
  const findWeekIndex = (date: Date | null) =>
    allWeeks.findIndex((weekStart) =>
      date ? isSameWeek(weekStart, date, { weekStartsOn: 1 }) : false
    ) + 1;

  // Calculate positions for different time ranges
  const startDay = differenceInCalendarDays(start, startDates) + 1;
  const endDay = differenceInCalendarDays(end, startDates) + 1;

  const startWeek = findWeekIndex(start) - 1;
  const endWeek = findWeekIndex(end) - 1;

  const startMonth = differenceInCalendarMonths(start, startDates) + 1;
  const endMonth = differenceInCalendarMonths(end, startDates) + 1;

  const startYear = differenceInCalendarYears(start, startDates) + 1;
  const endYear = differenceInCalendarYears(end, startDates) + 1;

  const funnelsData = {
    startDay,
    endDay,
    startWeek,
    endWeek,
    startMonth,
    endMonth,
    startYear,
    endYear,
  };

  function getDaysInEachMonth(): Record<string, number> {
    const daysInMonth: Record<string, number> = {};

    rrange?.forEach((date) => {
      const monthYear = format(date, "MMMM yyyy"); // Include year to differentiate months across years
      daysInMonth[monthYear] = (daysInMonth[monthYear] || 0) + 1;
    });

    return daysInMonth;
  }

  useEffect(() => {
    if (active === 7) {
      if (subStep === 1) {
        setClose(true);
      }
    }
  }, [active, subStep, close]);

  function getDaysInEachYear(): Record<string, number> {
    const daysInYear: Record<string, number> = {};

    rrange?.forEach((date) => {
      const year = format(date, "yyyy");
      daysInYear[year] = (daysInYear[year] || 0) + 1;
    });

    return daysInYear;
  }

  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return <DayInterval src="campaign" />;
      case "Month":
        return <MonthInterval disableDrag={disableDrag} />;
      case "Year":
        return <YearInterval />;
      default: // Week is default
        return (
          <WeekInterval funnelData={funnelsData} disableDrag={disableDrag} />
        );
    }
  };

  return (
    <div className="mt-[32px]">
      {!hideDate && <DateComponent useDate={true} />}

      <div className="box-border w-full min-h-auto bg-white border-b-2 relative mt-4">
        <div ref={scrollContainerRef} className="overflow-auto w-full h-full">
          <div className="relative min-w-max px-2">
            <div className="relative">
              <div className="bg-white">
                {/* <DateInterval /> */}
                {renderTimeline()}
              </div>
            </div>

            <ResizeableElements
              funnelData={funnelsData}
              disableDrag={disableDrag}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
            />
          </div>
        </div>
      </div>
      {isOpen && (
        <AddNewChennelsModel
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          selectedStage={selectedStage}
        />
      )}
      {/* </div> */}
    </div>
  );
};

export default MainSection;
