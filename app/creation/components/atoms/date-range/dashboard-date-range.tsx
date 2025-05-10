"use client"

import { useDateRange } from "src/date-context"


const Range = () => {
  const { range, setRange } = useDateRange()

  const handleRangeChange = (newRange: string) => {
    setRange(newRange)
  }

  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-2 py-1 shadow-sm border">
      <button
        className={`px-2 py-2 rounded-md text-sm font-medium ${
          range === "Day" ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => handleRangeChange("Day")}
      >
        Day
      </button>
      <button
        className={`px-2 py-2 rounded-md text-sm font-medium ${
          range === "Week" ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => handleRangeChange("Week")}
      >
        Week
      </button>
      <button
        className={`px-2 py-2 rounded-md text-sm font-medium ${
          range === "Month" ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => handleRangeChange("Month")}
      >
        Month
      </button>
    </div>
  )
}

export default Range
