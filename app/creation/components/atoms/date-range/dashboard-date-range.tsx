"use client";

import { useDateRange } from "src/date-context";

const Range = () => {
  const { range, setRange } = useDateRange();

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
  };

  const options = ["Day", "Week", "Month", "Quarter", "Year"];
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg p-2 py-1 shadow-sm border">
      {options.map((option) => (
        <button
          key={option}
          className={`px-2 py-2 rounded-md text-sm font-medium ${
            range === option
              ? "bg-blue-500 text-white"
              : "bg-transparent text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => handleRangeChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default Range;
