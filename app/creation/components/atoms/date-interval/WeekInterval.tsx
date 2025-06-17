"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import moment from "moment";
import React, { useCallback } from "react";
import { useDateRange } from "src/date-range-context";

const WeekInterval = ({
  weeksCount,
  funnelData,
  disableDrag,
}: {
  weeksCount: any;
  funnelData?: any;
  disableDrag?: any;
}) => {
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  const groupDatesByWeek = (dates: Date[]) => {
    const weeks: string[][] = [];
    let currentWeek: string[] = [];

    dates.forEach((date, index) => {
      currentWeek.push(moment(new Date(date)).format("YYYY-MM-DD"));
      if (currentWeek.length === 7 || index === dates.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const datesByWeek = range ? groupDatesByWeek(range) : [];
  console.log("🚀 ~ datesByWeek:", datesByWeek);

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
  console.log("🚀 ~ week:", dailyWidth)

  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeksCount}, ${dailyWidth * 7}px)`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${dailyWidth}px 100%`,
        }}
      >
        {Array.from({ length: weeksCount }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center relative py-2"
          >
            {/* Week Label */}
            <div>
              <div className="font-[500] text-[13px]">
              {datesByWeek[i] && (
                <div className="flex flex-row gap-2 items-center justify-center">
                  <p>
                    {moment(datesByWeek[i][0]).format("DD")} -{" "}
                    {moment(datesByWeek[i][datesByWeek[i].length - 1]).format(
                      "DD"
                    )}
                  </p>
                </div>
              )}
              {datesByWeek[i] && (
                <p className="text-[rgba(0,0,255,0.5)]">
                  {moment(datesByWeek[i][0]).format("MMM")} -{" "}
                  {moment(datesByWeek[i][datesByWeek[i].length - 1]).format(
                    "MMM"
                  )}
                </p>
              )}
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekInterval;
