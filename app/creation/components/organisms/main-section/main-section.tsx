import { useCampaigns } from "app/utils/CampaignsContext";
import { useDateRange } from "../../../../../src/date-context";
import DateInterval from "../../atoms/date-interval/date-interval";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  eachDayOfInterval,
  max,
  min,
  parseISO,
} from "date-fns";
import { getCurrencySymbol } from "components/data";
import DayInterval from "../../atoms/date-interval/DayInterval";
import MonthInterval from "../../atoms/date-interval/MonthInterval";
import WeekInterval from "../../atoms/date-interval/WeekInterval";

const MainSection = ({ hideDate, disableDrag, view }: { hideDate?: boolean, disableDrag?: boolean, view?:boolean }) => {
  const { clientCampaignData, campaignFormData } = useCampaigns();
  const { range } = useDateRange();
  const startDates = campaignFormData?.campaign_timeline_start_date
    ? campaignFormData?.campaign_timeline_start_date
    : null;

  const endDates = campaignFormData?.campaign_timeline_end_date
    ? campaignFormData?.campaign_timeline_end_date
    : null;

  const dayDifference = differenceInCalendarDays(endDates, startDates);
  const weekDifference = differenceInCalendarWeeks(endDates, startDates);
  const monthDifference = differenceInCalendarMonths(endDates, startDates);


  const start = campaignFormData?.campaign_timeline_start_date
    ? parseISO(campaignFormData.campaign_timeline_start_date)
    : null;
  const end = campaignFormData?.campaign_timeline_end_date
    ? parseISO(campaignFormData.campaign_timeline_end_date)
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
            {/* <DayTimeline daysCount={dayDifference} funnels={funnelsData} /> */}
          </>
        );
      case "Month":
        return (
          <>
            <MonthInterval
              monthsCount={monthDifference === 0 ? 1 : monthDifference + 1}
              view={view}
            />
            {/* <MonthTimeline monthsCount={monthDifference} funnels={funnelsData} /> */}
          </>
        );
      default: // Week is default
        return (
          <>
            <WeekInterval weeksCount={weekDifference} />
            {/* <WeekTimeline weeksCount={weekDifference} funnels={funnelsData} /> */}
          </>
        );
    }
  };
  return (
    <div className="mt-[32px] ">
      {!hideDate && <DateComponent useDate={true} />}
      <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative mt-4">
        <div className="overflow-x-auto w-full">
          <div className="min-w-fit">
            <div className="relative">
              <div className="bg-white">
                {/* <DateInterval /> */}
                {renderTimeline()}
                <div className="absolute right-[2px] top-18 w-1 bg-orange-500 min-h-screen"></div>
                <div className="absolute left-0 top-18 w-1 bg-orange-500 min-h-screen"></div>
              </div>
            </div>
            <ResizeableElements funnelData={funnelsData} disableDrag={disableDrag} view={view} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSection;
