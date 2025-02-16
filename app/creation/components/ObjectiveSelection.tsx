"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg"; // Add a checkmark icon
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from "../../../public/TheTradeDesk.svg";
import Quantcast from "../../../public/Quantcast.svg";
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import Button from "./common/button";

const funnelStages = [
  {
    name: "Awareness",
    icon: speaker,
    status: "In progress",
    statusIsActive: true,
    platforms: {
      "Social media": [
        { name: "Facebook", icon: facebook },
        { name: "Buy type", hasDropdown: true },
        { name: "Buy objective", hasDropdown: true },
        { name: "Instagram", icon: ig },
        { name: "Buy type", hasDropdown: true },
        { name: "Buy objective", hasDropdown: true },
        { name: "Youtube", icon: youtube },
        { name: "Buy type", hasDropdown: true },
        { name: "Buy objective", hasDropdown: true },
      ],
      "Display networks": [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Buy type", hasDropdown: true },
        { name: "Buy objective", hasDropdown: true },
        { name: "Quantcast & Video", icon: Quantcast },
        { name: "Buy type", hasDropdown: true },
        { name: "Buy objective", hasDropdown: true },
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

const ObjectiveSelection = () => {
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [statuses, setStatuses] = useState(funnelStages.map((stage) => stage.status));

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const handleValidate = (index: number) => {
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);

    // Show toast notification
    toast.success("Stage completed successfully! 🎉");

    // Vibrate for 300ms if supported
    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  return (
    <div className="mt-12 flex flex-col gap-12 w-full max-w-[950px] mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      {funnelStages.map((stage, index) => (
        <div key={index} className="w-full">
          {/* Stage Header */}
          <div
            className="flex items-center justify-between px-6 py-6 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} alt={stage.name} />
              <p className="text-lg font-semibold text-[#061237]">{stage.name}</p>
            </div>

            <div className="flex items-center gap-2">
              {statuses[index] === "Completed" ? (
                <>
                  <Image className="w-5 h-5 rounded-full p-1 bg-green-500" src={checkmark} alt="Completed" />
                  <p className="text-green-500 font-semibold text-base">Completed</p>
                </>
              ) : stage.statusIsActive ? (
                <p className="text-[#3175FF] font-semibold text-base">{statuses[index]}</p>
              ) : (
                <p className="text-[#061237] opacity-50 text-base">Not started</p>
              )}
            </div>

            <div>
              {openItems[stage.name] ? (
                <Image src={up} alt="collapse" />
              ) : (
                <Image src={down2} alt="expand" />
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {openItems[stage.name] && (
            <div className="flex flex-col gap-8 p-8 bg-white border border-gray-300 rounded-b-lg">
              {Object.entries(stage.platforms).map(([category, platforms]) => (
                <div key={category} className="flex flex-col w-full gap-6">
                  <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {platforms.map((platform, pIndex) => (
                      <div
                        key={pIndex}
                        className="flex items-center justify-between px-5 py-4 bg-white border border-gray-300 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {platform.icon && <Image src={platform.icon} alt={platform.name} />}
                          <p className="text-base font-medium text-[#061237]">{platform.name}</p>
                        </div>
                        {platform.hasDropdown && <Image src={down2} alt="dropdown" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Validate Button (Only for Awareness stage) */}
              {stage.name === "Awareness" && (
                <div className="flex justify-end mt-6">
                  <Button text="Validate" variant="primary" onClick={() => handleValidate(index)} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ObjectiveSelection;
