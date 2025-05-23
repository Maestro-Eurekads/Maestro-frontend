"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import React from "react";
import { useDateRange } from "src/date-range-context";

const WeekInterval = ({ weeksCount }) => {
  const { campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeksCount}, 350px)`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundSize: `calc(350px) 100%`,
        }}
      >
        {Array.from({ length: weeksCount }, (_, i) => (
          <div key={i} className="flex flex-col items-center relative py-2">
        {/* Week Label */}
        <div className="flex flex-row gap-2 items-center mb-2">
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
