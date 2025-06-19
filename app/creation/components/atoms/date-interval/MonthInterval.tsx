import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { eachDayOfInterval, addDays, format, differenceInDays } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";

interface MonthIntervalProps {
  monthsCount: number;
  view?: boolean;
  getDaysInEachMonth?: any;
  funnelData?: any;
  disableDrag?: any
}

const MonthInterval: React.FC<MonthIntervalProps> = ({ monthsCount, view, getDaysInEachMonth, disableDrag, funnelData }) => {

  const [monthNames, setSetMonthName] = useState([]);
  const [daysInMonth, setDaysInEachMonth] = useState([]);
  const { campaignFormData } = useCampaigns();
  useEffect(() => {
    if (getDaysInEachMonth) {
      setDaysInEachMonth(getDaysInEachMonth())
    }
  }, [getDaysInEachMonth])
  // const daysInMonth = getDaysInEachMonth()
  // Compute gridTemplateColumns dynamically from daysInMonth
  const totalDays = Object.values(daysInMonth || {}).reduce((acc,
    //@ts-ignore
    days) => acc + (days as number), 0);

  const gridTemplateColumns = Object.values(daysInMonth || {})
    //@ts-ignore
    .map((days) => `${(days / totalDays) * 100}%`)
    .join(" ");

  useEffect(() => {
    if (campaignFormData) {
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

      // Extract month names
      const names = Array.from(
        new Set(dateList.map((date) => format(date, "MMMM")))
      );
      setSetMonthName(names);
    }
  }, [campaignFormData]);

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth - (disableDrag ? 80 : 367);

    const totalDays = funnelData?.endDay || 30;
    let dailyWidth = contWidth / totalDays;

    // Ensure minimum width constraints
    dailyWidth = Math.max(dailyWidth, 50);

    return Math.round(dailyWidth);
  }, [disableDrag, funnelData?.endDay]);

  const dailyWidth = calculateDailyWidth();

  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundSize: `100% 100%`,
        }}
      >
        {Object.entries(daysInMonth || {}).map(([monthName], i) => (
          <div
            key={i}
            className="flex flex-col items-center relative py-3 border-r border-blue-200 last:border-r-0"
          >
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                {monthName}
              </span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default MonthInterval;
