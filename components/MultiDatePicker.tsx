import React, { useEffect, useState } from "react";
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
  const [monthOffset, setMonthOffset] = useState(0);
  const {setCampaignFormData, campaignFormData} = useCampaigns()

  const getMonthData = (offset: number) => {
    const today = new Date();
    const baseDate = new Date(
      today.getFullYear(),
      today.getMonth() + offset,
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

  // const parseApiDate = (dateString: string | null): { day: number; month: number } | null => {
  // 	if (!dateString) return null;
  // 	const parsedDate = new Date(dateString);
  // 	return {
  // 		day: parsedDate.getDate(),
  // 		month: parsedDate.getMonth(),
  // 	};
  // };

  // Use selected dates if set, otherwise fallback to API dates
  const fromDate =
    selectedDates.from ||
    parseApiDate(campaignFormData?.campaign_timeline_start_date);
  const toDate =
    selectedDates.to || parseApiDate(campaignFormData?.campaign_timeline_end_date);

  const isPastDate = (day: number, monthIndex: number, year: number) => {
    const today = new Date();
    const date = new Date(year, monthIndex, day);
    return (
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  const handleDateClick = (day: number, monthIndex: number, year: number) => {
    // if (isPastDate(day, monthIndex, year)) return;

    const newDate = { day, month: monthIndex };

    if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
      setSelectedDates({ from: newDate, to: null });
      resetNestedDates(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, null)
      // setCampaignFormData((prev) => ({
      //   ...prev,
      //   campaign_timeline_start_date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      //   campaign_timeline_end_date: null,
      // }));
    } else if (
      selectedDates.from &&
      (newDate.month > selectedDates.from.month ||
        (newDate.month === selectedDates.from.month &&
          newDate.day > selectedDates.from.day))
    ) {
      setSelectedDates((prev) => ({ ...prev, to: newDate }));
      resetNestedDates(campaignFormData?.campaign_timeline_start_date, `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)
      // setCampaignFormData((prev) => ({
      //   ...prev,
      //   campaign_timeline_end_date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      // }));
    } else {
      setSelectedDates({ from: newDate, to: null });
      resetNestedDates(`${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`, null)
      // setCampaignFormData((prev) => ({
      //   ...prev,
      //   campaign_timeline_start_date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      //   campaign_timeline_end_date: null,
      // }));
    }
  };
  const resetNestedDates = (startDate, endDate) => {
    setCampaignFormData((prev) => {
      const updatedChannels = prev.channel_mix.map((channel) => {
        const updatedMediaTypes = Object.keys(channel).reduce((acc, mediaType) => {
          if (Array.isArray(channel[mediaType])) {
            acc[mediaType] = channel[mediaType].map((media) => ({
              ...media,
              campaign_start_date: null,
              campaign_end_date: null,
            }));
          }
          return acc;
        }, {});

        return {
          ...channel,
          funnel_stage_timeline_start_date: null,
          funnel_stage_timeline_end_date: null,
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
    setCampaignFormData((prev)=>({
      ...prev,
      campaign_timeline_start_date: null,
      campaign_timeline_end_date: null
    }))
  };

  const months = [getMonthData(monthOffset), getMonthData(monthOffset + 1)];

  // write a useEffect that get the campaign_timeline_start and end date and initialize the selectedDates states

  useEffect(() => {
    const startDate = parseApiDate(campaignFormData?.campaign_timeline_start_date);
    const endDate = parseApiDate(campaignFormData?.campaign_timeline_end_date);

    if (startDate && endDate) {
      setSelectedDates({ from: startDate, to: endDate });
    }
  }, [campaignFormData]);

  return (
    <div
      className={`flex flex-col items-start p-5 gap-5 w-[792px] bg-white border border-gray-200 rounded-lg mt-8 cursor-pointer`}
    >
      {/* Navigation */}
      <div className="flex justify-between w-full">
        <button
          className={`flex items-center gap-3 `}
          onClick={() => setMonthOffset(monthOffset - 1)}
          // disabled={!isEditing}
        >
          <Image src={left} alt="left" />
          <h6 className="font-semibold text-[16px] text-[#061237]">
            {months[0].name}
          </h6>
        </button>
        <button
          className={`flex items-center gap-3 `}
          onClick={() => setMonthOffset(monthOffset + 1)}
          // disabled={!isEditing}
        >
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
                    fromDate?.month === month.monthIndex) ||
                  (toDate?.day === day && toDate?.month === month.monthIndex);
                const isInRange =
                  fromDate &&
                  toDate &&
                  (month.monthIndex > fromDate.month ||
                    (month.monthIndex === fromDate.month &&
                      day > fromDate.day)) &&
                  (month.monthIndex < toDate.month ||
                    (month.monthIndex === toDate.month && day < toDate.day));
                const isPast = isPastDate(day, month.monthIndex, month.year);
                return (
                  <div
                    key={day}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all
						${isSelected ? "bg-blue-500 text-white" : ""}
						${isInRange ? "bg-blue-200" : ""}
						
						`}
                    onClick={() =>
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
                  ).padStart(2, "0")}-${new Date()
                    .getFullYear()
                    .toString()
                    .slice(-2)}`
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
                  ).padStart(2, "0")}-${new Date()
                    .getFullYear()
                    .toString()
                    .slice(-2)}`
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
