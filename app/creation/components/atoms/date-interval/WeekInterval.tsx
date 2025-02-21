"use client";
import React from "react";

const WeekInterval = ({ weeksCount }) => {
  return (
    <div className="w-full overflow-x-auto border-y py-5">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeksCount}, 1fr)`,
        }}
      >
        {Array.from({ length: weeksCount }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center relative"
          >
            {/* Week Label */}
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
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
