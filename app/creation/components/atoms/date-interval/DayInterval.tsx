import { format, eachDayOfInterval } from "date-fns";
import type React from "react";
import { useDateRange } from "src/date-range-context";

interface DayIntervalProps {
  daysCount: number;
  /**
   * Identifies the origin of the call.  "dashboard" means the parent has
   * already supplied an explicit range array via the `range` prop.  Any other
   * value falls back to the date-range context (legacy behaviour).
   */
  src?: string;
  /**
   * Explicit array of JavaScript Date objects coming from the parent.  Used
   * only when `src === "dashboard"` *and* `funnelData` is empty.
   */
  range?: Date[];
  /**
   * Timeline funnels.  When present, the earliest startDate and latest endDate
   * across all funnels (and their stages) will be used to compute the header
   * date range.
   */
  funnelData?: any[];
}

const DayInterval: React.FC<DayIntervalProps> = ({ daysCount, src, range, funnelData }) => {
  const { range: contextRange } = useDateRange();

  /**
   * Compute the array of Date objects that will be displayed in the header.
   * Priority:
   *   1. If `funnelData` is provided & non-empty, use earliest startDate and
   *      latest endDate across all funnels/stages.
   *   2. Else if `src === "dashboard"` and `range` was supplied, use it.
   *   3. Fallback to `useDateRange()` context.
   */
  
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

      // Filter out invalid dates just in case
      const validDates = dates.filter((d) => !isNaN(d as unknown as number));

      if (validDates.length > 0) {
        const minDate = validDates.reduce((a, b) => (a < b ? a : b));
        const maxDate = validDates.reduce((a, b) => (a > b ? a : b));

        return eachDayOfInterval({ start: minDate, end: maxDate });
      }
    }

    // Fallbacks
    if (src === "dashboard" && Array.isArray(range)) {
      return range;
    }

    return contextRange ?? [];
  };

  const headerDates = computeHeaderRange();

  return (
    <div className="w-full border-y py-3">
      <div
        className="inline-flex"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${headerDates.length}, 1fr)`,
        }}
      >
        {headerDates.map((date, i) => {
          const isEdge = i === 0 || i === headerDates.length - 1;

          return (
            <div key={i} className="flex flex-col items-center relative">
              <div
                className={`relative w-[50px] text-center text-sm font-medium px-1 py-1 rounded-md ${
                  isEdge ? "bg-[#f05406] text-white" : "bg-white"
                }`}
              >
                <span className={`block ${isEdge ? "text-white" : "text-black"}`}>
                  {date && format(date, "d")}
                </span>
                <span className={`block ${isEdge ? "text-white" : "text-blue-500"}`}>
                  {date && format(date, "MMM")}
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

export default DayInterval;
