"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { eachMonthOfInterval, format, startOfMonth } from "date-fns";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "src/date-range-context";

interface QuarterIntervalProps {
  range?: any;
  isInfiniteTimeline?: boolean;
}

const MONTH_WIDTH_PX = 80;

const QuarterInterval: React.FC<QuarterIntervalProps> = ({
  range,
  isInfiniteTimeline = true,
}) => {
  const { campaignFormData } = useCampaigns();
  const { extendedRange } = useDateRange();
  const effectiveRange = isInfiniteTimeline ? extendedRange : range;
  const [monthsByYear, setMonthsByYear] = useState<Record<string, string[]>>(
    {}
  );

  useEffect(() => {
    let months: Date[] = [];

    if (effectiveRange && effectiveRange.length > 0) {
      months = eachMonthOfInterval({
        start: startOfMonth(effectiveRange[0]),
        end: effectiveRange[effectiveRange.length - 1],
      });
    } else if (
      campaignFormData?.campaign_timeline_start_date &&
      campaignFormData?.campaign_timeline_end_date
    ) {
      months = eachMonthOfInterval({
        start: startOfMonth(
          new Date(campaignFormData.campaign_timeline_start_date)
        ),
        end: new Date(campaignFormData.campaign_timeline_end_date),
      });
    }

    const grouped: Record<string, string[]> = {};
    months.forEach((month) => {
      const year = format(month, "yyyy");
      const monthName = format(month, "MMM");
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(monthName);
    });

    setMonthsByYear(grouped);
  }, [campaignFormData, effectiveRange, isInfiniteTimeline]);

  const sortedYears = useMemo(
    () => Object.keys(monthsByYear).sort(),
    [monthsByYear]
  );

  const totalMonths = useMemo(
    () => sortedYears.reduce((acc, year) => acc + monthsByYear[year].length, 0),
    [sortedYears, monthsByYear]
  );

  const gridTemplateColumns = `repeat(${totalMonths}, ${MONTH_WIDTH_PX}px)`;

  const allMonths = useMemo(() => {
    const result: Array<{
      month: string;
      year: string;
      quarter: number;
      isFirstOfYear: boolean;
    }> = [];
    sortedYears.forEach((year) => {
      monthsByYear[year].forEach((month, idx) => {
        // Calculate quarter based on month abbreviation
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(month);
        const quarter = monthIndex >= 0 ? Math.floor(monthIndex / 3) + 1 : 1;
        
        result.push({
          month,
          year,
          quarter,
          isFirstOfYear: idx === 0,
        });
      });
    });
    return result;
  }, [sortedYears, monthsByYear]);

  const yearHeaders = useMemo(() => {
    const headers: Array<{ year: string; span: number; startIndex: number }> =
      [];
    let currentIndex = 0;

    sortedYears.forEach((year) => {
      const monthCount = monthsByYear[year].length;
      headers.push({
        year,
        span: monthCount,
        startIndex: currentIndex,
      });
      currentIndex += monthCount;
    });

    return headers;
  }, [sortedYears, monthsByYear]);

  const quarterHeaders = useMemo(() => {
    const headers: Array<{ quarter: string; span: number; startIndex: number }> =
      [];
    let currentIndex = 0;
    let currentQuarter: number | null = null;
    let currentYear: string | null = null;
    let currentSpan = 0;

    allMonths.forEach((month) => {
      if (
        currentQuarter === null ||
        currentYear !== month.year ||
        currentQuarter !== month.quarter
      ) {
        if (currentQuarter !== null && currentYear !== null) {
          headers.push({
            quarter: `Q${currentQuarter}`,
            span: currentSpan,
            startIndex: currentIndex - currentSpan,
          });
        }
        currentQuarter = month.quarter;
        currentYear = month.year;
        currentSpan = 1;
      } else {
        currentSpan++;
      }
      currentIndex++;
    });

    if (currentQuarter !== null && currentYear !== null) {
      headers.push({
        quarter: `Q${currentQuarter}`,
        span: currentSpan,
        startIndex: currentIndex - currentSpan,
      });
    }

    return headers;
  }, [allMonths]);

  return (
    <div
      className={
        isInfiniteTimeline
          ? "min-w-max border-y relative"
          : "w-full border-y relative"
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns,
        }}
        className="border-b border-blue-200"
      >
        {yearHeaders.map((header) => (
          <div
            key={header.year}
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
              className="py-2 px-3 border-r border-blue-200/50 h-full flex items-center"
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
          gridTemplateColumns,
        }}
        className="border-b border-blue-200"
      >
        {quarterHeaders.map((header, idx) => (
          <div
            key={`quarter-${idx}`}
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
                zIndex: 9,
              }}
              className="py-2 px-3 border-r border-blue-200/50 h-full flex items-center"
            >
              <span className="font-[600] text-[14px] text-[rgba(0,0,0,0.7)]">
                {header.quarter}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns,
          backgroundImage: `linear-gradient(to right, rgba(0,0,255,0.1) 1px, transparent 1px)`,
          backgroundSize: `${MONTH_WIDTH_PX}px 100%`,
        }}
      >
        {allMonths.map((item, i) => (
          <div
            key={`${item.year}-${item.month}-${i}`}
            className="flex flex-col items-center justify-center relative py-3 last:border-r-0"
          >
            <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuarterInterval;
