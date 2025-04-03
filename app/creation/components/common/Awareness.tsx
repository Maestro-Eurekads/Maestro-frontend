import React from "react";
import Image from "next/image";
import AwarenessEdit from "./AwarenessEdit";
import { useCampaigns } from "../../../utils/CampaignsContext";
import facebook from "../../../../public/facebook.svg";
import ig from "../../../../public/ig.svg";
import youtube from "../../../../public/youtube.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import Quantcast from "../../../../public/quantcast.svg";
import speaker from "../../../../public/mdi_megaphone.svg";
import google from "../../../../public/social/google.svg";
import x from "../../../../public/x.svg";
import linkedin from "../../../../public/linkedin.svg";
import Display from "../../../../public/Display.svg";
import yahoo from "../../../../public/yahoo.svg";
import bing from "../../../../public/bing.svg";
import tictok from "../../../../public/tictok.svg";

const platformIcons = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  Youtube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  Linkedin: linkedin,
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

const Awareness = ({
  edit,
  setEdit,
  onDelete,
  stageName,
  updatedData,
  setUpdatedData,
  handleLoyaltyButtonClick,
  handlePlatformSelect,
  handleDropDownSelection,
}) => {
  const { campaignFormData } = useCampaigns();

  return (
    <div className="mt-6 bg-gray-100 p-6 gap-8 rounded-lg">
      {/* Header */}
      {!edit && (
        <div className="flex items-center gap-4">
          <Image src={speaker} alt="Awareness icon" className="w-6 h-6" />
          <p className="text-black font-bold text-md">
            {stageName && stageName}
          </p>
        </div>
      )}

      {edit ? (
        // Pass the onDelete callback to AwarenessEdit
        <AwarenessEdit
          onDelete={onDelete}
          stageName={stageName}
          sm_data={
            stageName &&
            updatedData?.channel_mix?.find(
              (ch: { funnel_stage?: string }) => ch?.funnel_stage === stageName
            )?.["social_media"]
          }
          dn_data={
            stageName &&
            updatedData?.channel_mix?.find(
              (ch) => ch?.funnel_stage === stageName
            )?.["display_networks"]
          }
          se_data={
            stageName &&
            updatedData?.channel_mix?.find(
              (ch) => ch?.funnel_stage === stageName
            )?.["search_engines"]
          }
          updatedData={updatedData}
          setUpdatedData={setUpdatedData}
          setEdit={setEdit}
          handleLoyaltyButtonClick={handleLoyaltyButtonClick}
          handlePlatformSelect={handlePlatformSelect}
          handleDropDownSelection={handleDropDownSelection}
        />
      ) : (
        <div className="mt-6 flex flex-col md:flex-row gap-8 overflow-x-auto w-full">
          {/* Social Media Section (Left) */}
          <div className="shrink-0 w-full md:w-fit">
            <h2 className="text-black font-bold text-md mb-4">Social Media</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["social_media"]?.map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[150px]"
                  >
                    {getPlatformIcon(item.platform_name) && (
                      <Image
                        src={getPlatformIcon(item.platform_name)}
                        alt={item.platform_name}
                        className="size-4"
                      />
                    )}
                    <p className="text-black text-center text-md">
                      {item.platform_name}
                    </p>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["social_media"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[150px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.buy_type}
                    </p>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["social_media"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[150px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.objective_type}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Display Network Section (Right) */}
          <div className="shrink-0 w-full md:w-fit">
            <h2 className="text-black font-bold text-md mb-4">
              Display Networks
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["display_networks"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                   {getPlatformIcon(item.platform_name) && (
                      <Image
                        src={getPlatformIcon(item.platform_name)}
                        alt={item.platform_name}
                        className="size-4"
                      />
                    )}
                    <p className="text-black text-center text-md">
                      {item.platform_name}
                    </p>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["display_networks"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.buy_type}
                    </p>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["display_networks"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.objective_type}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Search Engines Section (Right) */}
          <div className="shrink-0 w-full md:w-fit">
            <h2 className="text-black font-bold text-md mb-4">
              Search Engines
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["search_engines"].map((item) => (
                  <div
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                   {getPlatformIcon(item.platform_name) && (
                      <Image
                        src={getPlatformIcon(item.platform_name)}
                        alt={item.platform_name}
                        className="size-4"
                      />
                    )}
                    <p className="text-black text-center text-md">
                      {item.platform_name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["search_engines"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.buy_type}
                    </p>
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {campaignFormData?.channel_mix
                  ?.find((ch) => ch?.funnel_stage === stageName)
                ["search_engines"].map((item) => (
                  <a
                    key={item.platform_name}
                    // onClick={() => window.open(item.link, "_blank")}
                    className="flex bg-white px-4 py-3 whitespace-nowrap rounded-md border border-gray-200 items-center gap-2 shrink-0 w-[180px]"
                  >
                    <p className="text-black text-center text-md">
                      {item.objective_type}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Content Layout */}
    </div>
  );
};

export default Awareness;
