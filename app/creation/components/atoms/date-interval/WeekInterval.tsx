"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import React from "react";
import { useDateRange } from "src/date-range-context";

const WeekInterval = ({ weeksCount }) => {
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  return (
    <div className="w-full border-y py-5">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeksCount}, ${
            weeksCount > 2 ? `360px` : `50%`
          })`,
        }}
      >
        {Array.from({ length: weeksCount }, (_, i) => {
          const isEdge = i === 0 || i === range?.length - 1;
          return (
            <div key={i} className="flex flex-col items-center relative">
              {/* Week Label */}
              <div className="flex flex-row gap-2 items-center">
                <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                  Week
                </span>
                <p className="font-[500] text-[13px] text-blue-500">{i + 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekInterval;
