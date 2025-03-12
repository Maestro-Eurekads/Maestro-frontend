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

const funnelStages = [
  {
    name: "Awareness",
    icon: speaker,
    status: "In progress",
    statusIsActive: true,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "Youtube", icon: youtube },
        { name: "The TradeDesk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
      ],
    },
  },
  {
    name: "Consideration",
    icon: tablerzoomfilled,
    status: "Not started",
    statusIsActive: false,
    platforms: {},
  },
  {
    name: "Conversion",
    icon: orangecredit,
    status: "Not started",
    statusIsActive: false,
    platforms: {},
  },
];

const DefineAdSetPage = () => {
  const [openItems, setOpenItems] = useState({
    Awareness: true,
    Consideration: false,
    Conversion: false
  });

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  return (
    <div className="mt-12 flex items-start flex-col mx-auto gap-12 w-full">
      {funnelStages.map((stage, index) => (
        <div key={index} className="w-full">
          <div
            className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
  ${openItems[stage.name] ? 'rounded-t-[10px]' : 'rounded-[10px]'}`}
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

          {openItems[stage.name] && stage.name === "Awareness" && (
            <div className={`card_bucket_container_main_sub flex flex-col pb-6 w-full cursor-pointer min-h-[300px] overflow-x-scroll`}>

              <AdSetsFlow />
            </div>
          )}

          {openItems[stage.name] &&
            (stage.name === "Consideration") && (
              <div className="card_bucket_container_main_sub flex flex-col pb-6 cursor-pointer w-full min-h-[300px] overflow-x-scroll">
                <AdSetsFlow />
              </div>
            )}
          {openItems[stage.name] &&
            (stage.name === "Conversion") && (
              <div className="card_bucket_container_main_sub flex flex-col cursor-pointer pb-6 w-full min-h-[300px] overflow-x-scroll">
                <AdSetsFlow />
              </div>
            )}
        </div>
      ))
      }
    </div >
  );
};

export default DefineAdSetPage;
