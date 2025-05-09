"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import zoom from "../../../public/tabler_zoom-filled.svg";
import credit from "../../../public/mdi_credit-card.svg";
import addPlus from "../../../public/addPlus.svg";
import creditWhite from "../../../public/mdi_credit-cardwhite.svg";
import zoomWhite from "../../../public/tabler_zoom-filledwhite.svg";
import speakerWhite from "../../../public/mdi_megaphonewhite.svg";
import addPlusWhite from "../../../public/addPlusWhite.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { PlusIcon, Edit2, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import customicon from "../../../public/social/customicon.png";

const MapFunnelStages = () => {
  const {
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    setCampaignFormData,
  } = useCampaigns();
  const [previousValidationState, setPreviousValidationState] = useState(null);
  const { setIsDrawerOpen, setClose } = useComments();
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = React.useState<number | null>(null);
  const [alert, setAlert] = useState(null);
  const { verifyStep, setHasChanges, hasChanges, setverifybeforeMove } =
    useVerification();
  const [selectedOption, setSelectedOption] = useState<string | null>("");

  // Store previous selections for each option type
  const [savedSelections, setSavedSelections] = useState({
    custom: {
      funnel_stages: [],
      channel_mix: [],
    },
    targeting_retargeting: {
      funnel_stages: ["Targeting", "Retargeting"],
      channel_mix: [
        { funnel_stage: "Targeting" },
        { funnel_stage: "Retargeting" },
      ],
    },
  });

  // Default funnel stages for Custom option
  const defaultFunnels = [
    {
      id: "Awareness",
      name: "Awareness",
      icon: speaker,
      activeIcon: speakerWhite,
      color: "bg-blue-500",
    },
    {
      id: "Consideration",
      name: "Consideration",
      icon: zoom,
      activeIcon: zoomWhite,
      color: "bg-green-500",
    },
    {
      id: "Conversion",
      name: "Conversion",
      icon: credit,
      activeIcon: creditWhite,
      color: "bg-orange-500 border border-orange-500",
    },
    {
      id: "Loyalty",
      name: "Loyalty",
      icon: addPlus,
      activeIcon: addPlusWhite,
      color: "bg-red-500 border border-red-500",
    },
  ];

  // Funnel stages for Targeting-Retargeting option with fixed icons
  const targetingRetargetingFunnels = [
    {
      id: "Targeting",
      name: "Targeting",
      icon: zoom, // Fixed icon for Targeting
      activeIcon: zoomWhite,
      color: "bg-blue-500",
    },
    {
      id: "Retargeting",
      name: "Retargeting",
      icon: credit, // Fixed icon for Retargeting
      activeIcon: creditWhite,
      color: "bg-green-500",
    },
  ];

  // State for custom funnels and modal
  const [customFunnels, setCustomFunnels] = useState(defaultFunnels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  useEffect(() => {
    const isValid =
      Array.isArray(campaignData?.funnel_stages) &&
      campaignData.funnel_stages.length > 0;
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignData, cId, verifyStep]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Initialize from campaignData
  useEffect(() => {
    const initialOption = campaignData?.funnel_type || "";
    setSelectedOption(initialOption);

    if (initialOption === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);
      setCampaignFormData((prev) => ({
        ...prev,
        custom_funnels: targetingRetargetingFunnels, // Use fixed icons for Targeting/Retargeting
        funnel_stages: ["Targeting", "Retargeting"],
        channel_mix: [
          { funnel_stage: "Targeting" },
          { funnel_stage: "Retargeting" },
        ],
      }));
    } else if (
      campaignData?.custom_funnels &&
      campaignData.custom_funnels.length > 0
    ) {
      setCustomFunnels(campaignData.custom_funnels);
    } else {
      setCustomFunnels(defaultFunnels);
    }

    if (campaignData?.funnel_stages) {
      if (initialOption === "custom") {
        setSavedSelections((prev) => ({
          ...prev,
          custom: {
            funnel_stages: campaignData.funnel_stages || [],
            channel_mix: campaignData.channel_mix || [],
          },
        }));
      } else if (initialOption === "targeting_retargeting") {
        setSavedSelections((prev) => ({
          ...prev,
          targeting_retargeting: {
            funnel_stages: ["Targeting", "Retargeting"],
            channel_mix: [
              { funnel_stage: "Targeting" },
              { funnel_stage: "Retargeting" },
            ],
          },
        }));
      }
    }
  }, [campaignData]);

  // Update campaignFormData when customFunnels or selectedOption change
  useEffect(() => {
    setCampaignFormData((prev) => ({
      ...prev,
      custom_funnels:
        selectedOption === "custom" ? customFunnels : targetingRetargetingFunnels,
    }));
    setHasChanges(true);
  }, [customFunnels, selectedOption, setCampaignFormData]);

  const handleSelect = (id: string) => {
    setHasChanges(true);

    // Check if this would unselect the last selected funnel
    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData?.funnel_stages?.length === 1
    ) {
      toast.error("You can't unselect all funnel stages at least one", {
        duration: 3000,
      });
      return;
    }

    const newFunnelStages = campaignFormData?.funnel_stages
      ? campaignFormData.funnel_stages.includes(id)
        ? campaignFormData.funnel_stages.filter((name: string) => name !== id)
        : [...campaignFormData.funnel_stages, id]
      : [id];

    let newChannelMix = [...(campaignFormData?.channel_mix || [])];

    if (campaignFormData?.funnel_stages?.includes(id)) {
      newChannelMix = newChannelMix.filter((ch: any) => ch?.funnel_stage !== id);
    } else {
      newChannelMix.push({ funnel_stage: id });
    }

    setCampaignFormData({
      ...campaignFormData,
      funnel_stages: newFunnelStages,
      channel_mix: newChannelMix,
    });

    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: newFunnelStages,
        channel_mix: newChannelMix,
      },
    }));
  };

  const handleOptionChange = (option: string) => {
    if (selectedOption) {
      setSavedSelections((prev) => ({
        ...prev,
        [selectedOption]: {
          funnel_stages: campaignFormData?.funnel_stages || [],
          channel_mix: campaignData?.channel_mix || [],
        },
      }));
    }

    setSelectedOption(option);

    const newFormData = {
      ...campaignFormData,
      funnel_type: option,
    };

    if (option === "targeting_retargeting") {
      newFormData.funnel_stages = ["Targeting", "Retargeting"];
      newFormData.channel_mix = [
        { funnel_stage: "Targeting" },
        { funnel_stage: "Retargeting" },
      ];
      newFormData.custom_funnels = targetingRetargetingFunnels; // Use fixed icons
      setCustomFunnels(targetingRetargetingFunnels);
    } else if (option === "custom") {
      newFormData.funnel_stages = savedSelections.custom.funnel_stages;
      newFormData.channel_mix = savedSelections.custom.channel_mix;
      newFormData.custom_funnels = customFunnels;
      setCustomFunnels(defaultFunnels);
    }

    setCampaignFormData(newFormData);
    setHasChanges(true);
  };

  // Close modal when clicking outside
  const modalRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleAddFunnel = (name: string) => {
    if (!name.trim()) {
      toast("Funnel name cannot be empty", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }
    if (name.trim().length < 2) {
      toast("Funnel name cannot be less than 2 characters", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }
    if (!/[a-zA-Z]/.test(name)) {
      toast("Funnel name must include at least one alphabet", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }
    if (
      customFunnels.some(
        (funnel) => funnel.name?.toLowerCase() === name?.toLowerCase()
      )
    ) {
      toast("A funnel with this name already exists", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }

    const colorPalette = [
      "bg-orange-500 border border-orange-500",
      "bg-green-500",
      "bg-red-500 border border-red-500",
      "bg-blue-500",
    ];
    const newFunnel = {
      id: name,
      name: name,
      color: colorPalette[customFunnels.length % colorPalette.length],
      icon: customicon, // Use customicon for new custom funnels only
      activeIcon: customicon,
    };

    const updatedFunnels = [...customFunnels, newFunnel];
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev) => ({
      ...prev,
      custom_funnels: updatedFunnels,
    }));

    setHasChanges(true);
  };

  const handleEditFunnel = (oldId: string, newName: string) => {
    if (!newName.trim()) {
      toast("Funnel name cannot be empty", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }

    if (
      customFunnels.some(
        (funnel) =>
          funnel.name?.toLowerCase() === newName?.toLowerCase() &&
          funnel.name !== oldId
      )
    ) {
      toast("A funnel with this name already exists", {
        style: {
          background: "red",
          color: "white",
          textAlign: "center",
        },
        duration: 3000,
      });
      return;
    }

    const updatedFunnels = customFunnels.map((f) =>
      f.name === oldId ? { ...f, name: newName, id: newName } : f
    );
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev) => {
      const updatedFormData = {
        ...prev,
        custom_funnels: updatedFunnels,
      };

      if (prev.funnel_stages?.includes(oldId)) {
        updatedFormData.funnel_stages = prev.funnel_stages.map(
          (stage: string) => (stage === oldId ? newName : stage)
        );
      }

      if (prev.channel_mix?.some((ch: any) => ch.funnel_stage === oldId)) {
        updatedFormData.channel_mix = prev.channel_mix.map((ch: any) =>
          ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
        );
      }

      return updatedFormData;
    });

    setSavedSelections((prev) => {
      const updatedCustomSelections = { ...prev.custom };

      if (updatedCustomSelections.funnel_stages.includes(oldId)) {
        updatedCustomSelections.funnel_stages =
          updatedCustomSelections.funnel_stages.map((stage: string) =>
            stage === oldId ? newName : stage
          );
      }

      if (
        updatedCustomSelections.channel_mix.some(
          (ch: any) => ch.funnel_stage === oldId
        )
      ) {
        updatedCustomSelections.channel_mix =
          updatedCustomSelections.channel_mix.map((ch: any) =>
            ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
          );
      }

      return {
        ...prev,
        custom: updatedCustomSelections,
      };
    });

    setHasChanges(true);
  };

  const handleRemoveFunnel = (id: string) => {
    if (customFunnels.length <= 1) {
      setAlert({
        variant: "error",
        message: "You must have at least one funnel stage",
        position: "bottom-right",
      });
      return;
    }

    const updatedFunnels = customFunnels.filter((f) => f.name !== id);
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev) => {
      const updatedFunnelStages = (prev.funnel_stages || []).filter(
        (name: string) => name !== id
      );
      const updatedChannelMix = (prev.channel_mix || []).filter(
        (ch: any) => ch?.funnel_stage !== id
      );

      const updatedFormData = {
        ...prev,
        custom_funnels: updatedFunnels,
        funnel_stages: updatedFunnelStages,
        channel_mix: updatedChannelMix,
      };

      return updatedFormData;
    });

    setSavedSelections((prev) => {
      const updatedCustomSelections = {
        funnel_stages: prev.custom.funnel_stages.filter(
          (stage: string) => stage !== id
        ),
        channel_mix: prev.custom.channel_mix.filter(
          (ch: any) => ch?.funnel_stage !== id
        ),
      };

      return {
        ...prev,
        custom: updatedCustomSelections,
      };
    });

    setHasChanges(true);
  };

  const handleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className={"text-[22px]"}
          t1={
            "How many funnel stage(s) would you like to activate to achieve your objective ?"
          }
        />
      </div>
      <div className="mt-[56px] flex items-center gap-[32px]">
        {[
          { id: "targeting_retargeting", label: "Targeting - Retargeting" },
          { id: "custom", label: "Custom" },
        ].map((option) => (
          <label
            key={option.id}
            className="cursor-pointer flex items-center gap-3"
          >
            <input
              type="radio"
              name="funnel_selection"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => handleOptionChange(option.id)}
              className="w-4 h-4"
            />
            <p className="font-semibold">{option.label}</p>
          </label>
        ))}
      </div>

      {selectedOption === "targeting_retargeting" && (
        <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
          {targetingRetargetingFunnels.map((funnel, index) => {
            const isSelected = campaignFormData.funnel_stages?.includes(
              funnel.name
            );
            return (
              <div key={funnel.id} className="relative w-full max-w-[685px]">
                <button
                  className={`cursor-pointer w-full ${
                    isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                  } rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200`}
                  onClick={() => handleSelect(funnel.name)}
                  onMouseEnter={() => setHovered(index + 1)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Image
                    src={isSelected ? funnel.activeIcon : funnel.icon}
                    alt={`${funnel.name} icon`}
                    width={24}
                    height={24}
                  />
                  <p className="text-[16px]">{funnel.name}</p>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedOption === "custom" && (
        <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
          {customFunnels.map((funnel, index) => {
            const isSelected = campaignFormData.funnel_stages?.includes(
              funnel.name
            );
            return (
              <div
                key={`${funnel.id}-${index}`}
                className="relative w-full max-w-[685px]"
              >
                <button
                  className={`cursor-pointer w-full ${
                    isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                  } rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200`}
                  onClick={() => handleSelect(funnel.name)}
                  onMouseEnter={() => setHovered(index + 1)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <Image
                    src={isSelected ? funnel.activeIcon : funnel.icon}
                    alt={`${funnel.name} icon`}
                    width={24}
                    height={24}
                  />
                  <p className="text-[16px]">{funnel.name}</p>
                </button>

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    className="p-1 bg-white rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalMode("edit");
                      setCurrentFunnel(funnel);
                      setNewFunnelName(funnel.name);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-1 bg-white rounded-full shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFunnel(funnel.name);
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            className="flex items-center gap-2 text-blue-500 cursor-pointer text-[16px]"
            onClick={() => {
              setModalMode("add");
              setCurrentFunnel(null);
              setNewFunnelName("");
              setIsModalOpen(true);
            }}
          >
            <PlusIcon className="text-blue-500" />
            Add new funnel
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalMode === "add" ? "Add New Funnel" : "Edit Funnel"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="funnelName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="funnelName"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter funnel name"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalMode === "add") {
                    handleAddFunnel(newFunnelName);
                  } else if (currentFunnel) {
                    handleEditFunnel(currentFunnel.name, newFunnelName);
                  }
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {modalMode === "add" ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFunnelStages;