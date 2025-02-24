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
import Quantcast from "../../../public/quantcast.svg";
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
        { name: "Quantcast", icon: Quantcast },
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
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  // Toggle expand/collapse for a stage
  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  // Toggle the dropdown for dropdown items (only active when not completed)
  const toggleDropdown = (platformKey: string) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [platformKey]: !prev[platformKey],
    }));
  };

  // Handle selecting an option from the dropdown
  const handleSelectOption = (platformKey: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [platformKey]: option,
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [platformKey]: false,
    }));
  };

  // Mark the stage as validated/completed
  const handleValidate = (index: number) => {
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);

    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  // For the dropdown items, generate required keys only for "Buy type" and "Buy objective"
  const requiredFieldKeys: string[] = [];
  const awarenessStage = funnelStages.find((stage) => stage.name === "Awareness");
  if (awarenessStage) {
    Object.entries(awarenessStage.platforms).forEach(([category, platforms]) => {
      platforms.forEach((platform, pIndex) => {
        if (platform.name === "Buy type" || platform.name === "Buy objective") {
          requiredFieldKeys.push(`Awareness-${category}-${pIndex}`);
        }
      });
    });
  }
  const allRequiredSelected = requiredFieldKeys.every((key) => !!selectedOptions[key]);

  // Return dropdown options based on field name
  const getDropdownOptions = (platform: { name: string }) => {
    if (platform.name === "Buy type") {
      return ["CPM", "CPV"];
    }
    if (platform.name === "Buy objective") {
      return ["Awareness", "Video views", "Traffic"];
    }
    return [];
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      <Toaster position="top-right" reverseOrder={false} />
      {funnelStages.map((stage, stageIndex) => (
        <div key={stageIndex} className="w-full">
          {/* Stage Header */}
          <div
            className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleItem(stage.name)}
          >
            <div className="flex items-center gap-4">
              <Image src={stage.icon} alt={stage.name} />
              <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {statuses[stageIndex] === "Completed" ? (
                <>
                  <Image
                    className="w-5 h-5 rounded-full p-1 bg-green-500"
                    src={checkmark}
                    alt="Completed"
                  />
                  <p className="text-green-500 font-semibold text-base">Completed</p>
                </>
              ) : stage.statusIsActive ? (
                <p className="text-[#3175FF] font-semibold text-base">{statuses[stageIndex]}</p>
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
            <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
              {Object.entries(stage.platforms).map(([category, platforms]) => {
                if (stage.name === "Awareness" && statuses[stageIndex] === "Completed") {
                  // Separate the static and dropdown items.
                  const staticPlatforms = platforms.filter((p) => p.icon);
                  const dropdownPlatforms = platforms
                    .map((p, idx) => ({ ...p, originalIndex: idx }))
                    .filter(
                      (p) =>
                        !p.icon &&
                        (p.name === "Buy type" || p.name === "Buy objective")
                    );
                  return (
                    <div key={category} className="flex flex-col items-start gap-6">
                      <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
                      {/* Top row: static items */}
                      <div className="flex flex-row gap-8">
                        {staticPlatforms.map((platform, idx) => (
                          <div
                            key={`static-${idx}`}
                            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                          >
                            {platform.icon && (
                              <Image src={platform.icon} alt={platform.name} />
                            )}
                            <p className="text-base font-medium text-[#061237]">
                              {platform.name}
                            </p>
                          </div>
                        ))}
                      </div>
                      {/* Bottom row: dropdown items with their selected values */}
                      {dropdownPlatforms.length > 0 && (
                        <div className="flex flex-row gap-8 mt-4">
                          {dropdownPlatforms.map((platform) => {
                            const platformKey = `${stage.name}-${category}-${platform.originalIndex}`;
                            return (
                              <div
                                key={platformKey}
                                className="relative w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg"
                              >
                                <p className="text-base font-medium text-[#061237]">
                                  {selectedOptions[platformKey] || platform.name}
                                </p>
                                <Image src={down2} alt="dropdown" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Render the default grid layout (when not completed)
                  return (
                    <div key={category} className="flex flex-col items-start gap-6">
                      <h3 className="text-xl font-semibold text-[#061237]">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {platforms.map((platform, pIndex) => {
                          const platformKey = `${stage.name}-${category}-${pIndex}`;
                          if (platform.name === "Buy type" || platform.name === "Buy objective") {
                            return (
                              <div key={pIndex} className="relative w-full">
                                <div
                                  className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                  onClick={() => toggleDropdown(platformKey)}
                                >
                                  <p className="text-base font-medium text-[#061237]">
                                    {selectedOptions[platformKey] || platform.name}
                                  </p>
                                  <Image src={down2} alt="dropdown" />
                                </div>
                                {dropdownOpen[platformKey] && (
                                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                                    <ul className="py-2">
                                      {getDropdownOptions(platform).map((option, i) => (
                                        <li
                                          key={i}
                                          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer mb-1"
                                          onClick={() =>
                                            handleSelectOption(platformKey, option)
                                          }
                                        >
                                          {option}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            // Render static items in the normal grid
                            return (
                              <div
                                key={pIndex}
                                className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                              >
                                {platform.icon && (
                                  <Image src={platform.icon} alt={platform.name} />
                                )}
                                <p className="text-base font-medium text-[#061237]">
                                  {platform.name}
                                </p>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                }
              })}
              {/* Validate Button (Only for Awareness stage when not completed) */}
              {stage.name === "Awareness" && statuses[stageIndex] !== "Completed" && (
                <div className="flex justify-end mt-6 w-full">
                  <Button
                    text="Validate"
                    variant="primary"
                    onClick={() => handleValidate(stageIndex)}
                    disabled={!allRequiredSelected}
                  />
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
