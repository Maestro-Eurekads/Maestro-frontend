"use client";

import { PiNumberCircleTwoFill } from "react-icons/pi";

const SectionHead = () => {
  return (
    <div className=" flex flex-col gap-y-8 px-14 pt-14 pb-10">
      <div className="flex flex-col gap-y-3">
        <h4 className="text-[23px] font-semibold text-[#292929]">
          Setup the timeline of your campaign
        </h4>
        <p className="text-base ">
          Choose your campaign start and end dates, then arrange each funnel
          phase within the timeline.
        </p>
      </div>

      <div className="flex gap-2 text-app-primary  font-semibold">
        <span>
          <PiNumberCircleTwoFill className="text-[24px] text-app-primary" />
        </span>
        <div className="text-app-primary text-[14px]">
          Phases default to the campaign duration, but you can adjust each phase
          and channel by dragging them
        </div>
      </div>
    </div>
  );
};

export default SectionHead;
