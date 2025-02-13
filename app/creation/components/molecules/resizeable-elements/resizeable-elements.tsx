"use client";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { TbZoomFilled, TbCreditCardFilled } from "react-icons/tb";
import ResizeableBar from "../../atoms/drag-timeline/drag-timeline";

const ResizeableElements = () => {
  return (
    <div className="flex flex-col gap-y-6 select-none">
      <ResizeableBar
        bg="#3175FF"
        description="Awareness"
        Icon={BsFillMegaphoneFill}
      />
      <ResizeableBar
        bg="#0ABF7E"
        description="Consideration"
        Icon={TbZoomFilled}
      />
      <ResizeableBar
        bg="#ff9037"
        description="Conversion"
        Icon={TbCreditCardFilled}
      />
    </div>
  );
};

export default ResizeableElements;
