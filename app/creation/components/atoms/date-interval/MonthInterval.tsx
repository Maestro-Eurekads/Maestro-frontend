import type React from "react";
import { useEffect, useState } from "react";
import { eachDayOfInterval, addDays, format, differenceInDays } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";

interface MonthIntervalProps {
  monthsCount: number;
  view?: boolean;
}

const MonthInterval: React.FC<MonthIntervalProps> = ({ monthsCount, view }) => {
  const [monthNames, setSetMonthName] = useState([]);
  const { campaignFormData } = useCampaigns();
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

  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${monthsCount}, ${
            monthsCount === 1
              ? "100%"
              : monthsCount > 1
              ? `${100 / monthsCount}%`
              : `${100 / monthsCount}%`
          })`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundSize: !view
            ? `calc(100% / ${monthsCount}) 100%`
            : monthsCount === 1
            ? "100%"
            : monthsCount <= 3
            ? `calc(${100 / monthsCount}%)`
            : "33.33%",
        }}
      >
        {Array.from({ length: monthsCount }, (_, i) => (
          <div key={i} className="flex flex-col items-center relative py-3">
            {/* Week Label */}
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                {monthNames[i] ?? "Month"}
              </span>
              {monthNames?.length < 1 && (
                <p className="font-[500] text-[13px] text-blue-500">{i + 1}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthInterval;
