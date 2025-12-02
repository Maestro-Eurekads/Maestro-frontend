"use client";

import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "../../../../../src/date-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
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

const EXTENSION_DEBOUNCE_MS = 100;

const MainSection = ({
  hideDate,
  disableDrag,
  view,
}: {
  hideDate?: boolean;
  disableDrag?: boolean;
  view?: boolean;
}) => {
  const {  campaignFormData } = useCampaigns();
  const { range: rrange, extendTimelineBefore, extendTimelineAfter, isInfiniteTimeline, dailyWidthPx, timelineStart } = useRange();
  const { range } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const { active, subStep } = useActive();
  const { setClose } = useComments();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isExtendingRef = useRef(false);
  const lastExtensionTime = useRef(0);
  const hasScrolledToInitial = useRef(false);
  
  const getDailyWidthForView = useCallback(() => {
    switch (range) {
      case "Day":
        return 30;
      case "Week":
        return 30;
      case "Year":
        return 80;
      case "Month":
      default:
        return 15;
    }
  }, [range]);

  const getScrollTriggerDistance = useCallback(() => {
    if (range === "Year") {
      return 1000;
    }
    return 800;
  }, [range]);
  
  useEffect(() => {
    if (
      !hasScrolledToInitial.current && 
      scrollContainerRef.current && 
      isInfiniteTimeline && 
      timelineStart && 
      rrange?.length > 0
    ) {
      const container = scrollContainerRef.current;
      
      let focusDate: Date | null = null;
      
      if (campaignFormData?.channel_mix && campaignFormData.channel_mix.length > 0) {
        const allDates: Date[] = [];
        campaignFormData.channel_mix.forEach((stage: any) => {
          if (stage.funnel_stage_timeline_start_date) {
            allDates.push(new Date(stage.funnel_stage_timeline_start_date));
          }
          const mediaTypes = [
            "social_media", "display_networks", "search_engines", "streaming",
            "ooh", "broadcast", "messaging", "print", "e_commerce", "in_game", "mobile"
          ];
          mediaTypes.forEach((type) => {
            if (stage[type] && Array.isArray(stage[type])) {
              stage[type].forEach((platform: any) => {
                if (platform.campaign_start_date) {
                  allDates.push(new Date(platform.campaign_start_date));
                }
              });
            }
          });
        });
        
        if (allDates.length > 0) {
          focusDate = allDates.reduce((earliest, current) => 
            current < earliest ? current : earliest
          );
        }
      }
      
      if (!focusDate && campaignFormData?.campaign_timeline_start_date) {
        focusDate = new Date(campaignFormData.campaign_timeline_start_date);
      }
      
      if (!focusDate) return;
      
      let scrollPosition: number;
      
      if (range === "Year") {
        const yearTimelineStart = startOfYear(timelineStart);
        const monthsFromStart = differenceInCalendarMonths(focusDate, yearTimelineStart);
        const monthWidth = 80;
        scrollPosition = Math.max(0, (monthsFromStart * monthWidth) - 150);
      } else {
        const daysFromStart = differenceInCalendarDays(focusDate, timelineStart);
        const dailyWidth = getDailyWidthForView();
        scrollPosition = Math.max(0, (daysFromStart * dailyWidth) - 150);
      }
      
      setTimeout(() => {
        container.scrollLeft = scrollPosition;
        hasScrolledToInitial.current = true;
      }, 200);
    }
  }, [isInfiniteTimeline, timelineStart, campaignFormData?.channel_mix, campaignFormData?.campaign_timeline_start_date, rrange?.length, getDailyWidthForView, range]);

  const previousViewRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (
      scrollContainerRef.current && 
      isInfiniteTimeline && 
      timelineStart && 
      range &&
      previousViewRef.current !== null &&
      previousViewRef.current !== range
    ) {
      const container = scrollContainerRef.current;
      
      let focusDate: Date | null = null;
      
      if (campaignFormData?.channel_mix && campaignFormData.channel_mix.length > 0) {
        const allDates: Date[] = [];
        campaignFormData.channel_mix.forEach((stage: any) => {
          if (stage.funnel_stage_timeline_start_date) {
            allDates.push(new Date(stage.funnel_stage_timeline_start_date));
          }
        });
        
        if (allDates.length > 0) {
          focusDate = allDates.reduce((earliest, current) => 
            current < earliest ? current : earliest
          );
        }
      }
      
      if (!focusDate && campaignFormData?.campaign_timeline_start_date) {
        focusDate = new Date(campaignFormData.campaign_timeline_start_date);
      }
      
      if (focusDate) {
        let scrollPosition: number;
        
        if (range === "Year") {
          const yearTimelineStart = startOfYear(timelineStart);
          const monthsFromStart = differenceInCalendarMonths(focusDate, yearTimelineStart);
          const monthWidth = 80;
          scrollPosition = Math.max(0, (monthsFromStart * monthWidth) - 150);
        } else {
          const daysFromStart = differenceInCalendarDays(focusDate, timelineStart);
          const dailyWidth = getDailyWidthForView();
          scrollPosition = Math.max(0, (daysFromStart * dailyWidth) - 150);
        }
        
        setTimeout(() => {
          container.scrollLeft = scrollPosition;
        }, 100);
      }
    }
    
    previousViewRef.current = range;
  }, [range, isInfiniteTimeline, timelineStart, campaignFormData?.channel_mix, campaignFormData?.campaign_timeline_start_date, getDailyWidthForView]);
  
  const handleScroll = useCallback(() => {
    if (!isInfiniteTimeline || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const triggerDistance = getScrollTriggerDistance();
    
    const now = Date.now();
    const timeSinceLastExtension = now - lastExtensionTime.current;
    
    if (scrollLeft < triggerDistance && !isExtendingRef.current) {
      if (timeSinceLastExtension < EXTENSION_DEBOUNCE_MS) return;
      
      isExtendingRef.current = true;
      lastExtensionTime.current = now;
      
      const oldScrollWidth = container.scrollWidth;
      const currentScrollLeft = container.scrollLeft;
      
      extendTimelineBefore();
      
      setTimeout(() => {
        const newScrollWidth = container.scrollWidth;
        const addedWidth = newScrollWidth - oldScrollWidth;
        
        if (addedWidth > 0) {
          container.scrollLeft = currentScrollLeft + addedWidth;
        }
        
        isExtendingRef.current = false;
      }, 50);
    }
    
    const distanceFromEnd = scrollWidth - scrollLeft - clientWidth;
    
    if (distanceFromEnd < triggerDistance && !isExtendingRef.current) {
      if (timeSinceLastExtension < EXTENSION_DEBOUNCE_MS) return;
      
      isExtendingRef.current = true;
      lastExtensionTime.current = now;
      
      extendTimelineAfter();
      
      setTimeout(() => {
        isExtendingRef.current = false;
      }, 50);
    }
  }, [isInfiniteTimeline, extendTimelineBefore, extendTimelineAfter, getScrollTriggerDistance]);
  
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isInfiniteTimeline) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isInfiniteTimeline]);

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
        return <DayInterval daysCount={dayDifference + 1} src="campaign" />;
      case "Month":
        return (
          <MonthInterval
            monthsCount={monthDifference === 0 ? 1 : monthDifference + 1}
            view={view}
            getDaysInEachMonth={getDaysInEachMonth}
            funnelData={funnelsData}
            disableDrag={disableDrag}
          />
        );
      case "Year":
        return (
          <YearInterval
            yearsCount={yearDifference === 0 ? 1 : yearDifference + 1}
            view={view}
            getDaysInEachYear={getDaysInEachYear}
            funnelData={funnelsData}
            disableDrag={disableDrag}
          />
        );
      default: // Week is default
        return (
          <WeekInterval
            weeksCount={weekDifference === 0 ? 1 : weekDifference - 1}
            funnelData={funnelsData}
            disableDrag={disableDrag}
          />
        );
    }
  };

  return (
    <div className="mt-[32px]">
      {!hideDate && <DateComponent useDate={true} />}

      <div className="box-border w-full min-h-auto bg-white border-b-2 relative mt-4">
        <div 
          ref={scrollContainerRef}
          className="overflow-auto w-full h-full hide-vertical-scrollbar"
        >
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
