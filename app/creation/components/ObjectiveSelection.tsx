"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import speaker from "../../../public/mdi_megaphone.svg";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
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
        { name: "Buy type" },
        { name: "Buy objective" },
        { name: "Instagram", icon: ig },
        { name: "Buy type" },
        { name: "Buy objective" },
        { name: "Youtube", icon: youtube },
        { name: "Buy type" },
        { name: "Buy objective" },
      ],
      "Display networks": [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Buy type" },
        { name: "Buy objective" },
        { name: "Quantcast & Video", icon: Quantcast },
        { name: "Buy type" },
        { name: "Buy objective" },
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
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const toggleDropdown = (platform: string) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleValidate = (index: number) => {
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);

    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
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
              {openItems[stage.name] ? <Image src={up} alt="collapse" /> : <Image src={down2} alt="expand" />}
            </div>
          </div>

          {/* Expanded Content */}
          {openItems[stage.name] && (
            <div className="flex item-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
              {Object.entries(stage.platforms).map(([category, platforms]) => (
                <div key={category} className="flex flex-col items-start gap-6">
                  <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {platforms.map((platform, pIndex) => {
                      const platformKey = `${stage.name}-${category}-${pIndex}`;
                      return (
                        <div key={pIndex} className="relative w-full">
                          <div
                            className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                            onClick={() => toggleDropdown(platformKey)}
                          >
                            <div className="flex items-center gap-3">
                              {platform.icon && <Image className="flex flex-shrink-0" src={platform.icon} alt={platform.name} />}
                              <p className="text-base font-medium text-[#061237]">{platform.name}</p>
                            </div>
                            <Image src={down2} alt="dropdown" />
                          </div>

                          {/* Dropdown Menu */}
                          {dropdownOpen[platformKey] && (
                            <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                              <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 1</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 2</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Option 3</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
