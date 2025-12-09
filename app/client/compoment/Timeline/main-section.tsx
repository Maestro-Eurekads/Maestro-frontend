import { useCampaigns } from "app/utils/CampaignsContext";

import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  eachDayOfInterval,
  format,
  max,
  min,
  parseISO,
} from "date-fns";
import { getCurrencySymbol } from "components/data";
import MonthInterval from "app/creation/components/atoms/date-interval/MonthInterval";
import DayInterval from "app/creation/components/atoms/date-interval/DayInterval";
import WeekInterval from "app/creation/components/atoms/date-interval/WeekInterval";
import DateComponent from "app/creation/components/molecules/date-component/date-component";
import ResizeableElements from "app/creation/components/molecules/resizeable-elements/resizeable-elements";
import { useDateRange } from "src/date-context";

const MainSection = ({
  hideDate,
  disableDrag,
  campaignData,
}: {
  hideDate?: boolean;
  disableDrag?: boolean;
  campaignData: any;
}) => {
  const { range } = useDateRange();
  const startDates = campaignData?.campaign_timeline_start_date
    ? campaignData?.campaign_timeline_start_date
    : null;

  const endDates = campaignData?.campaign_timeline_end_date
    ? campaignData?.campaign_timeline_end_date
    : null;

  const dayDifference = differenceInCalendarDays(endDates, startDates);
  const weekDifference = differenceInCalendarWeeks(endDates, startDates);
  const monthDifference = differenceInCalendarMonths(endDates, startDates);

  const start = campaignData?.campaign_timeline_start_date
    ? parseISO(campaignData.campaign_timeline_start_date)
    : null;
  const end = campaignData?.campaign_timeline_end_date
    ? parseISO(campaignData.campaign_timeline_end_date)
    : null;

  // Calculate positions for different time ranges
  const startDay = differenceInCalendarDays(start, startDates) + 1;
  const endDay = differenceInCalendarDays(end, startDates) + 1;

  const startWeek = differenceInCalendarWeeks(start, startDates) + 1;
  const endWeek = differenceInCalendarWeeks(end, startDates) + 1;

  const startMonth = differenceInCalendarMonths(start, startDates) + 1;
  const endMonth = differenceInCalendarMonths(end, startDates) + 1;

  const funnelsData = {
    startDay,
    endDay,
    startWeek,
    endWeek,
    startMonth,
    endMonth,
  };

  const renderTimeline = () => {
    switch (range) {
      case "Day":
        return (
          <>
            <DayInterval daysCount={dayDifference + 1} src="campaign" />
          </>
        );
      case "Month":
        return <MonthInterval />;
      default: // Week is default
        return (
          <>
            <WeekInterval
              weeksCount={weekDifference}
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
          </>
        );
    }
  };
  return (
    <div>
      {!hideDate && <DateComponent useDate={true} />}
      <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative">
        <div className="overflow-x-auto w-full">
          <div className="min-w-fit">
            <div className="relative">
              <div className="bg-white">
                {renderTimeline()}
                {/* <div className="absolute right-[2px] top-18 w-1 bg-orange-500 min-h-screen"></div>
                <div className="absolute left-0 top-18 w-1 bg-orange-500 min-h-screen"></div> */}
              </div>
            </div>
            <ResizeableElements
              funnelData={funnelsData}
              disableDrag={disableDrag}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSection;
