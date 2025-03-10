"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";

const SelectChannelMix = () => {
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState({});
  const [validatedStages, setValidatedStages] = useState({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

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
  }, [campaignFormData?.funnel_stages]);

  const togglePlatform = (
    stageName: string,
    category: string,
    platformName: string
  ) => {
    if (validatedStages[stageName]) return;

    const prev = { ...selected };

    const stageSelection = prev[stageName] || {};
    const categorySelection = stageSelection[category] || [];
    const isAlreadySelected = categorySelection.includes(platformName);

    const newCategorySelection = isAlreadySelected
      ? categorySelection.filter((p) => p !== platformName)
      : [...categorySelection, platformName];
    setSelected((prev) => {
      return {
        ...prev,
        [stageName]: {
          ...stageSelection,
          [category]: newCategorySelection,
        },
      };
    });
    setCampaignFormData((prev1: any) => {
      const updatedCategorySelection = isAlreadySelected
        ? categorySelection.filter((p) => p !== platformName)
        : [...categorySelection, platformName];
      return {
        ...prev1,
        channel_mix: {
          ...prev1.channel_mix,
          [stageName]: {
            ...prev1.channel_mix[stageName],
            funnel_stage: stageName,
            [category.toLowerCase().replaceAll(" ", "_")]: updatedCategorySelection.map(
              (cat: any) => ({
                platform_name: cat,
              })
            ),
          },
        },
      };
    });
  };

  const isStageValid = (stageName: string) => {
    const stageSelections = selected[stageName] || {};
    const hasAtLeastOneSelection = Object.values(stageSelections).some(
      (categorySelection) =>
        Array.isArray(categorySelection) && categorySelection.length > 0
    );
    return hasAtLeastOneSelection;
  };

  const handleValidate = (stageName: string) => {
    if (isStageValid(stageName)) {
      setValidatedStages((prev) => ({
        ...prev,
        [stageName]: true,
      }));
    }
  };

  const handleEdit = (stageName) => {
    setValidatedStages((prev) => ({
      ...prev,
      [stageName]: false,
    }));
  };

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          t1={
            "Which platforms would you like to activate for each funnel stage?"
          }
          t2={
            "Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time."
          }
          span={1}
        />
        {isEditing ? (
          ""
        ) : (
          <button
            className="model_button_blue"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {campaignFormData?.funnel_stages.map((stageName, index) => {
          const stage = funnelStages.find((s) => s.name === stageName);
          if (!stage) return null;

          return (
            <div key={index}>
              <div
                className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
          ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
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
                  {openItems[stage.name] ? (
                    <Image src={up} alt="up" />
                  ) : (
                    <Image src={down2} alt="down" />
                  )}
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
                            return null; // Skip if no platforms selected
                          return (
                            <div key={category} className="mb-8">
                              <h2 className="mb-4 font-bold text-lg">
                                {category}
                              </h2>
                              <div className="card_bucket_container flex flex-wrap gap-6">
                                {platformNames.map((platformName, idx) => {
                                  const platformData = stage.platforms[
                                    category
                                  ].find((p) => p.name === platformName);
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
                                const isSelected = selected[stage.name]?.[
                                  category
                                ]?.includes(platform.name);
                                return (
                                  <div
                                    key={pIndex}
                                    className={`${
                                      isEditing
                                        ? "cursor-pointer"
                                        : "cursor-not-allowed"
                                    } 
          flex flex-row justify-between items-center p-4 gap-2 w-[230px] h-[62px] bg-white 
          border rounded-[10px] ${
            isSelected ? "border-[#3175FF]" : "border-[rgba(0,0,0,0.1)]"
          }`}
                                    onClick={() => {
                                      if (isEditing) {
                                        togglePlatform(
                                          stage.name,
                                          category,
                                          platform.name
                                        );
                                      }
                                    }}
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
                          onClick={() => {
                            handleValidate(stage.name), setIsEditing(false);
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
  );
};

export default SelectChannelMix;
