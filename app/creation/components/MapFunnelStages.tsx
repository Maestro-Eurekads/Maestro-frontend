"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import speaker from "../../../public/mdi_megaphone.svg";
import zoom from "../../../public/tabler_zoom-filled.svg";
import credit from "../../../public/mdi_credit-card.svg";
import addPlus from "../../../public/addPlus.svg";
import speakerWhite from "../../../public/mdi_megaphonewhite.svg";
import zoomWhite from "../../../public/tabler_zoom-filledwhite.svg";
import creditWhite from "../../../public/mdi_credit-cardwhite.svg";
import addPlusWhite from "../../../public/addPlusWhite.svg";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { PlusIcon, Edit2, Trash2, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Define type for funnel objects
interface Funnel {
  id: string;
  name: string;
  color: string;
  icon?: any; // Optional for funnels with icons
  activeIcon?: any; // Optional for funnels with active icons
}

// Color palette for dynamic assignment
const colorPalette = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500 border border-orange-500",
  "bg-red-500 border border-red-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500 border border-pink-500",
  "bg-indigo-500",
];

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
  const [selectedOption, setSelectedOption] = useState("");

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

  // Default funnel stages for Custom option with dynamic colors
  const defaultFunnels: Funnel[] = [
    {
      id: "Awareness",
      name: "Awareness",
      icon: speaker,
      activeIcon: speakerWhite,
      color: colorPalette[0],
    },
    {
      id: "Consideration",
      name: "Consideration",
      icon: zoom,
      activeIcon: zoomWhite,
      color: colorPalette[1],
    },
    {
      id: "Conversion",
      name: "Conversion",
      icon: credit,
      activeIcon: creditWhite,
      color: colorPalette[2],
    },
    {
      id: "Loyalty",
      name: "Loyalty",
      icon: addPlus,
      activeIcon: addPlusWhite,
      color: colorPalette[3],
    },
  ];

  // Funnel stages for Targeting-Retargeting option
  const targetingRetargetingFunnels: Funnel[] = [
    {
      id: "Targeting",
      name: "Targeting",
      icon: zoom,
      activeIcon: zoomWhite,
      color: colorPalette[0],
    },
    {
      id: "Retargeting",
      name: "Retargeting",
      icon: credit,
      activeIcon: creditWhite,
      color: colorPalette[1],
    },
  ];

  // State for custom funnels and modal
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>(defaultFunnels);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
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
      setCampaignFormData((prev: any) => ({
        ...prev,
        custom_funnels: targetingRetargetingFunnels,
        funnel_stages: ["Targeting", "Retargeting"],
        channel_mix: [
          { funnel_stage: "Targeting" },
          { funnel_stage: "Retargeting" },
        ],
      }));
    } else {
      const loadedFunnels =
        campaignData?.custom_funnels && campaignData.custom_funnels.length > 0
          ? campaignData.custom_funnels.map((funnel: any, index: number) => {
              const defaultFunnel = defaultFunnels.find(
                (df) => df.id === funnel.id && df.name === funnel.name
              );
              return {
                id: funnel.id,
                name: funnel.name,
                color:
                  funnel.color ||
                  (defaultFunnel
                    ? defaultFunnel.color
                    : colorPalette[index % colorPalette.length] || "bg-gray-500"),
                icon: defaultFunnel ? defaultFunnel.icon : undefined,
                activeIcon: defaultFunnel ? defaultFunnel.activeIcon : undefined,
              };
            })
          : defaultFunnels;
      setCustomFunnels(loadedFunnels);
      setCampaignFormData((prev: any) => ({
        ...prev,
        custom_funnels: loadedFunnels,
        funnel_stages: campaignData?.funnel_stages || [],
        channel_mix: campaignData?.channel_mix || [],
      }));
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
  }, [campaignData, setCampaignFormData]);

  useEffect(() => {
    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels:
        selectedOption === "custom" ? customFunnels : targetingRetargetingFunnels,
    }));
    setHasChanges(true);
  }, [customFunnels, selectedOption, setCampaignFormData]);

  const handleSelect = (id: string) => {
    setHasChanges(true);

    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData?.funnel_stages?.length === 1
    ) {
      toast.error("You must have at least one funnel stage selected", {
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
          channel_mix: campaignFormData?.channel_mix || [],
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
      newFormData.custom_funnels = targetingRetargetingFunnels;
      setCustomFunnels(targetingRetargetingFunnels);
    } else if (option === "custom") {
      newFormData.funnel_stages = [];
      newFormData.channel_mix = [];
      newFormData.custom_funnels = defaultFunnels;
      setCustomFunnels(defaultFunnels);
    }

    setCampaignFormData(newFormData);
    setHasChanges(true);
  };

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

    const usedColors = customFunnels.map((f) => f.color);
    const availableColors = colorPalette.filter((c) => !usedColors.includes(c));
    const newColor =
      availableColors.length > 0
        ? availableColors[Math.floor(Math.random() * availableColors.length)]
        : colorPalette[Math.floor(Math.random() * colorPalette.length)];

    const newFunnel: Funnel = {
      id: name,
      name: name,
      color: newColor,
    };

    const updatedFunnels: Funnel[] = [...customFunnels, newFunnel];
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
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

    const updatedFunnels: Funnel[] = customFunnels.map((f) =>
      f.name === oldId
        ? { ...f, name: newName, id: newName, icon: undefined, activeIcon: undefined }
        : f
    );
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => {
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

    const updatedFunnels: Funnel[] = customFunnels.filter((f) => f.name !== id);
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => {
      const updatedFunnelStages = (prev.funnel_stages || []).filter(
        (name: string) => name !== id
      );
      const updatedChannelMix = (prev.channel_mix || []).filter(
        (ch: any) => ch?.funnel_stage !== id
      );

      return {
        ...prev,
        custom_funnels: updatedFunnels,
        funnel_stages: updatedFunnelStages,
        channel_mix: updatedChannelMix,
      };
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
                  {funnel.icon && funnel.activeIcon && (
                    <Image
                      src={isSelected ? funnel.activeIcon : funnel.icon}
                      alt={`${funnel.name} icon`}
                      width={24}
                      height={24}
                    />
                  )}
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
                  } rounded-lg py-4 flex items-center justify-center ${
                    funnel.icon && funnel.activeIcon ? "gap-2" : ""
                  } transition-all duration-200`}
                  onClick={() => handleSelect(funnel.name)}
                  onMouseEnter={() => setHovered(index + 1)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {funnel.icon && funnel.activeIcon && (
                    <Image
                      src={isSelected ? funnel.activeIcon : funnel.icon}
                      alt={`${funnel.name} icon`}
                      width={24}
                      height={24}
                    />
                  )}
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