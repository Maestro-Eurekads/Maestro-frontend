"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { addDays, addMonths, addYears, subMonths, subYears, eachDayOfInterval, subDays, differenceInDays, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

const INITIAL_MONTHS_BUFFER = 6;
const EXTENSION_MONTHS = 12;

type DateRangeContextType = {
  range: Date[];
  setRange: (range: Date[]) => void;
  dateRangeWidth: number;
  setDateRangeWidth: (width: number) => void;
  extendRange: (newStart: string, newEnd: string) => void;
  // Infinite timeline
  extendedRange: Date[];
  campaignRange: Date[]; // Original campaign dates without buffer
  bufferMonths: number;
  setBufferMonths: (months: number) => void;
  isInfiniteTimeline: boolean;
  setIsInfiniteTimeline: (value: boolean) => void;
  // Functions to extend timeline dynamically - returns number of days added
  extendTimelineBefore: () => number;
  extendTimelineAfter: () => number;
  timelineStart: Date | null;
  timelineEnd: Date | null;
  // Daily width for scroll calculations
  dailyWidthPx: number;
  setDailyWidthPx: (width: number) => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider = ({ children }: { children: React.ReactNode }) => {
  const { campaignFormData } = useCampaigns();
  const [range, setRange] = useState<Date[]>([]);
  const [extendedRange, setExtendedRange] = useState<Date[]>([]);
  const [campaignRange, setCampaignRange] = useState<Date[]>([]);
  const [dateRangeWidth, setDateRangeWidth] = useState(0);
  const [bufferMonths, setBufferMonths] = useState(12); // 1 year default
  const [isInfiniteTimeline, setIsInfiniteTimeline] = useState(true);
  const [timelineStart, setTimelineStart] = useState<Date | null>(null);
  const [timelineEnd, setTimelineEnd] = useState<Date | null>(null);
  const [dailyWidthPx, setDailyWidthPx] = useState(15); // Default daily width in pixels
  
  // Track if we've initialized
  const initialized = useRef(false);

  // Initialize timeline with large range
  useEffect(() => {
    if (
      campaignFormData?.campaign_timeline_start_date &&
      campaignFormData?.campaign_timeline_end_date
    ) {
      const startDate = new Date(campaignFormData.campaign_timeline_start_date);
      const endDate = new Date(campaignFormData.campaign_timeline_end_date);
      
      // Original campaign range (no buffer)
      const campaignDateList = eachDayOfInterval({ start: startDate, end: endDate });
      setCampaignRange(campaignDateList);
      
      if (isInfiniteTimeline) {
        // Start with 6 months buffer before and after campaign dates
        const extendedStart = startOfMonth(subMonths(startDate, INITIAL_MONTHS_BUFFER));
        const extendedEnd = endOfMonth(addMonths(endDate, INITIAL_MONTHS_BUFFER));
        const extendedDateList = eachDayOfInterval({ start: extendedStart, end: extendedEnd });
        
        setTimelineStart(extendedStart);
        setTimelineEnd(extendedEnd);
        setExtendedRange(extendedDateList);
        setRange(extendedDateList);
        initialized.current = true;
      } else {
        const bufferedStart = subDays(startDate, 0);
        const bufferedEnd = addDays(endDate, 0);
        const dateList = eachDayOfInterval({ start: bufferedStart, end: bufferedEnd });
        setTimelineStart(bufferedStart);
        setTimelineEnd(bufferedEnd);
        setRange(dateList);
        setExtendedRange(dateList);
      }
    }
  }, [campaignFormData, isInfiniteTimeline]);

  // Extend timeline before (add 6 months to the beginning) - returns days added
  const extendTimelineBefore = useCallback((): number => {
    if (!timelineStart || !timelineEnd) return 0;
    
    const newStart = startOfMonth(subMonths(timelineStart, EXTENSION_MONTHS));
    const daysAdded = differenceInDays(timelineStart, newStart);
    const newDateList = eachDayOfInterval({ start: newStart, end: timelineEnd });
    
    setTimelineStart(newStart);
    setExtendedRange(newDateList);
    setRange(newDateList);
    
    return daysAdded;
  }, [timelineStart, timelineEnd]);

  // Extend timeline after (add 6 months to the end) - returns days added
  const extendTimelineAfter = useCallback((): number => {
    if (!timelineStart || !timelineEnd) return 0;
    
    const newEnd = endOfMonth(addMonths(timelineEnd, EXTENSION_MONTHS));
    const daysAdded = differenceInDays(newEnd, timelineEnd);
    const newDateList = eachDayOfInterval({ start: timelineStart, end: newEnd });
    
    setTimelineEnd(newEnd);
    setExtendedRange(newDateList);
    setRange(newDateList);
    
    return daysAdded;
  }, [timelineStart, timelineEnd]);

  const extendRange = useCallback(
    (newStartStr: string, newEndStr: string) => {
      const newStart = parseISO(newStartStr);
      const newEnd = parseISO(newEndStr);
      if (!range || range.length === 0) return;

      const currentStart = range[0];
      const currentEnd = range[range.length - 1];
      let updatedStart = currentStart;
      let updatedEnd = currentEnd;

      if (newStart < currentStart) {
        updatedStart = startOfYear(subYears(newStart, 1));
      }
      if (newEnd > currentEnd) {
        updatedEnd = endOfYear(addYears(newEnd, 1));
      }

      if (updatedStart !== currentStart || updatedEnd !== currentEnd) {
        const newRange = eachDayOfInterval({ start: updatedStart, end: updatedEnd });
        setTimelineStart(updatedStart);
        setTimelineEnd(updatedEnd);
        setRange(newRange);
        setExtendedRange(newRange);
      }
    },
    [range]
  );

  return (
    <DateRangeContext.Provider
      value={{ 
        range, 
        setRange, 
        dateRangeWidth, 
        setDateRangeWidth, 
        extendRange,
        extendedRange,
        campaignRange,
        bufferMonths,
        setBufferMonths,
        isInfiniteTimeline,
        setIsInfiniteTimeline,
        extendTimelineBefore,
        extendTimelineAfter,
        timelineStart,
        timelineEnd,
        dailyWidthPx,
        setDailyWidthPx,
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};