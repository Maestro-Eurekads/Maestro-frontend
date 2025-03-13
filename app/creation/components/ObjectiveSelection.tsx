"use client";
import React, { useEffect, useState } from "react";
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
import { useCampaigns } from "../../utils/CampaignsContext";
import { funnelStages } from "../../../components/data";

import google from "../../../public/social/google.svg";
import x from "../../../public/x.svg";
import linkedin from "../../../public/linkedin.svg";
import Display from "../../../public/Display.svg";
import yahoo from "../../../public/yahoo.svg";
import bing from "../../../public/bing.svg";
import tictok from "../../../public/tictok.svg";
import cursor from "../../../public/blue_fluent_cursor-click.svg";
import State12 from "../../../public/State12.svg";
import roundget from "../../../public/ic_round-get-app.svg";
import mingcute_basket from "../../../public/mingcute_basket-fill.svg";
import mdi_leads from "../../../public/mdi_leads.svg";

const platformData = {
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
};

const ObjectiveSelection = () => {
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [statuses, setStatuses] = useState(
    funnelStages.map((stage) => stage.status)
  );
  const [dropdownOpen, setDropdownOpen] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [isEditable, setIsEditable] = useState<{ [key: string]: boolean }>({});
  const [previousSelectedOptions, setPreviousSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const [selectedNetworks, setSelectedNetworks] = useState<{
    [key: string]: Set<string>;
  }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<{
    [key: string]: Set<string>;
  }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
  });
  const [validatedPlatforms, setValidatedPlatforms] = useState<{
    [key: string]: Set<string>;
  }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
  });

  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // console.log("selectedNetw", selectedNetworks);

  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const value = campaignFormData?.funnel_stages?.reduce(
        (acc, stage, index) => {
          acc[stage] = index === 0;
          return acc;
        },
        {}
      );
      setOpenItems(value);
    }
    const ch_mix = campaignFormData?.channel_mix;
    console.log("🚀 ~ useEffect ~ ch_mix:", JSON.stringify(ch_mix));
    const v =
      Array.isArray(ch_mix) &&
      ch_mix.reduce((acc, ch) => {
        acc[ch.funnel_stage] = {
          "Social media": ch?.social_media?.map((sm) => sm?.platform_name),
          "Display networks": ch?.display_networks?.map(
            (dn) => dn?.platform_name
          ),
          "Search engines": ch?.search_engines?.map((se) => se?.platform_name),
        };
        return acc;
      }, {});
    console.log("🚀 ~ v ~ v:", v);
    setSelectedNetworks(v);
  }, [campaignFormData?.funnel_stages]);

  // Toggle expand/collapse for a stage
  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  // Toggle the dropdown for dropdown items (only active when not completed)
  const toggleDropdown = (platformKey: string) => {
    setDropdownOpen({ [platformKey]: !dropdownOpen[platformKey] });
  };

  // Handle selecting an option from the dropdown
  const handleSelectOption = (
    platformName: string,
    option: string,
    category: string,
    stageName: string,
    dropDownName: string
  ) => {
    console.log({ platformName, option, category, stageName, dropDownName });
    // Update the campaignFormData with the selected buy type or objective type
    const updatedChannelMix = campaignFormData.channel_mix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        if (category === "Social media") {
          updatedStage.social_media = stage.social_media.map((platform) => {
            if (platform.platform_name === platformName) {
              return {
                ...platform,
                [dropDownName]: option,
              };
            }
            console.log(platform);
            return platform;
          });
        } else if (category === "Display networks") {
          updatedStage.display_networks = stage.display_networks.map(
            (platform) => {
              if (platform.platform_name === platformName) {
                return {
                  ...platform,
                  [dropDownName]: option,
                };
              }
              return platform;
            }
          );
        } else if (category === "Search engines") {
          updatedStage.search_engines = stage.search_engines.map((platform) => {
            if (platform.platform_name === platformName) {
              return {
                ...platform,
                [dropDownName]: option,
              };
            }
            return platform;
          });
        }
        return updatedStage;
      }
      return stage;
    });

    toggleDropdown("");
    // Update the campaignFormData state
    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));
  };

  // Mark the stage as validated/completed
  const handleValidate = (index: number) => {
    const stageName = funnelStages[index].name;
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);
    setIsEditable((prev) => ({ ...prev, [stageName]: true }));

    // Store validated platforms
    const validatedPlatformsSet = new Set<string>();
    Object.entries(selectedOptions).forEach(([key]) => {
      const [stage, category, platformIndex] = key.split("-");
      if (stage === stageName) {
        const platform =
          funnelStages[0].platforms[category][
            Math.floor(parseInt(platformIndex) / 3) * 3
          ];
        if (
          platform &&
          platform.name &&
          hasCompletePlatformSelection(platform.name, category, stageName)
        ) {
          validatedPlatformsSet.add(platform.name);
        }
      }
    });

    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: validatedPlatformsSet,
    }));

    // Store the current selected options before validation
    setPreviousSelectedOptions(selectedOptions);

    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  // Check if a platform has both buy type and objective selected
  const hasCompletePlatformSelection = (
    platformName: string,
    category: string,
    stageName: string
  ) => {
    const platforms = funnelStages[0].platforms[category];
    const platformIndex = platforms.findIndex((p) => p.name === platformName);
    if (platformIndex === -1) return false;

    const baseIndex = platformIndex;
    const buyTypeKey = `${stageName}-${category}-${baseIndex + 1}`;
    const buyObjectiveKey = `${stageName}-${category}-${baseIndex + 2}`;

    return selectedOptions[buyTypeKey] && selectedOptions[buyObjectiveKey];
  };

  // Check if at least one platform has both selections
  const hasMinimumBuySelections = (stageName: string) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0)
      return false;

    for (const network of selectedNetworks[stageName]) {
      const platforms = funnelStages[0].platforms[network];
      for (let i = 0; i < platforms.length; i += 3) {
        const platform = platforms[i];
        if (
          platform.icon &&
          hasCompletePlatformSelection(platform.name, network, stageName)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const platformIcons = {
    Facebook: facebook,
    Instagram: ig,
    YouTube: youtube,
    TheTradeDesk: TheTradeDesk,
    Quantcast: Quantcast,
    Google: google,
    "Twitter/X": x,
    LinkedIn: linkedin,
    TikTok: tictok,
    "Display & Video": Display,
    Yahoo: yahoo,
    Bing: bing,
    "Apple Search": google,
    "The Trade Desk": TheTradeDesk,
    QuantCast: Quantcast,
  };

  const getPlatformIcon = (platformName) => {
    return platformIcons[platformName] || null;
  };

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

  const renderCompletedPlatform = (
    platform: any,
    idx: number,
    category: string,
    stageName: string
  ) => {
    const baseIndex = idx * 3;
    const buyTypeKey = `${stageName}-${category}-${baseIndex + 1}`;
    const buyObjectiveKey = `${stageName}-${category}-${baseIndex + 2}`;

    if (!validatedPlatforms[stageName].has(platform.name)) {
      return null;
    }

    return (
      <div key={idx} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image src={platform.icon} className="size-4" alt={platform.name} />
          <p className="text-sm font-medium text-[#061237] ">{platform.name}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white border text-center whitespace-nowrap border-gray-300 rounded-lg">
            {selectedOptions[buyTypeKey] || "Buy type"}
          </div>
          <div className="px-4 py-2 bg-white whitespace-nowrap border text-center border-gray-300 rounded-lg">
            {selectedOptions[buyObjectiveKey] || "Buy objective"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      <Toaster position="top-right" reverseOrder={false} />
      {campaignFormData?.funnel_stages.map((stageName, stageIndex) => {
        const stage = funnelStages.find((s) => s.name === stageName);
        if (!stage) return null;
        return (
          <div key={stageIndex} className="w-full">
            {/* Stage Header */}
            <div
              className="flex items-center justify-between px-6 py-4 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                <Image src={stage.icon} className="size-4" alt={stage.name} />
                <p className="text-sm font-semibold text-[#061237] whitespace-nowrap">
                  {stage.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {statuses[stageIndex] === "Completed" ? (
                  <>
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark}
                      alt="Completed"
                    />
                    <p className="text-green-500 font-semibold text-base">
                      Completed
                    </p>
                  </>
                ) : stage.statusIsActive ? (
                  <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">
                    {statuses[stageIndex]}
                  </p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">
                    Not started
                  </p>
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
                {statuses[stageIndex] === "Completed" ? (
                  <div className="flex flex-col md:flex-row w-full gap-12">
                    {Array.from(selectedNetworks[stage.name] || []).map(
                      (network) => {
                        console.log(network, "fdhfd");
                        return (
                          <div key={network} className="flex-1">
                            <h3 className="text-xl font-semibold text-[#061237] mb-6">
                              {network} here
                            </h3>
                            <div className="flex flex-row gap-8">
                              {stage.platforms[network]
                                .filter((p) => p.icon)
                                .map((platform, idx) =>
                                  renderCompletedPlatform(
                                    platform,
                                    idx,
                                    network,
                                    stage.name
                                  )
                                )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  // Original grid layout for non-completed state
                  Object.entries(selectedNetworks[stageName]).map(
                    ([category, platforms]: [string, Set<string>]) => {
                      console.log({ category, platforms });
                      return (
                        <div
                          key={category}
                          className="w-full md:flex flex-col items-start gap-6 md:w-4/5"
                        >
                          <h3 className="text-xl font-semibold text-[#061237]">
                            {category}
                          </h3>
                          <div className="flex flex-col gap-8 w-fit">
                            {Array.from(platforms).map((platform, pIndex) => {
                              const platformKey = `${stage.name}-${category}-${pIndex}`;
                              const selectedObj = campaignFormData?.channel_mix
                                ?.find((ch) => ch?.funnel_stage === stageName)
                                ?.[
                                  category?.toLowerCase()?.replaceAll(" ", "_")
                                ]?.find(
                                  (pl) => pl?.platform_name === platform
                                )?.objective_type;
                              const selectedBuy = campaignFormData?.channel_mix
                                ?.find((ch) => ch?.funnel_stage === stageName)
                                ?.[
                                  category?.toLowerCase()?.replaceAll(" ", "_")
                                ]?.find(
                                  (pl) => pl?.platform_name === platform
                                )?.buy_type;
                              console.log("here", selectedObj);
                              return (
                                <div
                                  key={platformKey}
                                  className="flex items-center gap-8"
                                >
                                  <div className="w-[180px]">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit">
                                      {platform && (
                                        <Image
                                          src={getPlatformIcon(platform)}
                                          className="size-4"
                                          alt={platform}
                                        />
                                      )}
                                      <p className="text-base font-medium text-[#061237]">
                                        {platform}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="relative w-fit shrink-0">
                                    <div
                                      className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                      onClick={() =>
                                        toggleDropdown(platformKey + "obj")
                                      }
                                    >
                                      <p className="text-sm font-medium text-[#061237]">
                                        {selectedObj || "Buy Objectives"}
                                      </p>
                                      <Image src={down2} alt="dropdown" />
                                    </div>
                                    {dropdownOpen[platformKey + "obj"] && (
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                                        <ul>
                                          {["CPM", "CPV"].map((option, i) => (
                                            <li
                                              key={`${platformKey}-objective-${i}`}
                                              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                              onClick={() =>
                                                handleSelectOption(
                                                  platform,
                                                  option,
                                                  category,
                                                  stage.name,
                                                  "objective_type"
                                                )
                                              }
                                            >
                                              {option}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  <div className="relative w-fit shrink-0">
                                    <div
                                      className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                      onClick={() =>
                                        toggleDropdown(platformKey)
                                      }
                                    >
                                      <p className="text-sm font-medium text-[#061237]">
                                        {selectedBuy || "Buy Type"}
                                      </p>
                                      <Image src={down2} alt="dropdown" />
                                    </div>
                                    {dropdownOpen[platformKey] && (
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                                        <ul>
                                          {["CPM", "CPV"].map((option, i) => (
                                            <li
                                              key={`${platformKey}-type-${i}`}
                                              className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                              onClick={() =>
                                                handleSelectOption(
                                                  platform,
                                                  option,
                                                  category,
                                                  stage.name,
                                                  "buy_type"
                                                )
                                              }
                                            >
                                              {option}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                  )
                )}
                {/* Validate Button (Only when not completed) */}
                {statuses[stageIndex] !== "Completed" && (
                  <div className="flex justify-end mt-6 w-full">
                    <Button
                      text="Validate"
                      variant="primary"
                      onClick={() => handleValidate(stageIndex)}
                      // disabled={!hasMinimumBuySelections(stage.name)}
                    />
                  </div>
                )}
                {/* Edit Button (Only when completed) */}
                {statuses[stageIndex] === "Completed" && (
                  <div className="flex justify-end mt-2 w-full">
                    <Button
                      text="Edit"
                      variant="primary"
                      className="bg-blue-500"
                      onClick={() => {
                        setIsEditable((prev) => ({
                          ...prev,
                          [stage.name]: false,
                        }));
                        setSelectedOptions(previousSelectedOptions); // Restore previous selections
                        setStatuses((prev) => {
                          const updated = [...prev];
                          updated[stageIndex] = "In progress"; // Set status back to "In progress"
                          return updated;
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ObjectiveSelection;
