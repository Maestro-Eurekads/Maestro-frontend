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
  const [openItems, setOpenItems] = useState({ Awareness: true });
  
  // Toggle expand/collapse for a stage
  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full ">
      {funnelStages.map((stage, index) => (
        <div key={index} className="w-full">
          {/* Stage Header */}
          <div
            className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-t-[10px] cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} alt={stage.name} />
              <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {stage.statusIsActive ? (
                <p className="text-[#3175FF] font-semibold text-base">{stage.status}</p>
              ) : (
                <p className="text-[#061237] opacity-50 text-base">Not started</p>
              )}
            </div>

            <div>
              {openItems[stage.name] ? <Image src={up} alt="collapse" /> : <Image src={down2} alt="expand" />}
            </div>
          </div>

          {/* Expanded Content */}
          {openItems[stage.name] && (
            <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
              {/* No platforms to display */}
              {/* Removed all platform-related content and validate button */}
              

              <div className="flex items-center justify-between gap-8">
                <div className="flex flex-col gap-4">
                {}
                </div>


                <div className="flex gap-4">

                </div>

              </div>
              
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DefineAdSetPage;
