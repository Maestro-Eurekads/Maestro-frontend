import type React from "react";
import { useState } from "react";

interface MonthIntervalProps {
  monthsCount: number;
}

const MonthInterval: React.FC<MonthIntervalProps> = ({ monthsCount }) => {
  // const [containerWidth, setContainerWidth] = useState(0)
  const gridContainer = document.querySelector(
    ".grid-container"
  ) as HTMLElement;
  if (!gridContainer) return;

  // Get container boundaries
  const containerRect = gridContainer.getBoundingClientRect();
  const containerWidth = containerRect.width - 75;
  return (
    <div className="w-full border-y">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${monthsCount}, 1fr)`,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.2) 1px, transparent 1px)`,
          backgroundSize: `calc(1550px) 100%`,
        }}
      >
        {Array.from({ length: monthsCount }, (_, i) => (
          <div key={i} className="flex flex-col items-center relative py-5">
            {/* Week Label */}
            <div className="flex flex-row gap-2 items-center">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                Month
              </span>
              <p className="font-[500] text-[13px] text-blue-500">{i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthInterval;
