"use client";
import Button from "./button";
import Awareness from "./Awareness";
import { Plus, Trash } from "lucide-react";
import creditWhite from "../../../../public/mdi_credit-cardwhite.svg";
import zoomWhite from "../../../../public/tabler_zoom-filledwhite.svg";
import speakerWhite from "../../../../public/mdi_megaphonewhite.svg";
import addPlusWhite from "../../../../public/addPlusWhite.svg";
import Image from "next/image";
import { useCampaigns } from "../../../utils/CampaignsContext";
import { funnelStages } from "../../../../components/data";
import { ChannelSelector } from "./ChannelSelector";
import { useEffect, useState } from "react";

// Default fallback data to ensure consistency during SSR
const defaultCampaignData = {
  funnel_stages: [],
  channel_mix: [],
};

const BuyingObjective = () => {
  const [edit, setEdit] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const { campaignFormData: rawCampaignFormData, setCampaignFormData } = useCampaigns();
  const campaignFormData = rawCampaignFormData || defaultCampaignData; // Fallback to default
  const [updatedData, setUpdatedData] = useState(null);
  const [filteredChannelMix, setFilteredChannelMix] = useState([]);
  const [isLoyalty, setIsLoyalty] = useState(false);
  const [showLoyaltyField, setShowLoyaltyField] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("Initial campaignFormData:", campaignFormData); // Debug initial data
    setUpdatedData(campaignFormData);
    const filtered = getFilteredChannelMix(campaignFormData.channel_mix);
    console.log("Initial filteredChannelMix:", filtered); // Debug filtered data
    setFilteredChannelMix(filtered);
  }, [campaignFormData]);

  useEffect(() => {
    if (updatedData && isMounted) {
      const filtered = getFilteredChannelMix(updatedData.channel_mix);
      console.log("Updated filteredChannelMix:", filtered); // Debug updated data
      setFilteredChannelMix(filtered);
    }
  }, [updatedData]);

  const getFilteredChannelMix = (channelMix) => {
    if (!Array.isArray(channelMix)) return [];
    return channelMix
      .map((stage) => {
        const filteredStage = { ...stage };
        filteredStage.social_media = stage.social_media?.filter(
          (platform) => platform.buy_type && platform.objective_type
        ) || [];
        filteredStage.display_networks = stage.display_networks?.filter(
          (platform) => platform.buy_type && platform.objective_type
        ) || [];
        filteredStage.search_engines = stage.search_engines?.filter(
          (platform) => platform.buy_type && platform.objective_type
        ) || [];
        return filteredStage;
      })
      .filter(
        (stage) =>
          stage.social_media.length > 0 ||
          stage.display_networks.length > 0 ||
          stage.search_engines.length > 0
      );
  };

  const handleLoyaltyButtonClick = (stageName?: string) => {
    if (!stageName) {
      setIsLoyalty(true);
      return;
    }
    setSelectedStage(stageName);
    const updatedFunnels = updatedData?.funnel_stages?.includes(stageName)
      ? {
          ...updatedData,
          funnel_stages: updatedData.funnel_stages.filter((name: string) => name !== stageName),
        }
      : {
          ...updatedData,
          funnel_stages: [...(updatedData?.funnel_stages || []), stageName],
          channel_mix: [
            ...(updatedData?.channel_mix || []),
            {
              funnel_stage: stageName,
              social_media: [],
              display_networks: [],
              search_engines: [],
            },
          ],
        };
    setUpdatedData(updatedFunnels);
  };

  const handlePlatformSelect = (stageName, category, platformName) => {
    const updatedChannelMix = updatedData?.channel_mix?.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        if (category === "Social media") {
          updatedStage.social_media = [
            ...stage.social_media,
            { platform_name: platformName },
          ];
        } else if (category === "Display networks") {
          updatedStage.display_networks = [
            ...stage.display_networks,
            { platform_name: platformName },
          ];
        } else if (category === "Search engines") {
          updatedStage.search_engines = [
            ...stage.search_engines,
            { platform_name: platformName },
          ];
        }
        return updatedStage;
      }
      return stage;
    });

    setUpdatedData((prevData) => ({
      ...prevData,
      channel_mix: updatedChannelMix,
    }));
  };

  const handleDropDownSelection = (
    stageName,
    category,
    platformName,
    dropDownName,
    option
  ) => {
    const updatedChannelMix = updatedData?.channel_mix?.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        if (category === "Social media") {
          updatedStage.social_media = stage.social_media.map((platform) => {
            if (platform.platform_name === platformName) {
              return { ...platform, [dropDownName]: option };
            }
            return platform;
          });
        } else if (category === "Display networks") {
          updatedStage.display_networks = stage.display_networks.map((platform) => {
            if (platform.platform_name === platformName) {
              return { ...platform, [dropDownName]: option };
            }
            return platform;
          });
        } else if (category === "Search engines") {
          updatedStage.search_engines = stage.search_engines.map((platform) => {
            if (platform.platform_name === platformName) {
              return { ...platform, [dropDownName]: option };
            }
            return platform;
          });
        }
        return updatedStage;
      }
      return stage;
    });
    setUpdatedData((prevData) => ({
      ...prevData,
      channel_mix: updatedChannelMix,
    }));
  };

  const handleDeleteLoyaltyStage = () => {
    setIsLoyalty(false);
    setShowLoyaltyField(false);
  };

  if (!isMounted) {
    return (
      <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
              <span className="text-white font-bold">2</span>
            </div>
            <h1 className="text-blue-500 font-semibold text-base">
              Your buying objectives and types
            </h1>
          </div>
          <Button
            text="Edit"
            variant="primary"
            className="!w-[85px] !h-[40px]"
            onClick={() => {}}
            disabled
          />
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  const displayedData = edit ? updatedData : campaignFormData;

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
            <span className="text-white font-bold">2</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">
            Your buying objectives and types
          </h1>
        </div>
        {edit ? (
          <div className="flex items-center gap-[15px]">
            <Button
              text="Confirm Changes"
              variant="primary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={() => {
                setEdit(false);
                setCampaignFormData(updatedData);
                setSelectedStage("");
                setUpdatedData(null);
                setIsLoyalty(false);
                setShowLoyaltyField(false);
              }}
            />
            <Button
              text="Cancel"
              variant="secondary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={() => {
                setUpdatedData(null);
                setSelectedStage("");
                setIsLoyalty(false);
                setShowLoyaltyField(false);
                setEdit(false);
              }}
            />
          </div>
        ) : (
          <Button
            text="Edit"
            variant="primary"
            className="!w-[85px] !h-[40px]"
            onClick={() => {
              setEdit(true);
              setUpdatedData(campaignFormData);
            }}
          />
        )}
      </div>

      {edit && (
        <div className="mb-4">
          <Button
            variant="primary"
            text="Add new stage"
            icon={Plus}
            onClick={() => handleLoyaltyButtonClick()}
            className="!rounded-full !px-4 !py-4 !text-white !w-[167px] !h-[31px]"
          />
        </div>
      )}

      {edit && isLoyalty && (
        <div className="bg-gray-200 p-4 rounded-lg mt-4">
          {funnelStages.map((stageName, stageIndex) => {
            const stage = !campaignFormData?.funnel_stages?.includes(stageName?.name);
            if (!stage) return null;
            return (
              <div key={stageIndex} className="flex justify-between items-center mb-4">
                <div>
                  <div
                    className={`${
                      stageName?.name === "Conversion"
                        ? "bg-[#FF9037] cursor-pointer"
                        : stageName?.name === "Loyalty"
                        ? "bg-[#EF5407] cursor-pointer"
                        : stageName?.name === "Awareness"
                        ? "bg-[#0866FF]"
                        : stageName?.name === "Consideration"
                        ? "bg-[#00A36C]"
                        : ""
                    } rounded-[10px]`}
                    onClick={() => handleLoyaltyButtonClick(stageName?.name)}
                  >
                    <div className="flex items-center justify-center gap-[16px] p-[24px]">
                      {stageName?.name === "Conversion" ? (
                        <Image src={creditWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Loyalty" ? (
                        <Image src={addPlusWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Awareness" ? (
                        <Image src={speakerWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Consideration" ? (
                        <Image src={zoomWhite} alt={stageName?.name} />
                      ) : (
                        ""
                      )}
                      <p className="text-[18px] font-medium text-white">{stageName?.name}</p>
                    </div>
                  </div>
                  {selectedStage === stageName?.name && showLoyaltyField && (
                    <div className="flex gap-4 mt-4">
                      {["Social media", "Display networks", "Search engines"].map((channel) => (
                        <div key={channel} className="flex flex-col items-center">
                          <span className="mb-2 font-medium">{channel}</span>
                          <ChannelSelector
                            stageName={stageName?.name}
                            channelName={channel}
                            handlePlatformSelect={handlePlatformSelect}
                            handleDropDownSelection={handleDropDownSelection}
                            hideSelectAfterSelection={false}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  text="Delete this stage"
                  icon={Trash}
                  variant="danger"
                  className="!rounded-full !px-4 !py-4 !text-white !w-[167px] !h-[31px]"
                  onClick={handleDeleteLoyaltyStage}
                />
              </div>
            );
          })}
        </div>
      )}

      {filteredChannelMix.length > 0 ? (
        filteredChannelMix.map((stage, index) => {
          const stageName = stage.funnel_stage;
          const stageConfig = funnelStages?.find((s) => s?.name === stageName);
          if (!stageConfig) return null;
          const StageComponent = Awareness;
          return (
            <StageComponent
              key={stageName} // Use stageName as key for stability
              edit={edit}
              setEdit={setEdit}
              stageName={stageName}
              updatedData={{
                ...displayedData,
                channel_mix: filteredChannelMix,
              }}
              setUpdatedData={setUpdatedData}
              handleLoyaltyButtonClick={handleLoyaltyButtonClick}
              handlePlatformSelect={handlePlatformSelect}
              handleDropDownSelection={handleDropDownSelection}
              onDelete={undefined}
            />
          );
        })
      ) : (
        <div>No validated platforms available.</div>
      )}
    </div>
  );
};

export default BuyingObjective;