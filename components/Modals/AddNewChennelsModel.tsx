"use client";
import { useEffect, useState } from "react";
import FunnelStage from "../../app/creation/components/SelectChannelMix";
import { funnelStages, getPlatformIcon, platformStyles } from "../data";
import Image from "next/image";
import up from "../../public/arrow-down.svg";
import down2 from "../../public/arrow-down-2.svg";
import checkmark from "../../public/mingcute_check-fill.svg";
import { useCampaigns } from "app/utils/CampaignsContext";

const AddNewChennelsModel = ({ isOpen, setIsOpen, setPlatforms }) => {
  // Controls expanded/collapsed state for each stage, defaulting "Awareness" to open
  const [openItems, setOpenItems] = useState({ Awareness: true });
  // Tracks selected platforms per stage (per category)
  const [selected, setSelected] = useState({});
  // Tracks whether a stage has been validated/submitted
  const [validatedStages, setValidatedStages] = useState({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  useEffect(() => {
    if (campaignFormData?.funnel_stages?.length > 0) {
      const initialOpenItems = campaignFormData.funnel_stages.reduce(
        (acc, stage) => {
          acc[stage] = validatedStages[stage] ? false : true; // Keep validated closed, others open
          return acc;
        },
        {}
      );
      setOpenItems(initialOpenItems);
    }

    if (campaignFormData?.channel_mix?.length > 0) {
      const initialSelected = {};
      campaignFormData.channel_mix.forEach((channelMixItem) => {
        const stageName = channelMixItem.funnel_stage;
        initialSelected[stageName] = {
          "Social media":
            channelMixItem?.social_media?.map((sm) => sm.platform_name) || [],
          "Display networks":
            channelMixItem?.display_networks?.map((dn) => dn.platform_name) ||
            [],
          "Search engines":
            channelMixItem?.search_engines?.map((se) => se.platform_name) || [],
        };
      });
      setSelected(initialSelected);
    }

    if (campaignFormData?.validatedStages) {
      setValidatedStages(campaignFormData.validatedStages);
    }
  }, [
    campaignFormData?.funnel_stages,
    campaignFormData?.channel_mix,
    campaignFormData?.validatedStages,
  ]);

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const togglePlatform = (stageName, category, platformName) => {
    setSelected((prev) => {
      const stageSelection = prev[stageName] || {};
      const categorySelection = stageSelection[category] || [];
      const isAlreadySelected = categorySelection.includes(platformName);

      const newCategorySelection = isAlreadySelected
        ? categorySelection.filter((p) => p !== platformName)
        : [...categorySelection, platformName];

      return {
        ...prev,
        [stageName]: {
          ...stageSelection,
          [category]: newCategorySelection,
        },
      };
    });

    const style =
      platformStyles.find((style) => style.name === platformName) ||
      platformStyles[Math.floor(Math.random() * platformStyles.length)];
    setPlatforms((prev) => {
      let stageSelection = prev[stageName] || [];
      stageSelection = [
        ...stageSelection,
        {
          name: platformName,
          icon: getPlatformIcon(platformName),
          channel_name: category,
          color: style?.color,
          bg: style?.bg,
        },
      ];

      return {
        ...prev,
        [stageName]: stageSelection,
      };
    });

    // Update campaign form data without affecting openItems
    setCampaignFormData((prevFormData) => {
      const categoryKey = category.toLowerCase().replaceAll(" ", "_");
      const stageSelection = selected[stageName] || {};
      const categorySelection = stageSelection[category] || [];
      const isAlreadySelected = categorySelection.includes(platformName);
      const newCategorySelection = isAlreadySelected
        ? categorySelection.filter((p) => p !== platformName)
        : [...categorySelection, platformName];
      const platformObjects = newCategorySelection.map((name) => ({
        platform_name: name,
      }));

      const existingChannelMixIndex = prevFormData.channel_mix?.findIndex(
        (item) => item.funnel_stage === stageName
      );

      let updatedChannelMix = [...(prevFormData.channel_mix || [])];

      if (existingChannelMixIndex >= 0) {
        updatedChannelMix[existingChannelMixIndex] = {
          ...updatedChannelMix[existingChannelMixIndex],
          [categoryKey]: platformObjects,
        };
      } else {
        updatedChannelMix.push({
          funnel_stage: stageName,
          [categoryKey]: platformObjects,
        });
      }

      return {
        ...prevFormData,
        channel_mix: updatedChannelMix,
      };
    });
  };

  // A stage (including Awareness) is valid if at least one channel is selected in any category
  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    const hasSocialMedia = stageSelections["Social media"]?.length > 0;
    const hasDisplayNetworks = stageSelections["Display networks"]?.length > 0;
    const hasSearchEngines = stageSelections["Search engines"]?.length > 0;
    return hasSocialMedia || hasDisplayNetworks || hasSearchEngines;
  };

  const handleValidate = (stageName) => {
    if (isStageValid(stageName)) {
      setValidatedStages((prev) => ({
        ...prev,
        [stageName]: true,
      }));
    }
  };

  const handlePlatformClick = (e, stageName, category, platformName) => {
    e.stopPropagation();
    togglePlatform(stageName, category, platformName);
  };

  return (
    <div className="z-50">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full">
          <div className="flex flex-col items-start p-6 gap-6 bg-white rounded-[10px]">
            <button className="self-end" onClick={() => setIsOpen(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                  stroke="#717680"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="card bg-base-100 overflow-y-auto max-h-[60vh]">
              <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
                {campaignFormData?.funnel_stages?.map((stageName, index) => {
                  const stage = funnelStages.find((s) => s.name === stageName);
                  if (!stage) return null;

                  return (
                    <div key={index}>
                      <div
                        className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                  ${
                    openItems[stage.name]
                      ? "rounded-t-[10px]"
                      : "rounded-[10px]"
                  }`}
                        onClick={() => toggleItem(stage.name)}
                      >
                        <div className="flex items-center gap-2">
                          <Image src={stage.icon} alt={stage.name} />
                          <p className="w-[119px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                            {stage.name}
                          </p>
                        </div>
                        {validatedStages[stage.name] ? (
                          <div className="flex items-center gap-2">
                            <Image
                              className="w-5 h-5 rounded-full p-1 bg-green-500"
                              src={checkmark}
                              alt="Completed"
                            />
                            <p className="text-green-500 font-semibold">
                              Completed
                            </p>
                          </div>
                        ) : stage.statusIsActive ? (
                          <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
                            {stage.status}
                          </p>
                        ) : (
                          <p className="mx-auto w-[86px] h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50">
                            Not started
                          </p>
                        )}
                        <div>
                          <Image
                            src={openItems[stage.name] ? up : down2}
                            alt={openItems[stage.name] ? "up" : "down"}
                          />
                        </div>
                      </div>

                      {openItems[stage.name] && (
                        <div className="card_bucket_container_main_sub flex flex-col pb-6 w-full min-h-[300px]">
                          {validatedStages[stage.name] ? (
                            <div className="mt-8 px-6">
                              {Object.entries(selected[stage.name] || {}).map(
                                ([category, platformNames]) => {
                                  if (
                                    !Array.isArray(platformNames) ||
                                    platformNames.length === 0
                                  )
                                    return null;
                                  return (
                                    <div key={category} className="mb-8">
                                      <h2 className="mb-4 font-bold text-lg">
                                        {category}
                                      </h2>
                                      <div className="card_bucket_container flex flex-wrap gap-6">
                                        {platformNames.map(
                                          (platformName, idx) => {
                                            const platformData =
                                              stage.platforms[category].find(
                                                (p) => p.name === platformName
                                              );
                                            if (!platformData) return null;
                                            return (
                                              <div
                                                key={idx}
                                                className="flex flex-row justify-between items-center px-4 py-2 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
                                              >
                                                <div className="flex items-center gap-3">
                                                  <Image
                                                    src={platformData.icon}
                                                    alt={platformData.name}
                                                  />
                                                  <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                                    {platformData.name}
                                                  </p>
                                                </div>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            <>
                              {Object.entries(stage.platforms).map(
                                ([category, platforms]) => (
                                  <div
                                    key={category}
                                    className="card_bucket_container_main"
                                  >
                                    <h2 className="font-bold">{category}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                      {platforms.map((platform, pIndex) => {
                                        const isSelected = selected[
                                          stage.name
                                        ]?.[category]?.includes(platform.name);
                                        return (
                                          <div
                                            key={pIndex}
                                            className={`cursor-pointer flex flex-row justify-between items-center p-4 gap-2 w-[230px] h-[62px] bg-white 
                                  border rounded-[10px] ${
                                    isSelected
                                      ? "border-[#3175FF]"
                                      : "border-[rgba(0,0,0,0.1)]"
                                  }`}
                                            onClick={(e) =>
                                              handlePlatformClick(
                                                e,
                                                stage.name,
                                                category,
                                                platform.name
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-2">
                                              <Image
                                                src={platform.icon}
                                                alt={platform.name}
                                              />
                                              <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                                {platform.name}
                                              </p>
                                            </div>
                                            <div
                                              className={`w-[20px] h-[20px] rounded-full flex items-center justify-center ${
                                                isSelected
                                                  ? "bg-[#3175FF]"
                                                  : "border-[0.769px] border-[rgba(0,0,0,0.2)]"
                                              }`}
                                            >
                                              {isSelected && (
                                                <Image
                                                  src={checkmark}
                                                  alt="selected"
                                                  className="w-3 h-3"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {category !== "Search engines" && (
                                      <hr className="text-[#0000001A] px-4 w-full " />
                                    )}
                                  </div>
                                )
                              )}

                              <div className="flex justify-end pr-[24px] mt-4">
                                <button
                                  disabled={!isStageValid(stage.name)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleValidate(stage.name);
                                  }}
                                  className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${
                                    isStageValid(stage.name)
                                      ? "bg-[#3175FF] hover:bg-[#2563eb]"
                                      : "bg-[#3175FF] opacity-50 cursor-not-allowed"
                                  }`}
                                >
                                  Validate
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewChennelsModel;