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
import { funnelStages, getPlatformIcon } from "../../../components/data";
import axios from "axios";
import { FaSpinner } from "react-icons/fa";
import customicon from "../../../public/social/customicon.png";

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
  const [statuses, setStatuses] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const savedOptions = localStorage.getItem("selectedOptions");
    return savedOptions ? JSON.parse(savedOptions) : {};
  });
  const [isEditable, setIsEditable] = useState({});
  const [previousSelectedOptions, setPreviousSelectedOptions] = useState({});
  const [selectedNetworks, setSelectedNetworks] = useState({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
    Loyalty: new Set(),
  });
  const [validatedPlatforms, setValidatedPlatforms] = useState(() => {
    const savedPlatforms = localStorage.getItem("validatedPlatforms");
    return savedPlatforms
      ? JSON.parse(savedPlatforms, (key, value) =>
        value.dataType === "Set" ? new Set(value.value) : value
      )
      : {
        Awareness: new Set(),
        Consideration: new Set(),
        Conversion: new Set(),
        Loyalty: new Set(),
      };
  });
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [showInput, setShowInput] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    campaignFormData,
    setCampaignFormData,
    buyObj,
    buyType,
    setBuyObj,
    setBuyType,
  } = useCampaigns();

  // Initialize statuses and sync selectedNetworks
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      // Clear previous localStorage statuses to avoid conflicts
      localStorage.removeItem("funnelStageStatuses");

      // Initialize all stages as "Not Started"
      const initialStatuses = {};
      campaignFormData.funnel_stages.forEach((stage) => {
        initialStatuses[stage] = "Not Started";
      });
      setStatuses(initialStatuses);
      localStorage.setItem(
        "funnelStageStatuses",
        JSON.stringify(initialStatuses)
      );

      // Sync selectedNetworks with channel_mix
      const channelMix = Array.isArray(campaignFormData?.channel_mix)
        ? campaignFormData.channel_mix
        : [];
      const updatedNetworks = channelMix.reduce((acc, ch) => {
        const platformsWithFormats = [
          ...(ch?.social_media?.map((sm) => sm?.platform_name) || []),
          ...(ch?.display_networks?.map((dn) => dn?.platform_name) || []),
          ...(ch?.search_engines?.map((se) => se?.platform_name) || []),
          ...(ch?.streaming?.map((st) => st?.platform_name) || []),
          ...(ch?.mobile?.map((mb) => mb?.platform_name) || []),
          ...(ch?.messaging?.map((ms) => ms?.platform_name) || []),
          ...(ch?.in_game?.map((ig) => ig?.platform_name) || []),
          ...(ch?.e_commerce?.map((ec) => ec?.platform_name) || []),
          ...(ch?.broadcast?.map((bc) => bc?.platform_name) || []),
          ...(ch?.print?.map((pr) => pr?.platform_name) || []),
          ...(ch?.ooh?.map((oh) => oh?.platform_name) || []),
        ];
        acc[ch.funnel_stage] = new Set(platformsWithFormats);
        return acc;
      }, {});
      setSelectedNetworks((prev) => ({ ...prev, ...updatedNetworks }));
    }
  }, [campaignFormData?.funnel_stages, campaignFormData?.channel_mix]);

  // Update statuses based on selectedOptions and validatedPlatforms
  // useEffect(() => {
  //   if (campaignFormData?.funnel_stages) {
  //     const updatedStatuses = {};
  //     campaignFormData.funnel_stages.forEach((stageName) => {
  //       if (validatedPlatforms[stageName]?.size > 0) {
  //         updatedStatuses[stageName] = "Completed";
  //       } else if (hasCompleteSelection(stageName)) {
  //         updatedStatuses[stageName] = "In Progress";
  //       } else {
  //         updatedStatuses[stageName] = "Not Started";
  //       }
  //     });
  //     setStatuses(updatedStatuses);
  //     localStorage.setItem(
  //       "funnelStageStatuses",
  //       JSON.stringify(updatedStatuses)
  //     );
  //   }
  // }, [selectedOptions, validatedPlatforms, campaignFormData?.funnel_stages]);

  // // Persist selectedOptions to localStorage
  // useEffect(() => {
  //   localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions));
  // }, [selectedOptions]);

  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const updatedStatuses = {};

      campaignFormData.funnel_stages.forEach((stageName) => {
        const hasValidated = validatedPlatforms[stageName]?.size > 0;
        const hasSelected = hasCompleteSelection(stageName); // Your function for checking selections

        if (hasValidated) {
          updatedStatuses[stageName] = "Completed";
        } else if (hasSelected) {
          updatedStatuses[stageName] = "In Progress";
        } else {
          updatedStatuses[stageName] = "Not Started";
        }
      });

      setStatuses(updatedStatuses);
      localStorage.setItem(
        "funnelStageStatuses",
        JSON.stringify(updatedStatuses)
      );
    }
  }, [selectedOptions, validatedPlatforms, campaignFormData?.funnel_stages]);


  // Persist validatedPlatforms to localStorage
  useEffect(() => {
    const serializedPlatforms = JSON.stringify(
      validatedPlatforms,
      (key, value) =>
        value instanceof Set
          ? { dataType: "Set", value: Array.from(value) }
          : value
    );
    localStorage.setItem("validatedPlatforms", serializedPlatforms);
  }, [validatedPlatforms]);

  // Sync selectedOptions with campaignFormData only on initial load if not already set
  useEffect(() => {
    const initialSelectedOptions = {};
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    channelMix.forEach((stage) => {
      const stageName = stage.funnel_stage;
      ["social_media", "display_networks", "search_engines", "streaming", "ooh", "print", "in_game", "e_commerce", "broadcast", "messaging", "mobile"].forEach(
        (category) => {
          const platforms = Array.isArray(stage[category])
            ? stage[category]
            : [];
          platforms.forEach((platform) => {

            const platformName = platform.platform_name;
            const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`;
            const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`;
            if (platform.buy_type && !selectedOptions[buyTypeKey]) {
              initialSelectedOptions[buyTypeKey] = platform.buy_type;
            }
            if (
              platform.objective_type &&
              !selectedOptions[buyObjectiveKey]
            ) {
              initialSelectedOptions[buyObjectiveKey] =
                platform.objective_type;
            }

          });
        }
      );
    });
    setSelectedOptions((prev) => ({ ...prev, ...initialSelectedOptions }));
  }, [campaignFormData?.channel_mix]);

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => (prev === key ? "" : key));
  };

  const handleSelectOption = (
    platformName,
    option,
    category,
    stageName,
    dropDownName
  ) => {
    const key = `${stageName}-${category}-${platformName}-${dropDownName}`;
    setSelectedOptions((prev) => ({ ...prev, [key]: option }));

    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const updatedChannelMix = channelMix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        const normalizedCategory = category.toLowerCase().replace(" ", "_");
        updatedStage[normalizedCategory] = (
          stage[normalizedCategory] || []
        ).map((platform) => {
          if (platform.platform_name === platformName) {
            return { ...platform, [dropDownName]: option };
          }
          return platform;
        });
        return updatedStage;
      }
      return stage;
    });

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));
    setDropdownOpen("");
    setOpenItems((prev) => ({ ...prev, [stageName]: true }));
  };

  const handleValidate = (stageName) => {
    // Prevent duplicate validation
    if (statuses[stageName] === "Completed") return;

    setStatuses((prev) => {
      const newStatuses = { ...prev, [stageName]: "Completed" };
      localStorage.setItem("funnelStageStatuses", JSON.stringify(newStatuses));
      return newStatuses;
    });
    setIsEditable((prev) => ({ ...prev, [stageName]: true }));

    const validatedPlatformsSet = new Set();
    Array.from(selectedNetworks[stageName] || []).forEach((platformName) => {
      if (
        hasCompletePlatformSelection(platformName, "social_media", stageName) ||
        hasCompletePlatformSelection(
          platformName,
          "display_networks",
          stageName
        ) ||
        hasCompletePlatformSelection(platformName, "search_engines", stageName)
      ) {
        validatedPlatformsSet.add(platformName);
      }
    });

    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: validatedPlatformsSet,
    }));
    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: { ...prev.validatedStages, [stageName]: true },
    }));
    setPreviousSelectedOptions(selectedOptions);

    if (navigator.vibrate) navigator.vibrate(300);
  };

  const hasCompletePlatformSelection = (platformName, category, stageName) => {
    const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`;
    const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`;
    return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey];
  };

  const hasCompleteSelection = (stageName) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0)
      return false;
    return Array.from(selectedNetworks[stageName]).some(
      (platformName) =>
        hasCompletePlatformSelection(platformName, "social_media", stageName) ||
        hasCompletePlatformSelection(
          platformName,
          "display_networks",
          stageName
        ) ||
        hasCompletePlatformSelection(platformName, "search_engines", stageName)
    );
  };



  const renderCompletedPlatform = (platformName, category, stageName) => {
    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_");
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const platformData = channelMix
      .find((ch) => ch.funnel_stage === stageName)
      ?.[normalizedCategory]?.find((p) => p.platform_name === platformName);

    if (!validatedPlatforms[stageName]?.has(platformName) || !platformData)
      return null;

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
    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix
      : [];
    const platformsInCategory =
      channelMix
        .find((ch) => ch.funnel_stage === stageName)
        ?.[category]?.filter((p) => p.format?.length > 0)
        .map((p) => p.platform_name) || [];
    return platformsInCategory.some((platform) =>
      validatedPlatforms[stageName]?.has(platform)
    );
  };

  const handleSaveCustomValue = async (field) => {
    const endpoint = field === "obj" ? "/buy-objectives" : "/buy-types";
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`,
        { data: { text: customValue } },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      if (field === "obj") {
        setBuyObj((prev) => [...prev, data]);
      } else {
        setBuyType((prev) => [...prev, data]);
      }
      setCustomValue("");
      setShowInput("");
    } catch (error) {
      console.error("Error saving custom value:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      <Toaster position="top-right" reverseOrder={false} />
      {campaignFormData?.funnel_stages?.map((stageName) => {
        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s?.name === stageName
        );
        const funn = funnelStages?.find((ff) => ff?.name === stageName);
        if (!stage) return null;
        return (
          <div key={stageName} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 max-w-[950px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
    rounded-t-[10px] ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                {funn?.icon ? (
                  <Image src={funn.icon} className="size-5" alt={stage.name} />
                ) : (
                  <Image src={customicon} className="size-5" alt={stage.name} />
                )}
                <p className="font-semibold text-[#061237] whitespace-nowrap">
                  {stage.name}
                </p>
              </div>
              <div
                id={`status-${stageName}`} // Added unique id based on stageName
                className="flex items-center gap-2"
              >
                {statuses[stageName] === "Completed" ? (
                  <>
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark}
                      alt="Completed"
                    />
                    <p className="text-green-500 font-semibold text-base">Completed</p>
                  </>
                ) : statuses[stageName] === "In Progress" ? (
                  <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">
                    In Progress
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
                    {[
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
                    ]
                      .filter((category) =>
                        hasValidatedPlatformsForCategory(category, stage.name)
                      )
                      .map((category) => (
                        <div key={category} className="w-full">
                          <h3 className="text-xl font-semibold text-[#061237] mb-6 capitalize">
                            {category?.replace("_", " ")}
                          </h3>
                          <div className="flex flex-wrap gap-8">
                            {Array.from(selectedNetworks[stage.name] || []).map(
                              (platform) =>
                                renderCompletedPlatform(
                                  platform,
                                  category,
                                  stage.name
                                )
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  [
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
                  ].map((category) => {
                    const normalizedCategory = category
                      .toLowerCase()
                      .replaceAll(" ", "_");
                    const platforms = Array.isArray(
                      campaignFormData?.channel_mix
                    )
                      ? campaignFormData.channel_mix
                        .find((ch) => ch.funnel_stage === stageName)
                      ?.[normalizedCategory] || []
                      : [];
                    if (platforms.length === 0) return null;

                    return (
                      <div
                        key={category}
                        className="w-full md:flex flex-col items-start gap-6 md:w-4/5"
                      >
                        <h3 className="text-xl font-semibold text-[#061237] capitalize">
                          {category?.replace("_", " ")}
                        </h3>
                        <div className="flex flex-col gap-8">
                          {platforms.map((platform) => {
                            const platformKey = `${stage.name}-${category}-${platform.platform_name}`;
                            const selectedObj =
                              selectedOptions[
                              `${stageName}-${category}-${platform.platform_name}-objective_type`
                              ];
                            const selectedBuy =
                              selectedOptions[
                              `${stageName}-${category}-${platform.platform_name}-buy_type`
                              ];

                            return (
                              <div
                                key={platformKey}
                                className="flex items-center gap-8"
                              >
                                <div className="w-[180px]">
                                  <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit min-w-[150px]">
                                    {getPlatformIcon(platform.platform_name) ? (
                                      <Image
                                        src={getPlatformIcon(
                                          platform.platform_name
                                        )}
                                        className="size-4"
                                        alt={platform.platform_name}
                                      />
                                    ) : null}
                                    <p className="text-base font-medium text-[#061237] capitalize">
                                      {platform.platform_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="relative min-w-[200px]">
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
                                  {dropdownOpen === platformKey + "obj" && (
                                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                      <ul>
                                        {buyObj?.map((option, i) => (
                                          <li
                                            key={`${platformKey}-objective-${i}`}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() =>
                                              handleSelectOption(
                                                platform.platform_name,
                                                option?.text,
                                                category,
                                                stage.name,
                                                "objective_type"
                                              )
                                            }
                                          >
                                            {option?.text}
                                          </li>
                                        ))}
                                        {showInput !==
                                          `${platformKey}+custom` ? (
                                          <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() =>
                                              setShowInput(
                                                `${platformKey}+custom`
                                              )
                                            }
                                          >
                                            Add Custom
                                          </li>
                                        ) : (
                                          <div className="w-[90%] mx-auto mb-2">
                                            <input
                                              className="w-full p-2 border rounded-[5px] outline-none"
                                              value={customValue}
                                              onChange={(e) =>
                                                setCustomValue(e.target.value)
                                              }
                                            />
                                            <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                                              <button
                                                className="w-full p-[5px] border rounded-[5px]"
                                                onClick={() => setShowInput("")}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                                                onClick={() =>
                                                  handleSaveCustomValue("obj")
                                                }
                                                disabled={loading}
                                              >
                                                {loading ? (
                                                  <FaSpinner className="animate-spin" />
                                                ) : (
                                                  "Save"
                                                )}
                                              </button>
                                            </div>
                                          </div>
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
                                  {dropdownOpen === platformKey && (
                                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                      <ul>
                                        {buyType.map((option, i) => (
                                          <li
                                            key={`${platformKey}-type-${i}`}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() =>
                                              handleSelectOption(
                                                platform.platform_name,
                                                option?.text,
                                                category,
                                                stage.name,
                                                "buy_type"
                                              )
                                            }
                                          >
                                            {option?.text}
                                          </li>
                                        ))}
                                        {showInput !==
                                          `${platformKey}+custom+buy` ? (
                                          <li
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() =>
                                              setShowInput(
                                                `${platformKey}+custom+buy`
                                              )
                                            }
                                          >
                                            Add Custom
                                          </li>
                                        ) : (
                                          <div className="w-[90%] mx-auto mb-2">
                                            <input
                                              className="w-full p-2 border rounded-[5px] outline-none"
                                              value={customValue}
                                              onChange={(e) =>
                                                setCustomValue(e.target.value)
                                              }
                                            />
                                            <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                                              <button
                                                className="w-full p-[5px] border rounded-[5px]"
                                                onClick={() => setShowInput("")}
                                              >
                                                Cancel
                                              </button>
                                              <button
                                                className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                                                onClick={() =>
                                                  handleSaveCustomValue("buy")
                                                }
                                                disabled={loading}
                                              >
                                                {loading ? (
                                                  <FaSpinner className="animate-spin" />
                                                ) : (
                                                  "Save"
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
                {statuses[stageName] !== "Completed" && (
                  <div className="flex justify-end mt-6 w-full">
                    <Button
                      text="Validate"
                      variant="primary"
                      onClick={() => handleValidate(stageName)}
                      disabled={!hasCompleteSelection(stageName)}
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
                        setStatuses((prev) => {
                          const newStatuses = {
                            ...prev,
                            [stageName]: hasCompleteSelection(stageName)
                              ? "In Progress"
                              : "Not Started",
                          };
                          localStorage.setItem(
                            "funnelStageStatuses",
                            JSON.stringify(newStatuses)
                          );
                          return newStatuses;
                        });
                        setValidatedPlatforms((prev) => ({
                          ...prev,
                          [stageName]: new Set(),
                        }));
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
