import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";
import vector from "../../../../public/Vector.svg";
import speaker from "../../../../public/mdi_megaphone.svg";
import {
  campaignObjectives,
  getPlatformIcon,
  platformIcons,
} from "../../../../components/data";
import Select from "react-select";
import { useCampaigns } from "../../../utils/CampaignsContext";
import { ChannelSelector } from "./ChannelSelector";

const AwarenessEdit = ({
  onDelete,
  stageName,
  updatedData,
  setUpdatedData,
  setEdit,
  handleLoyaltyButtonClick,
  handlePlatformSelect,
  handleDropDownSelection,
  stageData,
}) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [values, setValues] = useState({});
  const {
    campaignFormData,
    setCampaignFormData,
    buyObj,
    buyType,
    platformList,
  } = useCampaigns();
  const [showChannelSelect, setShowChannelSelect] = useState("");
  const buyObjectiveOptions =
    buyObj?.map((obj) => ({
      label: obj?.text,
      value: obj?.text,
    })) || [];

  const buyTypeOptions =
    buyType?.map((obj) => ({
      label: obj?.text,
      value: obj?.text,
    })) || [];

  const platformListMerge = {
    ...platformList?.offline,
    ...platformList?.online,
  };

  const handleAddBack = () => {
    setIsDeleted(false);
  };

  if (isDeleted) {
    return (
      <button
        onClick={handleAddBack}
        className="w-full py-4 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Add Awareness Stage
      </button>
    );
  }

  // const buyObjectiveOptions = [
  //   { value: "Awareness", label: "Awareness" },
  //   { value: "Traffic", label: "Traffic" },
  //   { value: "Purchase", label: "Purchase" },
  // ];

  const handleSelectOption = (
    platformName: string,
    option: string,
    category: string,
    stageName: string,
    dropDownName: string
  ) => {
    const updatedChannelMix = updatedData.channel_mix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };

        updatedStage[category] = stage[category].map((platform) => {
          if (platform.platform_name === platformName) {
            return {
              ...platform,
              [dropDownName]: option,
            };
          }
          return platform;
        });

        return updatedStage;
      }
      return stage;
    });

    setUpdatedData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));
  };

  const handleChannelSelect = (selectedOption, category) => {
    if (selectedOption) {
      // Create a new platform object
      const newPlatform = {
        platform_name: selectedOption.value,
        objective_type: "",
        buy_type: "",
      };

      // Update the channel mix with the new platform
      const updatedChannelMix = updatedData.channel_mix.map((stage) => {
        if (stage.funnel_stage === stageName) {
          const updatedStage = { ...stage };

          updatedStage[category] = [...(stage[category] || []), newPlatform];

          return updatedStage;
        }
        return stage;
      });

      setUpdatedData((prev) => ({
        ...prev,
        channel_mix: updatedChannelMix,
      }));

      // Reset the select dropdown
      setShowChannelSelect(category);
    }
  };

  const handleRemoveStage = (stageName) => {
    if (
      !updatedData ||
      !updatedData?.funnel_stages ||
      !updatedData?.channel_mix
    ) {
      return;
    }

    // Remove the stage from funnel_stages
    const updatedFunnelStages = updatedData?.funnel_stages.filter(
      (stage) => stage !== stageName
    );

    // Remove all channel data associated with the stage
    const updatedChannelMix = updatedData?.channel_mix.filter(
      (stage) => stage?.funnel_stage !== stageName
    );

    // Update state safely
    setUpdatedData((prev) => ({
      ...prev,
      funnel_stages: updatedFunnelStages,
      channel_mix: updatedChannelMix,
    }));
    setCampaignFormData((prev) => ({
      ...prev,
      funnel_stages: updatedFunnelStages,
      channel_mix: updatedChannelMix,
    }));
  };

  const handleRemovePlatform = (
    platformName: string,
    category: string,
    stageName: string
  ) => {
    const updatedChannelMix = updatedData.channel_mix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage };
        updatedStage[category] = stage[category].filter(
          (platform) => platform.platform_name !== platformName
        );
        return updatedStage;
      }
      return stage;
    });

    setUpdatedData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }));
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "white",
      padding: "4px",
      border: "1px solid #D1D5DB",
      borderRadius: "0.8rem",
      cursor: "pointer",
      minWidth: "150px",
      width: "100%",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      width: "auto",
      minWidth: "150px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
    }),
  };

  const formatOptionLabel = ({ value, label, icon }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Image src={icon} alt={label} width={16} height={16} />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="flex items-start flex-col gap-6">
      {/* Awareness */}
      <div className="flex justify-between w-full">
        <div className="flex items-center gap-4">
          <Image src={speaker} alt="speaker" className="size-5" />
          <span className="text-lg leading-wider text-[#061237] font-semibold">
            {stageName}
          </span>
        </div>

        <Button
          variant="danger"
          text="Delete this stage"
          icon={Trash}
          onClick={() => handleRemoveStage(stageName)}
          className="!rounded-full !px-4 !py-4 !text-white !w-[167px] !h-[31px]"
        />
      </div>

      {/* social media */}
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
      ].map((channel) => {
        if (stageData[channel]?.length === 0) return null;
        return (
          <div
            key={channel}
            className="flex flex-col items-start gap-4 w-full flex-1"
          >
            <h2 className="font-bold text-[#061237] capitalize">
              {channel?.replace("_", " ")}
            </h2>
            <div className="flex gap-4 w-full">
              <div className="flex justify-between gap-4 w-full">
                <div className="flex gap-4 items-start overflow-x-auto pb-4">
                  {stageData[channel]?.map((sm: any, index: number) => (
                    <div
                      key={`${stageName}-sm-${index}`}
                      className="shrink-0 flex flex-col gap-4"
                    >
                      <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(sm?.platform_name) && (
                            <Image
                              src={getPlatformIcon(sm?.platform_name)}
                              className="size-4"
                              alt="platform"
                            />
                          )}
                          <span className="text-[#061237] font-semibold whitespace-nowrap">
                            {sm?.platform_name}
                          </span>
                        </div>
                        <Image
                          src={vector}
                          alt="vector"
                          className="cursor-pointer"
                          onClick={() =>
                            handleRemovePlatform(
                              sm?.platform_name,
                              channel,
                              stageName
                            )
                          }
                        />
                      </div>
                      <div className="flex gap-4 items-center">
                        <Select
                          options={buyObjectiveOptions}
                          value={buyObjectiveOptions?.find(
                            (option) => option.value === sm?.objective_type
                          )}
                          onChange={(selectedOption) =>
                            handleSelectOption(
                              sm?.platform_name,
                              selectedOption?.value,
                              channel,
                              stageName,
                              "objective_type"
                            )
                          }
                          placeholder="Buy Objective"
                          styles={customSelectStyles}
                          menuPosition="fixed"
                          menuPlacement="auto"
                          menuPortalTarget={document.body}
                        />
                      </div>
                      <div className="flex gap-4 items-center">
                        <Select
                          options={buyTypeOptions}
                          value={buyTypeOptions?.find(
                            (option) => option.value === sm?.buy_type
                          )}
                          onChange={(selectedOption) =>
                            handleSelectOption(
                              sm?.platform_name,
                              selectedOption?.value,
                              channel,
                              stageName,
                              "buy_type"
                            )
                          }
                          placeholder="Buy Type"
                          styles={customSelectStyles}
                          menuPosition="fixed"
                          menuPlacement="auto"
                          menuPortalTarget={document.body}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  {showChannelSelect === channel ? (
                    <Select
                      options={platformListMerge[channel]?.map((list) => ({
                        label: list?.platform_name,
                        value: list?.platform_name,
                        icon: getPlatformIcon(list?.platform_name),
                      }))}
                      onChange={(option) =>
                        handleChannelSelect(option, [channel])
                      }
                      placeholder="Select Channel"
                      styles={customSelectStyles}
                      formatOptionLabel={formatOptionLabel}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      menuPortalTarget={document.body}
                    />
                  ) : (
                    <button
                      onClick={() => setShowChannelSelect(channel)}
                      className="px-6 py-3 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap h-[52px]"
                    >
                      Add Channel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AwarenessEdit;
