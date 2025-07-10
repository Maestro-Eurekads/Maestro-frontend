import React from "react";

const ThreeValuesProgress = ({
  values,
  color,
  showpercent,
}: {
  values: number[];
  showpercent: boolean;
  color?: string[];
}) => {
  const total = values?.reduce((acc, val) => acc + val, 0) || 0;
  const percentages = total > 0 ? values?.map((val) => (val / total) * 100) : [0, 0, 0];

  // Fallback hex colors aligned with colorClassToHex from other components
  const fallbackColors = ["#3B82F6", "#22C55E", "#F59E42"]; // blue-500, green-500, orange-500



  // Function to format percentage: remove `.0` if it's a whole number
  const formatPercentage = (value: number) =>
    value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  return (
    <div className="w-full h-[24px] flex overflow-hidden rounded-[4px] bg-gray-200">
      {percentages?.map((percent, index) => {
        const borderRadiusStyles = ["4px 0 0 4px", "0px", "0px 4px 4px 0px"];
        const segmentColor = color && color[index] ? color[index] : "#6B7280";

        return (
          <div
            key={index}
            className="h-full flex items-center justify-center"
            style={{
              width: `${percent}%`,
              backgroundColor: segmentColor,
              borderRadius: borderRadiusStyles[index],
            }}
          >
            {showpercent && percent > 0 && (
              <p className="font-semibold text-[13px] leading-[18px] flex items-center justify-center text-white">
                {formatPercentage(percent)}%
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ThreeValuesProgress;