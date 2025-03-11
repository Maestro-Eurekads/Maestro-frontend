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

import carousel from "../../../public/carousel.svg";
import video_format from "../../../public/video_format.svg";
import image_format from "../../../public/Image_format.svg";
import collection_format from "../../../public/collection_format.svg";
import slideshow_format from "../../../public/slideshow_format.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import FormatsSelection from "./FormatsSelection";

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

// Main Platforms component that handles format selection for different platforms
export const Platforms = () => {
  // State management
  const [item, setItem] = useState(""); // Currently selected platform
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: { [key: string]: boolean } }>({}); // Track selected formats per platform
  const [platformMediaOptions, setPlatformMediaOptions] = useState<{ [key: string]: any[] }>({}); // Available media options per platform
  const [isValidateEnabled, setIsValidateEnabled] = useState(false); // Enable/disable validate button
  const [validatedMediaOptions, setValidatedMediaOptions] = useState<{ [key: string]: any[] }>({}); // Store validated selections
  const [isValidated, setIsValidated] = useState(false); // Track if selections are validated
  const [quantities, setQuantities] = useState<{ [key: string]: { [key: string]: number } }>({}); // Track quantities for each format

  // Default media format options available
  const defaultMediaOptions = [
    { name: "Carousel", icon: carousel, selected: false },
    { name: "Image", icon: image_format, selected: false },
    { name: "Video", icon: video_format, selected: false },
    { name: "Slideshow", icon: slideshow_format, selected: false },
    { name: "Collection", icon: collection_format, selected: false },
  ];

  // Enable validate button if any format is selected
  useEffect(() => {
    const anyPlatformSelected = Object.values(platformMediaOptions).some(options =>
      options.some(option => option.selected)
    );
    setIsValidateEnabled(anyPlatformSelected);
  }, [platformMediaOptions]);
  

  // Available channels and their platforms
  const channels: IChannel[] = [
    {
      title: "Social media",
      platforms: [
        { name: "Facebook", icon: facebook },
        { name: "Instagram", icon: ig },
        { name: "Youtube", icon: youtube },
      ],
      style: "max-w-[150px] w-full h-[52px]",
    },
    {
      title: "Display Network", 
      platforms: [
        { name: "TheTradeDesk", icon: TheTradeDesk },
        { name: "Quantcast", icon: Quantcast },
      ],
      style: "max-w-[180px] w-full",
    },
  ];

  // Initialize media options when platform is first opened
  const initializePlatformOptions = (platformName: string) => {
    if (!platformMediaOptions[platformName]) {
      setPlatformMediaOptions(prev => ({
        ...prev,
        [platformName]: [...defaultMediaOptions]
      }));
    }
  };

  // Handle selection of a media format
  const handleFormatSelection = (index: number, platformName: string) => {
    setPlatformMediaOptions(prev => ({
      ...prev,
      [platformName]: prev[platformName].map((option, i) =>
        i === index ? { ...option, selected: !option.selected } : option
      )
    }));
    
    setSelectedOptions(prev => ({
      ...prev,
      [platformName]: { ...prev[platformName], [index]: true }
    }));

    // Initialize quantity to 1 when format is selected
    if (!quantities[platformName]) {
      setQuantities(prev => ({
        ...prev,
        [platformName]: {}
      }));
    }
    setQuantities(prev => ({
      ...prev,
      [platformName]: {
        ...prev[platformName],
        [index]: 1
      }
    }));
  };

  // Handle quantity changes for formats
  const handleQuantityChange = (platformName: string, formatIndex: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [platformName]: {
        ...prev[platformName],
        [formatIndex]: Math.max(1, (prev[platformName]?.[formatIndex] || 1) + change)
      }
    }));
  };

  // Handle validation or editing of selections
  const handleValidateOrEdit = () => {
    if (!isValidated) {
      // Store validated selections
      const validatedSelections: { [key: string]: any[] } = {};
      Object.entries(platformMediaOptions).forEach(([platform, options]) => {
        validatedSelections[platform] = options.filter(option => option.selected);
      });
      setValidatedMediaOptions(validatedSelections);
      setIsValidated(true);
    } else {
      // Reset to editing mode
      setPlatformMediaOptions(prev => {
        const newOptions: { [key: string]: any[] } = {};
        Object.keys(prev).forEach(platform => {
          newOptions[platform] = prev[platform].map(option => ({
            ...option,
            selected: validatedMediaOptions[platform]?.some(valid => valid.name === option.name) || false
          }));
        });
        return newOptions;
      });
      setIsValidated(false);
    }
  };

  // Render the platforms UI
  return (
    <div className="text-[16px] my-6 overflow-x-hidden">
      {channels.map((channel, channelIndex) => (
        <React.Fragment key={channelIndex}>
          <h3 className="font-[600] my-[24px]">{channel.title}</h3>
          <div className="flex flex-col gap-[24px]">
            {channel.platforms.map((platform, platformIndex) => (
              <div key={platformIndex}>
                <div className="flex items-center gap-6">
                  <div className={`flex items-center gap-[12px] font-[500] border p-5 rounded-[10px] ${channel.style}`}>
                    <Image src={platform.icon} alt={platform.name} />
                    <p>{platform.name}</p>
                  </div>

                  <div
                    className={`flex gap-3 items-center font-semibold cursor-pointer ${platform.name === item ? 'text-gray-600' : 'text-[#3175FF]'}`}
                    onClick={() => {
                      if (item !== platform.name) {
                        initializePlatformOptions(platform.name);
                      }
                      setItem(platform.name === item ? "" : platform.name);
                    }}
                  >
                    {platform.name === item ? 
                      selectedOptions[platform.name] ? 
                        "Choose the number of visuals for this format" : 
                        "Select your format"
                      : (
                        <>
                          <p className="font-bold text-[18px]">
                            <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                              <path d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z" fill="#3175FF"/>
                            </svg>
                          </p>
                          <h3>Add format</h3>
                        </>
                      )
                    }
                  </div>
                </div>

                {item === platform.name && platformMediaOptions[platform.name] && (
                  <div className="py-6">
                    <MediaSelection
                      handleFormatSelection={(index) => handleFormatSelection(index, platform.name)}
                      mediaOptions={platformMediaOptions[platform.name]}
                    />
                  </div>
                )}

                {isValidated && validatedMediaOptions[platform.name]?.length > 0 && (
                  <div className="py-6">
                    <MediaSelection 
                      mediaOptions={validatedMediaOptions[platform.name]}
                      handleFormatSelection={() => {}}
                      isValidated={true}
                      platformName={platform.name}
                      quantities={quantities[platform.name] || {}}
                      onQuantityChange={(formatIndex, change) => 
                        handleQuantityChange(platform.name, formatIndex, change)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      <div className="w-full flex items-center justify-end mt-9">
        <button 
          className={`px-10 py-4 gap-2 w-[142px] h-[52px] rounded-lg text-white font-semibold text-[16px] leading-[22px] ${isValidateEnabled ? 'bg-[#3175FF]' : 'bg-[#3175FF] opacity-50 cursor-not-allowed'}`} 
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <PageHeaderWrapper
        t1="Select formats for each channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel."
      />
      <div className="card cursor-pointer mt-[32px] bg-[#FFFFFF] max-w-[968px]">
        <div className="flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2 cursor-pointer">
            <Image src={speaker} alt="speaker" />
            <p>Awareness</p>
          </div>
          <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
            In progress
          </p>
          <div>
            <Image src={isOpen ? up : down} alt={isOpen ? "up" : "down"} />
          </div>
        </div>
        {isOpen && (
          <div className="card-body">
            <Platforms />
          </div>
        )}
      </div>

      <FormatsSelection />
    </div>
  );
};

// MediaSelection component for rendering format options
export default function MediaSelection({
  handleFormatSelection,
  mediaOptions,
  isValidated = false,
  platformName = "",
  quantities = {},
  onQuantityChange = () => {},
}: {
  mediaOptions: any[];
  handleFormatSelection: (index: number) => void;
  isValidated?: boolean;
  platformName?: string;
  quantities?: { [key: string]: number };
  onQuantityChange?: (index: number, change: number) => void;
}) {
  return (
    <div className="flex gap-4">
      {mediaOptions.map((option, index) => (
        <div
          key={index}
          className="flex flex-col items-center"
        >
          <div
            onClick={() => handleFormatSelection(index)}
            className={`relative text-center cursor-pointer p-2 rounded-lg border transition ${
              option.selected ? "border-blue-500 shadow-lg" : "border-gray-300"
            }`}
          >
            <Image src={option.icon} width={168} height={132} alt={option.name} />
            <p className="text-sm font-medium text-gray-700 mt-2">{option.name}</p>
            {option.selected && (
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
      ))}
    </div>
  );
}
