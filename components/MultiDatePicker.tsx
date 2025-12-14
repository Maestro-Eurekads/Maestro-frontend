//@ts-nocheck

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import left from "../public/left.svg";
import right from "../public/right.svg";
import moveright from "../public/lucide_move-right.svg";
import { useSelectedDates } from "../app/utils/SelectedDatesContext";
import { parseApiDate } from "./Options";
import { useCampaigns } from "app/utils/CampaignsContext";

interface MultiDatePickerProps {
  isEditing: boolean;
  campaignData: any;
}

const MultiDatePicker: React.FC<MultiDatePickerProps> = ({
  isEditing,
  campaignData,
}) => {
  const weekdays = ["M", "T", "W", "Th", "F", "S", "S"];
  const { selectedDates, setSelectedDates } = useSelectedDates();
  const { setCampaignFormData, campaignFormData } = useCampaigns();

  const getInitialViewDate = () => {
    if (campaignFormData?.campaign_timeline_start_date) {
      return new Date(campaignFormData.campaign_timeline_start_date);
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState(getInitialViewDate);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (campaignFormData?.campaign_timeline_start_date) {
      setViewDate(new Date(campaignFormData.campaign_timeline_start_date));
      hasInitialized.current = true;
    }
  }, [campaignFormData?.campaign_timeline_start_date]);

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getMonthData = (offset: number) => {
    const baseDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + offset,
      1
    );

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return {
      name: baseDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      days: daysInMonth,
      startDay: firstDay === 0 ? 6 : firstDay - 1,
      monthIndex: month,
      year,
    };
  };
  const fromDate =
    selectedDates.from ||
    parseApiDate(campaignFormData?.campaign_timeline_start_date);
  const toDate =
    selectedDates.to ||
    parseApiDate(campaignFormData?.campaign_timeline_end_date);

  const isPastDate = (day: number, monthIndex: number, year: number) => {
    const today = new Date();
    const date = new Date(year, monthIndex, day);
    return (
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };
  const handleDateClick = (day: number, monthIndex: number, year: number) => {
    const newDate = { day, month: monthIndex, year };

    if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
      const startDateStr = `${year}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      setSelectedDates({ from: newDate, to: null });
      resetNestedDates(startDateStr, null);
    } else if (selectedDates.from) {
      const from = new Date(
        selectedDates.from.year,
        selectedDates.from.month,
        selectedDates.from.day
      );
      const to = new Date(year, monthIndex, day);

      if (to > from) {
        const startDateStr = `${selectedDates.from.year}-${String(
          selectedDates.from.month + 1
        ).padStart(2, "0")}-${String(selectedDates.from.day).padStart(2, "0")}`;
        const endDateStr = `${year}-${String(monthIndex + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;

        setSelectedDates((prev) => ({ ...prev, to: newDate }));
        resetNestedDates(startDateStr, endDateStr);
      } else {
        const startDateStr = `${year}-${String(monthIndex + 1).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        setSelectedDates({ from: newDate, to: null });
        resetNestedDates(startDateStr, null);
      }
    }
  };

  const resetNestedDates = (
    startDate: string | null,
    endDate: string | null
  ) => {
    setCampaignFormData((prev: any) => {
      const updatedChannels = prev.channel_mix?.map((channel: any) => {
        const updatedMediaTypes = Object.keys(channel).reduce(
          (acc: any, mediaType: string) => {
            if (Array.isArray(channel[mediaType])) {
              acc[mediaType] = channel[mediaType].map((media: any) => ({
                ...media,
                campaign_start_date: startDate,
                campaign_end_date: endDate,
              }));
            }
            return acc;
          },
          {}
        );

        return {
          ...channel,
          funnel_stage_timeline_start_date: startDate,
          funnel_stage_timeline_end_date: endDate,
          ...updatedMediaTypes,
        };
      });

      return {
        ...prev,
        campaign_timeline_start_date: startDate,
        campaign_timeline_end_date: endDate,
        channel_mix: updatedChannels,
      };
    });
  };

  const resetDates = () => {
    setSelectedDates({ from: null, to: null });
    setCampaignFormData((prev: any) => ({
      ...prev,
      campaign_timeline_start_date: null,
      campaign_timeline_end_date: null,
    }));
  };

  const months = [getMonthData(0), getMonthData(1)];

  useEffect(() => {
    const startDateStr = campaignFormData?.campaign_timeline_start_date;
    const endDateStr = campaignFormData?.campaign_timeline_end_date;

    if (!startDateStr || !endDateStr) return;

    const startDate = parseApiDate(startDateStr);
    const endDate = parseApiDate(endDateStr);

    if (startDate && endDate) {
      setSelectedDates((prev) => {
        const newFrom = {
          ...startDate,
          year: new Date(startDateStr).getFullYear(),
        };
        const newTo = { ...endDate, year: new Date(endDateStr).getFullYear() };

        if (
          prev.from?.day === newFrom.day &&
          prev.from?.month === newFrom.month &&
          prev.from?.year === newFrom.year &&
          prev.to?.day === newTo.day &&
          prev.to?.month === newTo.month &&
          prev.to?.year === newTo.year
        ) {
          return prev;
        }

        return { from: newFrom, to: newTo };
      });
    }
  }, [
    campaignFormData?.campaign_timeline_start_date,
    campaignFormData?.campaign_timeline_end_date,
  ]);

  const isInRange = (day: number, monthIndex: number, year: number) => {
    if (!fromDate || !toDate) return false;
    const current = new Date(year, monthIndex, day);
    const from = new Date(fromDate.year, fromDate.month, fromDate.day);
    const to = new Date(toDate.year, toDate.month, toDate.day);
    return current > from && current < to;
  };

  return (
    <div
      className={`flex flex-col items-start p-5 gap-5 w-[792px] bg-white border border-gray-200 rounded-lg mt-8 cursor-pointer`}
    >
      {/* Navigation */}
      <div className="flex justify-between w-full">
        <button className="flex items-center gap-3" onClick={goToPrevMonth}>
          <Image src={left} alt="left" />
          <h6 className="font-semibold text-[16px] text-[#061237]">
            {months[0].name}
          </h6>
        </button>
        <button className="flex items-center gap-3" onClick={goToNextMonth}>
          <h6 className="font-semibold text-[16px] text-[#061237]">
            {months[1].name}
          </h6>
          <Image src={right} alt="right" />
        </button>
      </div>

      {/* Calendar */}
      <div className="flex w-full">
        {months.map((month, monthIndex) => (
          <div
            key={monthIndex}
            className={`w-1/2 p-2 ${
              monthIndex === 1 ? "border-l border-gray-200" : ""
            }`}
          >
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700">
              {weekdays.map((day, i) => (
                <div key={i} className="w-8 h-8 text-[16px] text-gray-400 mb-4">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center mt-2">
              {/* Empty spaces for the starting day */}
              {Array.from({ length: month.startDay }).map((_, i) => (
                <div key={i}></div>
              ))}

              {/* Render Days */}
              {Array.from({ length: month.days }).map((_, i) => {
                const day = i + 1;
                const isSelected =
                  (fromDate?.day === day &&
                    fromDate?.month === month.monthIndex &&
                    fromDate?.year === month.year) ||
                  (toDate?.day === day &&
                    toDate?.month === month.monthIndex &&
                    toDate?.year === month.year);
                const isRange = isInRange(day, month.monthIndex, month.year);
                const isPast = isPastDate(day, month.monthIndex, month.year);
                return (
                  <div
                    key={day}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all
                      ${isSelected ? "bg-blue-500 text-white" : ""}
                      ${isRange ? "bg-blue-200" : ""}
                      `}
                    onClick={() =>
                      // !isPast &&
                      handleDateClick(day, month.monthIndex, month.year)
                    }
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Date Selection & Reset */}
      <div className="flex flex-row items-end py-5 w-full h-28 justify-between border-t border-gray-100">
        <div className="flex items-center gap-5">
          <div>
            <h6 className="font-semibold text-[14px] text-[#061237]">From</h6>
            <button className="reset_dates_move">
              {fromDate
                ? `${String(fromDate.day).padStart(2, "0")}-${String(
                    fromDate.month + 1
                  ).padStart(2, "0")}-${fromDate.year}`
                : "Select date"}
            </button>
          </div>
          <Image src={moveright} alt="moveright" className="mt-5" />
          <div>
            <h6 className="font-semibold text-[14px] text-[#061237]">To</h6>
            <button className="reset_dates_move">
              {toDate
                ? `${String(toDate.day).padStart(2, "0")}-${String(
                    toDate.month + 1
                  ).padStart(2, "0")}-${toDate.year}`
                : "Select date"}
            </button>
          </div>
        </div>
        <button
          type="button"
          className={`reset_dates `}
          onClick={resetDates}
          // disabled={!isEditing}
        >
          Reset dates
        </button>
      </div>
    </div>
  );
};

export default MultiDatePicker;
