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

      <div className="relative">
        <div className="bg-white">
          <DateInterval />
<<<<<<< HEAD
          <div className="absolute right-14 top-18 w-1 bg-orange-500 min-h-screen"></div>
          <div className="absolute left-14 top-18 w-1 bg-orange-500 h-screen"></div>
=======
        <div className="absolute right-[2px] top-18 w-1 bg-orange-500 h-screen"></div>
        <div className="absolute left-0 top-18 w-1 bg-orange-500 h-screen"></div>
>>>>>>> b013bd844346fa1a60b4bc40f318b8b2a3e3a1d1
        </div>

      </div>

    </div>
  );
};

export default DateComponent;


