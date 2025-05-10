"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { addDays, eachDayOfInterval } from "date-fns";
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
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
);

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { campaignFormData } = useCampaigns();
  const [range, setRange] = useState<Date[]>([]);

  const [dateRangeWidth, setDateRangeWidth] = useState(0);

  useEffect(() => {
    if (
      campaignFormData?.campaign_timeline_start_date &&
      campaignFormData?.campaign_timeline_end_date
    ) {

      const startDate = new Date(
        campaignFormData?.campaign_timeline_start_date
      );

      const endDate = new Date(campaignFormData?.campaign_timeline_end_date);

      const differenceInDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const dateList = eachDayOfInterval({
        start:
          new Date(campaignFormData?.campaign_timeline_start_date) ||
          new Date(),
        end:
          addDays(
            new Date(campaignFormData?.campaign_timeline_start_date),
            differenceInDays
          ) || addDays(new Date(), 13),
      });
      setRange(dateList);
    }
  }, [campaignFormData]);
  return (
    <DateRangeContext.Provider
      value={{ range, setRange, dateRangeWidth, setDateRangeWidth }}
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
