import React, { useState } from "react";
import { Trash } from "lucide-react";
import Button from "./button";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import trade from "../../../../public/TheTradeDesk.svg";
import instagram from "../../../../public/ig.svg";
import quantcast from "../../../../public/quantcast.svg";
import arrowdown from "../../../../public/arrow-down-2.svg";
import vector from "../../../../public/Vector.svg";

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
import {
  campaignObjectives,
  getPlatformIcon,
} from "../../../../components/data";
import Select from "react-select";
import { useCampaigns } from "../../../utils/CampaignsContext";
import { ChannelSelector } from "./ChannelSelector";

const AwarenessEdit = ({
  onDelete,
  stageName,
  sm_data,
  dn_data,
  se_data,
  updatedData,
  setUpdatedData,
  setEdit,
  handleLoyaltyButtonClick,
  handlePlatformSelect,
  handleDropDownSelection,
}) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [values, setValues] = useState({});
  const { campaignFormData, setCampaignFormData, buyObj, buyType } =
    useCampaigns();
  const [showChannelSelect, setShowChannelSelect] = useState({
    "Social media": false,
    "Display networks": false,
    "Search engines": false,
  });
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

  const channelOptions = {
    "Social media": [
      { value: "Facebook", label: "Facebook", icon: facebook },
      { value: "Instagram", label: "Instagram", icon: ig },
      { value: "TikTok", label: "TikTok", icon: tictok },
      { value: "YouTube", label: "YouTube", icon: youtube },
      { value: "Twitter/X", label: "Twitter/X", icon: x },
      { value: "LinkedIn", label: "LinkedIn", icon: linkedin },
    ],
    "Display networks": [
      { value: "The Trade Desk", label: "The Trade Desk", icon: TheTradeDesk },
      { value: "Quantcast", label: "Quantcast", icon: Quantcast },
      { value: "Display & Video", label: "Display & Video", icon: Display },
    ],
    "Search engines": [
      { value: "Google", label: "Google", icon: google },
      { value: "Yahoo", label: "Yahoo", icon: yahoo },
      { value: "Bing", label: "Bing", icon: bing },
    ],
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
        if (category === "Social media") {
          updatedStage.social_media = stage.social_media.map((platform) => {
            if (platform.platform_name === platformName) {
              return {
                ...platform,
                [dropDownName]: option,
              };
            }
            return platform;
          });
        } else if (category === "Display networks") {
          updatedStage.display_networks = stage.display_networks.map(
            (platform) => {
              if (platform.platform_name === platformName) {
                return {
                  ...platform,
                  [dropDownName]: option,
                };
              }
              return platform;
            }
          );
        } else if (category === "Search engines") {
          updatedStage.search_engines = stage.search_engines.map((platform) => {
            if (platform.platform_name === platformName) {
              return {
                ...platform,
                [dropDownName]: option,
              };
            }
            return platform;
          });
        }
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
          if (category === "Social media") {
            updatedStage.social_media = [
              ...(stage.social_media || []),
              newPlatform,
            ];
          } else if (category === "Display networks") {
            updatedStage.display_networks = [
              ...(stage.display_networks || []),
              newPlatform,
            ];
          } else if (category === "Search engines") {
            updatedStage.search_engines = [
              ...(stage.search_engines || []),
              newPlatform,
            ];
          }
          return updatedStage;
        }
        return stage;
      });

      setUpdatedData((prev) => ({
        ...prev,
        channel_mix: updatedChannelMix,
      }));

      // Reset the select dropdown
      setShowChannelSelect((prev) => ({ ...prev, [category]: false }));
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
        if (category === "Social media") {
          updatedStage.social_media = stage.social_media.filter(
            (platform) => platform.platform_name !== platformName
          );
        } else if (category === "Display networks") {
          updatedStage.display_networks = stage.display_networks.filter(
            (platform) => platform.platform_name !== platformName
          );
        } else if (category === "Search engines") {
          updatedStage.search_engines = stage.search_engines.filter(
            (platform) => platform.platform_name !== platformName
          );
        }
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
      <div className="flex flex-col items-start gap-4 w-full flex-1">
        <h2 className="font-bold text-[#061237]">Social Media</h2>
        <div className="flex gap-4 w-full">
          <div className="flex justify-between gap-4 w-full">
            <div className="flex gap-4 items-start overflow-x-auto pb-4">
              {sm_data?.map((sm: any, index: number) => (
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
                          "Social media",
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
                          "Social media",
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
                          "Social media",
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
              {showChannelSelect["Social media"] ? (
                <Select
                  options={channelOptions["Social media"]}
                  onChange={(option) =>
                    handleChannelSelect(option, "Social media")
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
                  onClick={() =>
                    setShowChannelSelect((prev) => ({
                      ...prev,
                      "Social media": true,
                    }))
                  }
                  className="px-6 py-3 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap h-[52px]"
                >
                  Add Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Display Networks */}
      <div className="flex flex-col items-start gap-4 w-full">
        <h2 className="font-bold text-[#061237]">Display Networks</h2>
        <div className="flex gap-4 w-full h-full">
          <div className="flex justify-between gap-4 w-full">
            <div className="flex gap-4 items-start overflow-x-auto pb-4">
              {dn_data?.map((dn, index) => (
                <div
                  key={`${stageName}-dn-${index}`}
                  className="shrink-0 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                    <div className="flex items-center gap-2">
                      <Image
                        src={getPlatformIcon(dn?.platform_name)}
                        className="size-4"
                        alt="platform"
                      />
                      <span className="text-[#061237] font-semibold whitespace-nowrap">
                        {dn?.platform_name}
                      </span>
                    </div>
                    <Image
                      src={vector}
                      alt="vector"
                      className="cursor-pointer"
                      onClick={() =>
                        handleRemovePlatform(
                          dn?.platform_name,
                          "Display networks",
                          stageName
                        )
                      }
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <Select
                      options={buyObjectiveOptions}
                      value={buyObjectiveOptions.find(
                        (option) => option.value === dn?.objective_type
                      )}
                      onChange={(selectedOption) =>
                        handleSelectOption(
                          dn?.platform_name,
                          selectedOption?.value,
                          "Display networks",
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
                      value={buyTypeOptions.find(
                        (option) => option.value === dn?.buy_type
                      )}
                      onChange={(selectedOption) =>
                        handleSelectOption(
                          dn?.platform_name,
                          selectedOption?.value,
                          "Display networks",
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
              {showChannelSelect["Display networks"] ? (
                <Select
                  options={channelOptions["Display networks"]}
                  onChange={(option) =>
                    handleChannelSelect(option, "Display networks")
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
                  onClick={() =>
                    setShowChannelSelect((prev) => ({
                      ...prev,
                      "Display networks": true,
                    }))
                  }
                  className="px-6 py-3 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap h-[52px]"
                >
                  Add Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Engines */}
      <div className="flex flex-col items-start gap-4 w-full">
        <h2 className="font-bold text-[#061237]">Search Engines</h2>
        <div className="flex gap-4 w-full h-full">
          <div className="flex justify-between gap-4 w-full">
            <div className="flex gap-4 items-start overflow-x-auto pb-4">
              {se_data?.map((se, index) => (
                <div
                  key={`${stageName}-se-${index}`}
                  className="shrink-0 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-center bg-[#FFFFFF] rounded-[10px] border border-solid border-[#0000001A] h-[52px] px-4 gap-[20px] shrink-0 w-fit">
                    <div className="flex items-center gap-2">
                      <Image
                        src={getPlatformIcon(se?.platform_name)}
                        className="size-4"
                        alt="platform"
                      />
                      <span className="text-[#061237] font-semibold whitespace-nowrap">
                        {se?.platform_name}
                      </span>
                    </div>
                    <Image
                      src={vector}
                      alt="vector"
                      className="cursor-pointer"
                      onClick={() =>
                        handleRemovePlatform(
                          se?.platform_name,
                          "Search engines",
                          stageName
                        )
                      }
                    />
                  </div>
                  <div className="flex gap-4 items-center">
                    <Select
                      options={buyObjectiveOptions}
                      value={buyObjectiveOptions.find(
                        (option) => option.value === se?.objective_type
                      )}
                      onChange={(selectedOption) =>
                        handleSelectOption(
                          se?.platform_name,
                          selectedOption?.value,
                          "Search engines",
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
                      value={buyTypeOptions.find(
                        (option) => option.value === se?.buy_type
                      )}
                      onChange={(selectedOption) =>
                        handleSelectOption(
                          se?.platform_name,
                          selectedOption?.value,
                          "Search engines",
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
              {showChannelSelect["Search engines"] ? (
                <Select
                  options={channelOptions["Search engines"]}
                  onChange={(option) =>
                    handleChannelSelect(option, "Search engines")
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
                  onClick={() =>
                    setShowChannelSelect((prev) => ({
                      ...prev,
                      "Search engines": true,
                    }))
                  }
                  className="px-6 py-3 bg-[#3175FF] text-white rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap h-[52px]"
                >
                  Add Channel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessEdit;
