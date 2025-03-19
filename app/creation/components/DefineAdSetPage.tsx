"use client";
import React, { useState } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/quantcast.svg";
import AdSetsFlow from "./common/AdSetsFlow";
import { useCampaigns } from "../../utils/CampaignsContext";
import { funnelStages } from "components/data";

const DefineAdSetPage = () => {
  const [openItems, setOpenItems] = useState({});
  const { campaignFormData } = useCampaigns();

  // console.log(JSON.stringify(campaignFormData))

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  return (
    <div className="mt-12 flex items-start flex-col cursor-pointer mx-auto gap-12 w-full">
      {campaignFormData?.funnel_stages.map((stageName, index) => {
        const stage = funnelStages.find((s) => s.name === stageName);
        if (!stage) return null;
        return (
          <div key={index} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
  ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={stage.icon}
                  alt={stage.name}
                  width={24}
                  height={24}
                />
                <p className="text-md font-semibold text-[#061237]">
                  {stage.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {stage.statusIsActive ? (
                  <p className="text-[#3175FF] font-semibold text-base">
                    {stage.status}
                  </p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base">
                    Not started
                  </p>
                )}
              </div>

              <div>
                <Image
                  src={openItems[stage.name] ? up : down2}
                  alt={openItems[stage.name] ? "collapse" : "expand"}
                  width={24}
                  height={24}
                />
              </div>
            </div>
            {openItems[stage.name] && (
              <div
                className={`card_bucket_container_main_sub flex flex-col pb-6 w-full cursor-pointer min-h-[300px] overflow-x-scroll`}
              >
                <AdSetsFlow stageName={stage.name} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DefineAdSetPage;
