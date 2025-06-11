"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import React from "react";
import { useDateRange } from "src/date-range-context";

const WeekInterval = ({ weeksCount, funnelData, disableDrag }) => {
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeksCount}, 1fr)`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: (function () {
            const gridContainer = document.querySelector(
              ".grid-container"
            ) as HTMLElement;
            const getViewportWidth = () => {
              return (
                window.innerWidth || document.documentElement.clientWidth || 0
              );
            };
            const screenWidth = getViewportWidth();
            if (!gridContainer) return;
            const endMonth = funnelData?.endDay || 1;
            const contWidth = screenWidth - (disableDrag ? 80 : 367); // subtract margin/padding if needed

            // console.log("🚀  ~ contWidth:", contWidth)
            const percent = 100 / endMonth; // e.g., 20 if endMonth=5
            const total = (percent / 100) * contWidth; // target total width in px for all days (31 days)

            const dailyWidth = contWidth / endMonth; // width per day without factor
            console.log("🚀  ~ dailyWidth:", dailyWidth);
            const totalLines = Math.round(dailyWidth) * endMonth; // total width for 31 days without factor

            // Calculate factor to scale dailyWidth to reach 'total'
            const factor = total / totalLines; // e.g., if total=500 and totalLines=400, factor=1.25

            const adjustedDailyWidth = dailyWidth;

            return `calc(${
              adjustedDailyWidth < 50 ? 50 : adjustedDailyWidth
            }px) 100%, calc(${
              (adjustedDailyWidth < 50 ? 50 : adjustedDailyWidth) * 7
            }px) 100%`;
          })(),
        }}
      >
        {Array.from({ length: weeksCount }, (_, i) => (
          <div key={i} className="flex flex-col items-center justify-center relative py-2">
            {/* Week Label */}
            <div className="flex flex-row gap-2 items-center mb-2 justify-center text-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,255,0.5)]">
                Week
              </span>
              <p className="font-[500] text-[13px] text-blue-500">{i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekInterval;
