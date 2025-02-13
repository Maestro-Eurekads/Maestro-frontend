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
  }, []);
  return (
    <div
      className="overflow-x-auto whitespace-nowrap flex justify-between border-y py-5 px-6"
      ref={containerRef}
    >
      {dateList.map((date, index) => {
        const isEdge = index === 0 || index === dateList.length - 1;

        return (
          <div
            key={index}
            className={`min-w-[60px] text-center text-sm font-medium px-2 py-1 rounded-md
              ${isEdge ? "bg-[#f05406]" : ""}
            `}
          >
            <span className={`${isEdge ? "text-white" : "text-black"}`}>
              {format(date, "E")},{" "}
            </span>
            <span className={`${isEdge ? "text-white" : "text-blue-500"}`}>
              {format(date, "d")}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default DateInterval;
