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
  const [statuses, setStatuses] = useState(() => {
    // Initialize from localStorage if available
    const savedStatuses = localStorage.getItem('funnelStageStatuses');
    return savedStatuses ? JSON.parse(savedStatuses) : {};
  });
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isEditable, setIsEditable] = useState({});
  const [previousSelectedOptions, setPreviousSelectedOptions] = useState({});
  const [selectedNetworks, setSelectedNetworks] = useState({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
    Loyalty: new Set(),
  });
  const [validatedPlatforms, setValidatedPlatforms] = useState(() => {
    // Initialize from localStorage if available
    const savedPlatforms = localStorage.getItem('validatedPlatforms');
    return savedPlatforms ? JSON.parse(savedPlatforms, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Set') {
          return new Set(value.value);
        }
      }
      return value;
    }) : {
      Awareness: new Set(),
      Consideration: new Set(),
      Conversion: new Set(),
      Loyalty: new Set(),
    };
  });
  const [dropdownOpen, setDropdownOpen] = useState({});

  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // Initialize statuses when campaign form data changes
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const savedStatuses = localStorage.getItem('funnelStageStatuses');
      const initialStatuses = savedStatuses ? JSON.parse(savedStatuses) : {};
      
      // Only initialize stages that don't have a saved status
      campaignFormData.funnel_stages.forEach(stage => {
        if (!initialStatuses[stage]) {
          initialStatuses[stage] = "Not Started";
        }
      });
      
      setStatuses(initialStatuses);
      localStorage.setItem('funnelStageStatuses', JSON.stringify(initialStatuses));
    }
  }, [campaignFormData?.funnel_stages]);

  // Save validatedPlatforms to localStorage whenever they change
  useEffect(() => {
    const serializedPlatforms = JSON.stringify(validatedPlatforms, (key, value) => {
      if (value instanceof Set) {
        return {
          dataType: 'Set',
          value: Array.from(value)
        };
      }
      return value;
    });
    localStorage.setItem('validatedPlatforms', serializedPlatforms);
  }, [validatedPlatforms]);

  // Save statuses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('funnelStageStatuses', JSON.stringify(statuses));
  }, [statuses]);

  // Sync selectedOptions with campaignFormData on mount or update
  useEffect(() => {
    const initialSelectedOptions = {};
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    channelMix.forEach((stage) => {
      const stageName = stage.funnel_stage;
      ["social_media", "display_networks", "search_engines"].forEach(
        (category) => {
          const platforms = Array.isArray(stage[category]) ? stage[category] : [];
          platforms.forEach((platform) => {
            const platformName = platform.platform_name;
            const buyTypeKey = `${stageName}-${category.replace(
              "_",
              " "
            )}-${platformName}-buy_type`;
            const buyObjectiveKey = `${stageName}-${category.replace(
              "_",
              " "
            )}-${platformName}-objective_type`;
            if (platform.buy_type) {
              initialSelectedOptions[buyTypeKey] = platform.buy_type;
            }
            if (platform.objective_type) {
              initialSelectedOptions[buyObjectiveKey] = platform.objective_type;
            }
          });
        }
      );
    });
    setSelectedOptions((prev) => ({ ...prev, ...initialSelectedOptions }));
  }, [campaignFormData?.channel_mix]);

  // Initialize openItems and selectedNetworks from campaignFormData
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const value = campaignFormData.funnel_stages.reduce((acc, stage) => {
        acc[stage] = acc[stage] !== undefined ? acc[stage] : stage === "Awareness";
        return acc;
      }, { ...openItems });
      setOpenItems(value);
    }
    const ch_mix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    if (ch_mix.length > 0) {
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

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const toggleDropdown = (key) => {
    setDropdownOpen((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleSelectOption = (
    platformName,
    option,
    category,
    stageName,
    dropDownName
  ) => {
    const key = `${stageName}-${category}-${platformName}-${dropDownName}`;
    const dropdownKey =
      dropDownName === "objective_type"
        ? `${stageName}-${category}-${platformName}obj`
        : `${stageName}-${category}-${platformName}`;

    // Update selected options
    setSelectedOptions((prev) => ({
      ...prev,
      [key]: option,
    }));

    // Update status to "In progress" only when an option is selected
    setStatuses(prev => {
      const newStatuses = {
        ...prev,
        [stageName]: "In progress"
      };
      localStorage.setItem('funnelStageStatuses', JSON.stringify(newStatuses));
      return newStatuses;
    });

    // Update campaignFormData
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const updatedChannelMix = channelMix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        if (category === "Social media") {
          updatedStage.social_media = (stage.social_media || []).map((platform) => {
            if (platform.platform_name === platformName) {
              return { ...platform, [dropDownName]: option };
            }
            return platform;
          });
        } else if (category === "Display networks") {
          updatedStage.display_networks = (stage.display_networks || []).map(
            (platform) => {
              if (platform.platform_name === platformName) {
                return { ...platform, [dropDownName]: option };
              }
              return platform;
            }
          );
        } else if (category === "Search engines") {
          updatedStage.search_engines = (stage.search_engines || []).map(
            (platform) => {
              if (platform.platform_name === platformName) {
                return { ...platform, [dropDownName]: option };
              }
              return platform;
            }
          );
        }
        return updatedStage;
      }
      return stage;
    });

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));

    // Close only the specific dropdown
    setDropdownOpen((prev) => ({
      ...prev,
      [dropdownKey]: false,
    }));

    // Ensure the current stage remains open
    setOpenItems((prev) => ({
      ...prev,
      [stageName]: true,
    }));
  };

  const handleValidate = (stageName) => {
    // Update status to "Completed"
    setStatuses(prev => {
      const newStatuses = {
        ...prev,
        [stageName]: "Completed"
      };
      localStorage.setItem('funnelStageStatuses', JSON.stringify(newStatuses));
      return newStatuses;
    });
    
    setIsEditable((prev) => ({ ...prev, [stageName]: true }));

    const validatedPlatformsSet = new Set();
    Array.from(selectedNetworks[stageName] || []).forEach((platformName) => {
      if (
        hasCompletePlatformSelection(platformName, "Social media", stageName) ||
        hasCompletePlatformSelection(platformName, "Display networks", stageName) ||
        hasCompletePlatformSelection(platformName, "Search engines", stageName)
      ) {
        validatedPlatformsSet.add(platformName);
      }
    });

    setValidatedPlatforms((prev) => {
      const newValidatedPlatforms = {
        ...prev,
        [stageName]: validatedPlatformsSet,
      };
      
      // Save to localStorage with proper Set serialization
      const serializedPlatforms = JSON.stringify(newValidatedPlatforms, (key, value) => {
        if (value instanceof Set) {
          return {
            dataType: 'Set',
            value: Array.from(value)
          };
        }
        return value;
      });
      localStorage.setItem('validatedPlatforms', serializedPlatforms);
      
      return newValidatedPlatforms;
    });

    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: {
        ...prev.validatedStages,
        [stageName]: true,
      },
    }));

    setPreviousSelectedOptions(selectedOptions);
    toast.success("Stage completed successfully! 🎉");

    if (navigator.vibrate) {
      navigator.vibrate(300);
    }
  };

  const hasCompletePlatformSelection = (platformName, category, stageName) => {
    const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`;
    const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`;
    return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey];
  };

  const hasMinimumBuySelections = (stageName) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0)
      return false;

    for (const platformName of selectedNetworks[stageName]) {
      if (
        hasCompletePlatformSelection(platformName, "Social media", stageName) ||
        hasCompletePlatformSelection(platformName, "Display networks", stageName) ||
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

  const renderCompletedPlatform = (platformName, category, stageName) => {
    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_");
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const platformData = channelMix
      .find((ch) => ch.funnel_stage === stageName)
      ?.[normalizedCategory]?.find((p) => p.platform_name === platformName);

    if (!validatedPlatforms[stageName]?.has(platformName) || !platformData) {
      return null;
    }

    return (
      <div
        key={platformName}
        className="flex flex-col gap-4 min-w-[150px] max-w-[200px]"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image
            src={getPlatformIcon(platformName)}
            className="size-4"
            alt={platformName}
          />
          <p className="text-sm font-medium text-[#061237] truncate">
            {platformName}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.buy_type || "Buy type"}
          </div>
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.objective_type || "Buy objective"}
          </div>
        </div>
      </div>
    );
  };

  const hasValidatedPlatformsForCategory = (category, stageName) => {
    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_");
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const platformsInCategory = channelMix
      .find((ch) => ch.funnel_stage === stageName)
      ?.[normalizedCategory]?.map((p) => p.platform_name) || [];
    return platformsInCategory.some((platform) =>
      validatedPlatforms[stageName]?.has(platform)
    );
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      <Toaster position="top-right" reverseOrder={false} />
      {campaignFormData?.funnel_stages?.map((stageName) => {
        const stage = funnelStages?.find((s) => s?.name === stageName);
        if (!stage) return null;
        return (
          <div key={stageName} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 max-w-[950px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                rounded-t-[10px] ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                <Image src={stage.icon} className="size-4" alt={stage.name} />
                <p className="text-sm font-semibold text-[#061237] whitespace-nowrap">
                  {stage.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {statuses[stageName] === "Completed" ? (
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
                ) : statuses[stageName] === "In progress" ? (
                  <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">
                    In progress
                  </p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">
                    Not Started
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
                {statuses[stageName] === "Completed" ? (
                  <div className="flex flex-col w-full gap-12">
                    {["Social media", "Display networks", "Search engines"]
                      .filter((category) =>
                        hasValidatedPlatformsForCategory(category, stage.name)
                      )
                      .map((category) => (
                        <div key={category} className="w-full">
                          <h3 className="text-xl font-semibold text-[#061237] mb-6">
                            {category}
                          </h3>
                          <div className="flex flex-wrap gap-8">
                            {Array.from(selectedNetworks[stage.name] || [])
                              .filter((platform) => {
                                const channelMix = Array.isArray(
                                  campaignFormData?.channel_mix
                                )
                                  ? campaignFormData.channel_mix
                                  : [];
                                return channelMix
                                  .find((ch) => ch.funnel_stage === stageName)
                                  ?.[category.toLowerCase().replaceAll(" ", "_")]
                                  ?.some((p) => p.platform_name === platform);
                              })
                              .map((platform) =>
                                renderCompletedPlatform(platform, category, stage.name)
                              )}
                          </div>
                        </div>
                      ))}
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
                        <div className="flex flex-col gap-8">
                          {Array.from(selectedNetworks[stageName] || [])
                            .filter((platform) => {
                              const channelMix = Array.isArray(
                                campaignFormData?.channel_mix
                              )
                                ? campaignFormData.channel_mix
                                : [];
                              return channelMix
                                .find((ch) => ch.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.some((p) => p.platform_name === platform);
                            })
                            .map((platform) => {
                              const channelMix = Array.isArray(
                                campaignFormData?.channel_mix
                              )
                                ? campaignFormData.channel_mix
                                : [];
                              const platformKey = `${stage.name}-${category}-${platform}`;
                              const selectedObj = channelMix
                                .find((ch) => ch?.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.find((pl) => pl?.platform_name === platform)
                                ?.objective_type;
                              const selectedBuy = channelMix
                                .find((ch) => ch?.funnel_stage === stageName)
                                ?.[category.toLowerCase().replaceAll(" ", "_")]
                                ?.find((pl) => pl?.platform_name === platform)
                                ?.buy_type;

                              return (
                                <div
                                  key={platformKey}
                                  className="flex items-center gap-8"
                                >
                                  <div className="w-[180px]">
                                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit min-w-[150px]">
                                      <Image
                                        src={getPlatformIcon(platform)}
                                        className="size-4"
                                        alt={platform as string}
                                      />
                                      <p className="text-base font-medium text-[#061237]">
                                        {platform as string}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="relative min-w-[150px]">
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
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                                        <ul>
                                          {["Awareness", "Video views", "Traffic"].map(
                                            (option, i) => (
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
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  <div className="relative min-w-[150px]">
                                    <div
                                      className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                      onClick={() => toggleDropdown(platformKey)}
                                    >
                                      <p className="text-sm font-medium text-[#061237]">
                                        {selectedBuy || "Buy Type"}
                                      </p>
                                      <Image src={down2} alt="dropdown" />
                                    </div>
                                    {dropdownOpen[platformKey] && (
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
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
                {statuses[stageName] !== "Completed" && (
                  <div className="flex justify-end mt-6 w-full">
                    <Button
                      text="Validate"
                      variant="primary"
                      onClick={() => handleValidate(stageName)}
                      disabled={!hasMinimumBuySelections(stage.name)}
                    />
                  </div>
                )}
                {statuses[stageName] === "Completed" && (
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
                        setStatuses(prev => {
                          const newStatuses = {
                            ...prev,
                            [stageName]: "Not Started"
                          };
                          localStorage.setItem('funnelStageStatuses', JSON.stringify(newStatuses));
                          return newStatuses;
                        });
                        // Clear validated platforms for this stage
                        setValidatedPlatforms(prev => {
                          const newValidatedPlatforms = {
                            ...prev,
                            [stageName]: new Set()
                          };
                          const serializedPlatforms = JSON.stringify(newValidatedPlatforms, (key, value) => {
                            if (value instanceof Set) {
                              return {
                                dataType: 'Set',
                                value: Array.from(value)
                              };
                            }
                            return value;
                          });
                          localStorage.setItem('validatedPlatforms', serializedPlatforms);
                          return newValidatedPlatforms;
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
