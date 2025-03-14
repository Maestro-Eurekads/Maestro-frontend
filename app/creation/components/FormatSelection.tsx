/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
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
import orangecredit from "../../../public/orangecredit-card.svg";
import tablerzoomfilled from "../../../public/tabler_zoom-filled.svg";
import tictok from "../../../public/tictok.svg";
import cursor from "../../../public/blue_fluent_cursor-click.svg";
import State12 from "../../../public/State12.svg";
import roundget from "../../../public/ic_round-get-app.svg";
import mingcute_basket from "../../../public/mingcute_basket-fill.svg";
import mdi_leads from "../../../public/mdi_leads.svg";

import carousel from "../../../public/carousel.svg";
import video_format from "../../../public/video_format.svg";
import image_format from "../../../public/Image_format.svg";
import collection_format from "../../../public/collection_format.svg";
import slideshow_format from "../../../public/slideshow_format.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import FormatsSelection from "./FormatsSelection";
import { funnelStages } from "../../../components/data";
import { useCampaigns } from "../../utils/CampaignsContext";

// Types for platforms and channels
type IPlatform = {
  name: string;
  icon: any;
  style?: string;
  mediaOptions?: any[];
};

type IChannel = {
  title: string;
  platforms: IPlatform[];
  style?: string;
};

export const Platforms = ({ stageName }: { stageName: string }) => {
  const [item, setItem] = useState("");
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: { [key: string]: boolean };
  }>({});
  const [platformMediaOptions, setPlatformMediaOptions] = useState<{
    [key: string]: any[];
  }>({});
  const [isValidateEnabled, setIsValidateEnabled] = useState(false);
  const [validatedMediaOptions, setValidatedMediaOptions] = useState<{
    [key: string]: any[];
  }>({});
  const [isValidated, setIsValidated] = useState(false);
  const [quantities, setQuantities] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [channels, setChannels] = useState<IChannel[]>([]);

  console.log("here", campaignFormData?.channel_mix);

  // Default media format options available
  const defaultMediaOptions = [
    { name: "Carousel", icon: carousel, selected: false },
    { name: "Image", icon: image_format, selected: false },
    { name: "Video", icon: video_format, selected: false },
    { name: "Slideshow", icon: slideshow_format, selected: false },
    { name: "Collection", icon: collection_format, selected: false },
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

  const getPlatformIcon = (platformName) => {
    return platformIcons[platformName] || null;
  };

  // Enable validate button if any platform has selections
  useEffect(() => {
    const anyPlatformSelected = Object.values(platformMediaOptions).some(
      (options) => options.some((option) => option.selected)
    );
    setIsValidateEnabled(anyPlatformSelected);
  }, [platformMediaOptions]);

  useEffect(() => {
    if (campaignFormData?.channel_mix && stageName) {
      const stage = campaignFormData?.channel_mix?.find(
        (chan) => chan?.funnel_stage === stageName
      );
      const transformedData = {
        title: "Social media",
        platforms: stage?.social_media?.map((platform) => ({
          name: platform.platform_name,
          icon: getPlatformIcon(platform.platform_name),
        })),
        style: "max-w-[150px] w-full h-[52px]",
      };

      const displayNetworkData = {
        title: "Display Networks",
        platforms: stage?.display_networks?.map((platform) => ({
          name: platform.platform_name,
          icon: getPlatformIcon(platform.platform_name),
        })),
        style: "max-w-[200px] w-full",
      };

      const serachEnginesData = {
        title: "Search Engines",
        platforms: stage?.search_engines?.map((platform) => ({
          name: platform.platform_name,
          icon: getPlatformIcon(platform.platform_name),
        })),
        style: "max-w-[180px] w-full",
      };

      console.log("Transformed Data:", [
        transformedData,
        displayNetworkData,
        serachEnginesData,
      ]);
      setChannels([transformedData, displayNetworkData, serachEnginesData]);
    }
  }, [stageName]);

  // Toggle the selection of a media format for a specific platform
  const handleFormatSelection = (
    channelName,
    index: number,
    platformName: string
  ) => {
    const copy = [...campaignFormData?.channel_mix];
    const stage = copy.find((item) => item.funnel_stage === stageName);
    // console.log("🚀 ~ initializePlatformOptions ~ stage:", stage);
    const channel = stage[channelName?.toLowerCase()?.replace(" ", "_")];
    // console.log("🚀 ~ initializePlatformOptions ~ channel:", channel);
    const platform = channel?.find(
      (item) => item?.platform_name === platformName
    );
    const formatIndex = platform?.format?.findIndex(
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
    console.log("🚀 ~ updatedData ~ campaignFormData:", copy);

    setCampaignFormData({ ...campaignFormData, channel_mix: copy });
  };

  // Handle quantity changes for formats
  const handleQuantityChange = (
    platformName: string,
    formatIndex: number,
    change: number
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [platformName]: {
        ...prev[platformName],
        [formatIndex]: Math.max(
          1,
          (prev[platformName]?.[formatIndex] || 1) + change
        ),
      },
    }));
  };

  // Handle validation or editing of selections
  const handleValidateOrEdit = () => {
    if (!isValidated) {
      // Store validated selections
      const validatedSelections: { [key: string]: any[] } = {};
      Object.entries(platformMediaOptions).forEach(([platform, options]) => {
        validatedSelections[platform] = options.filter(
          (option) => option.selected
        );
      });
      setValidatedMediaOptions(validatedSelections);
      setIsValidated(true);
    } else {
      // Reset to editing mode
      setPlatformMediaOptions((prev) => {
        const newOptions: { [key: string]: any[] } = {};
        Object.keys(prev).forEach((platform) => {
          newOptions[platform] = prev[platform].map((option) => ({
            ...option,
            selected:
              validatedMediaOptions[platform]?.some(
                (valid) => valid.name === option.name
              ) || false,
          }));
        });
        return newOptions;
      });
      setIsValidated(false);
    }
  };

  console.log("channels", channels);

  // Render the platforms UI
  return (
    <div className="text-[16px] overflow-x-hidden">
      {channels?.map((channel, channelIndex) => {
        return (
          <React.Fragment key={channelIndex}>
            <h3 className="font-[600] my-[24px]">{channel?.title}</h3>
            <div className="flex flex-col gap-[24px]">
              {channel?.platforms?.map((platform, platformIndex) => {
                const existsInDB =
                  campaignFormData?.channel_mix
                    ?.find((ch) => ch?.funnel_stage === stageName)
                    ?.[
                      channel?.title?.toLowerCase()?.replaceAll(" ", "_")
                    ]?.find((pl) => pl?.platform_name === platform.name)?.format
                    ?.length > 0;
                // console.log("jbfjd", existsInDB)
                return (
                  <div key={platformIndex}>
                    <div className="flex items-center gap-6">
                      <div
                        className={`flex items-center gap-[12px] font-[500] border p-5 rounded-[10px] ${channel?.style}`}
                      >
                        <Image src={platform.icon} alt={platform.name} />
                        <p>{platform.name}</p>
                      </div>

                      <div
                        className={`flex gap-3 items-center font-semibold cursor-pointer ${
                          platform.name === item
                            ? "text-gray-600"
                            : "text-[#3175FF]"
                        }`}
                        onClick={() => {
                          setItem(platform.name === item ? "" : platform.name);
                        }}
                      >
                        {platform.name === item || existsInDB ? (
                          selectedOptions[platform.name] ? (
                            "Choose the number of visuals for this format"
                          ) : (
                            "Select your format"
                          )
                        ) : (
                          <>
                            <p className="font-bold text-[18px]">
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
                            <h3>Add format</h3>
                          </>
                        )}
                      </div>
                    </div>

                    {(item === platform.name || existsInDB) && (
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
                          platformName={platform?.name}
                          stageName={stageName}
                        />
                      </div>
                    )}

                    {isValidated &&
                      validatedMediaOptions[platform.name]?.length > 0 && (
                        <div className="py-6">
                          <MediaSelection
                            mediaOptions={validatedMediaOptions[platform.name]}
                            handleFormatSelection={() => {}}
                            isValidated={true}
                            stageName={stageName}
                            channelName={channel?.title}
                            platformName={platform.name}
                            quantities={quantities[platform.name] || {}}
                            onQuantityChange={(formatIndex, change) =>
                              handleQuantityChange(
                                platform.name,
                                formatIndex,
                                change
                              )
                            }
                          />
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}

      <div className="w-full flex items-center justify-end mt-9">
        <button
          className={`px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${
            isValidateEnabled
              ? "bg-[#3175FF]"
              : "bg-[#3175FF] opacity-50 cursor-not-allowed"
          }`}
          disabled={!isValidateEnabled}
          onClick={handleValidateOrEdit}
        >
          {isValidated ? "Edit" : "Validate"}
        </button>
      </div>
    </div>
  );
};

// Main FormatSelection component that wraps everything
export const FormatSelection = () => {
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const { campaignFormData } = useCampaigns();
  // console.log("🚀 ~ FormatSelection ~ campaignFormData:", campaignFormData);

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      setOpenTabs([campaignFormData?.channel_mix[0]?.funnel_stage]);
    }
  }, []);

  const toggleTab = (stageName: string) => {
    setOpenTabs(
      (prevOpenTabs) =>
        prevOpenTabs.includes(stageName)
          ? prevOpenTabs.filter((tab) => tab !== stageName) // Remove if already open
          : [...prevOpenTabs, stageName] // Add if not open
    );
  };

  return (
    <div>
      <PageHeaderWrapper
        t1="Select formats for each channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel."
      />
      <div className="mt-[32px] flex flex-col gap-[24px] cursor-pointer">
        {campaignFormData?.funnel_stages.map((stageName, index) => {
          const stage = funnelStages.find((s) => s.name === stageName);
          if (!stage) return null;

          return (
            <div key={index}>
              <div
                className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
          rounded-t-[10px]`}
                onClick={() => toggleTab(stage.name)}
              >
                <div className="flex items-center gap-2">
                  <Image src={stage.icon} alt={stage.name} />
                  <p className="w-[119px] h-[24px] font-[General Sans] font-semibold text-[18px] leading-[24px] text-[#061237]">
                    {stage.name}
                  </p>
                </div>
                <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
                  {stage.status}
                </p>
                <Image
                  src={openTabs.includes(stage.name) ? up : down}
                  alt={openTabs.includes(stage.name) ? "up" : "down"}
                />
              </div>
              {openTabs.includes(stage.name) && (
                <div className="card-body">
                  <Platforms stageName={stage?.name} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* <FormatsSelection /> */}
    </div>
  );
};

export default function MediaSelection({
  handleFormatSelection,
  mediaOptions,
  isValidated = false,
  platformName,
  quantities = {},
  onQuantityChange = () => {},
  channelName,
  stageName
}: {
  mediaOptions: any[];
  handleFormatSelection: (index: number) => void;
  isValidated?: boolean;
  platformName?: string;
  channelName?: string;
  quantities?: { [key: string]: number };
  onQuantityChange?: (index: number, change: number) => void;
  stageName: string
}) {
  const { campaignFormData } = useCampaigns();
  return (
    <div className="flex gap-4">
      {mediaOptions.map((option, index) => {
        const existsInDB =
        campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stageName)
          ?.[
            channelName?.toLowerCase()?.replaceAll(" ", "_")
          ]?.find((pl) => pl?.platform_name === platformName)?.format?.find((ty)=>ty?.format_type === option?.name);
        return (
          <div key={index} className="flex flex-col items-center">
            <div
              onClick={() => handleFormatSelection(index)}
              className={`relative text-center cursor-pointer p-2 rounded-lg border transition ${
                (option.selected || existsInDB)
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-300"
              }`}
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
              {(option.selected || existsInDB) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
              )}
            </div>

            {isValidated && option.selected && (
              <div className="flex items-center bg-[#F6F6F6] gap-2 mt-4 border rounded-[8px]">
                <button
                  className="px-2 py-1 text-[#000000] text-lg font-semibold"
                  onClick={() => onQuantityChange(index, -1)}
                >
                  -
                </button>
                <span className="px-2">{quantities[index] || 1}</span>
                <button
                  className="px-2 py-1 text-[#000000] text-lg font-semibold"
                  onClick={() => onQuantityChange(index, 1)}
                >
                  +
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
