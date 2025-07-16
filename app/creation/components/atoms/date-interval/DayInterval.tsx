import { format } from "date-fns"
import type React from "react"
import { useDateRange } from "src/date-range-context"

interface DayIntervalProps {
  daysCount: number
  src?: string
  range?: any
}

const DayInterval: React.FC<DayIntervalProps> = ({ daysCount, src, range }) => {
  const { range: ddRange } = useDateRange()

  return (
    <div className="w-full border-y py-3">
      <div
        className="inline-flex"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${ddRange?.length}, 1fr)`,
          // width: "fit-content",
        }}
      >
        {Array.from({ length: ddRange?.length }, (_, i) => {
          const isEdge = i === 0 || i === (src === "dashboard" ? range.length : ddRange?.length - 1)
          const date = src === "dashboard" ? range[i] : ddRange[i]

          return (
            <div key={i} className="flex flex-col items-center relative">
              <div
                key={i}
                className={`relative w-[50px] text-center text-sm font-medium px-1 py-1 rounded-md ${
                  isEdge ? "bg-[#f05406] text-white" : "bg-white"
                }`}
              >
                <span className={`block ${isEdge ? "text-white" : "text-black"}`}>{date && format(date, "d")}</span>
                <span className={`block ${isEdge ? "text-white" : "text-blue-500"}`}>
                  {date && format(date, "MMM")}
                </span>

                {/* Triangle for Edge Dates */}
                {isEdge && (
                  <div className="absolute left-1/2 -bottom-[4.2px] transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#f05406]"></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DayInterval
