import { useDateRange } from "../../../../../src/date-range-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import { eachDayOfInterval } from "date-fns";


const MainSection = () => {

  return (
    <div className="mt-[32px]">
      <DateComponent useDate={true} />
      <ResizeableElements />
    </div>
  );
};

export default MainSection;
