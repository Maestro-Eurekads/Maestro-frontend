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
import SaveProgressButton from "app/utils/SaveProgressButton";
import { useActive } from "app/utils/ActiveContext";

// Simple Toast Component
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
      {message}
    </div>
  );
};

// Utility functions for localStorage with campaign-specific scoping
const loadStateFromLocalStorage = (
  key: string,
  defaultValue: any,
  cId: string
) => {
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

const saveStateToLocalStorage = (key: string, state: any, cId: string) => {
  if (typeof window === "undefined") return;
  const storageKey = cId ? `${cId}_${key}` : key;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (e) {
    console.error(`Error saving ${storageKey} to localStorage:`, e);
  }
};

const ONLINE_TYPES = [
  "social_media",
  "display_networks",
  "search_engines",
  "streaming",
  "mobile",
  "messaging",
  "in_game",
  "e_commerce",
];
const OFFLINE_TYPES = ["broadcast", "print", "ooh"];

const getChannelTypeLabel = (type) => {
  if (ONLINE_TYPES.includes(type)) return "online";
  if (OFFLINE_TYPES.includes(type)) return "offline";
  return "channel";
};

const SelectChannelMix = ({ selectedStage }: { selectedStage?: string }) => {
  const { setChange } = useActive()
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
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const [isDataReady, setIsDataReady] = useState(false);
  const [showMoreMap, setShowMoreMap] = useState({});
  const [toast, setToast] = useState(null);
  // Per-stage search terms
  const [searchTerms, setSearchTerms] = useState({});
  const ITEMS_TO_SHOW = 6;

  // Fallback metadata for Targeting/Retargeting
  const fallbackFunnelMetadata = {
    Targeting: { name: "Targeting" },
    Retargeting: { name: "Retargeting" },
  };

  // Debug data on mount
  useEffect(() => { }, [platformList, campaignFormData, cId]);

  // Ensure component is mounted and data is ready
  useEffect(() => {
    setIsMounted(true);
    if (
      campaignFormData?.funnel_stages?.length > 0 &&
      Object.keys(platformList).length > 0
    ) {
      setIsDataReady(true);
    } else {
      // console.warn("SelectChannelMix - Data not ready:", {
      //   funnel_stages: campaignFormData?.funnel_stages,
      //   platformList: Object.keys(platformList),
      // });
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

  // Initialize states from localStorage
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

  // Sync state to localStorage
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
          // Only "Not started" or "" (no "In progress")
          updatedStatuses[stageName] = hasSelections
            ? ""
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

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [stage]: !prev[stage],
    }));
  };

  const togglePlatform = async (
    stageName: string,
    category: string,
    platformName: string,
    type: string
  ) => {
    setSelected((prevSelected) => {
      const stageSelection = prevSelected[stageName] || {};
      const categorySelection = stageSelection[category] || [];
      const isAlreadySelected = categorySelection.includes(platformName);

      // If deselecting, check if this is the last selected platform in the stage
      if (isAlreadySelected) {
        const newCategorySelection = categorySelection.filter(
          (p) => p !== platformName
        );
        const updatedStageSelection = {
          ...stageSelection,
          [category]: newCategorySelection,
        };
        // Count total selected platforms in the stage
        const totalSelected = Object.values(updatedStageSelection).reduce(
          (count: number, arr: unknown[]) =>
            count + (Array.isArray(arr) ? arr.length : 0),
          0
        );

        if (totalSelected === 0) {
          // Show toast and prevent deselection
          setToast("At least one channel must be selected for each stage.");
          return prevSelected; // No state change
        }
      }

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

      // Compute new stage status
      const hasSelections = Object.values(updatedStageSelection).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
      // Only "Not started" or "" (no "In progress")
      setStageStatuses((prev) => ({
        ...prev,
        [stageName]: hasSelections ? "" : "Not started",
      }));

      return updatedSelected;
    });

    const updatedFormData = await setCampaignFormData((prevFormData: any) => {
      const categoryKey = category.toLowerCase().replaceAll(" ", "_");
      const stageSelection = selected[stageName] || {};
      const categorySelection = stageSelection[category] || [];
      const isAlreadySelected = categorySelection.includes(platformName);

      // Skip update if deselection was blocked
      if (
        isAlreadySelected &&
        Object.values({
          ...stageSelection,
          [category]: categorySelection.filter((p) => p !== platformName),
        }).reduce(
          (count: number, arr: unknown) =>
            count + (Array.isArray(arr) ? arr.length : 0),
          0
        ) === 0
      ) {
        return prevFormData;
      }

      const newCategorySelection = isAlreadySelected
        ? categorySelection.filter((p) => p !== platformName)
        : [...categorySelection, platformName];

      const platformObjects = newCategorySelection.map((name) => {
        const existingPlatform = prevFormData.channel_mix
          ?.find((item) => item.funnel_stage === stageName)
          ?.[categoryKey]?.find((platform) => platform.platform_name === name);

        return existingPlatform || {
          platform_name: name,
          campaign_start_date: campaignFormData?.campaign_timeline_start_date === "" ? null : campaignFormData?.campaign_timeline_start_date || null,
          campaign_end_date: campaignFormData?.campaign_timeline_end_date === "" ? null : campaignFormData?.campaign_timeline_end_date || null,
        };
      });

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
          [categoryKey]: platformObjects
        });
      }

      return {
        ...prevFormData,
        channel_mix: updatedChannelMix,
      };
    });

    // Sync with server if form data was updated
    if (
      cId &&
      updatedFormData !== campaignFormData // Only update if form data changed
    ) {
      await updateCampaign({
        ...removeKeysRecursively(campaignData, [
          "id",
          "documentId",
          "createdAt",
          "publishedAt",
          "updatedAt",
          "_aggregated",
        ]),
        channel_mix: removeKeysRecursively(updatedFormData.channel_mix, [
          "id",
          "isValidated",
          "formatValidated",
          "validatedStages",
          "_aggregated",
        ]),
      });
    }
  };

  const handlePlatformClick = (
    e: React.MouseEvent,
    stageName: string,
    category: string,
    platformName: string,
    type: string
  ) => {
    setChange(true)
    e.stopPropagation();
    togglePlatform(stageName, category, platformName, type);
  };

  const toggleShowMore = (channelKey: string) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const toggleChannelType = (
    e: React.MouseEvent,
    stageName: string,
    type: string
  ) => {
    e.stopPropagation();
    setOpenChannelTypes((prev) => ({
      ...prev,
      [`${stageName}-${type}`]: !prev[`${stageName}-${type}`],
    }));
  };

  // Filter platforms based on search term (now per-stage)
  const filterPlatforms = (platforms, stageName) => {
    const term = searchTerms[stageName] || "";
    if (!term) return platforms;
    return platforms.filter((platform) =>
      platform.platform_name.toLowerCase().includes(term.toLowerCase())
    );
  };

  // Get all selected platforms for a stage, grouped by online/offline type
  // This version ensures only platforms that are actually in the correct type are shown
  // --- Lazada deduplication fix applied here ---
  const getSelectedPlatformsByType = (stageName) => {
    const stageSelection = selected[stageName] || {};
    const selectedByType = {};
    Object.entries(platformList).forEach(([type, channels]) => {
      // Use a Set to deduplicate platforms for each type
      const platformSet = new Set();
      Object.entries(channels).forEach(([channelName, platforms]) => {
        const normalizedChannelName = channelName
          .replace(/[\s-]/g, "")
          .toLowerCase();
        const selectedPlatforms = stageSelection[normalizedChannelName] || [];
        // Only include platforms that are actually in this channel's platform list
        const validPlatformNames = platforms.map((p) => p.platform_name);
        selectedPlatforms.forEach((platformName) => {
          if (validPlatformNames.includes(platformName)) {
            platformSet.add(platformName);
          }
        });
      });
      selectedByType[type] = Array.from(platformSet);
    });
    return selectedByType;
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

  // --- Funnel List Order Fix ---
  let orderedFunnelStages = [];
  if (
    Array.isArray(campaignFormData?.custom_funnels) &&
    campaignFormData.custom_funnels.length > 0
  ) {
    orderedFunnelStages = campaignFormData.custom_funnels
      .map((f) => f.name)
      .filter((name) => campaignFormData.funnel_stages.includes(name));
  } else if (Array.isArray(funnelStages) && funnelStages.length > 0) {
    orderedFunnelStages = funnelStages
      .map((f) => f.name)
      .filter((name) => campaignFormData.funnel_stages.includes(name));
  }
  if (Array.isArray(campaignFormData?.funnel_stages)) {
    campaignFormData.funnel_stages.forEach((name) => {
      if (!orderedFunnelStages.includes(name)) {
        orderedFunnelStages.push(name);
      }
    });
  }

  // --- Recap component for a stage ---
  const StageRecap = ({ selectedByType }) => {
    // Only show if there are any selections
    const hasAny = Object.values(selectedByType).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasAny) return null;
    return (
      <div className="flex flex-wrap gap-4 p-4 bg-[#F5F8FF] border border-[rgba(49,117,255,0.08)] rounded-b-[10px]">
        {Object.entries(selectedByType).map(([type, platforms]) =>
          Array.isArray(platforms) && platforms.length > 0 ? (
            <div key={type} className="flex flex-col min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold capitalize text-[15px]">
                  {type.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">
                  {/* Only one word: "channel" or "channels" */}(
                  {platforms.length}{" "}
                  {platforms.length === 1 ? "channel" : "channels"} selected)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 ${ONLINE_TYPES.includes(type)
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                      } rounded-full px-3 py-1`}
                  >
                    {getPlatformIcon(platform) && (
                      <Image
                        src={getPlatformIcon(platform)}
                        alt={platform}
                        width={16}
                        height={16}
                      />
                    )}
                    <span className="text-sm">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    );
  };

  // --- New: Per-stage selected channels recap, shown under search bar ---
  const StageSelectedChannels = ({ selectedByType }) => {
    // Only show if there are any selections
    const hasAny = Object.values(selectedByType).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );
    if (!hasAny) return null;
    return (
      <div className="flex flex-wrap gap-4 p-4 bg-[#F5F8FF] border border-[rgba(49,117,255,0.08)] rounded-[10px] mb-6">
        {Object.entries(selectedByType).map(([type, platforms]) =>
          Array.isArray(platforms) && platforms.length > 0 ? (
            <div key={type} className="flex flex-col min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold capitalize text-[15px]">
                  {type.replace("_", " ")}
                </span>
                <span className="text-xs text-gray-500">
                  ({platforms.length} {platforms.length === 1 ? "channel" : "channels"} selected)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 ${ONLINE_TYPES.includes(type)
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                      } rounded-full px-3 py-1`}
                  >
                    {getPlatformIcon(platform) && (
                      <Image
                        src={getPlatformIcon(platform)}
                        alt={platform}
                        width={16}
                        height={16}
                      />
                    )}
                    <span className="text-sm">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="flex items-center justify-between w-full">
        <PageHeaderWrapper
          t1="Which platforms would you like to activate for each funnel stage?"
          t2="Choose the platforms for each stage to ensure your campaign reaches the right audience at the right time."
          span={1}
        />
        {/* <SaveProgressButton setIsOpen={undefined} /> */}
      </div>


      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {(orderedFunnelStages.length > 0
          ? selectedStage
            ? orderedFunnelStages.filter(
              (stageName) => stageName === selectedStage
            )
            : orderedFunnelStages
          : campaignFormData.funnel_stages
        ).map((stageName, index) => {
          const stageFromFunnelStages = funnelStages?.find(
            (f) => f.name === stageName
          );
          const stageFromCustomFunnels = campaignFormData?.custom_funnels?.find(
            (s) => s.name === stageName
          );
          const stage =
            stageFromCustomFunnels ||
            stageFromFunnelStages ||
            fallbackFunnelMetadata[stageName];

          if (!stage) {
            // console.warn(`Stage metadata not found for: ${stageName}`);
            return (
              <div key={index}>
                Stage "{stageName}" not found. Please check configuration.
              </div>
            );
          }

          // For recap at the channel type level
          const selectedByType = getSelectedPlatformsByType(stage.name);

          return (
            <div key={index} className={`${selectedStage ? "max-h-[500px] overflow-y-scroll" : ""}`}>
              <div
                className={`flex flex-col p-6 gap-3 w-full bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                  ${openItems[stage.name]
                    ? "rounded-t-[10px]"
                    : "rounded-[10px]"
                  }`}
              >
                <div
                  className="flex items-center"
                  onClick={() => toggleItem(stage.name)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {stage.icon && (
                      <Image
                        src={stage.icon}
                        alt={`${stage.name} icon`}
                        width={20}
                        height={20}
                      />
                    )}
                    <p
                      className="w-full font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237] break-words whitespace-normal"
                      style={{
                        maxWidth: "100%",
                        minHeight: "24px",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {stage.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-center flex-1">
                    <p
                      className={`font-general-sans font-semibold text-[16px] leading-[22px] ${stageStatuses[stage.name] === "Not started"
                        ? "text-[#061237] opacity-50"
                        : "text-[#3175FF]"
                        }`}
                    >
                      {stageStatuses[stage.name] || ""}
                    </p>
                  </div>
                  <div className="flex items-center justify-end flex-1">
                    <Image
                      src={openItems[stage.name] ? up : down2}
                      alt={openItems[stage.name] ? "up" : "down"}
                      width={24}
                      height={24}
                    />
                  </div>
                </div>

                {/* Recap for collapsed stage */}
                {!openItems[stage.name] && (
                  <StageRecap selectedByType={selectedByType} />
                )}

                {/* Per-stage search input and selected channels recap */}
                {openItems[stage.name] && (
                  <div className="mt-4 mb-6">
                    <input
                      type="text"
                      placeholder={`Search channels for ${stage.name}...`}
                      value={searchTerms[stage.name] || ""}
                      onChange={(e) =>
                        setSearchTerms((prev) => ({
                          ...prev,
                          [stage.name]: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Show selected channels recap right under the search bar */}
                    <StageSelectedChannels selectedByType={selectedByType} />
                  </div>
                )}
              </div>

              {openItems[stage.name] && (
                <div className="card_bucket_container_main_sub flex flex-col pb-6 w-full min-h-[300px]">
                  {Object.entries(platformList).map(([type, channels]) => {
                    // Recap row for closed channel type accordions
                    const isChannelTypeOpen =
                      openChannelTypes[`${stage.name}-${type}`];
                    const selectedPlatformsForType =
                      getSelectedPlatformsByType(stage.name)[type] || [];
                    return (
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
                            {type.replace("_", " ")} Channels
                          </h2>
                          <Image
                            src={isChannelTypeOpen ? up : down2}
                            alt={isChannelTypeOpen ? "up" : "down"}
                            width={24}
                            height={24}
                          />
                        </div>
                        {/* Recap row for selected platforms at channel type level when closed */}
                        {!isChannelTypeOpen &&
                          selectedPlatformsForType.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedPlatformsForType.map((platform, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-1 ${ONLINE_TYPES.includes(type)
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                    } rounded-full px-3 py-1`}
                                >
                                  {getPlatformIcon(platform) && (
                                    <Image
                                      src={getPlatformIcon(platform)}
                                      alt={platform}
                                      width={16}
                                      height={16}
                                    />
                                  )}
                                  <span className="text-sm">{platform}</span>
                                </div>
                              ))}
                              <span className="ml-2 text-xs text-gray-500">
                                {/* Only one word: "channel" or "channels" */}
                                {selectedPlatformsForType.length}{" "}
                                {selectedPlatformsForType.length === 1
                                  ? "channel"
                                  : "channels"}{" "}
                                selected
                              </span>
                            </div>
                          )}
                        {isChannelTypeOpen && (
                          <>
                            {Object.entries(channels).length === 0 ? (
                              <p>No channels available for {type}</p>
                            ) : (
                              Object.entries(channels).map(
                                ([channelName, platforms]) => {
                                  // Deduplicate platforms by platform_name for this channel
                                  const seenNames = new Set();
                                  const dedupedPlatforms = [];
                                  for (const p of platforms) {
                                    if (!seenNames.has(p.platform_name)) {
                                      seenNames.add(p.platform_name);
                                      dedupedPlatforms.push(p);
                                    }
                                  }
                                  const filteredPlatforms = filterPlatforms(
                                    dedupedPlatforms,
                                    stage.name
                                  );
                                  return filteredPlatforms?.length > 0 ? (
                                    <div key={channelName} className="mb-6">
                                      <p className="capitalize font-semibold mb-4">
                                        {channelName.replace("_", " ")}
                                      </p>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {filteredPlatforms
                                          .slice(
                                            0,
                                            showMoreMap[
                                              `${stage.name}-${channelName}`
                                            ]
                                              ? filteredPlatforms.length
                                              : ITEMS_TO_SHOW
                                          )
                                          .map((platform, pIndex) => {
                                            const normalizedChannelName =
                                              channelName
                                                .replace(/[\s-]/g, "")
                                                .toLowerCase();
                                            const isSelected = selected[
                                              stage.name
                                            ]?.[
                                              normalizedChannelName
                                            ]?.includes(platform.platform_name);
                                            return (
                                              <div
                                                key={pIndex}
                                                className={`cursor-pointer flex flex-row justify-between items-center p-4 gap-2 w-[250px] min-h-[62px] bg-white 
                                    border rounded-[10px] ${isSelected
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
                                                      alt={
                                                        platform.platform_name
                                                      }
                                                      width={20}
                                                      height={20}
                                                    />
                                                  ) : null}
                                                  <p className="min-h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                                    {platform.platform_name}
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
                                      {filteredPlatforms.length >
                                        ITEMS_TO_SHOW && (
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
                                  ) : null;
                                }
                              )
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SelectChannelMix;
