import Image from "next/image";
import React, { useState } from "react";
import speaker from "../../../public/mdi_megaphone.svg";
import down from "../../../public/arrow-down.svg";
import facebook from "../../../public/facebook.svg";
import ig from "../../../public/ig.svg";
import youtube from "../../../public/youtube.svg";

type IPlatform = {
  name: string;
  icon: string;
  style?: string;
};

type IChannel = {
  title: string;
  platforms: IPlatform[];
  style?: string;
};

export const Platforms = () => {
  const [item, setItem] = useState("");

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
        { name: "TheTradeDesk", icon: facebook },
        { name: "Quantcast", icon: ig },
      ],
      style: "max-w-[180px] w-full",
    },
  ];
  return (
    <div className="text-[16px] my-6">
      {channels.map((channel, index) => (
        <React.Fragment key={index}>
          <h3 className="font-[600] my-[24px]">{channel.title}</h3>
          <div className="flex flex-col gap-[24px]">
            {channel.platforms.map((platform, index) => (
              <div key={index}>
                <div className="flex items-center gap-6">
                  <div
                    className={`flex items-center gap-[12px] font-[500] border p-5 rounded-[10px] ${
                      channel.style ?? platform.style
                    }`}
                  >
                    <Image src={platform.icon} alt={platform.name} />
                    <p>{platform.name}</p>
                  </div>

                  <div
                    className="text-[#3175FF] flex gap-3 items-center font-semibold cursor-pointer"
                    onClick={() =>
                      setItem(platform.name === item ? "" : platform.name)
                    }
                  >
                    {platform.name === item ? (
                      "Select your format"
                    ) : (
                      <>
                        <p className="font-bold text-[18px]">
                          <svg
                            width="13"
                            height="12"
                            viewBox="0 0 13 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.87891 5.16675V0.166748H7.54557V5.16675H12.5456V6.83342H7.54557V11.8334H5.87891V6.83342H0.878906V5.16675H5.87891Z"
                              fill="#3175FF"
                            />
                          </svg>
                        </p>
                        <h3 className="">{"Add format"}</h3>
                      </>
                    )}
                  </div>
                </div>

                {item === platform.name && (
                  <div className="py-6 px-4">
                    <h1>{platform.name}</h1>
                  </div>
                )}
              </div>
            ))}
          </div>
        </React.Fragment>
      ))}

      <div className="flex justify-end items-center">
        <div className="btn btn-primary py-[15px] px-[40px] rounded-[10px]">
          Validate
        </div>
      </div>
    </div>
  );
};

export const FormatSelection = () => {
  return (
    <div className="card_bucket_container_main">
      <header className="max-w-[818px]">
        <h1 className="font-general-sans font-semibold text-[24px] leading-[32px] text-[#292929]">
          Select formats for each channel{" "}
        </h1>
        <h1 className="font-general-sans font-medium text-[16px] leading-[22px] text-[rgba(0,0,0,0.9)] mt-2">
          Select the creative formats you want to use for your campaign. Specify
          the number of visuals for each format. Multiple formats can be
          selected per channel.
        </h1>
      </header>
      <div className="card mt-[32px] bg-[#FFFFFF] max-w-[968px]">
        <div className="flex justify-between items-center p-6 gap-3 w-[968px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] rounded-t-[10px]">
          <div className="flex items-center gap-2">
            <Image src={speaker} alt="speaker" />
            <p>Awareness</p>
          </div>
          <p className="font-general-sans font-semibold text-[16px] leading-[22px] text-[#3175FF]">
            In progress
          </p>
          <div>
            <Image src={down} alt="down" />
          </div>
        </div>
        <div className="card-body">
          <Platforms />
        </div>
      </div>
    </div>
  );
};
