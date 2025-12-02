import { format } from "date-fns";
import type React from "react";
import { useDateRange } from "src/date-range-context";

interface DayIntervalProps {
  daysCount: number;
  src?: string;
  range?: any
}

const DayInterval: React.FC<DayIntervalProps> = ({ daysCount, src , range}) => {
  const { range: ddRange, extendedRange, isInfiniteTimeline } = useDateRange();
    const effectiveRange = isInfiniteTimeline ? extendedRange : ddRange;
  
  const dailyWidth = isInfiniteTimeline ? 50 : undefined;
  const gridColumns = isInfiniteTimeline 
    ? `repeat(${effectiveRange?.length || 0}, ${dailyWidth}px)`
    : `repeat(${effectiveRange?.length || 0}, 1fr)`;
  
  return (
    <div className={isInfiniteTimeline ? "min-w-max border-y py-3" : "w-full border-y py-3"}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
        }}
      >
        {Array.from({ length: effectiveRange?.length || 0 }, (_, i) => {
          const isEdge = i === 0 || i === (src==="dashboard" ? range?.length : effectiveRange?.length - 1);
          const date = src==="dashboard" ? range?.[i] : effectiveRange?.[i]
          return (
            <div key={i} className="flex flex-col items-center relative">
              {/* Week Label */}
              { (
                <div
                  key={i}
                  className={`relative min-w-[50px] text-center text-sm font-medium px-1 py-1 rounded-md
                          ${isEdge ? "bg-[#f05406] text-white" : "#fff"}
                        `}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(50px, 1fr)`,
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
              ) }
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayInterval;
