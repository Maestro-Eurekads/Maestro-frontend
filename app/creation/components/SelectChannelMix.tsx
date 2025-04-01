"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages, getPlatformIcon } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";

const SelectChannelMix = () => {
  const [openItems, setOpenItems] = useState({});
  const [selected, setSelected] = useState({});
  const [validatedStages, setValidatedStages] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("validatedStages");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [stageStatuses, setStageStatuses] = useState({});
  const { campaignFormData, setCampaignFormData, platformList } =
    useCampaigns();

  const [showMoreMap, setShowMoreMap] = useState({});
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const ITEMS_TO_SHOW = 6;

  // Save validatedStages to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("validatedStages", JSON.stringify(validatedStages));
    }
  }, [validatedStages]);

  useEffect(() => {
    if (campaignFormData?.funnel_stages?.length > 0) {
      const initialOpenItems = campaignFormData.funnel_stages.reduce(
        (acc, stage) => {
          acc[stage] = validatedStages[stage] ? false : true;
          return acc;
        },
        {}
      );
      setOpenItems(initialOpenItems);
    }

    if (campaignFormData?.channel_mix?.length > 0) {
      const initialSelected = {};
      const initialStatuses = {};
      campaignFormData.channel_mix.forEach((channelMixItem) => {
        const stageName = channelMixItem.funnel_stage;
        initialSelected[stageName] = {
          "Social media": (channelMixItem?.social_media || [])
            .filter((sm) => sm?.platform_name)
            .map((sm) => sm.platform_name),
          "Display networks": (channelMixItem?.display_networks || [])
            .filter((dn) => dn?.platform_name)
            .map((dn) => dn.platform_name),
          "Search engines": (channelMixItem?.search_engines || [])
            .filter((se) => se?.platform_name)
            .map((se) => se.platform_name),
        };
        Object.keys(initialSelected[stageName]).forEach((category) => {
          if (initialSelected[stageName][category].length === 0) {
            delete initialSelected[stageName][category];
          }
        });

        // Set initial status based on selection
        if (
          Object.values(initialSelected[stageName] || {}).some(
            (arr) => Array.isArray(arr) && arr.length > 0
          )
        ) {
          initialStatuses[stageName] = validatedStages[stageName]
            ? "Completed"
            : "In progress";
        } else {
          initialStatuses[stageName] = "Not started";
        }
      });
      setSelected(initialSelected);
      setStageStatuses(initialStatuses);
    }

    if (campaignFormData?.validatedStages) {
      setValidatedStages((prevValidated) => ({
        ...prevValidated,
        ...campaignFormData.validatedStages,
      }));

      // Update statuses for validated stages
      if (campaignFormData?.funnel_stages?.length > 0) {
        const updatedStatuses = { ...stageStatuses };
        campaignFormData.funnel_stages.forEach((stage) => {
          if (campaignFormData.validatedStages[stage]) {
            updatedStatuses[stage] = "Completed";
          }
        });
        setStageStatuses(updatedStatuses);
      }
    }
  }, [
    campaignFormData?.funnel_stages,
    campaignFormData?.channel_mix,
    campaignFormData?.validatedStages,
  ]);

  // Initialize channel types to be open by default
  useEffect(() => {
    if (
      campaignFormData?.funnel_stages?.length > 0 &&
      Object.keys(platformList).length > 0
    ) {
      const initialOpenChannelTypes = {};
      campaignFormData.funnel_stages.forEach((stageName) => {
        Object.keys(platformList).forEach((type) => {
          initialOpenChannelTypes[`${stageName}-${type}`] = true;
        });
      });
      setOpenChannelTypes(initialOpenChannelTypes);
    }
  }, [campaignFormData?.funnel_stages, platformList]);

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const togglePlatform = (stageName, category, platformName) => {
    // console.log("🚀 ~ togglePlatform ~ category:", category)
    const prev ={...selected}
    const stageSelection = prev[stageName] || {};
    // console.log("stage", stageName, stageSelection)
    if (!stageSelection[category]) {
      stageSelection[category] = [];
    }
    const categorySelection = stageSelection[category] || [];
    console.log("🚀 ~ togglePlatform ~ categorySelection:", categorySelection);
    const isAlreadySelected = categorySelection.includes(platformName);

    const newCategorySelection = isAlreadySelected
      ? categorySelection.filter((p) => p !== platformName)
      : [...categorySelection, platformName];

    const newStageSelection = {
      ...stageSelection,
      [category]: newCategorySelection,
    };

    // Update status to "In progress" if any platform is selected
    const hasSelections = Object.values(newStageSelection).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );

    if (hasSelections && stageStatuses[stageName] !== "Completed") {
      setStageStatuses((prev) => ({
        ...prev,
        [stageName]: "In progress",
      }));
    } else if (!hasSelections) {
      setStageStatuses((prev) => ({
        ...prev,
        [stageName]: "Not started",
      }));
    }
    // setSelected((prev) => {

    //   return {
    //     ...prev,
    //     [stageName]: newStageSelection,
    //   };
    // });

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

      const updatedChannelMix = [...(prevFormData.channel_mix || [])];

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

  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    return Object.values(stageSelections).some(
      (categorySelection) =>
        Array.isArray(categorySelection) && categorySelection.length > 0
    );
  };

  const handleValidate = (stageName) => {
    if (isStageValid(stageName)) {
      const updatedValidatedStages = {
        ...validatedStages,
        [stageName]: true,
      };

      setValidatedStages(updatedValidatedStages);
      setStageStatuses((prev) => ({
        ...prev,
        [stageName]: "Completed",
      }));
      setOpenItems((prev) => ({
        ...prev,
        [stageName]: false,
      }));

      setCampaignFormData((prev) => {
        const updatedChannelMix = prev.channel_mix.map((mix) => {
          if (mix.funnel_stage === stageName) {
            const selectedPlatforms = selected[stageName] || {};
            return {
              ...mix,
              social_media:
                selectedPlatforms["Social media"]?.map((name) => ({
                  platform_name: name,
                })) || [],
              display_networks:
                selectedPlatforms["Display networks"]?.map((name) => ({
                  platform_name: name,
                })) || [],
              search_engines:
                selectedPlatforms["Search engines"]?.map((name) => ({
                  platform_name: name,
                })) || [],
            };
          }
          return mix;
        });

        return {
          ...prev,
          channel_mix: updatedChannelMix,
          validatedStages: updatedValidatedStages,
        };
      });
    }
  };

  const handleEdit = (stageName) => {
    const updatedValidatedStages = {
      ...validatedStages,
      [stageName]: false,
    };

    setValidatedStages(updatedValidatedStages);
    setStageStatuses((prev) => ({
      ...prev,
      [stageName]: "In progress",
    }));
    setOpenItems((prev) => ({
      ...prev,
      [stageName]: true,
    }));

    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: updatedValidatedStages,
    }));
  };

  const handlePlatformClick = (e, stageName, category, platformName) => {
    e.stopPropagation();
    togglePlatform(stageName, category, platformName);
  };

  const toggleShowMore = (channelKey) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const toggleChannelType = (e, stageName, type) => {
    e.stopPropagation(); // Prevent the stage from toggling
    setOpenChannelTypes((prev) => ({
      ...prev,
      [`${stageName}-${type}`]: !prev[`${stageName}-${type}`],
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
      </div>

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
                  <Image
                    src={stage.icon || "/placeholder.svg"}
                    alt={stage.name}
                    width={20}
                    height={20}
                  />
                  <p className="w-[119px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                {validatedStages[stage.name] ? (
                  <div className="flex items-center gap-2">
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark || "/placeholder.svg"}
                      alt="Completed"
                      width={20}
                      height={20}
                    />
                    <p className="text-green-500 font-semibold">Completed</p>
                  </div>
                ) : stageStatuses[stage.name] === "In progress" ? (
                  <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
                    In progress
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
                          const validPlatformNames = platformNames.filter(
                            (pn) =>
                              stage.platforms[category]?.some(
                                (p) => p.name === pn
                              )
                          );
                          if (validPlatformNames.length === 0) return null;

                          return (
                            <div key={category} className="mb-8">
                              <h2 className="mb-4 font-bold text-lg">
                                {category}
                              </h2>
                              <div className="card_bucket_container flex flex-wrap gap-6">
                                {validPlatformNames.map((platformName, idx) => {
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
                                          src={
                                            platformData.icon ||
                                            "/placeholder.svg"
                                          }
                                          alt={platformData.name}
                                          width={20}
                                          height={20}
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
                      {Object.keys(selected[stage.name] || {}).some(
                        (category) => selected[stage.name][category]?.length > 0
                      ) && (
                        <div className="flex justify-end pr-[24px] mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(stage.name);
                            }}
                            className="flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] bg-blue-500"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {Object.entries(platformList).map(([type, channels]) => (
                        <div key={type} className="card_bucket_container_main">
                          <div
                            className="flex justify-between items-center cursor-pointer rounded-md"
                            onClick={(e) =>
                              toggleChannelType(e, stage.name, type)
                            }
                          >
                            <h2 className="font-bold capitalize text-[18px]">
                              {type} Channels
                            </h2>
                            <Image
                              src={
                                openChannelTypes[
                                  `${stage.name || "/placeholder.svg"}-${type}`
                                ]
                                  ? up
                                  : down2
                              }
                              alt={
                                openChannelTypes[`${stage.name}-${type}`]
                                  ? "up"
                                  : "down"
                              }
                              width={24}
                              height={24}
                            />
                          </div>
                          {openChannelTypes[`${stage.name}-${type}`] &&
                            Object.entries(channels).map(
                              ([channelName, platforms]) =>
                                platforms?.length > 0 && (
                                  <div key={channelName}>
                                    <p className="capitalize font-semibold mb-2">
                                      {channelName?.replace("_", " ")}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                      {platforms
                                        .slice(
                                          0,
                                          showMoreMap[
                                            `${stage.name}-${channelName}`
                                          ]
                                            ? platforms.length
                                            : ITEMS_TO_SHOW
                                        )
                                        .map((platform, pIndex) => {
                                          const isSelected = false;
                                          return (
                                            <div
                                              key={pIndex}
                                              className={`cursor-pointer flex flex-row justify-between items-center p-4 gap-2 w-[300px] h-[62px] bg-white 
                                  border rounded-[10px] ${
                                    isSelected
                                      ? "border-[#3175FF]"
                                      : "border-[rgba(0,0,0,0.1)]"
                                  }`}
                                              onClick={(e) =>
                                                handlePlatformClick(
                                                  e,
                                                  stage.name,
                                                  channelName,
                                                  platform.name
                                                )
                                              }
                                            >
                                              <div className="flex items-center gap-2">
                                                {getPlatformIcon(
                                                  platform.platform_name
                                                ) ? (
                                                  <Image
                                                    src={
                                                      getPlatformIcon(
                                                        platform.platform_name
                                                      ) || "/placeholder.svg"
                                                    }
                                                    alt={platform.platform_name}
                                                    width={20}
                                                    height={20}
                                                  />
                                                ) : null}
                                                <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                                  {platform.platform_name}
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
                                                    src={
                                                      checkmark ||
                                                      "/placeholder.svg"
                                                    }
                                                    alt="selected"
                                                    className="w-3 h-3"
                                                    width={20}
                                                    height={20}
                                                  />
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                    {platforms.length > ITEMS_TO_SHOW && (
                                      <div className="flex justify-center mt-4">
                                        <button
                                          onClick={() =>
                                            toggleShowMore(
                                              `${stage.name}-${channelName}`
                                            )
                                          }
                                          className="text-blue-500 font-medium flex items-center gap-1"
                                        >
                                          {showMoreMap[
                                            `${stage.name}-${channelName}`
                                          ] ? (
                                            <>
                                              Show less
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <path d="m18 15-6-6-6 6" />
                                              </svg>
                                            </>
                                          ) : (
                                            <>
                                              Show more
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <path d="m6 9 6 6 6-6" />
                                              </svg>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                            )}
                          {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                                  onClick={(e) => handlePlatformClick(e, stage.name, category, platform.name)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Image src={platform.icon || "/placeholder.svg"} alt={platform.name} />
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
                                        src={checkmark || "/placeholder.svg"}
                                        alt="selected"
                                        className="w-3 h-3"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div> */}
                          {/* {category !== "Search engines" && (
                            <hr className="text-[#0000001A] px-4 w-full " />
                          )} */}
                        </div>
                      ))}

                      {/* <div className="flex justify-end pr-[24px] mt-4">
                        <button
                          disabled={!isStageValid(stage.name)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValidate(stage.name);
                          }}
                          className={`flex items-center justify-center px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${isStageValid(stage.name)
                            ? "bg-[#3175FF] hover:bg-[#2563eb]"
                            : "bg-[#3175FF] opacity-50 cursor-not-allowed"
                            }`}
                        >
                          Validate
                        </button>
                      </div> */}
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
