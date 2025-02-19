
// import ResizeableBar from "../../atoms/drag-timeline/drag-timeline";
import { DateRangeProvider } from "../../../../../src/date-range-context";
import DateComponent from "../../molecules/date-component/date-component";
import ResizeableElements from "../../molecules/resizeable-elements/resizeable-elements";
const MainSection = () => {
  return (
    <div className="mt-[32px]">
      <DateRangeProvider>
        <DateComponent useDate={true} />
        <ResizeableElements />
      </DateRangeProvider>
    </div>
  );
};

export default MainSection;
