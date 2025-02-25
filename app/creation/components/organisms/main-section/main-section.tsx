import { useDateRange } from "../../../../../src/date-range-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import { eachDayOfInterval } from "date-fns";


const MainSection = () => {
  const { range } = useDateRange();
  const dateList = eachDayOfInterval({
    start: range.startDate,
    end: range.endDate,
  });

  return (
    <div className="mt-[32px]">
      <DateComponent useDate={true} />
      <ResizeableElements dateList={dateList} />
    </div>
  );
};

export default MainSection;
