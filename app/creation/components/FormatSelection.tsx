"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
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
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { funnelStages } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";
import UploadModal from "../../../components/UploadModal/UploadModal";
import checkmark from "../../../public/mingcute_check-fill.svg";
import { useComments } from "app/utils/CommentProvider";

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

export const Platforms = ({ stageName }: { stageName: string }) => {
  const [expandedPlatforms, setExpandedPlatforms] = useState<{
    [key: string]: boolean;
  }>({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [isValidateEnabled, setIsValidateEnabled] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [quantities, setQuantities] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [channels, setChannels] = useState<IChannel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{
    platform: string;
    channel: string;
    format: string;
  } | null>(null);

  const defaultMediaOptions = [
    { name: "Carousel", icon: carousel },
    { name: "Image", icon: image_format },
    { name: "Video", icon: video_format },
    { name: "Slideshow", icon: slideshow_format },
    { name: "Collection", icon: collection_format },
  ];

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

  const getPlatformIcon = (platformName) => platformIcons[platformName] || null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedValidationState = localStorage.getItem(
        `formatValidation_${stageName}`
      );
      const initialValidation = savedValidationState
        ? JSON.parse(savedValidationState)
        : false;
      setIsValidated(initialValidation);

      const savedQuantities = localStorage.getItem(`quantities_${stageName}`);
      if (savedQuantities) {
        setQuantities(JSON.parse(savedQuantities));
      }

      const savedExpanded = localStorage.getItem(
        `expandedPlatforms_${stageName}`
      );
      if (savedExpanded) {
        setExpandedPlatforms(JSON.parse(savedExpanded));
      }
    }
  }, [stageName]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `expandedPlatforms_${stageName}`,
        JSON.stringify(expandedPlatforms)
      );
    }
  }, [expandedPlatforms, stageName]);

  useEffect(() => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    const hasMediaOptionsSelected =
      stage &&
      (stage.social_media?.some((platform) => platform.format?.length > 0) ||
        stage.display_networks?.some(
          (platform) => platform.format?.length > 0
        ) ||
        stage.search_engines?.some((platform) => platform.format?.length > 0));
    setIsValidateEnabled(hasMediaOptionsSelected);
  }, [campaignFormData, stageName]);

  useEffect(() => {
    if (campaignFormData?.channel_mix && stageName) {
      const stage = campaignFormData?.channel_mix?.find(
        (chan) => chan?.funnel_stage === stageName
      );
      if (!stage) {
        setChannels([]);
        return;
      }

      const transformedData = {
        title: "Social media",
        platforms:
          stage.social_media
            ?.filter((platform) => platform.platform_name)
            .map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
        style: "max-w-[150px] w-full h-[52px]",
      };
      const displayNetworkData = {
        title: "Display Networks",
        platforms:
          stage.display_networks
            ?.filter((platform) => platform.platform_name)
            .map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
        style: "max-w-[200px] w-full",
      };
      const searchEnginesData = {
        title: "Search Engines",
        platforms:
          stage.search_engines
            ?.filter((platform) => platform.platform_name)
            .map((platform) => ({
              name: platform.platform_name,
              icon: getPlatformIcon(platform.platform_name),
            })) || [],
        style: "max-w-[180px] w-full",
      };

      setChannels(
        [transformedData, displayNetworkData, searchEnginesData].filter(
          (channel) => channel.platforms.length > 0
        )
      );
    }
  }, [campaignFormData, stageName]);

  useEffect(() => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan.funnel_stage === stageName
    );
    if (stage && !Object.keys(quantities).length) {
      const initialQuantities = {};
      ["social_media", "display_networks", "search_engines"].forEach(
        (channel) => {
          stage[channel]?.forEach((platform) => {
            if (platform.format) {
              initialQuantities[platform.platform_name] = {};
              platform.format.forEach((f) => {
                initialQuantities[platform.platform_name][f.format_type] =
                  parseInt(f.num_of_visuals || "1");
              });
            }
          });
        }
      );
      setQuantities(initialQuantities);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `quantities_${stageName}`,
          JSON.stringify(initialQuantities)
        );
      }
    }
  }, [campaignFormData, stageName, quantities]);

  const handleFormatSelection = (
    channelName: string,
    index: number,
    platformName: string
  ) => {
    if (isValidated) return;

    const copy = [...campaignFormData?.channel_mix];
    const stageIndex = copy.findIndex(
      (item) => item.funnel_stage === stageName
    );
    if (stageIndex === -1) return;

    const channel =
      copy[stageIndex][channelName?.toLowerCase()?.replace(" ", "_")];
    const platformIndex = channel?.findIndex(
      (item) => item?.platform_name === platformName
    );
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

    // Reset validation state when a new format is selected
    setIsValidated(false);
    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: copy,
      validatedStages: {
        ...prev.validatedStages,
        [stageName]: false, // Reset global validation for this stage
      },
    }));
  };

  const handleQuantityChange = (
    platformName: string,
    formatName: string,
    change: number
  ) => {
    const newQuantities = {
      ...quantities,
      [platformName]: {
        ...quantities[platformName],
        [formatName]: Math.max(
          1,
          (quantities[platformName]?.[formatName] || 1) + change
        ),
      },
    };
    setQuantities(newQuantities);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `quantities_${stageName}`,
        JSON.stringify(newQuantities)
      );
    }

    const copy = [...campaignFormData.channel_mix];
    const stageIndex = copy.findIndex(
      (item) => item.funnel_stage === stageName
    );
    if (stageIndex === -1) return;

    const channels = ["social_media", "display_networks", "search_engines"];
    for (const channel of channels) {
      const platforms = copy[stageIndex][channel];
      if (platforms) {
        const platform = platforms.find(
          (p) => p.platform_name === platformName
        );
        if (platform && platform.format) {
          const format = platform.format.find(
            (f) => f.format_type === formatName
          );
          if (format) {
            format.num_of_visuals =
              newQuantities[platformName][formatName].toString();
            break;
          }
        }
      }
    }
    setCampaignFormData({ ...campaignFormData, channel_mix: copy });
  };

  const handleValidateOrEdit = () => {
    if (!isValidateEnabled && !isValidated) {
      alert("Please select at least one format before validating");
      return;
    }

    const newValidationState = !isValidated;
    setIsValidated(newValidationState);
    setIsModalOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `formatValidation_${stageName}`,
        JSON.stringify(newValidationState)
      );
    }

    const updatedChannelMix = campaignFormData.channel_mix.map((mix) => {
      if (mix.funnel_stage === stageName) {
        return {
          ...mix,
          social_media: mix.social_media?.map((p) => ({
            ...p,
            formatValidated: newValidationState,
          })),
          display_networks: mix.display_networks?.map((p) => ({
            ...p,
            formatValidated: newValidationState,
          })),
          search_engines: mix.search_engines?.map((p) => ({
            ...p,
            formatValidated: newValidationState,
          })),
        };
      }
      return mix;
    });

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
      validatedStages: {
        ...prev.validatedStages,
        [stageName]: newValidationState,
      },
    }));
  };

  const hasPlatformSelectedFormats = (
    platformName: string,
    channelName: string
  ) => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    const channel = stage?.[channelName?.toLowerCase()?.replaceAll(" ", "_")];
    const platform = channel?.find((pl) => pl?.platform_name === platformName);
    return platform?.format?.length > 0;
  };

  const togglePlatformExpansion = (platformName: string) => {
    if (
      !isValidated ||
      (isValidated &&
        hasPlatformSelectedFormats(
          platformName,
          channels.find((chan) =>
            chan.platforms.some((p) => p.name === platformName)
          )?.title || ""
        ))
    ) {
      setExpandedPlatforms((prev) => ({
        ...prev,
        [platformName]: !prev[platformName],
      }));
    }
  };

  const openModal = (platform: string, channel: string, format: string) => {
    setModalContext({ platform, channel, format });
    setIsModalOpen(true);
  };

  return (
    <div className="text-[16px] overflow-x-hidden">
      {channels?.map((channel, channelIndex) => (
        <React.Fragment key={channelIndex}>
          <h3 className="font-[600] my-[24px]">{channel?.title}</h3>
          <div className="flex flex-col gap-[24px]">
            {channel?.platforms?.map((platform, platformIndex) => {
              const hasSelectedFormats = hasPlatformSelectedFormats(
                platform.name,
                channel.title
              );
              const isExpanded = expandedPlatforms[platform.name];

              return (
                <div key={platformIndex}>
                  <div className="flex items-center gap-6">
                    <div
                      className={`flex items-center gap-[12px] font-[500] border p-5 rounded-[10px] ${channel?.style}`}
                    >
                      {getPlatformIcon(platform?.name) ? (
                        <Image src={platform.icon} alt={platform.name} />
                      ) : null}

                      <p>{platform.name}</p>
                    </div>
                    <div
                      className="flex gap-3 items-center font-semibold cursor-pointer"
                      onClick={() => togglePlatformExpansion(platform.name)}
                    >
                      {isExpanded ? (
                        <span className="text-gray-500">
                          {isValidated
                            ? "Choose the number of visuals for this format"
                            : "Select your format"}
                        </span>
                      ) : (
                        <>
                          <p className="font-bold text-[18px] text-[#3175FF]">
                            <svg
                              width="13"
                              height="12"
                              viewBox="0 0 13 12"
                              fill="none"
                            >
                              <path
                                d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                                fill="#3175FF"
                              />
                            </svg>
                          </p>
                          <h3 className="text-[#3175FF]">Add format</h3>
                        </>
                      )}
                    </div>
                  </div>
                  {((isExpanded && !isValidated) ||
                    (isValidated && hasSelectedFormats && isExpanded)) && (
                      <div className="py-6">
                        <MediaSelection
                          handleFormatSelection={(index) =>
                            handleFormatSelection(
                              channel?.title,
                              index,
                              platform.name
                            )
                          }
                          mediaOptions={defaultMediaOptions}
                          channelName={channel?.title}
                          platformName={platform.name}
                          stageName={stageName}
                          isValidated={isValidated}
                          quantities={quantities[platform.name] || {}}
                          onQuantityChange={(formatName, change) =>
                            handleQuantityChange(
                              platform.name,
                              formatName,
                              change
                            )
                          }
                          onOpenModal={openModal}
                        />
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}
      <div className="w-full flex items-center justify-end mt-9">
        <button
          className={`px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${isValidateEnabled || isValidated
            ? "bg-[#3175FF] hover:bg-[#2563eb]"
            : "bg-[#3175FF] opacity-50 cursor-not-allowed"
            }`}
          onClick={handleValidateOrEdit}
        >
          {isValidated ? "Edit" : "Validate"}
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <UploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            platform={modalContext?.platform}
            channel={modalContext?.channel}
            format={modalContext?.format}
          />
        </div>
      )}
    </div>
  );
};

export const FormatSelection = () => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();
  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOpenTabs = localStorage.getItem("formatSelectionOpenTabs");
      if (savedOpenTabs) {
        setOpenTabs(JSON.parse(savedOpenTabs));
      } else if (campaignFormData?.channel_mix) {
        const initialTab = [campaignFormData?.channel_mix[0]?.funnel_stage];
        setOpenTabs(initialTab);
        localStorage.setItem(
          "formatSelectionOpenTabs",
          JSON.stringify(initialTab)
        );
      }
    }
  }, [campaignFormData]);

  const toggleTab = (stageName: string) => {
    const newOpenTabs = openTabs.includes(stageName)
      ? openTabs.filter((tab) => tab !== stageName)
      : [...openTabs, stageName];

    setOpenTabs(newOpenTabs);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "formatSelectionOpenTabs",
        JSON.stringify(newOpenTabs)
      );
    }
  };

  const hasSelectedFormatsForStage = (stageName: string) => {
    const stage = campaignFormData?.channel_mix?.find(
      (chan) => chan?.funnel_stage === stageName
    );
    return (
      stage &&
      (stage.social_media?.some((platform) => platform.format?.length > 0) ||
        stage.display_networks?.some(
          (platform) => platform.format?.length > 0
        ) ||
        stage.search_engines?.some((platform) => platform.format?.length > 0))
    );
  };

  const getStageStatus = (stageName: string) => {
    const hasFormats = hasSelectedFormatsForStage(stageName);
    const isValidated = campaignFormData?.validatedStages?.[stageName] || false;

    if (hasFormats && isValidated) {
      return "Completed";
    } else if (hasFormats) {
      return "In progress";
    } else {
      return "Not started";
    }
  };

  return (
    <div>
      <PageHeaderWrapper
        t1="Select formats for each channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel."
      />
      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {campaignFormData?.funnel_stages?.map((stageName, index) => {
          const stage = campaignFormData?.custom_funnels?.find((s) => s.name === stageName);
          if (!stage) return null;

          const status = getStageStatus(stageName);
          const isOpen = openTabs.includes(stage.name);

          return (
            <div key={index}>
              <div
                className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] ${isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
                  }`}
                onClick={() => toggleTab(stage.name)}
              >
                <div className="flex items-center gap-2">
                  {stage?.icon &&
                  <Image src={stage.icon} alt={stage.name} />
                  }
                  <p className="w-[119px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                {status === "Completed" ? (
                  <div className="flex items-center gap-2">
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark}
                      alt="Completed"
                    />
                    <p className="text-green-500 font-semibold">Completed</p>
                  </div>
                ) : status === "In progress" ? (
                  <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
                    In Progress
                  </p>
                ) : (
                  <p className="font-[General Sans] font-medium text-[16px] leading-[22px] text-[#061237] opacity-50">
                    Not started
                  </p>
                )}
                <Image src={isOpen ? up : down} alt={isOpen ? "up" : "down"} />
              </div>
              {isOpen && (
                <div className="card-body bg-white border border-[#E5E5E5]">
                  <Platforms stageName={stage?.name} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// export default function MediaSelection({
//   handleFormatSelection,
//   mediaOptions,
//   isValidated = false,
//   platformName,
//   quantities = {},
//   onQuantityChange = () => {},
//   channelName,
//   stageName,
//   onOpenModal,
// }: {
//   mediaOptions: any[];
//   handleFormatSelection: (index: number) => void;
//   isValidated?: boolean;
//   platformName?: string;
//   channelName?: string;
//   quantities?: { [key: string]: number };
//   onQuantityChange?: (formatName: string, change: number) => void;
//   stageName: string;
//   onOpenModal: (platform: string, channel: string, format: string) => void;
// }) {
//   const { campaignFormData } = useCampaigns();

//   return (
//     <div className="flex flex-wrap gap-4 overflow-x-auto">
//       {mediaOptions.map((option, index) => {
//         const existsInDB = campaignFormData?.channel_mix
//           ?.find((ch) => ch?.funnel_stage === stageName)
//           ?.[channelName?.toLowerCase()?.replaceAll(" ", "_")]?.find(
//             (pl) => pl?.platform_name === platformName
//           )
//           ?.format?.some((ty) => ty?.format_type === option?.name);

//         if (isValidated && !existsInDB) return null;

//         return (
//           <div key={index} className="flex justify-center gap-6 min-w-fit">
//             <div className="flex flex-col items-center">
//               <div
//                 onClick={() => !isValidated && handleFormatSelection(index)}
//                 className={`relative text-center cursor-pointer p-2 rounded-lg border transition ${
//                   existsInDB ? "border-blue-500 shadow-lg" : "border-gray-300"
//                 } ${isValidated ? "cursor-default" : "cursor-pointer"}`}
//               >
//                 <Image
//                   src={option.icon}
//                   width={168}
//                   height={132}
//                   alt={option.name}
//                 />
//                 <p className="text-sm font-medium text-gray-700 mt-2">
//                   {option.name}
//                 </p>
//                 {existsInDB && (
//                   <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                     <FaCheck />
//                   </div>
//                 )}
//               </div>
//               {isValidated && existsInDB && (
//                 <div className="flex items-center bg-[#F6F6F6] gap-2 mt-4 border rounded-[8px]">
//                   <button
//                     className="px-2 py-1 text-[#000000] text-lg font-semibold"
//                     onClick={() => onQuantityChange(option.name, -1)}
//                   >
//                     -
//                   </button>
//                   <span className="px-2">{quantities[option.name] || 1}</span>
//                   <button
//                     className="px-2 py-1 text-[#000000] text-lg font-semibold"
//                     onClick={() => onQuantityChange(option.name, 1)}
//                   >
//                     +
//                   </button>
//                 </div>
//               )}
//             </div>
//             {isValidated && existsInDB && (
//               <div
//                 onClick={() =>
//                   onOpenModal(platformName, channelName, option.name)
//                 }
//                 className="w-[225px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
//               >
//                 <div className="flex flex-col items-center gap-2 text-center">
//                   <svg
//                     width="16"
//                     height="17"
//                     viewBox="0 0 16 17"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M0.925781 14.8669H15.9258V16.5335H0.925781V14.8669ZM9.25911 3.89055V13.2002H7.59245V3.89055L2.53322 8.94978L1.35471 7.77128L8.42578 0.700195L15.4969 7.77128L14.3184 8.94978L9.25911 3.89055Z"
//                       fill="#3175FF"
//                     />
//                   </svg>
//                   <p className="text-md font-lighter text-black mt-2">
//                     Upload your previews
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

export default function MediaSelection({
  handleFormatSelection,
  mediaOptions,
  isValidated = false,
  platformName,
  quantities = {},
  onQuantityChange = () => { },
  channelName,
  stageName,
  onOpenModal,
}: {
  mediaOptions: any[];
  handleFormatSelection: (index: number) => void;
  isValidated?: boolean;
  platformName?: string;
  channelName?: string;
  quantities?: { [key: string]: number };
  onQuantityChange?: (formatName: string, change: number) => void;
  stageName: string;
  onOpenModal: (platform: string, channel: string, format: string) => void;
}) {
  const { campaignFormData } = useCampaigns();

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
        {mediaOptions.map((option, index) => {
          const existsInDB = campaignFormData?.channel_mix
            ?.find((ch) => ch?.funnel_stage === stageName)
            ?.[channelName?.toLowerCase()?.replaceAll(" ", "_")]?.find(
              (pl) => pl?.platform_name === platformName
            )
            ?.format?.some((ty) => ty?.format_type === option?.name);

          if (isValidated && !existsInDB) return null;

          return (
            <div key={index} className="flex justify-center gap-6 min-w-fit">
              <div className="flex flex-col items-center">
                <div
                  onClick={() => !isValidated && handleFormatSelection(index)}
                  className={`relative text-center cursor-pointer p-2 rounded-lg border transition ${existsInDB ? "border-blue-500 shadow-lg" : "border-gray-300"
                    } ${isValidated ? "cursor-default" : "cursor-pointer"}`}
                >
                  <Image
                    src={option.icon}
                    width={168}
                    height={132}
                    alt={option.name}
                  />
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {option.name}
                  </p>
                  {existsInDB && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      <FaCheck />
                    </div>
                  )}
                </div>
                {isValidated && existsInDB && (
                  <div className="flex items-center bg-[#F6F6F6] gap-2 mt-4 border rounded-[8px]">
                    <button
                      className="px-2 py-1 text-[#000000] text-lg font-semibold"
                      onClick={() => onQuantityChange(option.name, -1)}
                    >
                      -
                    </button>
                    <span className="px-2">{quantities[option.name] || 1}</span>
                    <button
                      className="px-2 py-1 text-[#000000] text-lg font-semibold"
                      onClick={() => onQuantityChange(option.name, 1)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
              {isValidated && existsInDB && (
                <div
                  onClick={() =>
                    onOpenModal(platformName, channelName, option.name)
                  }
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
                    <p className="text-md font-lighter text-black mt-2">
                      Upload your previews
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
