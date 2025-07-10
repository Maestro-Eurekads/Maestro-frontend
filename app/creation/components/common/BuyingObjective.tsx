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
import { removeKeysRecursively } from "utils/removeID";

// Default fallback data to ensure consistency during SSR
const defaultCampaignData = {
  funnel_stages: [],
  channel_mix: [],
};

const BuyingObjective = () => {
  const [edit, setEdit] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const {
    campaignFormData: rawCampaignFormData,
    setCampaignFormData,
    updateCampaign,
    getActiveCampaign,
    campaignData,
    setIsEditingBuyingObjective,
  } = useCampaigns();
  const campaignFormData = rawCampaignFormData || defaultCampaignData; // Fallback to default
  const [updatedData, setUpdatedData] = useState(null);
  const [filteredChannelMix, setFilteredChannelMix] = useState([]);
  const [isLoyalty, setIsLoyalty] = useState(false);
  const [showLoyaltyField, setShowLoyaltyField] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUpdatedData(campaignFormData);
    const filtered = getFilteredChannelMix(campaignFormData.channel_mix, campaignFormData.funnel_stages);
    setFilteredChannelMix(filtered);
  }, [rawCampaignFormData]);

  useEffect(() => {
    if (updatedData && isMounted) {
      const filtered = getFilteredChannelMix(updatedData.channel_mix, updatedData.funnel_stages);
      setFilteredChannelMix(filtered);
    }
  }, [updatedData]);

  const getFilteredChannelMix = (channelMix, funnelStages) => {
    if (!Array.isArray(channelMix)) return [];

    // Ensure all funnel stages are represented, even if channel_mix is incomplete
    const stageMap = funnelStages.map((stageName) => {
      const stage = channelMix.find((s) => s.funnel_stage === stageName) || {
        funnel_stage: stageName,
        social_media: [],
        display_networks: [],
        search_engines: [],
        streaming: [],
        ooh: [],
        print: [],
        in_game: [],
        e_commerce: [],
        broadcast: [],
        mobile: [],
        messaging: [],
      };
      return {
        ...stage,
        social_media: stage.social_media || [],
        display_networks: stage.display_networks || [],
        search_engines: stage.search_engines || [],
        streaming: stage.streaming || [],
        ooh: stage.ooh || [],
        print: stage.print || [],
        in_game: stage.in_game || [],
        e_commerce: stage.e_commerce || [],
        broadcast: stage.broadcast || [],
        mobile: stage.mobile || [],
        messaging: stage.messaging || [],
      };
    });

    // Filter stages with at least one platform
    return stageMap.filter(
      (stage) =>
        stage.social_media.length > 0 ||
        stage.display_networks.length > 0 ||
        stage.search_engines.length > 0 ||
        stage.streaming.length > 0 ||
        stage.ooh.length > 0 ||
        stage.print.length > 0 ||
        stage.in_game.length > 0 ||
        stage.e_commerce.length > 0 ||
        stage.broadcast.length > 0 ||
        stage.mobile.length > 0 ||
        stage.messaging.length > 0 ||
        funnelStages.includes(stage.funnel_stage) // Include even if no platforms, to show empty state
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
        funnel_stages: updatedData.funnel_stages.filter(
          (name: string) => name !== stageName
        ),
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
        updatedStage[category] = [
          ...(stage[category] || []),
          { platform_name: platformName },
        ];
        return updatedStage;
      }
      return stage;
    }) || [];

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
        updatedStage[category] = (stage[category] || []).map((platform) => {
          if (platform.platform_name === platformName) {
            return { ...platform, [dropDownName]: option };
          }
          return platform;
        });
        return updatedStage;
      }
      return stage;
    }) || [];

    setUpdatedData((prevData) => ({
      ...prevData,
      channel_mix: updatedChannelMix,
    }));
  };

  const handleDeleteLoyaltyStage = () => {
    setIsLoyalty(false);
    setShowLoyaltyField(false);
  };

  const closeEditStep = () => {
    setEdit(false);
    setSelectedStage("");
    setUpdatedData(null);
    setIsLoyalty(false);
    setShowLoyaltyField(false);
    setIsEditingBuyingObjective(false);
  };

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, [
      "id",
      "documentId",
      "createdAt",
      "publishedAt",
      "updatedAt",
      "_aggregated"
    ])
    : {};

  const handleConfirmStep = async () => {
    setLoading(true);

    try {
      // Set a timeout to ensure minimum loading time of 2 seconds
      const updatePromise = updateCampaign({
        ...cleanData,
        funnel_stages: updatedData?.funnel_stages,
        channel_mix: removeKeysRecursively(
          updatedData?.channel_mix,
          [
            "id",
            "isValidated",
            "formatValidated",
            "validatedStages",
            "documentId",
            "_aggregated"
          ],
          ["preview"]
        ),
        custom_funnels: updatedData?.custom_funnels,
        funnel_type: updatedData?.funnel_type,
      });

      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));

      // Wait for both the update and the minimum timeout
      await Promise.all([updatePromise, timeoutPromise]);
      await getActiveCampaign();

    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoading(false);
      closeEditStep();
    }
  };

  if (!isMounted) {
    return (
      <>
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
                <span className="text-white font-bold">1</span>
              </div>
              <h1 className="text-blue-500 font-semibold text-base">
                Your buying objectives and types
              </h1>
            </div>
            <Button
              text="Edit"
              variant="primary"
              className="!w-[85px] !h-[40px]"
              onClick={() => { }}
              disabled
            />
          </div>
          <div>Loading...</div>
        </div>
        <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
          2
        </div>
      </>
    );
  }

  const displayedData = edit ? updatedData : campaignFormData;

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-blue-500 justify-center items-center w-6 h-6">
            <span className="text-white font-bold">5</span>
          </div>
          <h1 className="text-blue-500 font-semibold text-base">
            Your buying objectives and types
          </h1>
        </div>
        {edit ? (
          <div className="flex items-center gap-[15px]">
            <Button
              text={loading ? "Loading..." : "Confirm Changes"}
              variant="primary"
              className="!w-[180px] !h-[40px] !rounded-[8px] !hover:ease-in-out"
              onClick={() => {
                !loading && handleConfirmStep();
              }}
              loading={loading}
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
                setIsEditingBuyingObjective(false);
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
              setIsEditingBuyingObjective(true);
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
          {campaignFormData?.custom_funnels
            ?.filter(
              (stageName) =>
                !campaignFormData?.funnel_stages?.includes(stageName?.name)
            )
            ?.map((stageName) => (
              <div
                key={stageName?.name}
                className="flex justify-between items-center mb-4"
              >
                <div>
                  <div
                    className={`${stageName?.name === "Conversion"
                        ? "bg-[#FF9037] cursor-pointer"
                        : stageName?.name === "Loyalty"
                          ? "bg-[#EF5407] cursor-pointer"
                          : stageName?.name === "Awareness"
                            ? "bg-[#0866FF]"
                            : stageName?.name === "Consideration"
                              ? "bg-[#00A36C]"
                              : stageName?.name === "Targeting and Retargeting"
                                ? "bg-[#6B7280]"
                                : "bg-[#FFF] text-[#000]"
                      } rounded-[10px] cursor-pointer`}
                    onClick={() => handleLoyaltyButtonClick(stageName?.name)}
                  >
                    <div className="w-full flex items-center justify-center gap-[16px] p-[24px]">
                      {stageName?.name === "Conversion" ? (
                        <Image src={creditWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Loyalty" ? (
                        <Image src={addPlusWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Awareness" ? (
                        <Image src={speakerWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Consideration" ? (
                        <Image src={zoomWhite} alt={stageName?.name} />
                      ) : stageName?.name === "Targeting and Retargeting" ? (
                        <Image src={zoomWhite} alt={stageName?.name} />
                      ) : (
                        ""
                      )}
                      <p className={`text-[18px] font-medium ${["Awareness", "Consideration", "Conversion", "Loyalty", "Targeting and Retargeting"].includes(stageName?.name) ? "text-[#FFF]" : "text-[#000]"}`}>
                        {stageName?.name}
                      </p>
                    </div>
                  </div>
                  {selectedStage === stageName?.name && (
                    <div className="flex flex-col gap-4 mt-4">
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
                      ].map((channel) => (
                        <div key={channel} className="flex items-center">
                          <span className="mb-2 font-medium capitalize w-[200px]">
                            {channel?.replace("_", " ")}
                          </span>
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
              </div>
            ))}
        </div>
      )}

      {filteredChannelMix.length > 0 ? (
        filteredChannelMix.map((stage, index) => {
          const stageName = stage.funnel_stage;
          const stageConfig = funnelStages?.find((s) => s?.name === stageName);
          const StageComponent = Awareness; // Fallback component
          return (
            <StageComponent
              key={stageName}
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
              stageData={stage}
            />
          );
        })
      ) : (
        <div>No platforms selected for the selected funnel stages. Please add platforms to continue.</div>
      )}
    </div>
  );
};

export default BuyingObjective;