"use client";
import DateInterval from "../../atoms/date-interval/date-interval";
import Range from "../../atoms/date-range/date-range";
import DateRangeSelector from "../../atoms/date-selector/date-range-selector";

const DateComponent = ({ useDate }) => {
  return (
    <div className="flex flex-col gap-4 ">

      {useDate && <div className="creation_continer flex gap-4 items-center w-full justify-end">
        <Range />
        <DateRangeSelector />
      </div>}



    </div>
  );
};

export default DateComponent;


