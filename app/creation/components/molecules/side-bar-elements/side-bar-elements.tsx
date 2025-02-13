"use client";

import StepIcons from "../../atoms/steps-progress-icon/step-progress-icon";
import StepsProgressLabel from "../../atoms/steps-progress-label/steps-progress-label";
import { MdCampaign, MdWebAsset } from "react-icons/md";
import { BsBasket2Fill, BsFunnelFill } from "react-icons/bs";
import { RiCalendar2Fill, RiCheckFill, RiDeviceFill } from "react-icons/ri";
import { GiNetworkBars } from "react-icons/gi";
import { PiCursorClickThin } from "react-icons/pi";

const steps = [
  {
    Icon: MdCampaign,
    step: "Define campaign objective",
    substep: "Main objective: Purchase",
    status: "success",
  },
  {
    Icon: BsFunnelFill,
    step: "Map funnel stages",
    substep: "Awareness · Consideration · Conversion",
    status: "success",
  },
  { Icon: MdWebAsset, step: "Select channel mix", status: "success" },
  { Icon: RiDeviceFill, step: "Formats selection", status: "success" },
  {
    Icon: BsBasket2Fill,
    step: "Set buy objectives and types",
    status: "success",
  },
  { Icon: RiCalendar2Fill, step: "Plan campaign schedule", status: "ongoing" },
  {
    Icon: PiCursorClickThin,
    step: "Configure ad sets and budget",
    status: "pending",
  },
  { Icon: GiNetworkBars, step: "Establish goals", status: "pending" },
  { Icon: RiCheckFill, step: "Overview of your campaign", status: "pending" },
];

const SideBarElements = () => {
  return (
    <div className="flex flex-col gap-y-4 relative">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-2 relative">
          <div className="flex flex-col items-center">
            <StepIcons Icon={step.Icon} status={step.status} />
          </div>

          <StepsProgressLabel
            step={step.step}
            substep={step.substep}
            status={step.status}
          />
        </div>
      ))}
    </div>
  );
};

export default SideBarElements;
