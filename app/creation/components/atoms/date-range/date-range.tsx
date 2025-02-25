import { useState, useEffect } from "react";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import { useDateRange } from "../../../../../src/date-range-context";

const Range = () => {
  const [selected, setSelected] = useState(""); // No default selection initially
  const { setRange } = useDateRange();

  const options = ["Day", "Week", "Month"];

  // Set default range to 14 days on first render
  useEffect(() => {
    setRange({ startDate: new Date(), endDate: addDays(new Date(), 13) });
  }, [setRange]);

  // Update range only when an option is selected
  const handleSelection = (option: string) => {
    setSelected(option);

    let newRange;
    const today = new Date();

    switch (option) {
      case "Day":
        newRange = { startDate: today, endDate: today };
        break;
      case "Week":
        newRange = { startDate: today, endDate: addDays(today, 6) };
        break;
      case "Month":
        newRange = { startDate: startOfMonth(today), endDate: endOfMonth(today) };
        break;
      default:
        return;
    }

    setRange(newRange);
  };

  return (
    <div className="w-fit z-0">
      <div className="relative flex items-center justify-between w-[210px] h-[42px] bg-[#F7F7F7] border border-black/10 rounded-lg p-[0.5]">
        {/* Moving Slider Indicator */}
        <div
          className="absolute w-[64px] h-[38px] bg-white border border-black/10 rounded-lg transition-transform duration-300 z-0"
          style={{
            transform: `translateX(${selected ? options.indexOf(selected) * 71.5 : 0}px)`,
          }}
        ></div>

        {/* Buttons */}
        {options.map((option) => (
          <button
            key={option}
            className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-300 ${selected === option ? "text-black" : "text-gray-500"
              }`}
            onClick={() => handleSelection(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Range;
