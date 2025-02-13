import React, { useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useDateRange } from "../../../../../src/date-range-context";

const DateRangeSelector = () => {
  const [isShowDateRange, setIsShowDateRange] = useState(false);
  const { range, setRange } = useDateRange();

  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="border rounded-lg flex gap-2 p-2.5 items-center justify-center"
            onClick={() => setIsShowDateRange(!isShowDateRange)}
          >
            <MdArrowBackIos />
          </span>
          <div className="py-2.5 px-4 border rounded-lg text-gray-800">
            {range.startDate
              ? format(range.startDate, "dd MMM")
              : "Select Date"}{" "}
            - {range.endDate ? format(range.endDate, "dd MMM") : "Select Date"}
          </div>
          <span
            className="border rounded-lg flex gap-2 p-2.5 items-center justify-center"
            onClick={() => setIsShowDateRange(!isShowDateRange)}
          >
            <MdArrowForwardIos />
          </span>
        </div>
        {isShowDateRange && (
          <div className="absolute z-50 right-0">
            <DateRange
              editableDateInputs={true}
              onChange={(item) =>
                setRange({
                  startDate: item.selection.startDate,
                  endDate: item.selection.endDate,
                })
              }
              moveRangeOnFirstSelection={false}
              ranges={[{ ...range, key: "selection" }]}
              rangeColors={["#3f51b5"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;
