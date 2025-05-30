"use client";
import { useEffect, useState } from "react";
import FunnelStage from "../../app/creation/components/SelectChannelMix";
import { funnelStages, getPlatformIcon, platformStyles } from "../data";
import Image from "next/image";
import up from "../../public/arrow-down.svg";
import down2 from "../../public/arrow-down-2.svg";
import checkmark from "../../public/mingcute_check-fill.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import customicon from "../../public/social/customicon.png";
import Modal from "./Modal";
import AdSetsFlow from "../../app/creation/components/common/AdSetsFlow";

const AddNewChennelsModel = ({ isOpen, setIsOpen, selectedStage }) => {
  const [openItems, setOpenItems] = useState({ Awareness: true });
  const [selected, setSelected] = useState({});
  const [validatedStages, setValidatedStages] = useState({});
  const { campaignFormData, setCampaignFormData, platformList, campaignData } =
    useCampaigns();
  const [openChannelTypes, setOpenChannelTypes] = useState({});
  const [showMoreMap, setShowMoreMap] = useState({});
  const [stageStatuses, setStageStatuses] = useState({});
  const ITEMS_TO_SHOW = 6;
  const [newlySelected, setNewlySelected] = useState([])
  const [openAdset, setOpenAdset] = useState(false);

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
    }

    if (campaignFormData?.validatedStages) {
      setValidatedStages(campaignFormData.validatedStages);
    }

    // Ensure Awareness has an empty initial selection if not present
    if (!selected["Awareness"]) {
      setSelected((prev) => ({
        ...prev,
        Awareness: {
          "Social media": [],
          "Display networks": [],
          "Search engines": [],
        },
      }));
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
      const platformObjects = newCategorySelection.map((name) => {
        const existingPlatform = prevFormData.channel_mix
          ?.find((item) => item.funnel_stage === stageName)?.[categoryKey]
          ?.find((platform) => platform.platform_name === name);

        return existingPlatform || { platform_name: name };
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
          [categoryKey]: platformObjects,
        });
      }

      return {
        ...prevFormData,
        channel_mix: updatedChannelMix,
      };
    });

    // Track newly added platforms
    setNewlySelected((prevNewlySelected) => {
      const originalPlatforms =
        campaignData.channel_mix
          ?.find((item) => item.funnel_stage === stageName)?.[
          category.toLowerCase().replaceAll(" ", "_")
        ]?.map((platform) => platform.platform_name) || [];

      const isNewlyAdded = !originalPlatforms.includes(platformName);

      if (isNewlyAdded) {
        return [...prevNewlySelected, { stageName, category, platformName }];
      }

      return prevNewlySelected.filter(
        (item) =>
          !(
            item.stageName === stageName &&
            item.category === category &&
            item.platformName === platformName
          )
      );
    });

    // Sync with server
  };
  const toggleChannelType = (e, stageName, type) => {
    e.stopPropagation();
    setOpenChannelTypes((prev) => ({
      ...prev,
      [`${stageName}-${type}`]: !prev[`${stageName}-${type}`],
    }));
  };

  const isStageValid = (stageName) => {
    const stageSelections = selected[stageName] || {};
    const hasSocialMedia = stageSelections["Social media"]?.length > 0;
    const hasDisplayNetworks = stageSelections["Display networks"]?.length > 0;
    const hasSearchEngines = stageSelections["Search engines"]?.length > 0;

    return hasSocialMedia || hasDisplayNetworks || hasSearchEngines;
  };

  const toggleShowMore = (channelKey) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [channelKey]: !prev[channelKey],
    }));
  };

  const handleValidate = (stageName) => {
    if (isStageValid(stageName)) {
      setValidatedStages((prev) => ({
        ...prev,
        [stageName]: true,
      }));
    }
  };

  const handlePlatformClick = (e, stageName, category, platformName, type) => {
    e.stopPropagation();
    togglePlatform(stageName, category, platformName, type);
  };

  return (
    <div className="relative z-[70]">
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 w-full z-[70]">
          <div className="flex flex-col items-start p-6 gap-6 bg-white rounded-[10px] w-[65%]">
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
            <div className="card bg-base-100 overflow-y-auto max-h-[60vh] w-full">
              <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
                {campaignFormData.funnel_stages
                  .filter((st) => st === selectedStage)
                  .map((stageName, index) => {
                    const stage = campaignFormData?.custom_funnels?.find(
                      (s) => s.name === selectedStage
                    );
                    const funn = funnelStages?.find(
                      (f) => f.name === stageName
                    );
                    if (!stage) return null;

                    return (
                      <div key={index}>
                        <div
                          className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                  ${openItems[stage.name]
                              ? "rounded-t-[10px]"
                              : "rounded-[10px]"
                            }`}
                          onClick={() => toggleItem(stage.name)}
                        >
                          <div className="flex items-center gap-2">
                            {funn?.icon ? (
                              <Image
                                src={funn.icon}
                                alt={stage.name}
                                width={20}
                                height={20}
                              />
                            ) : (
                              <Image
                                src={customicon}
                                alt={stage.name}
                                width={20}
                                height={20}
                              />
                            )}
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
                            {Object.entries(platformList).map(
                              ([type, channels]) => (
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
                                        openChannelTypes[
                                          `${stage.name}-${type}`
                                        ]
                                          ? up
                                          : down2
                                      }
                                      alt={
                                        openChannelTypes[
                                          `${stage.name}-${type}`
                                        ]
                                          ? "up"
                                          : "down"
                                      }
                                      width={24}
                                      height={24}
                                    />
                                  </div>

                                  <>
                                    {Object.entries(channels).length === 0 ? (
                                      <p>No channels available for {type}</p>
                                    ) : (
                                      Object.entries(channels).map(
                                        ([channelName, platforms]) =>
                                          platforms?.length > 0 ? (
                                            <div
                                              key={channelName}
                                              className="mb-6"
                                            >
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
                                                    ]?.[
                                                      channelName
                                                        ?.replace(" ", "")
                                                        ?.replace("-", "")
                                                        ?.toLowerCase()
                                                    ]?.includes(
                                                      platform.platform_name
                                                    );
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
                                                                ) ||
                                                                "/placeholder.svg"
                                                              }
                                                              alt={
                                                                platform.platform_name
                                                              }
                                                              width={20}
                                                              height={20}
                                                            />
                                                          ) : null}
                                                          <p className="min-h-[22px] font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237]">
                                                            {
                                                              platform.platform_name
                                                            }
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
                                              {platforms.length >
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
                                          ) : null
                                      )
                                    )}
                                  </>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="w-fit ml-auto">
              <button className="w-fit bg-blue-500 text-white rounded-md p-2 text-[16px]" onClick={() => setOpenAdset(true)}>
                Configure Adset and Audiences
              </button>
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={openAdset} onClose={() => setOpenAdset(false)}>
        <div className="bg-white w-[900px] p-2 rounded-lg">
          <button
            className="flex justify-end w-fit ml-auto"
            onClick={() => setOpenAdset(false)}
          >
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
          <AdSetsFlow
            stageName={selectedStage}
            // onEditStart={() => resetInteraction(stage.name)}
            platformName={newlySelected?.map((nn) => nn?.platformName)}
            modalOpen={openAdset}
          />
          <div className="w-fit ml-auto">
            <button
              className="bg-blue-500 text-white rounded-md p-2"
              onClick={() => setOpenAdset(false)}
            >
              Confirm Changes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddNewChennelsModel;