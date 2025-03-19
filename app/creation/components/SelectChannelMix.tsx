"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";

// SelectChannelMix component allows users to select marketing platforms for different funnel stages
const SelectChannelMix = () => {
  // State management
  const [openItems, setOpenItems] = useState({ Awareness: true }); // Tracks which funnel stages are expanded
  const [selected, setSelected] = useState({}); // Stores selected platforms for each stage
  const [validatedStages, setValidatedStages] = useState({}); // Tracks which stages are validated
  const { campaignFormData, setCampaignFormData } = useCampaigns(); // Campaign context

  // Initialize component state from campaign data when component mounts or data changes
  useEffect(() => {
    // Initialize openItems state from funnel stages
    if (campaignFormData?.funnel_stages?.length > 0) {
      const initialOpenItems = campaignFormData.funnel_stages.reduce(
        (acc, stage, index) => {
          acc[stage] = index === 0; // Open first stage by default
          return acc;
        },
        {}
      );
      setOpenItems(initialOpenItems);
    }

    // Initialize selected platforms from existing channel_mix data
    if (campaignFormData?.channel_mix?.length > 0) {
      const initialSelected = {};

      campaignFormData.channel_mix.forEach(channelMixItem => {
        const stageName = channelMixItem.funnel_stage;
        initialSelected[stageName] = {
          "Social media": channelMixItem?.social_media?.map(sm => sm.platform_name) || [],
          "Display networks": channelMixItem?.display_networks?.map(dn => dn.platform_name) || [],
          "Search engines": channelMixItem?.search_engines?.map(se => se.platform_name) || []
        };
      });

      setSelected(initialSelected);
    }

    // Initialize validatedStages from campaign data
    if (campaignFormData?.validatedStages) {
      setValidatedStages(campaignFormData.validatedStages);
    }
  }, [campaignFormData?.funnel_stages, campaignFormData?.channel_mix, campaignFormData?.validatedStages]);

  // Toggle expansion of a funnel stage section
  const toggleItem = (stage) => {
    setOpenItems(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  // Handle selection/deselection of platforms
  const togglePlatform = (
    stageName: string,
    category: string,
    platformName: string
  ) => {
    const prev = { ...selected };
    console.log("🚀 ~ SelectChannelMix ~ prev:", prev)
    const stageSelection = prev[stageName] || {};
    const categorySelection = stageSelection[category] || [];
    const isAlreadySelected = categorySelection.includes(platformName);

    // Update local state
    const newCategorySelection = isAlreadySelected
      ? categorySelection.filter(p => p !== platformName)
      : [...categorySelection, platformName];

    setSelected(prev => ({
      ...prev,
      [stageName]: {
        ...stageSelection,
        [category]: newCategorySelection
      }
    }));

    // Update campaign form data context
    setCampaignFormData(prevFormData => {
      // Create normalized category key (lowercase with underscores)
      const categoryKey = category.toLowerCase().replaceAll(" ", "_");

      // Map selected platform names to objects with platform_name property
      const platformObjects = newCategorySelection.map(name => ({
        platform_name: name
      }));

      // Check if this funnel stage already exists in channel_mix
      const existingChannelMixIndex = prevFormData.channel_mix?.findIndex(
        item => item.funnel_stage === stageName
      );

      let updatedChannelMix = [...(prevFormData.channel_mix || [])];

      if (existingChannelMixIndex >= 0) {
        // Update existing funnel stage with all categories, even if empty
        updatedChannelMix[existingChannelMixIndex] = {
          funnel_stage: stageName,
          social_media: categoryKey === 'social_media' ? platformObjects : (prevFormData.channel_mix[existingChannelMixIndex].social_media || []),
          display_networks: categoryKey === 'display_networks' ? platformObjects : (prevFormData.channel_mix[existingChannelMixIndex].display_networks || []),
          search_engines: categoryKey === 'search_engines' ? platformObjects : (prevFormData.channel_mix[existingChannelMixIndex].search_engines || [])
        };
      } else {
        // Add new funnel stage with all categories initialized
        updatedChannelMix.push({
          funnel_stage: stageName,
          social_media: categoryKey === 'social_media' ? platformObjects : [],
          display_networks: categoryKey === 'display_networks' ? platformObjects : [],
          search_engines: categoryKey === 'search_engines' ? platformObjects : []
        });
      }

      return {
        ...prevFormData,
        channel_mix: updatedChannelMix
      };
    });
  };

  // Check if a stage has at least one platform selected
  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    return Object.values(stageSelections).some(
      categorySelection => Array.isArray(categorySelection) && categorySelection.length > 0
    );
  };

  // Mark a stage as validated
  const handleValidate = (stageName) => {
    if (isStageValid(stageName)) {
      const updatedValidatedStages = {
        ...validatedStages,
        [stageName]: true
      };

      setValidatedStages(updatedValidatedStages);

      // Update validatedStages in the campaign context
      setCampaignFormData(prev => ({
        ...prev,
        validatedStages: updatedValidatedStages
      }));
    }
  };

  // Enable editing for a specific stage
  const handleEdit = (stageName) => {
    const updatedValidatedStages = {
      ...validatedStages,
      [stageName]: false
    };

    setValidatedStages(updatedValidatedStages);

    // Update validatedStages in the campaign context
    setCampaignFormData(prev => ({
      ...prev,
      validatedStages: updatedValidatedStages
    }));
  };

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          t1={"Which platforms would you like to activate for each funnel stage?"}
          t2={"Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time."}
          span={1}
        />
      </div>

      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = funnelStages.find(s => s.name === stageName);
          if (!stage) return null;

          return (
            <div key={index}>
              {/* Stage Header */}
              <div
                className={`flex justify-between items-center p-6 gap-3 max-w-[950px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                  ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
                onClick={() => toggleItem(stage.name)}
              >
                <div className="flex items-center gap-2">
                  <Image src={stage.icon} alt={stage.name} />
                  <p className="w-[119px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                {/* Stage Status Display */}
                {validatedStages[stage.name] ? (
                  <div className="flex items-center gap-2">
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark}
                      alt="Completed"
                    />
                    <p className="text-green-500 font-semibold">Completed</p>
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
                  <Image src={openItems[stage.name] ? up : down2} alt={openItems[stage.name] ? "up" : "down"} />
                </div>
              </div>

              {/* Stage Content */}
              {openItems[stage.name] && (
                <div className="card_bucket_container_main_sub flex flex-col pb-6 max-w-[950px] min-h-[300px]">
                  {validatedStages[stage.name] ? (
                    // Validated Stage View
                    <div className="mt-8 px-6">
                      {Object.entries(selected[stage.name] || {}).map(
                        ([category, platformNames]) => {
                          if (!Array.isArray(platformNames) || platformNames.length === 0)
                            return null;
                          return (
                            <div key={category} className="mb-8">
                              <h2 className="mb-4 font-bold text-lg">{category}</h2>
                              <div className="card_bucket_container flex flex-wrap gap-6">
                                {platformNames.map((platformName, idx) => {
                                  const platformData = stage.platforms[category].find(
                                    p => p.name === platformName
                                  );
                                  if (!platformData) return null;
                                  return (
                                    <div
                                      key={idx}
                                      className="flex flex-row justify-between items-center px-4 py-2 gap-4 w-[230px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Image src={platformData.icon} alt={platformData.name} />
                                        <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                          {platformData.name}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      )}
                      <div className="flex justify-end pr-[24px] mt-4">
                        <button
                          onClick={() => handleEdit(stage.name)}
                          className="flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] bg-blue-500"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Editing Stage View
                    <>
                      {Object.entries(stage.platforms).map(([category, platforms]) => (
                        <div key={category} className="card_bucket_container_main">
                          <h2 className="font-bold">{category}</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {platforms.map((platform, pIndex) => {
                              const isSelected = selected[stage.name]?.[category]?.includes(platform.name);
                              return (
                                <div
                                  key={pIndex}
                                  className={`cursor-pointer flex flex-row justify-between items-center p-4 gap-2 w-[230px] h-[62px] bg-white 
                                  border rounded-[10px] ${isSelected
                                      ? "border-[#3175FF]"
                                      : "border-[rgba(0,0,0,0.1)]"
                                    }`}
                                  onClick={() => togglePlatform(stage.name, category, platform.name)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Image src={platform.icon} alt={platform.name} />
                                    <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                      {platform.name}
                                    </p>
                                  </div>
                                  <div
                                    className={`w-[20px] h-[20px] rounded-full flex items-center justify-center ${isSelected
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
                      ))}

                      <div className="flex justify-end pr-[24px] mt-4">
                        <button
                          disabled={!isStageValid(stage.name)}
                          onClick={() => handleValidate(stage.name)}
                          className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${isStageValid(stage.name)
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
  );
};

export default SelectChannelMix;