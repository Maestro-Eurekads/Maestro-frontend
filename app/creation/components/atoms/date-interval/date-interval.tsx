"use client";
import React, { useEffect, useRef } from "react";
import { format, eachDayOfInterval } from "date-fns";
import { useDateRange } from "../../../../../src/date-range-context";

const DateInterval = () => {
  const { range, setDateRangeWidth } = useDateRange();
  const containerRef = useRef<HTMLDivElement>(null);
  const dateList = eachDayOfInterval({
    start: range.startDate,
    end: range.endDate,
  });

  useEffect(() => {
    if (containerRef.current) {
      setDateRangeWidth(containerRef.current.offsetWidth);
    }
  }, [setDateRangeWidth]);

  return (
    <div
      className=" w-full overflow-x-auto whitespace-nowrap flex justify-between border-y py-5 px-[23px] "
      ref={containerRef}
    >
      {dateList.map((date, index) => {
        const isEdge = index === 0 || index === dateList.length - 1;

        return (
          <div
            key={index}
            className={`relative min-w-[60px] text-center text-sm font-medium px-2 py-1 rounded-md
              ${isEdge ? "bg-[#f05406] text-white" : "#fff"}
            `}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dateList.length}, 1fr)`,
            }}

          >
            <span className={`${isEdge ? "text-white" : "text-black"}`}>
              {format(date, "E")},&nbsp; {/* Added space here */}
            </span>
            <span className={`${isEdge ? "text-white" : "text-blue-500"}`}>
              {format(date, "d")}
            </span>

            {/* Triangle for Edge Dates */}
            {isEdge && (
              <div className="absolute left-1/2 -bottom-[4.2] transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#f05406]"></div>
              </div>
            )}
            
          </div>
        );
      })}
    </div>
  );
};

export default DateInterval;
