import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaCheck } from "react-icons/fa";
// import PageHeaderWrapper from "../../.components/PageHeaderWrapper"; // Adjust path
import { funnelStages } from "../../../components/data"; // Adjust path
import { useCampaigns } from "../../utils/CampaignsContext"; // Adjust path
import UploadModal from "../../../components/UploadModal/UploadModal"; // Adjust path

// Import SVG icons
import speaker from "../../../public/mdi_megaphone.svg";
import down from "../../../public/arrow-down-2.svg";
import up from "../../../public/arrow-down.svg";
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
import carousel from "../../../public/carousel.svg";
import video_format from "../../../public/video_format.svg";
import image_format from "../../../public/Image_format.svg";
import collection_format from "../../../public/collection_format.svg";
import slideshow_format from "../../../public/slideshow_format.svg";
import PageHeaderWrapper from "components/PageHeaderWapper";

// Types
type IPlatform = {
  name: string;
  icon: any;
  style?: string;
  mediaOptions?: any[];
  isExpanded?: boolean;
};

type IChannel = {
  title: string;
  platforms: IPlatform[];
  style?: string;
};

const FormatSelection = () => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [validatedStages, setValidatedStages] = useState<{ [key: string]: boolean }>({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // State for Platforms
  const [expandedPlatforms, setExpandedPlatforms] = useState<{ [key: string]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [channels, setChannels] = useState<IChannel[]>([]);

  // State for MediaSelection
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default media options
  const defaultMediaOptions = [
    { name: "Carousel", icon: carousel },
    { name: "Image", icon: image_format },
    { name: "Video", icon: video_format },
    { name: "Slideshow", icon: slideshow_format },
    { name: "Collection", icon: collection_format },
  ];

  // Platform icons mapping
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

  const getPlatformIcon = (platformName: string) => platformIcons[platformName] || google; // Fallback to google icon

  // Initialize openTabs and validatedStages
  useEffect(() => {
    if (!campaignFormData?.funnel_stages?.length) return;

    const initialOpenTabs = campaignFormData.funnel_stages.reduce((acc, stage) => {
      if (!validatedStages[stage]) acc.push(stage); // Open unvalidated stages by default
      return acc;
    }, [] as string[]);
    setOpenTabs(initialOpenTabs);

    if (campaignFormData?.validatedStages) {
      setValidatedStages(campaignFormData.validatedStages);
    }
  }, [campaignFormData?.funnel_stages, campaignFormData?.validatedStages]);

  // Transform channel data for Platforms
  useEffect(() => {
    if (!campaignFormData?.channel_mix?.length) return;

    campaignFormData.funnel_stages.forEach((stageName) => {
      const stage = campaignFormData.channel_mix.find((chan) => chan?.funnel_stage === stageName);
      if (stage) {
        const transformedData: IChannel[] = [
          {
            title: "Social Media",
            platforms: stage.social_media?.map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
            style: "max-w-[150px] w-full h-[52px]",
          },
          {
            title: "Display Networks",
            platforms: stage.display_networks?.map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
            style: "max-w-[200px] w-full",
          },
          {
            title: "Search Engines",
            platforms: stage.search_engines?.map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
            style: "max-w-[180px] w-full",
          },
        ].filter((channel) => channel.platforms.length > 0); // Only include channels with platforms
        setChannels(transformedData);
      }
    });
  }, [campaignFormData?.channel_mix]);

  // Toggle tab for each stage
  const toggleTab = (stageName: string) => {
    setOpenTabs((prevOpenTabs) =>
      prevOpenTabs.includes(stageName)
        ? prevOpenTabs.filter((tab) => tab !== stageName)
        : [...prevOpenTabs, stageName]
    );
  };

  // Get stage status
  const getStageStatus = (stageName: string) => {
    const stageData = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    if (validatedStages[stageName]) {
      return "Completed";
    } else if (
      stageData &&
      (stageData.social_media?.length > 0 ||
        stageData.display_networks?.length > 0 ||
        stageData.search_engines?.length > 0)
    ) {
      return "In Progress";
    }
    return "Not Started";
  };

  // Toggle platform expansion
  const togglePlatformExpansion = (platformName: string, stageName: string, isValidated: boolean) => {
    if (!isValidated) {
      setExpandedPlatforms((prev) => ({
        ...prev,
        [`${stageName}-${platformName}`]: !prev[`${stageName}-${platformName}`],
      }));
    }
  };

  // Handle format selection
  const handleFormatSelection = (
    channelName: string,
    index: number,
    platformName: string,
    stageName: string
  ) => {
    const copy = [...campaignFormData.channel_mix];
    const stageIndex = copy.findIndex((item) => item.funnel_stage === stageName);
    if (stageIndex === -1) return;

    const channelKey = channelName.toLowerCase().replace(" ", "_");
    const channel = copy[stageIndex][channelKey];
    const platformIndex = channel?.findIndex((item) => item?.platform_name === platformName);
    if (platformIndex === -1) return;

    const platform = channel[platformIndex];
    if (!platform.format) platform.format = [];

    const formatIndex = platform.format.findIndex(
      (f) => f.format_type === defaultMediaOptions[index].name
    );

    if (formatIndex !== -1) {
      platform.format.splice(formatIndex, 1);
    } else {
      platform.format.push({
        format_type: defaultMediaOptions[index].name,
        num_of_visuals: "1",
        previews: null,
      });
    }

    setCampaignFormData({ ...campaignFormData, channel_mix: copy });
  };

  // Handle quantity change
  const handleQuantityChange = (
    platformName: string,
    formatIndex: number,
    change: number,
    stageName: string
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [`${stageName}-${platformName}`]: {
        ...prev[`${stageName}-${platformName}`],
        [formatIndex]: Math.max(1, (prev[`${stageName}-${platformName}`]?.[formatIndex] || 1) + change),
      },
    }));

    const copy = [...campaignFormData.channel_mix];
    const stageIndex = copy.findIndex((item) => item.funnel_stage === stageName);
    if (stageIndex === -1) return;

    ["social_media", "display_networks", "search_engines"].forEach((channelType) => {
      const channel = copy[stageIndex][channelType];
      if (!channel) return;

      const platformIndex = channel.findIndex((item) => item.platform_name === platformName);
      if (platformIndex === -1) return;

      const platform = channel[platformIndex];
      if (!platform.format || platform.format.length <= formatIndex) return;

      const newQuantity = Math.max(
        1,
        parseInt(platform.format[formatIndex].num_of_visuals || "1") + change
      );
      platform.format[formatIndex].num_of_visuals = newQuantity.toString();
    });

    setCampaignFormData({ ...campaignFormData, channel_mix: copy });
  };

  // Check if platform has selected formats
  const hasPlatformSelectedFormats = (platformName: string, channelName: string, stageName: string) => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    const channel = stage?.[channelName.toLowerCase().replace(" ", "_")];
    const platform = channel?.find((pl) => pl?.platform_name === platformName);
    return platform?.format?.length > 0;
  };

  // Check if stage is valid for validation
  const isStageValid = (stageName: string) => {
    const stageData = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    return (
      stageData &&
      (stageData.social_media?.some((p) => p.format?.length > 0) ||
        stageData.display_networks?.some((p) => p.format?.length > 0) ||
        stageData.search_engines?.some((p) => p.format?.length > 0))
    );
  };

  // Handle validation
  const handleValidate = (stageName: string) => {
    if (isStageValid(stageName)) {
      const updatedValidatedStages = { ...validatedStages, [stageName]: true };
      setValidatedStages(updatedValidatedStages);
      setOpenTabs((prev) => [...prev.filter((tab) => tab !== stageName), stageName]); // Keep stage open
      setCampaignFormData((prev) => ({
        ...prev,
        validatedStages: updatedValidatedStages,
      }));
    }
  };

  // Handle editing
  const handleEdit = (stageName: string) => {
    const updatedValidatedStages = { ...validatedStages, [stageName]: false };
    setValidatedStages(updatedValidatedStages);
    setOpenTabs((prev) => [...prev, stageName]); // Ensure stage is open
    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: updatedValidatedStages,
    }));
  };

  // Modal controls
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Fallback if no data
  if (!campaignFormData?.funnel_stages?.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-gray-600">
          No funnel stages available. Please set up your campaign first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeaderWrapper
        t1="Select Formats for Each Channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel."
      />
      <div className="mt-8 flex flex-col gap-6">
        {campaignFormData.funnel_stages.map((stageName, index) => {
          const stage = funnelStages.find((s) => s.name === stageName);
          if (!stage) return null;

          const status = getStageStatus(stageName);
          const isValidated = validatedStages[stageName];

          return (
            <div key={index} className="max-w-[950px]">
              <div
                className={`flex justify-between items-center p-6 gap-3 bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] ${
                  openTabs.includes(stage.name) ? "rounded-t-[10px]" : "rounded-[10px]"
                }`}
                onClick={() => toggleTab(stage.name)}
              >
                <div className="flex items-center gap-2">
                  <Image src={stage.icon} alt={stage.name} width={24} height={24} />
                  <p className="font-[General Sans] font-semibold text-[18px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                <p
                  className={`font-[General Sans] font-semibold text-[16px] ${
                    status === "Completed"
                      ? "text-green-500"
                      : status === "In Progress"
                      ? "text-[#3175FF]"
                      : "text-[#061237] opacity-50"
                  }`}
                >
                  {status}
                </p>
                <Image
                  src={openTabs.includes(stage.name) ? up : down}
                  alt={openTabs.includes(stage.name) ? "up" : "down"}
                  width={16}
                  height={16}
                />
              </div>
              {openTabs.includes(stage.name) && (
                <div className="flex flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
                  <div className="text-[16px] w-full">
                    {channels.map((channel, channelIndex) => (
                      <React.Fragment key={channelIndex}>
                        <h3 className="font-semibold my-6">{channel.title}</h3>
                        <div className="flex flex-col gap-6">
                          {channel.platforms.map((platform, platformIndex) => {
                            const hasSelectedFormats = hasPlatformSelectedFormats(
                              platform.name,
                              channel.title,
                              stageName
                            );
                            const isExpanded = expandedPlatforms[`${stageName}-${platform.name}`];

                            return (
                              <div key={platformIndex}>
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center gap-3 font-medium border p-5 rounded-[10px] min-w-[150px]">
                                    <Image
                                      src={platform.icon}
                                      alt={platform.name}
                                      width={24}
                                      height={24}
                                    />
                                    <p>{platform.name}</p>
                                  </div>
                                  {(!isValidated || (isValidated && hasSelectedFormats)) && (
                                    <div
                                      className="flex gap-3 items-center font-semibold cursor-pointer"
                                      onClick={() =>
                                        togglePlatformExpansion(platform.name, stageName, isValidated)
                                      }
                                    >
                                      {isExpanded ? (
                                        <button className="text-gray-500 text-[14px]">
                                          {isValidated
                                            ? "Choose the number of visuals"
                                            : "Select your format"}
                                        </button>
                                      ) : (
                                        <>
                                          <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                                            <path
                                              d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                                              fill="#3175FF"
                                            />
                                          </svg>
                                          <button className="text-[#3175FF] text-[14px]">
                                            Add format
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {((isExpanded && !isValidated) || (isValidated && hasSelectedFormats)) && (
                                  <div className="py-6 flex flex-wrap gap-6">
                                    {defaultMediaOptions.map((option, index) => {
                                      const existsInDB =
                                        campaignFormData.channel_mix
                                          ?.find((ch) => ch.funnel_stage === stageName)
                                          ?.[channel.title.toLowerCase().replace(" ", "_")]
                                          ?.find((pl) => pl.platform_name === platform.name)
                                          ?.format?.some((ty) => ty.format_type === option.name);

                                      if (isValidated && !existsInDB) return null;

                                      return (
                                        <div key={index} className="flex flex-col items-center gap-4">
                                          <div
                                            onClick={() =>
                                              !isValidated &&
                                              handleFormatSelection(
                                                channel.title,
                                                index,
                                                platform.name,
                                                stageName
                                              )
                                            }
                                            className={`relative p-4 rounded-lg border transition ${
                                              existsInDB
                                                ? "border-blue-500 shadow-lg"
                                                : "border-gray-300"
                                            } ${isValidated ? "cursor-default" : "cursor-pointer"}`}
                                          >
                                            <Image
                                              src={option.icon}
                                              width={120}
                                              height={100}
                                              alt={option.name}
                                            />
                                            <p className="text-sm font-medium text-gray-700 mt-2 text-center">
                                              {option.name}
                                            </p>
                                            {existsInDB && (
                                              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                <FaCheck size={12} />
                                              </div>
                                            )}
                                          </div>
                                          {isValidated && existsInDB && (
                                            <div className="flex items-center bg-[#F6F6F6] gap-2 border rounded-[8px]">
                                              <button
                                                className="px-2 py-1 text-lg font-semibold"
                                                onClick={() =>
                                                  handleQuantityChange(platform.name, index, -1, stageName)
                                                }
                                              >
                                                -
                                              </button>
                                              <span className="px-2">
                                                {quantities[`${stageName}-${platform.name}`]?.[index] || 1}
                                              </span>
                                              <button
                                                className="px-2 py-1 text-lg font-semibold"
                                                onClick={() =>
                                                  handleQuantityChange(platform.name, index, 1, stageName)
                                                }
                                              >
                                                +
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                    {isValidated && hasSelectedFormats && (
                                      <div
                                        onClick={openModal}
                                        className="w-[225px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                                      >
                                        <div className="flex flex-col items-center gap-2 text-center">
                                          <svg
                                            width="16"
                                            height="17"
                                            viewBox="0 0 16 17"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
                                              fill="#3175FF"
                                            />
                                          </svg>
                                          <p className="text-md text-black">Upload your previews</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                    <div className="flex justify-end mt-9">
                      <button
                        className={`px-10 py-4 rounded-lg text-white font-semibold text-[16px] ${
                          isStageValid(stageName)
                            ? "bg-[#3175FF] hover:bg-[#2563eb]"
                            : "bg-[#3175FF] opacity-50 cursor-not-allowed"
                        }`}
                        disabled={!isStageValid(stageName)}
                        onClick={() => (isValidated ? handleEdit(stageName) : handleValidate(stageName))}
                      >
                        {isValidated ? "Edit" : "Validate"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <UploadModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default FormatSelection;