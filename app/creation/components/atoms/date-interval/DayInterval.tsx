import { format } from "date-fns";
import type React from "react";
import { useDateRange } from "src/date-range-context";

interface DayIntervalProps {
  daysCount: number;
  src?: string;
}

const DayInterval: React.FC<DayIntervalProps> = ({ daysCount, src }) => {
  const { range } = useDateRange();
  return (
    <div className="w-full border-y py-3">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${daysCount},1fr )`,
        }}
      >
        {Array.from({ length: daysCount + 1 }, (_, i) => {
          const isEdge = i === 0 || i === range?.length - 1;
          const date = range[i]
          return (
            <div key={i} className="flex flex-col items-center relative">
              {/* Week Label */}
              {src && src === "campaign" ? (
                <div
                  key={i}
                  className={`relative min-w-[50px] text-center text-sm font-medium px-1 py-1 rounded-md
                          ${isEdge ? "bg-[#f05406] text-white" : "#fff"}
                        `}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(100px, 1fr)`,
                  }}
                >
                  <span className={`${isEdge ? "text-white" : "text-black"}`}>
                    {date && format(date, "d")}
                  </span>
                  <span
                    className={`${isEdge ? "text-white" : "text-blue-500"}`}
                  >
                    {date && format(date, "MMM")}
                  </span>

                  {/* Triangle for Edge Dates */}
                  {isEdge && (
                    <div className="absolute left-1/2 -bottom-[4.2] transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#f05406]"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-row gap-1 items-center mx-2">
                  <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                    Day
                  </span>
                  <p className="font-[500] text-[13px] text-blue-500">
                    {i + 1}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayInterval;
