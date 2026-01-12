import { format } from "date-fns";
import type React from "react";
import { useMemo } from "react";
import { useDateRange } from "src/date-range-context";

interface DayIntervalProps {
  src?: string;
  range?: any
  isInfiniteTimeline?: boolean
}

const DayInterval: React.FC<DayIntervalProps> = ({  src , range, isInfiniteTimeline = true}) => {
  const { extendedRange } = useDateRange();
    const effectiveRange = isInfiniteTimeline ? extendedRange : range;

  const dailyWidth = isInfiniteTimeline ? 50 : undefined;
  const gridColumns = isInfiniteTimeline 
    ? `repeat(${effectiveRange?.length || 0}, ${dailyWidth}px)`
    : `repeat(${effectiveRange?.length || 0}, 1fr)`;

  // Calculate year headers
  const yearHeaders = useMemo(() => {
    const headers: Array<{ year: string; span: number }> = [];
    let currentYear: string | null = null;
    let currentSpan = 0;

    const rangeToUse = src === "dashboard" ? range : effectiveRange;

    if (rangeToUse && rangeToUse.length > 0) {
      rangeToUse.forEach((date: Date) => {
        if (date) {
          const year = format(date, "yyyy");

          if (currentYear === null) {
            currentYear = year;
            currentSpan = 1;
          } else if (currentYear === year) {
            currentSpan += 1;
          } else {
            headers.push({ year: currentYear, span: currentSpan });
            currentYear = year;
            currentSpan = 1;
          }
        }
      });

      if (currentYear !== null) {
        headers.push({ year: currentYear, span: currentSpan });
      }
    }

    return headers;
  }, [effectiveRange, range, src]);
  
  return (
    <div className={isInfiniteTimeline ? "min-w-max border-y relative" : "w-full border-y relative"}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
        }}
        className="border-b border-blue-200"
      >
        {yearHeaders.map((header, idx) => (
          <div
            key={`year-${idx}`}
            style={{
              gridColumn: `span ${header.span}`,
            }}
            className="relative h-full"
          >
            <div
              style={{
                position: "sticky",
                left: 0,
                width: "fit-content",
                backgroundColor: "white",
                paddingRight: "12px",
                zIndex: 10,
              }}
              className="py-2 px-3 border-l border-blue-200/50 h-full flex items-center"
            >
              <span className="font-[600] text-[16px] text-[rgba(0,0,0,0.7)]">
                {header.year}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridColumns,
        }}
        className="py-3"
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
