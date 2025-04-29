import { useDateRange } from "../../../../../src/date-range-context";
import DateInterval from "../../atoms/date-interval/date-interval";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
import { eachDayOfInterval } from "date-fns";

const MainSection = () => {
  return (
    <div className="mt-[32px] ">
      <DateComponent useDate={true} />
      <div className="box-border w-full min-h-[519px] bg-white border-b-2 relative">
        <div className="overflow-x-auto w-full">
          <div className="min-w-max">
            <div className="relative">
              <div className="bg-white">
                <DateInterval />
                <div className="absolute right-[2px] top-18 w-1 bg-orange-500 h-screen"></div>
                <div className="absolute left-0 top-18 w-1 bg-orange-500 h-screen"></div>
              </div>
            </div>
            <ResizeableElements />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSection;
