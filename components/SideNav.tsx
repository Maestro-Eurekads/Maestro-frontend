import Image from "next/image";
import left_arrow from "../public/blue_back_arrow.svg";
import CreationFlow from "./CreationFlow";
import nike from "../public/nike.svg";
import closeicon from "../public/layout-left-line.svg";
import { useRouter } from "next/navigation";
import { useActive } from "../app/utils/ActiveContext";
import { useState } from "react";
import CreationFlowActive from "./CreationFlowActive";


const SideNav: React.FC = () => {
  const [close, setClose] = useState(false);
  const router = useRouter();
  const { setActive, setSubStep } = useActive();

  const handleBackClick = () => {
    setActive(0); // Reset state
    setSubStep(0);
    router.push("/"); // Navigate to home
  };

  return (
    <div id={close ? "side-nav-active" : "side-nav"} className="!flex !flex-col !h-full justify-between">

      <div>
        <div className={`flex ${close ? 'justify-center mb-[30px]' : 'justify-end'} w-full`}>
          <button onClick={() => setClose(!close)}>
            <Image src={closeicon} alt={"closeicon"} />
          </button>
        </div>
        {close === false && <div className="flex flex-col items-start mb-8">
          <button
            onClick={handleBackClick}
            className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF] flex items-center gap-2"
          >
            <Image src={left_arrow} alt="menu" />
            <p>Back to Dashboard</p>
          </button>
          <span className="font-general-sans font-semibold text-[24px] leading-[36px] text-[#152A37]">
            Spring Collection Launch 2025
          </span>
          <div className="flex items-center gap-[8px]">
            <Image src={nike} alt="nike" />
            <p className="w-[35px] h-[22px] font-[General Sans] font-semibold text-[16px] leading-[22px] text-[#061237]">
              Nike
            </p>

          </div>
        </div >}
        {close ? <CreationFlowActive /> : <CreationFlow />}
      </div>
      {
        close ? <div /> :
          <p className="font-general-sans italic font-medium text-[12px] leading-[21px] text-[rgba(6,18,55,0.8)]">
            This screen, all the other ones, as well as the system they build together are protected by
            copyright © - all use, display, and any other rights are exclusively reserved to Eurekads
            Pte. Ltd.
          </p>
      }
    </div >
  );
};

export default SideNav;