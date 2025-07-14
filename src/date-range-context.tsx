"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { addDays, eachDayOfInterval, subDays, differenceInDays, parseISO } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

type DateRangeContextType = {
  range: Date[];
  setRange: (range: Date[]) => void;
  dateRangeWidth: number;
  setDateRangeWidth: (width: number) => void;
  extendRange: (newStart: string, newEnd: string) => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export const DateRangeProvider = ({ children }: { children: React.ReactNode }) => {
  const { campaignFormData } = useCampaigns();
  const [range, setRange] = useState<Date[]>([]);
  const [dateRangeWidth, setDateRangeWidth] = useState(0);

  useEffect(() => {
    if (
      campaignFormData?.campaign_timeline_start_date &&
      campaignFormData?.campaign_timeline_end_date
    ) {
      const startDate = new Date(campaignFormData.campaign_timeline_start_date);
      const endDate = new Date(campaignFormData.campaign_timeline_end_date);
      // Add 2-day buffer before and after
      const bufferedStart = subDays(startDate, 0);
      const bufferedEnd = addDays(endDate, 0);
      const dateList = eachDayOfInterval({ start: bufferedStart, end: bufferedEnd });
      setRange(dateList);
    }
  }, [campaignFormData]);

  const extendRange = useCallback(
    (newStartStr: string, newEndStr: string) => {
      console.log("Extending range:", newStartStr, newEndStr);
      const newStart = parseISO(newStartStr);
      const newEnd = parseISO(newEndStr);
      if (!range || range.length === 0) return;

      const currentStart = range[0];
      const currentEnd = range[range.length - 1];
      let updatedStart = currentStart;
      let updatedEnd = currentEnd;

      if (newStart < currentStart) {
        const daysToAdd = differenceInDays(currentStart, newStart) + 2;
        updatedStart = subDays(currentStart, daysToAdd);
      }
      if (newEnd > currentEnd) {
        const daysToAdd = differenceInDays(newEnd, currentEnd) + 2;
        updatedEnd = addDays(currentEnd, daysToAdd);
      }

      if (updatedStart !== currentStart || updatedEnd !== currentEnd) {
        const newRange = eachDayOfInterval({ start: updatedStart, end: updatedEnd });
        setRange(newRange);
      }
    },
    [range]
  );

  return (
    <DateRangeContext.Provider
      value={{ range, setRange, dateRangeWidth, setDateRangeWidth, extendRange }}
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