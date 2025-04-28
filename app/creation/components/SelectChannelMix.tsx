"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import up from "../../../public/arrow-down.svg";
import down2 from "../../../public/arrow-down-2.svg";
import checkmark from "../../../public/mingcute_check-fill.svg";
import zoom from "../../../public/tabler_zoom-filled.svg";
import credit from "../../../public/mdi_credit-card.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages, getPlatformIcon } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";
import { removeKeysRecursively } from "utils/removeID";
import { SVGLoader } from "components/SVGLoader";
import { useComments } from "app/utils/CommentProvider";

// Utility functions for localStorage with campaign-specific scoping
const loadStateFromLocalStorage = (key, defaultValue, cId) => {
  if (typeof window === "undefined") return defaultValue;
  const storageKey = cId ? `${cId}_${key}` : key;
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
    cId,
  } = useCampaigns();

  const [isMounted, setIsMounted] = useState(false);
  const [openItems, setOpenItems] = useState({});
  const [selected, setSelected] = useState({});
  const [stageStatuses, setStageStatuses] = useState({});
  const [showMoreMap, setShowMoreMap] = useState({});
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const [isDataReady, setIsDataReady] = useState(false);
  const ITEMS_TO_SHOW = 6;

  // Fallback metadata for Targeting/Retargeting, using same icons as MapFunnelStages
  const fallbackFunnelMetadata = {
    Targeting: { name: "Targeting", icon: zoom },
    Retargeting: { name: "Retargeting", icon: credit },
  };

  // Debug data on mount
  useEffect(() => {
    console.log("SelectChannelMix - platformList:", platformList);
    console.log("SelectChannelMix - campaignFormData:", campaignFormData);
    console.log("SelectChannelMix - cId:", cId);
  }, [platformList, campaignFormData, cId]);

  // Ensure component is mounted and data is ready
  useEffect(() => {
    setIsMounted(true);
    if (
      campaignFormData?.funnel_stages?.length > 0 &&
      Object.keys(platformList).length > 0
    ) {
      setIsDataReady(true);
    } else {
      console.warn("SelectChannelMix - Data not ready:", {
        funnel_stages: campaignFormData?.funnel_stages,
        platformList: Object.keys(platformList),
      });
    }
  }, [campaignFormData, platformList]);

  // Close drawer on mount
  useEffect(() => {
    if (isMounted) {
      setIsDrawerOpen(false);
      setClose(false);
    }
  }, [isMounted, setIsDrawerOpen, setClose]);

  // Reset localStorage on cId change
  useEffect(() => {
    if (isMounted && cId) {
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("openItems") ||
          key.includes("selected") ||
          key.includes("stageStatuses") ||
          key.includes("showMoreMap") ||
          key.includes("openChannelTypes")
        ) {
          if (!key.startsWith(`${cId}_`)) {
            localStorage.removeItem(key);
          }
        }
      });
    }
  }, [cId, isMounted]);

  // Initialize states from localStorage based on cId
  useEffect(() => {
    if (isMounted) {
      setOpenItems(loadStateFromLocalStorage("openItems", {}, cId));
      setSelected(loadStateFromLocalStorage("selected", {}, cId));
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
      setSelected({});
      setStageStatuses({});
    }
  }, [campaignFormData?.channel_mix, isMounted, cId]);

  // Set initial openItems
  useEffect(() => {
    if (isMounted && campaignFormData?.funnel_stages?.length > 0) {
      const initialOpenItems = campaignFormData.funnel_stages.reduce(
        (acc, stage) => {
          acc[stage] = true;
          return acc;
        },
        {}
      );
      setOpenItems((prev) => ({ ...prev, ...initialOpenItems }));
    }
  }, [campaignFormData?.funnel_stages, isMounted]);

  // Update stage statuses based on selections
  useEffect(() => {
    if (isMounted && campaignFormData?.funnel_stages?.length > 0) {
      setStageStatuses((prev) => {
        const updatedStatuses = { ...prev };
        campaignFormData.funnel_stages.forEach((stageName) => {
          const currentStageSelections = selected[stageName] || {};
          const hasSelections = Object.values(currentStageSelections).some(
            (arr) => Array.isArray(arr) && arr.length > 0
          );
          updatedStatuses[stageName] = hasSelections
            ? "In progress"
            : "Not started";
        });
        return updatedStatuses;
      });
    }
  }, [selected, campaignFormData?.funnel_stages, isMounted]);

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

      const updatedSelected = {
        ...prevSelected,
        [stageName]: updatedStageSelection,
      };

      // Compute new stage status immediately
      const hasSelections = Object.values(updatedStageSelection).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
      setStageStatuses((prev) => ({
        ...prev,
        [stageName]: hasSelections ? "In progress" : "Not started",
      }));

      return updatedSelected;
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

  // Early return if not mounted or data not ready
  if (!isMounted || !isDataReady) {
    return <div>Loading channels...</div>;
  }

  // Fallback for empty funnel stages or platformList
  if (!campaignFormData?.funnel_stages?.length) {
    return (
      <div>
        No funnel stages selected. Please select stages in the previous step.
      </div>
    );
  }
  if (!Object.keys(platformList).length) {
    return <div>No platforms available. Please contact support.</div>;
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
        {campaignFormData.funnel_stages.map((stageName, index) => {
          // Find stage metadata: prioritize funnelStages, then custom_funnels, then fallback
          const stageFromFunnelStages = funnelStages?.find(
            (f) => f.name === stageName
          );
          const stageFromCustomFunnels = campaignFormData?.custom_funnels?.find(
            (s) => s.name === stageName
          );
          const stage =
            stageFromFunnelStages ||
            stageFromCustomFunnels ||
            fallbackFunnelMetadata[stageName];

          if (!stage) {
            console.warn(`Stage metadata not found for: ${stageName}`);
            return (
              <div key={index}>
                Stage "{stageName}" not found. Please check configuration.
              </div>
            );
          }

          // Use stage.icon if available, else fallback to custom icon from funnelStages or custom_funnels
          const icon =
            stage.icon ||
            stageFromFunnelStages?.icon ||
            stageFromCustomFunnels?.icon ||
            "/placeholder.svg";

          return (
            <div key={index}>
              <div
                className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                  ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
                onClick={() => toggleItem(stage.name)}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={icon}
                    alt={stage.name}
                    width={20}
                    height={20}
                  />
                  <p className="w-full max-w-[1500px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                <p
                  className={`font-general-sans font-semibold text-[16px] leading-[22px] ${
                    stageStatuses[stage.name] === "In progress"
                      ? "text-[#3175FF]"
                      : "text-[#061237] opacity-50"
                  }`}
                >
                  {stageStatuses[stage.name] || "Not started"}
                </p>
                <div>
                  <Image
                    src={openItems[stage.name] ? up : down2}
                    alt={openItems[stage.name] ? "up" : "down"}
                  />
                </div>
              </div>

              {openItems[stage.name] && (
                <div className="card_bucket_container_main_sub flex flex-col pb-6 w-full min-h-[300px]">
                  {Object.entries(platformList).map(([type, channels]) => (
                    <div key={type} className="card_bucket_container_main p-6">
                      <div
                        className="flex justify-between items-center cursor-pointer rounded-md mb-4"
                        onClick={(e) => toggleChannelType(e, stage.name, type)}
                      >
                        <h2 className="font-bold capitalize text-[18px]">
                          {type.replace("_", " ")} Channels
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
                      {openChannelTypes[`${stage.name}-${type}`] && (
                        <>
                          {Object.entries(channels).length === 0 ? (
                            <p>No channels available for {type}</p>
                          ) : (
                            Object.entries(channels).map(
                              ([channelName, platforms]) =>
                                platforms?.length > 0 ? (
                                  <div key={channelName} className="mb-6">
                                    <p className="capitalize font-semibold mb-4">
                                      {channelName.replace("_", " ")}
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
                                          const normalizedChannelName =
                                            channelName
                                              .replace(" ", "")
                                              .replace("-", "")
                                              .toLowerCase();
                                          const isSelected =
                                            selected[stage.name]?.[
                                              normalizedChannelName
                                            ]?.includes(platform.platform_name);
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
                                                  normalizedChannelName,
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
                                        })
                                      }
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
                            )
                          )}
                        </>
                      )}
                    </div>
                  ))}
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
