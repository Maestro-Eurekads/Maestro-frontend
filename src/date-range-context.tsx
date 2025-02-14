"use client";
import { createContext, useContext, useState } from "react";
import { addDays } from "date-fns";

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type DateRangeContextType = {
  range: DateRange;
  setRange: (range: DateRange) => void;
  dateRangeWidth: number;
  setDateRangeWidth: (width: number) => void;
};

const DateRangeContext = createContext<DateRangeContextType | undefined>(
  undefined
);

export const DateRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [range, setRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: addDays(new Date(), 13),
  });

  const [dateRangeWidth, setDateRangeWidth] = useState(0);

  return (
    <DateRangeContext.Provider
      value={{ range, setRange, dateRangeWidth, setDateRangeWidth }}
    >
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error("useDateRange must be used within a DateRangeProvider");
  }
  return context;
};
