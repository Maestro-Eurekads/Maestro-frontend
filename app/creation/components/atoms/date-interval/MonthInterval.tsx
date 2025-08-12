"use client";
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import type React from "react";
import { useDateRange } from "src/date-range-context";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useComments } from "app/utils/CommentProvider";
import { useCallback, useMemo } from "react";

interface MonthIntervalProps {
  monthsCount: number;
  view?: boolean;
  getDaysInEachMonth?: () => Record<string, number>;
  funnelData?: any;
  disableDrag?: boolean;
  range?: Date[];
  src?: string;
}

const MonthInterval: React.FC<MonthIntervalProps> = ({ 
  monthsCount, 
  view, 
  getDaysInEachMonth, 
  funnelData, 
  disableDrag,
  range,
  src 
}) => {
  const { campaignFormData } = useCampaigns();
  const { range: contextRange } = useDateRange();
  const { close } = useComments();

  const computeHeaderRange = (): Date[] => {
    if (Array.isArray(funnelData) && funnelData.length > 0) {
      const dates: Date[] = [];

      funnelData.forEach((funnel) => {
        if (funnel?.startDate) dates.push(new Date(funnel.startDate));
        if (funnel?.endDate) dates.push(new Date(funnel.endDate));

        if (Array.isArray(funnel.stages)) {
          funnel.stages.forEach((stage: any) => {
            if (stage?.startDate) dates.push(new Date(stage.startDate));
            if (stage?.endDate) dates.push(new Date(stage.endDate));
          });
        }
      });

      const validDates = dates.filter((d) => !isNaN(d as unknown as number));

      if (validDates.length > 0) {
        const minDate = validDates.reduce((a, b) => (a < b ? a : b));
        const maxDate = validDates.reduce((a, b) => (a > b ? a : b));

        return eachMonthOfInterval({ 
          start: startOfMonth(minDate), 
          end: endOfMonth(maxDate) 
        });
      }
    }

    if (src === "dashboard" && Array.isArray(range)) {
      // For dashboard, we need to get unique months from the range
      const uniqueMonths = new Set();
      range.forEach(date => {
        uniqueMonths.add(format(date, 'yyyy-MM'));
      });
      
      const monthDates = Array.from(uniqueMonths).map((monthStr: string) => {
        const [year, month] = monthStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
      }).sort((a, b) => a.getTime() - b.getTime());
      
      return monthDates;
    }

    return contextRange ? eachMonthOfInterval({
      start: startOfMonth(contextRange[0]),
      end: endOfMonth(contextRange[contextRange.length - 1])
    }) : [];
  };

  const headerMonths = computeHeaderRange();

  const calculateDailyWidth = useCallback(() => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth - (disableDrag ? 80 : close ? 0 : 367);

    // For month view, we need to calculate based on the total number of days
    // to match the day-level grid precision used in the main container
    const totalDays = range?.length || 1;
    let dailyWidth = contWidth / totalDays;

    // For month view, make day columns much smaller to fit more months
    // Each day should be a tiny section under the month header
    dailyWidth = Math.max(dailyWidth, 8); // Much smaller minimum for day columns
    dailyWidth = Math.min(dailyWidth, 15); // Much smaller maximum width

    return Math.round(dailyWidth);
  }, [disableDrag, close, range]);

  const dailyWidth = calculateDailyWidth();

  // Create grid template columns with day-level precision
  const gridTemplateColumns = `repeat(${range?.length || 1}, ${dailyWidth}px)`;

  return (
    <div className="w-full border-y py-1">
      <div
        className="inline-flex"
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
        }}
      >
        {/* Create month headers that span the correct number of days */}
        {headerMonths.map((monthDate, i) => {
          const isEdge = i === 0 || i === (headerMonths.length - 1);
          const monthName = format(monthDate, "MMMM yyyy");
          
          // Calculate how many days this month spans in the range
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          
          // Count days in this month that are in the range
          const daysInMonthInRange = range?.filter(date => 
            date >= monthStart && date <= monthEnd
          ).length || 0;
          
          // Calculate the grid column span for this month
          const gridColumnSpan = daysInMonthInRange > 0 ? daysInMonthInRange : 1;
          
          // Calculate the starting column position
          let startColumn = 1;
          for (let j = 0; j < i; j++) {
            const prevMonthDate = headerMonths[j];
            const prevMonthStart = startOfMonth(prevMonthDate);
            const prevMonthEnd = endOfMonth(prevMonthDate);
            const prevDaysInRange = range?.filter(date => 
              date >= prevMonthStart && date <= prevMonthEnd
            ).length || 0;
            startColumn += prevDaysInRange > 0 ? prevDaysInRange : 1;
          }

          return (
            <div 
              key={i} 
              className="flex flex-col items-center relative"
              style={{
                gridColumn: `${startColumn} / span ${gridColumnSpan}`,
              }}
            >
              <div
                className={`relative w-full text-center text-sm font-medium px-1 py-1 rounded-md border-r border-gray-300 ${
                  i === 0 ? "border-l border-gray-300" : ""
                } ${
                  isEdge ? "bg-[#f05406] text-white" : "bg-white"
                }`}
                style={{ minWidth: `${dailyWidth * gridColumnSpan}px` }}
              >
                <span className={`block ${isEdge ? "text-white" : "text-black"}`}>
                  {monthName}
                </span>
                <span className={`block text-xs ${isEdge ? "text-white" : "text-blue-500"}`}>
                  ({daysInMonthInRange} days)
                </span>

                {/* Triangle for Edge Dates */}
                {isEdge && (
                  <div className="absolute left-1/2 -bottom-[4.2px] transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#f05406]" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthInterval; 