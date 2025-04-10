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

const MapFunnelStages = () => {
  const { updateCampaign, campaignData, campaignFormData, cId, setCampaignFormData } = useCampaigns();
  const [previousValidationState, setPreviousValidationState] = useState(null);
  const { setIsDrawerOpen, setClose } = useComments();
  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = React.useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const { verifyStep, setHasChanges, hasChanges, setverifybeforeMove } = useVerification();
  const [selectedOption, setSelectedOption] = useState("targeting_retargeting");

  // Store previous selections for each option type
  const [savedSelections, setSavedSelections] = useState({
    custom: {
      funnel_stages: [],
      channel_mix: [],
    },
    targeting_retargeting: {
      funnel_stages: ["Targeting", "Retargeting"],
      channel_mix: [{ funnel_stage: "Targeting" }, { funnel_stage: "Retargeting" }],
    },
  });

  // Default funnel stages
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

  // Add these state variables
  const [customFunnels, setCustomFunnels] = useState(defaultFunnels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentFunnel, setCurrentFunnel] = useState(null);
  const [newFunnelName, setNewFunnelName] = useState("");

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, []);

  useEffect(() => {
    const isValid = Array.isArray(campaignData?.funnel_stages) && campaignData.funnel_stages.length > 0;
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignData, cId, verifyStep]);

  // Debug funnel_stages updates
  useEffect(() => {
    console.log("MapFunnelStages: Current funnel_stages:", campaignFormData?.funnel_stages);
  }, [campaignFormData?.funnel_stages]);

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Initialize from campaignData
  useEffect(() => {
    // Set initial selected option
    const initialOption = campaignData?.funnel_type || "targeting_retargeting";
    setSelectedOption(initialOption);

    // Initialize custom funnels if they exist in campaignData
    if (campaignData?.custom_funnels && campaignData.custom_funnels.length > 0) {
      setCustomFunnels(campaignData.custom_funnels);
    } else {
      setCustomFunnels(defaultFunnels);
    }

    // Initialize saved selections from campaignData
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
            funnel_stages: campaignData.funnel_stages || ["Targeting", "Retargeting"],
            channel_mix: campaignData.channel_mix || [{ funnel_stage: "Targeting" }, { funnel_stage: "Retargeting" }],
          },
        }));
      }
    }
  }, [campaignData]);

  // Update campaignFormData when customFunnels change
  useEffect(() => {
    if (selectedOption === "custom") {
      setCampaignFormData((prev) => ({
        ...prev,
        custom_funnels: customFunnels,
      }));
      setHasChanges(true);
    }
  }, [customFunnels, selectedOption, setCampaignFormData]);

  const handleSelect = (id) => {
    setHasChanges(true);

    // Update funnel_stages
    const newFunnelStages = campaignFormData?.funnel_stages
      ? campaignFormData.funnel_stages.includes(id)
        ? campaignFormData.funnel_stages.filter((name) => name !== id)
        : [...campaignFormData.funnel_stages, id]
      : [id];

    // Update channel_mix
    let newChannelMix = [...(campaignFormData?.channel_mix || [])];

    if (campaignFormData?.funnel_stages?.includes(id)) {
      // Remove from channel_mix if deselected
      newChannelMix = newChannelMix.filter((ch) => ch?.funnel_stage !== id);
    } else {
      // Add to channel_mix if selected
      newChannelMix.push({ funnel_stage: id });
    }

    const updatedFunnels = {
      ...campaignFormData,
      funnel_stages: newFunnelStages,
      channel_mix: newChannelMix,
    };

    // Update campaignFormData
    setCampaignFormData(updatedFunnels);

    // Also update saved selections for the current option
    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: newFunnelStages,
        channel_mix: newChannelMix,
      },
    }));
  };

  // Handle option change
  const handleOptionChange = (option) => {
    // Save current selections before changing
    if (selectedOption) {
      setSavedSelections((prev) => ({
        ...prev,
        [selectedOption]: {
          funnel_stages: campaignFormData?.funnel_stages || [],
          channel_mix: campaignFormData?.channel_mix || [],
        },
      }));
    }

    // Set new option
    setSelectedOption(option);

    // Apply saved selections for the new option
    setCampaignFormData((prev) => ({
      ...prev,
      funnel_type: option,
      funnel_stages:
        savedSelections[option]?.funnel_stages ||
        (option === "targeting_retargeting" ? ["Targeting", "Retargeting"] : []),
      channel_mix:
        savedSelections[option]?.channel_mix ||
        (option === "targeting_retargeting" ? [{ funnel_stage: "Targeting" }, { funnel_stage: "Retargeting" }] : []),
      ...(option === "custom" ? { custom_funnels: customFunnels } : {}),
    }));

    setHasChanges(true);
  };

  // Close modal when clicking outside
  const modalRef = React.useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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

  // Handle adding a new funnel
  const handleAddFunnel = (name) => {
    if (!name.trim()) {
      setAlert({
        variant: "error",
        message: "Funnel name cannot be empty",
        position: "bottom-right",
      });
      return;
    }

    // Create new funnel
    const newFunnel = {
      id: name,
      name: name,
      // Cycle through some predefined colors
      color: `bg-${["blue", "green", "purple", "pink", "orange"][customFunnels.length % 5]}-500`,
      icon: "",
      activeIcon: "",
    };

    // Update customFunnels state
    const updatedFunnels = [...customFunnels, newFunnel];
    setCustomFunnels(updatedFunnels);

    // Update campaignFormData
    setCampaignFormData((prev) => ({
      ...prev,
      custom_funnels: updatedFunnels,
    }));

    setHasChanges(true);
  };

  // Handle editing a funnel
  const handleEditFunnel = (oldId, newName) => {
    if (!newName.trim()) {
      setAlert({
        variant: "error",
        message: "Funnel name cannot be empty",
        position: "bottom-right",
      });
      return;
    }

    // Update customFunnels state
    const updatedFunnels = customFunnels.map((f) => (f.id === oldId ? { ...f, name: newName, id: newName } : f));
    setCustomFunnels(updatedFunnels);

    // Update campaignFormData
    setCampaignFormData((prev) => {
      const updatedFormData = {
        ...prev,
        custom_funnels: updatedFunnels,
      };

      // Update funnel_stages if this funnel was selected
      if (prev.funnel_stages?.includes(oldId)) {
        updatedFormData.funnel_stages = prev.funnel_stages.map((stage) => (stage === oldId ? newName : stage));
      }

      // Update channel_mix if this funnel was referenced
      if (prev.channel_mix?.some((ch) => ch.funnel_stage === oldId)) {
        updatedFormData.channel_mix = prev.channel_mix.map((ch) =>
          ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
        );
      }

      return updatedFormData;
    });

    // Also update saved selections
    setSavedSelections((prev) => {
      const updatedCustomSelections = { ...prev.custom };

      // Update funnel_stages in saved selections
      if (updatedCustomSelections.funnel_stages.includes(oldId)) {
        updatedCustomSelections.funnel_stages = updatedCustomSelections.funnel_stages.map((stage) =>
          stage === oldId ? newName : stage
        );
      }

      // Update channel_mix in saved selections
      if (updatedCustomSelections.channel_mix.some((ch) => ch.funnel_stage === oldId)) {
        updatedCustomSelections.channel_mix = updatedCustomSelections.channel_mix.map((ch) =>
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

  // Handle removing a funnel
  const handleRemoveFunnel = (id) => {
    if (customFunnels.length <= 1) {
      setAlert({
        variant: "error",
        message: "You must have at least one funnel stage",
        position: "bottom-right",
      });
      return;
    }

    // Update customFunnels state
    const updatedFunnels = customFunnels.filter((f) => f.id !== id);
    setCustomFunnels(updatedFunnels);

    // Update campaignFormData
    setCampaignFormData((prev) => {
      const updatedFormData = {
        ...prev,
        custom_funnels: updatedFunnels,
      };

      // Also remove from selected funnels if it was selected
      if (prev.funnel_stages?.includes(id)) {
        updatedFormData.funnel_stages = prev.funnel_stages.filter((name) => name !== id);
        updatedFormData.channel_mix = prev.channel_mix?.filter((ch) => ch?.funnel_stage !== id);
      }

      return updatedFormData;
    });

    // Also update saved selections
    setSavedSelections((prev) => {
      const updatedCustomSelections = { ...prev.custom };

      // Remove from funnel_stages in saved selections
      if (updatedCustomSelections.funnel_stages.includes(id)) {
        updatedCustomSelections.funnel_stages = updatedCustomSelections.funnel_stages.filter(
          (stage) => stage !== id
        );
        updatedCustomSelections.channel_mix = updatedCustomSelections.channel_mix.filter(
          (ch) => ch?.funnel_stage !== id
        );
      }

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
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className={"text-[22px]"}
          t1={"How many funnel stage(s) would you like to activate to achieve your objective ?"}
          t2={`This option is available only if you've selected any of the following main objectives:`}
          t3={"Traffic, Purchase, Lead Generation, or App Install."}
        />
      </div>
      <div className="mt-[56px] flex items-center gap-[32px]">
        {[
          { id: "targeting_retargeting", label: "Targeting - Retargeting" },
          { id: "custom", label: "Custom" },
        ].map((option) => (
          <label key={option.id} className="cursor-pointer flex items-center gap-3">
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
      {selectedOption === "targeting_retargeting" ? null : (
        <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
          {customFunnels.map((funnel, index) => (
            <div key={funnel.id} className="relative w-full max-w-[685px]">
              <button
                className={`cursor-pointer w-full ${
                  campaignFormData["funnel_stages"]?.includes(funnel.id) || hovered === index + 1 ? funnel.color : ""
                } text-black rounded-lg py-4 flex items-center justify-center gap-2
                  ${
                    campaignFormData["funnel_stages"]?.includes(funnel.id) || hovered === index + 1
                      ? "opacity-100 text-white"
                      : "opacity-90 shadow-md"
                  } 
                  `}
                onClick={() => {
                  handleSelect(funnel.id);
                }}
                onMouseEnter={() => setHovered(index + 1)}
                onMouseLeave={() => setHovered(null)}
              >
                {funnel.icon &&
                  (campaignFormData["funnel_stages"]?.includes(funnel.id) || hovered === index + 1 ? (
                    <Image src={funnel.activeIcon || "/placeholder.svg"} alt={`${funnel.name} icon`} />
                  ) : (
                    <Image src={funnel.icon || "/placeholder.svg"} alt={`${funnel.name} icon`} />
                  ))}
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
                    handleRemoveFunnel(funnel.id);
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}

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

          {/* Custom Modal without shadcn */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{modalMode === "add" ? "Add New Funnel" : "Edit Funnel"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <label htmlFor="funnelName" className="block text-sm font-medium text-gray-700 mb-1">
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
                        handleEditFunnel(currentFunnel.id, newFunnelName);
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
      )}
    </div>
  );
};

export default MapFunnelStages;