"use client";
import DateInterval from "../../atoms/date-interval/date-interval";
import Range from "../../atoms/date-range/dashboard-date-range";
import DateRangeSelector from "../../atoms/date-selector/date-range-selector";

const DateComponent = ({
  useDate,
  hideRange,
}: {
  useDate: boolean;
  hideRange?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4 ">
      {useDate && (
        <div className="creation_continer flex gap-4 items-center w-full justify-end">
          <Range />
          {!hideRange && <DateRangeSelector />}
        </div>
      )}
    </div>
  );
};

export default DateComponent;
