/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa"; // Importing the checkmark icon from react-icons
import speaker from "../../../public/mdi_megaphone.svg";
import down from "../../../public/arrow-down-2.svg";
import up from "../../../public/arrow-down.svg"; // Importing the up arrow
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";
import TheTradeDesk from '../../../public/TheTradeDesk.svg';
import Quantcast from '../../../public/quantcast.svg';

import carousel from "../../../public/carousel.svg";
import video_format from "../../../public/video_format.svg";
import image_format from "../../../public/Image_format.svg";
import collection_format from "../../../public/collection_format.svg";
import slideshow_format from "../../../public/slideshow_format.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import FormatsSelection from "./FormatsSelection";

type IPlatform = {
  name: string;
  icon: string;
  style?: string;
  mediaOptions?: any[];
};

type IChannel = {
  title: string;
  platforms: IPlatform[];
  style?: string;
};

export const Platforms = () => {
  const [item, setItem] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: boolean }>({});
  const [mediaOptions, setMediaOptions] = useState([
    { name: "Carousel", icon: carousel, selected: false },
    { name: "Image", icon: image_format, selected: false },
    { name: "Video", icon: video_format, selected: false },
    { name: "Slideshow", icon: slideshow_format, selected: false },
    { name: "Collection", icon: collection_format, selected: false },
  ]);
  const [isValidateEnabled, setIsValidateEnabled] = useState(false);
  const [validatedMediaOptions, setValidatedMediaOptions] = useState<any[]>([]);

  useEffect(() => {
    const anySelected = mediaOptions.some(option => option.selected);
    setIsValidateEnabled(anySelected);
  }, [mediaOptions]);

  const channels: IChannel[] = [
    {
      title: "Social media",
      platforms: [
        { name: "Facebook", icon: facebook, mediaOptions },
        { name: "Instagram", icon: ig, mediaOptions },
        { name: "Youtube", icon: youtube, mediaOptions },
      ],
      style: "max-w-[150px] w-full h-[52px]",
    },
    {
      title: "Display Network",
      platforms: [
        { name: "TheTradeDesk", icon: TheTradeDesk, mediaOptions },
        { name: "Quantcast", icon: Quantcast, mediaOptions },
      ],
      style: "max-w-[180px] w-full",
    },
  ];

  const handleFormatSelection = (index: number, platformName: string) => {
    setMediaOptions((prevOptions) =>
      prevOptions.map((option, i) => ({
        ...option,
        selected: index === i ? !option.selected : option.selected, // Toggle selection
      }))
    );

    setSelectedOptions((prev) => ({
      ...prev,
      [platformName]: true, // Mark the platform as having a selected format
    }));
  };

  const handleValidate = () => {
    // Only validate for Facebook
    const facebookPlatform = channels[0].platforms[0]; // Facebook platform
    if (facebookPlatform) {
      const selectedFormats = mediaOptions.filter(option => option.selected);
      setValidatedMediaOptions(selectedFormats);
    }
  };

  return (
    <div className="text-[16px] my-6">
      {channels.map((channel, index) => (
        <React.Fragment key={index}>
          <h3 className="font-[600] my-[24px]">{channel.title}</h3>
          <div className="flex flex-col gap-[24px]">
            {channel.platforms.map((platform, index) => (
              <div key={index}>
                <div className="flex items-center gap-6">
                  <div className={`flex items-center gap-[12px] font-[500] border p-5 rounded-[10px] ${channel.style ?? platform.style}`}>
                    <Image src={platform.icon} alt={platform.name} />
                    <p>{platform.name}</p>
                  </div>

                  <div
                    className="text-[#3175FF] flex gap-3 items-center font-semibold cursor-pointer"
                    onClick={() => setItem(platform.name === item ? "" : platform.name)}
                  >
                    {platform.name === item
                      ? selectedOptions[platform.name]
                        ? "Choose the number of visuals for this format"
                        : "Select your format"
                      : <>
                          <p className="font-bold text-[18px]">
                            <svg width="13" height="12" viewBox="0 0 13 12" fill="none">
                              <path d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z" fill="#3175FF"/>
                            </svg>
                          </p>
                          <h3>{"Add format"}</h3>
                        </>
                    }
                  </div>
                </div>

                {validatedMediaOptions.length > 0 && platform.name === "Facebook" ? (
                  <div className="py-6">
                    <MediaSelection mediaOptions={validatedMediaOptions} handleFormatSelection={() => {}} />
                  </div>
                ) : (
                  item === platform.name && (
                    <div className="py-6">
                      <MediaSelection handleFormatSelection={(index) => handleFormatSelection(index, platform.name)} mediaOptions={mediaOptions} />
                    </div>
                  )
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
          onClick={handleValidate}
        >
          Validate
        </button>
      </div>
    </div>
  );
};

export const FormatSelection = () => {
  const [isOpen, setIsOpen] = useState(true); // State to manage collapse/expand

  return (
    <div>
      <PageHeaderWrapper
        t1="Select formats for each channel"
        t2="Select the creative formats you want to use for your campaign. Specify the number of visuals for each format. Multiple formats can be selected per channel."
      />
      <div className="card cursor-pointer mt-[32px] bg-[#FFFFFF] max-w-[968px]">
        <div className="flex justify-between items-center p-6 gap-3 w-[968px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2 cursor-pointer"> {/* Added cursor pointer */}
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

export default function MediaSelection({ handleFormatSelection, mediaOptions }: { mediaOptions: any[], handleFormatSelection: (index: number) => void }) {
  return (
    <div className="flex gap-4">
      {mediaOptions.map((option, index) => (
        <div
          key={index}
          onClick={() => handleFormatSelection(index)}
          className={`relative text-center cursor-pointer p-2 rounded-lg border transition ${option.selected
            ? "border-blue-500 shadow-lg"
            : "border-gray-300"
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
      ))}
    </div>
  );
}
