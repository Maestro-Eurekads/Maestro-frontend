import type React from "react";

interface DayIntervalProps {
  daysCount: number;
}

const DayInterval: React.FC<DayIntervalProps> = ({ daysCount }) => {
  return (
    <div className="w-full border-y py-5">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${daysCount}, 50px)`,
        }}
      >
        {Array.from({ length: daysCount }, (_, i) => (
          <div key={i} className="flex flex-col items-center relative">
            {/* Week Label */}
            <div className="flex flex-row gap-1 items-center mx-2">
              <span className="font-[500] text-[13px] text-[rgba(0,0,0,0.5)]">
                Day
              </span>
              <p className="font-[500] text-[13px] text-blue-500">{i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayInterval;
