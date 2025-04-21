"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages, getPlatformIcon } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { SVGLoader } from "components/SVGLoader";
import { useComments } from "app/utils/CommentProvider";

// Utility functions for localStorage with campaign-specific scoping
const loadStateFromLocalStorage = (key, defaultValue, cId) => {
  if (typeof window === "undefined") return defaultValue;
  const storageKey = cId ? `${cId}_${key}` : key; // Scope by campaign ID if present
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${storageKey} from localStorage:`, e);
    return defaultValue;
  }
};

const saveStateToLocalStorage = (key, state, cId) => {
  if (typeof window === "undefined") return;
  const storageKey = cId ? `${cId}_${key}` : key;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.error(`Error saving ${storageKey} to localStorage:`, e);
  }
};

const SelectChannelMix = () => {
  const { setIsDrawerOpen, setClose } = useComments();
  const {
    campaignFormData,
    setCampaignFormData,
    platformList = {},
    campaignData,
    updateCampaign,
    getActiveCampaign,
    cId, // Campaign ID from context
  } = useCampaigns();

  const [isMounted, setIsMounted] = useState(false);
  const [openItems, setOpenItems] = useState({});
  const [selected, setSelected] = useState({});
  const [validatedStages, setValidatedStages] = useState({});
  const [stageStatuses, setStageStatuses] = useState({});
  const [showMoreMap, setShowMoreMap] = useState({});
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const ITEMS_TO_SHOW = 6;

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close drawer on mount
  useEffect(() => {
    if (isMounted) {
      setIsDrawerOpen(false);
      setClose(false);
    }
  }, [isMounted, setIsDrawerOpen, setClose]);

  // Initialize states from localStorage based on cId
  useEffect(() => {
    if (isMounted) {
      setOpenItems(loadStateFromLocalStorage("openItems", {}, cId));
      setSelected(loadStateFromLocalStorage("selected", {}, cId));
      setValidatedStages(loadStateFromLocalStorage("validatedStages", {}, cId));
      setStageStatuses(loadStateFromLocalStorage("stageStatuses", {}, cId));
      setShowMoreMap(loadStateFromLocalStorage("showMoreMap", {}, cId));
      setOpenChannelTypes(
        loadStateFromLocalStorage("openChannelTypes", {}, cId)
      );
    }
  }, [isMounted, cId]);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) saveStateToLocalStorage("openItems", openItems, cId);
  }, [openItems, isMounted, cId]);

  useEffect(() => {
    if (isMounted) saveStateToLocalStorage("selected", selected, cId);
  }, [selected, isMounted, cId]);

  useEffect(() => {
    if (isMounted)
      saveStateToLocalStorage("validatedStages", validatedStages, cId);
  }, [validatedStages, isMounted, cId]);

  useEffect(() => {
    if (isMounted) saveStateToLocalStorage("stageStatuses", stageStatuses, cId);
  }, [stageStatuses, isMounted, cId]);

  useEffect(() => {
    if (isMounted) saveStateToLocalStorage("showMoreMap", showMoreMap, cId);
  }, [showMoreMap, isMounted, cId]);

  useEffect(() => {
    if (isMounted)
      saveStateToLocalStorage("openChannelTypes", openChannelTypes, cId);
  }, [openChannelTypes, isMounted, cId]);

  // Initialize selected state based on campaignFormData.channel_mix
  useEffect(() => {
    if (isMounted && campaignFormData?.channel_mix?.length > 0) {
      const initialSelected = {};
      campaignFormData.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        if (!initialSelected[stageName]) {
          initialSelected[stageName] = {};
        }
        const channelTypes = [
          "social_media",
          "display_networks",
          "search_engines",
          "streaming",
          "mobile",
          "messaging",
          "in_game",
          "e_commerce",
          "broadcast",
          "print",
          "ooh",
        ];

        channelTypes.forEach((channel) => {
          if (!initialSelected[stageName][channel]) {
            initialSelected[stageName][channel] = [];
          }
          const ch = stage[channel];
          if (Array.isArray(ch)) {
            ch.forEach((platform) => {
              if (platform?.platform_name) {
                initialSelected[stageName][channel].push(
                  platform.platform_name
                );
              }
            });
          }
        });
      });
      setSelected(initialSelected);
    } else if (isMounted && !cId) {
      // Reset selected for new campaigns (no cId)
      setSelected({});
      setValidatedStages({});
      setStageStatuses({});
    }
  }, [campaignFormData?.channel_mix, isMounted, cId]);

  // Set initial openItems and validatedStages
  useEffect(() => {
    if (isMounted && campaignFormData?.funnel_stages?.length > 0) {
      const initialOpenItems = campaignFormData.funnel_stages.reduce(
        (acc, stage) => {
          acc[stage] = validatedStages[stage] ? false : true;
          return acc;
        },
        {}
      );
      setOpenItems((prev) => ({ ...prev, ...initialOpenItems }));

      if (campaignFormData?.validatedStages) {
        setValidatedStages((prev) => ({
          ...prev,
          ...campaignFormData.validatedStages,
        }));
      }
    }
  }, [
    campaignFormData?.funnel_stages,
    campaignFormData?.validatedStages,
    isMounted,
  ]);

  // Update stage statuses based on selections and validation
  useEffect(() => {
    if (isMounted && campaignFormData?.funnel_stages?.length > 0) {
      const updatedStatuses = {};
      campaignFormData.funnel_stages.forEach((stageName) => {
        const currentStageSelections = selected[stageName] || {};
        const hasSelections = Object.values(currentStageSelections).some(
          (arr) => Array.isArray(arr) && arr.length > 0
        );

        if (validatedStages[stageName]) {
          updatedStatuses[stageName] = "Completed";
        } else if (hasSelections) {
          updatedStatuses[stageName] = "In progress";
        } else {
          updatedStatuses[stageName] = "Not started";
        }
      });
      setStageStatuses((prev) => ({ ...prev, ...updatedStatuses }));
    }
  }, [selected, validatedStages, campaignFormData?.funnel_stages, isMounted]);

  // Initialize channel types to be open by default
  useEffect(() => {
    if (
      isMounted &&
      campaignFormData?.funnel_stages?.length > 0 &&
      Object.keys(platformList).length > 0
    ) {
      const initialOpenChannelTypes = {};
      campaignFormData.funnel_stages.forEach((stageName) => {
        Object.keys(platformList).forEach((type) => {
          initialOpenChannelTypes[`${stageName}-${type}`] = true;
        });
      });
      setOpenChannelTypes((prev) => ({ ...prev, ...initialOpenChannelTypes }));
    }
  }, [campaignFormData?.funnel_stages, platformList, isMounted]);

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const togglePlatform = async (stageName, category, platformName, type) => {
    setSelected((prevSelected) => {
      const stageSelection = prevSelected[stageName] || {};
      const categorySelection = stageSelection[category] || [];
      const isAlreadySelected = categorySelection.includes(platformName);

      const newCategorySelection = isAlreadySelected
        ? categorySelection.filter((p) => p !== platformName)
        : [...categorySelection, platformName];

      const updatedStageSelection = {
        ...stageSelection,
        [category]: newCategorySelection,
      };

      return {
        ...prevSelected,
        [stageName]: updatedStageSelection,
      };
    });

    const updatedFormData = await setCampaignFormData((prevFormData) => {
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

    // Sync with server
    if (cId) {
      await updateCampaign({
        ...removeKeysRecursively(campaignData, [
          "id",
          "documentId",
          "createdAt",
          "publishedAt",
          "updatedAt",
        ]),
        channel_mix: removeKeysRecursively(updatedFormData.channel_mix, [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
        ]),
      });
    }
  };

  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    return Object.values(stageSelections).some(
      (categorySelection) =>
        Array.isArray(categorySelection) && categorySelection.length > 0
    );
  };

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, [
        "id",
        "documentId",
        "createdAt",
        "publishedAt",
        "updatedAt",
      ])
    : {};

  const updateCampaignData = async (data) => {
    setLoading(true);
    try {
      await updateCampaign(data);
      await getActiveCampaign(cId);
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (stageName) => {
    await updateCampaignData({
      ...cleanData,
      channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, [
        "id",
        "isValidated",
        "formatValidated",
        "validatedStages",
      ]),
    }).then(() => {
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
        setCampaignFormData((prev) => ({
          ...prev,
          validatedStages: updatedValidatedStages,
        }));
      }
    });
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

  const handlePlatformClick = (e, stageName, category, platformName, type) => {
    e.stopPropagation();
    togglePlatform(stageName, category, platformName, type);
  };

  const toggleShowMore = (channelKey) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const toggleChannelType = (e, stageName, type) => {
    e.stopPropagation();
    setOpenChannelTypes((prev) => ({
      ...prev,
      [`${stageName}-${type}`]: !prev[`${stageName}-${type}`],
    }));
  };

  // Early return if not mounted or no campaign form data
  if (!isMounted || !campaignFormData?.funnel_stages?.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          t1="Which platforms would you like to activate for each funnel stage?"
          t2="Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time."
          span={1}
        />
      </div>

      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = campaignFormData?.custom_funnels?.find(
            (s) => s.name === stageName
          );
          const funn = funnelStages?.find((f) => f.name === stageName);
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
                  {funn?.icon && (
                    <Image
                      src={funn?.icon || "/placeholder.svg"}
                      alt={stage.name}
                      width={20}
                      height={20}
                    />
                  )}
                  <p className="w-full max-w-[1500px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237] text-">
                    {stage.name}
                  </p>
                </div>
                {stageStatuses[stage.name] === "Completed" ? (
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
                            (pn) => pn !== ""
                          );
                          if (validPlatformNames.length === 0) return null;

                          return (
                            <div key={category} className="mb-8">
                              <h2 className="mb-4 font-bold text-lg capitalize">
                                {category?.replace("_", " ")}
                              </h2>
                              <div className="card_bucket_container flex flex-wrap gap-6">
                                {validPlatformNames.map((platformName, idx) => (
                                  <div
                                    key={idx}
                                    className="flex flex-row justify-between items-center px-4 py-2 gap-4 w-[200px] h-[62px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px]"
                                  >
                                    <div className="flex items-center gap-3">
                                      {getPlatformIcon(platformName) ? (
                                        <Image
                                          src={
                                            getPlatformIcon(platformName) ||
                                            "/placeholder.svg"
                                          }
                                          alt={platformName}
                                          width={20}
                                          height={20}
                                        />
                                      ) : null}
                                      <p className="h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                        {platformName}
                                      </p>
                                    </div>
                                  </div>
                                ))}
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
                        <div
                          key={type}
                          className="card_bucket_container_main p-6"
                        >
                          <div
                            className="flex justify-between items-center cursor-pointer rounded-md mb-4"
                            onClick={(e) =>
                              toggleChannelType(e, stage.name, type)
                            }
                          >
                            <h2 className="font-bold capitalize text-[18px]">
                              {type} Channels
                            </h2>
                            <Image
                              src={
                                openChannelTypes[`${stage.name}-${type}`]
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
                                platforms?.length > 0 ? (
                                  <div key={channelName} className="mb-6">
                                    <p className="capitalize font-semibold mb-4">
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
                                          const isSelected = selected[
                                            stage.name
                                          ]?.[channelName]?.includes(
                                            platform.platform_name
                                          );
                                          return (
                                            <div
                                              key={pIndex}
                                              className={`cursor-pointer flex flex-row justify-between items-center p-4 gap-2 w-[250px] min-h-[62px] bg-white 
                                  border rounded-[10px] ${
                                    isSelected
                                      ? "border-[#3175FF]"
                                      : "border-[rgba(0,0,0,0.1)]"
                                  }`}
                                              onClick={(e) =>
                                                handlePlatformClick(
                                                  e,
                                                  stage.name,
                                                  channelName
                                                    ?.replace(" ", "")
                                                    ?.replace("-", "")
                                                    ?.toLowerCase(),
                                                  platform.platform_name,
                                                  type
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
                                                <p className="min-h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
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
                                ) : null
                            )}
                        </div>
                      ))}

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
                          {loading ? (
                            <SVGLoader
                              width="30px"
                              height="30px"
                              color="#FFF"
                            />
                          ) : (
                            "Validate"
                          )}
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
