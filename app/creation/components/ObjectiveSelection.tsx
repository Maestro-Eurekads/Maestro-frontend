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
import google from "../../../public/social/google.svg";
import x from "../../../public/x.svg";
import linkedin from "../../../public/linkedin.svg";
import Display from "../../../public/Display.svg";
import yahoo from "../../../public/yahoo.svg";
import bing from "../../../public/bing.svg";
import tictok from "../../../public/tictok.svg";
import Button from "./common/button";
import { useCampaigns } from "../../utils/CampaignsContext";
import { funnelStages } from "../../../components/data";

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
  const [validatedPlatforms, setValidatedPlatforms] = useState<{
    [key: string]: Set<string>;
  }>({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
  });

  const { campaignFormData, setCampaignFormData } = useCampaigns();

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
    if (Array.isArray(ch_mix)) {
      const updatedNetworks = ch_mix.reduce((acc, ch) => {
        acc[ch.funnel_stage] = new Set([
          ...(ch?.social_media?.map((sm) => sm?.platform_name) || []),
          ...(ch?.display_networks?.map((dn) => dn?.platform_name) || []),
          ...(ch?.search_engines?.map((se) => se?.platform_name) || []),
        ]);
        return acc;
      }, {});
      setSelectedNetworks((prev) => ({
        ...prev,
        ...updatedNetworks,
      }));
    }
  }, [campaignFormData?.funnel_stages, campaignFormData?.channel_mix]);

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const toggleDropdown = (platformKey: string) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [platformKey]: !prev[platformKey],
    }));
  };

  const handleSelectOption = (
    platformName: string,
    option: string,
    category: string,
    stageName: string,
    dropDownName: string
  ) => {
    const key = `${stageName}-${category}-${platformName}-${dropDownName}`;
    const dropdownKey =
      dropDownName === "objective_type"
        ? `${stageName}-${category}-${platformName}obj`
        : `${stageName}-${category}-${platformName}`;

    setSelectedOptions((prev) => ({
      ...prev,
      [key]: option,
    }));

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

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));

    // Close the dropdown after selection
    setDropdownOpen((prev) => ({
      ...prev,
      [dropdownKey]: false,
    }));
  };

  const handleValidate = (index: number) => {
    const stageName = funnelStages[index].name;
    const updatedStatuses = [...statuses];
    updatedStatuses[index] = "Completed";
    setStatuses(updatedStatuses);
    setIsEditable((prev) => ({ ...prev, [stageName]: true }));

    const validatedPlatformsSet = new Set<string>();
    Array.from(selectedNetworks[stageName] || []).forEach((platformName) => {
      if (
        hasCompletePlatformSelection(platformName, "Social media", stageName) ||
        hasCompletePlatformSelection(
          platformName,
          "Display networks",
          stageName
        ) ||
        hasCompletePlatformSelection(platformName, "Search engines", stageName)
      ) {
        validatedPlatformsSet.add(platformName);
      }
    });

    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: validatedPlatformsSet,
    }));

    setPreviousSelectedOptions(selectedOptions);
    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  const hasCompletePlatformSelection = (
    platformName: string,
    category: string,
    stageName: string
  ) => {
    const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`;
    const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`;
    return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey];
  };

  const hasMinimumBuySelections = (stageName: string) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0)
      return false;

    for (const platformName of selectedNetworks[stageName]) {
      if (
        hasCompletePlatformSelection(platformName, "Social media", stageName) ||
        hasCompletePlatformSelection(
          platformName,
          "Display networks",
          stageName
        ) ||
        hasCompletePlatformSelection(platformName, "Search engines", stageName)
      ) {
        return true;
      }
    }
    return false;
  };

  const getPlatformIcon = (platformName) => {
    return platformIcons[platformName] || null;
  };

  const renderCompletedPlatform = (
    platformName: string,
    category: string,
    stageName: string
  ) => {
    const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`;
    const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`;

    if (!validatedPlatforms[stageName].has(platformName)) {
      return null;
    }

    return (
      <div key={platformName} className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image
            src={getPlatformIcon(platformName)}
            className="size-4"
            alt={platformName}
          />
          <p className="text-sm font-medium text-[#061237]">{platformName}</p>
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

            {openItems[stage.name] && (
              <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
                {statuses[stageIndex] === "Completed" ? (
                  <div className="flex flex-col md:flex-row w-full gap-12">
                    {["Social media", "Display networks", "Search engines"].map(
                      (category) => (
                        <div key={category} className="flex-1">
                          <h3 className="text-xl font-semibold text-[#061237] mb-6">
                            {category}
                          </h3>
                          <div className="flex flex-row gap-8">
                            {Array.from(selectedNetworks[stage.name] || [])
                              .filter((platform) =>
                                campaignFormData?.channel_mix
                                  ?.find((ch) => ch.funnel_stage === stageName)
                                  ?.[category.toLowerCase().replaceAll(" ", "_")]
                                  ?.some((p) => p.platform_name === platform)
                              )
                              .map((platform) =>
                                renderCompletedPlatform(
                                  platform,
                                  category,
                                  stage.name
                                )
                              )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  ["Social media", "Display networks", "Search engines"].map(
                    (category) => (
                      <div
                        key={category}
                        className="w-full md:flex flex-col items-start gap-6 md:w-4/5"
                      >
                        <h3 className="text-xl font-semibold text-[#061237]">
                          {category}
                        </h3>
                        <div className="flex flex-col gap-8 w-fit">
                          {Array.from(selectedNetworks[stageName] || [])
                            .filter((platform) =>
                              campaignFormData?.channel_mix
                                ?.find((ch) => ch.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.some((p) => p.platform_name === platform)
                            )
                            .map((platform) => {
                              const platformKey = `${stage.name}-${category}-${platform}`;
                              const selectedObj = campaignFormData?.channel_mix
                                ?.find((ch) => ch?.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.find((pl) => pl?.platform_name === platform)
                                ?.objective_type;
                              const selectedBuy = campaignFormData?.channel_mix
                                ?.find((ch) => ch?.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.find((pl) => pl?.platform_name === platform)
                                ?.buy_type;
                              return (
                                <div
                                  key={platformKey}
                                  className="flex items-center gap-8"
                                >
                                  <div className="w-[180px]">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit">
                                      <Image
                                        src={getPlatformIcon(platform)}
                                        className="size-4"
                                        alt={platform}
                                      />
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
                                        {selectedObj || "Buy Objective"}
                                      </p>
                                      <Image src={down2} alt="dropdown" />
                                    </div>
                                    {dropdownOpen[platformKey + "obj"] && (
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg transition-transform transform hover:scale-105 z-10">
                                        <ul>
                                          {[
                                            "Awareness",
                                            "Video views",
                                            "Traffic",
                                          ].map((option, i) => (
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
                    )
                  )
                )}
                {statuses[stageIndex] !== "Completed" && (
                  <div className="flex justify-end mt-6 w-full">
                    <Button
                      text="Validate"
                      variant="primary"
                      onClick={() => handleValidate(stageIndex)}
                      disabled={!hasMinimumBuySelections(stage.name)}
                    />
                  </div>
                )}
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
                        setSelectedOptions(previousSelectedOptions);
                        setStatuses((prev) => {
                          const updated = [...prev];
                          updated[stageIndex] = "In progress";
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