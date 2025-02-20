import { useState } from "react";

const Range = () => {
  const [selected, setSelected] = useState("Day");

  const options = ["Day", "Week", "Month"];

  return (
    <div className="w-fit">
      <div className="relative flex items-center justify-between w-[210px] h-[42px] bg-[#F7F7F7] border border-black/10 rounded-lg  p-[0.5]">

        {/* Moving Slider Indicator */}
        <div
          className="absolute w-[64px] h-[38px] bg-white border border-black/10 rounded-lg transition-transform duration-300"
          style={{
            transform: `translateX(${options.indexOf(selected) * 71.5}px)`, // Dynamic movement
          }}
        ></div>

        {/* Buttons */}
        {options.map((option) => (
          <button
            key={option}
            className={`relative z-10 flex-1 text-sm font-medium  transition-colors duration-300 ${selected === option ? "text-black" : "text-gray-500"
              }`}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Range;
