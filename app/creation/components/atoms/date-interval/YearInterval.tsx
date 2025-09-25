"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { eachDayOfInterval, addDays, format } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";

interface YearIntervalProps {
  yearsCount?: number;
  view?: boolean;
  getDaysInEachYear?: any;
  funnelData?: any;
  disableDrag?: any;
}

const YearInterval: React.FC<YearIntervalProps> = ({
  yearsCount,
  view,
  getDaysInEachYear,
  disableDrag,
  funnelData,
}) => {
  const [yearNames, setYearNames] = useState<string[]>([]);
  const [daysInEachYear, setDaysInEachYear] = useState<Record<string, number>>(
    {}
  );
  const { campaignFormData } = useCampaigns();

  // Function to calculate days in each year from the campaign timeline
  const calculateDaysInEachYear = useCallback(() => {
    if (
      !campaignFormData?.campaign_timeline_start_date ||
      !campaignFormData?.campaign_timeline_end_date
    ) {
      return {};
    }

    const startDate = new Date(campaignFormData.campaign_timeline_start_date);
    const endDate = new Date(campaignFormData.campaign_timeline_end_date);

    const dateList = eachDayOfInterval({ start: startDate, end: endDate });
    const yearDays: Record<string, number> = {};

    dateList.forEach((date) => {
      const year = format(date, "yyyy");
      yearDays[year] = (yearDays[year] || 0) + 1;
    });

    return yearDays;
  }, [campaignFormData]);

  // Use provided function or calculate internally
  const daysInYear = getDaysInEachYear ? getDaysInEachYear() : daysInEachYear;

  // Compute gridTemplateColumns dynamically from daysInYear
  const totalDays = Object.values(daysInYear || {}).reduce(
    //@ts-ignore
    (acc, days) => acc + Number(days),
    0
  );

  const gridTemplateColumns = Object.values(daysInYear || {})
    //@ts-ignore
    .map((days) => `${((days as number) / totalDays) * 100}%`)
    .join(" ");

  useEffect(() => {
    if (campaignFormData) {
      const startDate = new Date(campaignFormData.campaign_timeline_start_date);
      const endDate = new Date(campaignFormData.campaign_timeline_end_date);

      const differenceInDaysCount = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const dateList = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, differenceInDaysCount),
      });

      // Extract unique year names
      const years = Array.from(
        new Set(dateList.map((date) => format(date, "yyyy")))
      );
      setYearNames(years);

      // Calculate days in each year if not provided externally
      if (!getDaysInEachYear) {
        const yearDaysData = calculateDaysInEachYear();
        setDaysInEachYear(yearDaysData);
      }
    }
  }, [campaignFormData, getDaysInEachYear, calculateDaysInEachYear]);

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth - (disableDrag ? 80 : 367);

    const totalDays = funnelData?.endDay || 365; // Default to 365 for year view
    let dailyWidth = contWidth / totalDays;

    // Ensure minimum width constraints
    dailyWidth = Math.max(dailyWidth, 10); // Smaller minimum for year view

    return Math.round(dailyWidth);
  }, [disableDrag, funnelData?.endDay]);

  const dailyWidth = calculateDailyWidth();

  return (
    <div className="w-full border-y border-r">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${yearNames.length}, 1fr)`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.3) 1px, transparent 1px)`,
          backgroundSize: `100% 100%`,
        }}
      >
        {yearNames.map((yearName, i) => {
          return (
            <div
              key={i}
              className="flex flex-col items-center relative py-4 border-r-2 border-blue-300 last:border-r-0"
            >
              <div className="flex flex-row gap-2 items-center">
                <span className="font-[600] text-[16px] text-[rgba(0,0,0,0.7)]">
                  {yearName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearInterval;
