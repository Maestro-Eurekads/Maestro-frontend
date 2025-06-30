"use client";

import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "../../../../../src/date-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  eachWeekOfInterval,
  format,
  isSameWeek,
  parseISO,
} from "date-fns";
import DayInterval from "../../atoms/date-interval/DayInterval";
import MonthInterval from "../../atoms/date-interval/MonthInterval";
import WeekInterval from "../../atoms/date-interval/WeekInterval";
import { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import AddNewChennelsModel from "components/Modals/AddNewChennelsModel";
import { useDateRange as useRange } from "src/date-range-context";
import YearInterval from "../../atoms/date-interval/YearInterval";

const MainSection = ({
  hideDate,
  disableDrag,
  view,
}: {
  hideDate?: boolean;
  disableDrag?: boolean;
  view?: boolean;
}) => {
  const { clientCampaignData, campaignFormData } = useCampaigns();
  const { range: rrange } = useRange();
  const [daysInEachMonth, setDaysInEachMonth] = useState<Record<any, any>>({});
  const { range } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");

  // Zoom state management
  const [zoomLevel, setZoomLevel] = useState(1);
  const minZoom = 0.1;
  const maxZoom = 3;
  const zoomStep = 0.05;

  const startDates = campaignFormData?.campaign_timeline_start_date
    ? campaignFormData?.campaign_timeline_start_date
    : null;

  const endDates = campaignFormData?.campaign_timeline_end_date
    ? campaignFormData?.campaign_timeline_end_date
    : null;

  const dayDifference = differenceInCalendarDays(endDates, startDates);
  const weekDifference =
    startDates && endDates
      ? eachWeekOfInterval(
          { start: new Date(startDates), end: new Date(endDates) },
          { weekStartsOn: 1 } // Optional: set Monday as start of week (0 = Sunday)
        ).length
      : 0;
  const monthDifference = differenceInCalendarMonths(endDates, startDates);
  const yearDifference = differenceInCalendarYears(endDates, startDates);

  const isValidDateFormat = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const start = campaignFormData?.campaign_timeline_start_date
    ? typeof campaignFormData.campaign_timeline_start_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_start_date)
      ? parseISO(campaignFormData.campaign_timeline_start_date)
      : campaignFormData.campaign_timeline_start_date
    : null;

  const end = campaignFormData?.campaign_timeline_end_date
    ? typeof campaignFormData.campaign_timeline_end_date === "string" &&
      isValidDateFormat(campaignFormData.campaign_timeline_end_date)
      ? parseISO(campaignFormData.campaign_timeline_end_date)
      : campaignFormData.campaign_timeline_end_date
    : null;

  // Get the list of weeks
  const allWeeks =
    startDates && endDates
      ? eachWeekOfInterval(
          { start: new Date(startDates), end: new Date(endDates) },
          { weekStartsOn: 1 } // set week start as needed
        )
      : [];

  // Helper to get week index in the range
  const findWeekIndex = (date: Date | null) =>
    allWeeks.findIndex((weekStart) =>
      date ? isSameWeek(weekStart, date, { weekStartsOn: 1 }) : false
    ) + 1;

  // Calculate positions for different time ranges
  const startDay = differenceInCalendarDays(start, startDates) + 1;
  const endDay = differenceInCalendarDays(end, startDates) + 1;

  const startWeek = findWeekIndex(start) - 1;
  const endWeek = findWeekIndex(end) - 1;

  const startMonth = differenceInCalendarMonths(start, startDates) + 1;
  const endMonth = differenceInCalendarMonths(end, startDates) + 1;

  const startYear = differenceInCalendarYears(start, startDates) + 1;
  const endYear = differenceInCalendarYears(end, startDates) + 1;

  const funnelsData = {
    startDay,
    endDay,
    startWeek,
    endWeek,
    startMonth,
    endMonth,
    startYear,
    endYear,
  };

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + zoomStep, maxZoom));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - zoomStep, minZoom));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "=" || event.key === "+") {
          event.preventDefault();
          zoomIn();
        } else if (event.key === "-") {
          event.preventDefault();
          zoomOut();
        } else if (event.key === "0") {
          event.preventDefault();
          resetZoom();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);

  function getDaysInEachMonth(): Record<string, number> {
    const daysInMonth: Record<string, number> = {};

    rrange?.forEach((date) => {
      const monthYear = format(date, "MMMM");
      daysInMonth[monthYear] = (daysInMonth[monthYear] || 0) + 1;
    });

    return daysInMonth;
  }

  function getDaysInEachYear(): Record<string, number> {
    const daysInYear: Record<string, number> = {};

    rrange?.forEach((date) => {
      const year = format(date, "yyyy");
      daysInYear[year] = (daysInYear[year] || 0) + 1;
    });

    return daysInYear;
  }

  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval daysCount={dayDifference + 1} src="campaign" />
            {/* <DayTimeline daysCount={dayDifference} funnels={funnelsData} /> */}
          </>
        );
      case "Month":
        return (
          <>
            <MonthInterval
              monthsCount={monthDifference === 0 ? 1 : monthDifference + 1}
              view={view}
              getDaysInEachMonth={getDaysInEachMonth}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
            {/* <MonthTimeline monthsCount={monthDifference} funnels={funnelsData} /> */}
          </>
        );
      case "Year":
        return (
          <>
            <YearInterval
              yearsCount={yearDifference === 0 ? 1 : yearDifference + 1}
              view={view}
              getDaysInEachYear={getDaysInEachYear}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
            {/* <YearTimeline yearsCount={yearDifference} funnels={funnelsData} /> */}
          </>
        );
      default: // Week is default
        return (
          <>
            <WeekInterval
              weeksCount={weekDifference === 0 ? 1 : weekDifference - 1}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
            {/* <WeekTimeline weeksCount={weekDifference} funnels={funnelsData} /> */}
          </>
        );
    }
  };

  return (
    <div className="mt-[32px]">
      {!hideDate && <DateComponent useDate={true} />}

      {/* Zoom Controls */}
      <div className="flex items-center justify-between mb-4 pl-4">
        <div className="flex items-center gap-2 bg-white border rounded-lg p-2 shadow-sm">
          <button
            onClick={zoomOut}
            disabled={zoomLevel <= minZoom}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out (Ctrl + -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={zoomLevel >= maxZoom}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In (Ctrl + +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <button
            onClick={resetZoom}
            className="p-1 rounded hover:bg-gray-100"
            title="Reset Zoom (Ctrl + 0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* <div className="text-xs text-gray-500">Use Ctrl + / Ctrl - to zoom, or Ctrl + 0 to reset</div> */}
      </div>

      <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative mt-4">
        <div className={`${zoomLevel < 1 ? "overflow-hidden" : "overflow-auto"} w-full h-full`}>
          <div
            className={`min-w-max transition-transform duration-200 ease-out origin-top-left`}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "left top",
              fontSize: `${1 / zoomLevel}em`,
              width: `${100 / zoomLevel}%`, // Compensates for shrinkage
              height: `${100 / zoomLevel}%`, // Optional: use if height also shrinks
            }}
          >
            <div className="relative">
              <div className="bg-white">
                {/* <DateInterval /> */}
                {renderTimeline()}
                <div className="absolute right-[2px] top-18 w-1 bg-orange-500 min-h-screen"></div>
                <div className="absolute left-0 top-18 w-1 bg-orange-500 min-h-screen"></div>
              </div>
            </div>
            <ResizeableElements
              funnelData={funnelsData}
              disableDrag={disableDrag}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
            />
          </div>
        </div>
      </div>
      {isOpen &&
      <AddNewChennelsModel
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      selectedStage={selectedStage}
      />
    }
      {/* </div> */}
    </div>
  );
};

export default MainSection;
