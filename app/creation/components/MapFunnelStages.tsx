"use client";
import React, { useState, useEffect, useRef } from "react";
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
    campaignData,
    campaignFormData,
    cId,
    setCampaignFormData,
  } = useCampaigns();
  const { setIsDrawerOpen, setClose } = useComments();
  const { verifyStep, setHasChanges } = useVerification();
  const [previousValidationState, setPreviousValidationState] = useState<boolean | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("custom");
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([]);
  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<Funnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Default funnel stages for Custom option (no icons)
  const defaultFunnels: Funnel[] = [
    {
      id: "Awareness",
      name: "Awareness",
      color: colorPalette[0],
    },
    {
      id: "Consideration",
      name: "Consideration",
      color: colorPalette[1],
    },
    {
      id: "Conversion",
      name: "Conversion",
      color: colorPalette[2],
    },
    {
      id: "Loyalty",
      name: "Loyalty",
      color: colorPalette[3],
    },
  ];

  // Funnel stages for Targeting-Retargeting option (no icons)
  const targetingRetargetingFunnels: Funnel[] = [
    {
      id: "Targeting",
      name: "Targeting",
      color: colorPalette[0],
    },
    {
      id: "Retargeting",
      name: "Retargeting",
      color: colorPalette[1],
    },
  ];

  // Store selections for each option type
  const [savedSelections, setSavedSelections] = useState<{
    custom: {
      funnel_stages: string[];
      channel_mix: { funnel_stage: string }[];
    };
    targeting_retargeting: {
      funnel_stages: string[];
      channel_mix: { funnel_stage: string }[];
    };
  }>({
    custom: {
      funnel_stages: ["Awareness", "Consideration", "Conversion", "Loyalty"],
      channel_mix: [
        { funnel_stage: "Awareness" },
        { funnel_stage: "Consideration" },
        { funnel_stage: "Conversion" },
        { funnel_stage: "Loyalty" },
      ],
    },
    targeting_retargeting: {
      funnel_stages: ["Targeting", "Retargeting"],
      channel_mix: [
        { funnel_stage: "Targeting" },
        { funnel_stage: "Retargeting" },
      ],
    },
  });

  // Initialize comments drawer
  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, [setIsDrawerOpen, setClose]);

  // Validate funnel stages for step verification
  useEffect(() => {
    const isValid =
      Array.isArray(campaignFormData?.funnel_stages) &&
      campaignFormData.funnel_stages.length > 0;
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);
      setPreviousValidationState(isValid);
    }
  }, [campaignFormData, cId, verifyStep, previousValidationState]);

  // Initialize funnel data from campaignData
  useEffect(() => {
    // Check if campaignData.custom_funnels contains Targeting/Retargeting
    const isTargetingRetargeting = campaignData?.custom_funnels?.every((funnel: any) =>
      ["Targeting", "Retargeting"].includes(funnel.name)
    );

    // Load custom funnels, excluding Targeting/Retargeting
    const loadedCustomFunnels =
      campaignData?.custom_funnels &&
      campaignData.custom_funnels.length > 0 &&
      !isTargetingRetargeting
        ? campaignData.custom_funnels.map((funnel: any, index: number) => ({
            id: funnel.id || funnel.name,
            name: funnel.name,
            color:
              funnel.color ||
              colorPalette[index % colorPalette.length] ||
              "bg-gray-500",
          }))
        : defaultFunnels;

    // Set persistent custom funnels
    setPersistentCustomFunnels(loadedCustomFunnels);

    // Determine initial funnel type
    const initialOption = campaignData?.funnel_type || "custom";
    setSelectedOption(initialOption);

    // Load funnel stages and channel mix
    const initialFunnelStages =
      campaignData?.funnel_stages && campaignData.funnel_stages.length > 0
        ? campaignData.funnel_stages
        : initialOption === "targeting_retargeting"
        ? ["Targeting", "Retargeting"]
        : loadedCustomFunnels.map((f) => f.name);

    const initialChannelMix =
      campaignData?.channel_mix && campaignData.channel_mix.length > 0
        ? campaignData.channel_mix
        : initialOption === "targeting_retargeting"
        ? [
            { funnel_stage: "Targeting" },
            { funnel_stage: "Retargeting" },
          ]
        : loadedCustomFunnels.map((f) => ({ funnel_stage: f.name }));

    // Initialize state based on funnel type
    if (initialOption === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);
      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "targeting_retargeting",
        funnel_stages: initialFunnelStages,
        channel_mix: initialChannelMix,
        custom_funnels: loadedCustomFunnels, // Preserve custom funnels
      }));
    } else {
      setCustomFunnels(loadedCustomFunnels);
      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "custom",
        custom_funnels: loadedCustomFunnels,
        funnel_stages: initialFunnelStages,
        channel_mix: initialChannelMix,
      }));
    }

    // Update savedSelections
    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: initialOption === "custom" ? initialFunnelStages : prev.custom.funnel_stages,
        channel_mix: initialOption === "custom" ? initialChannelMix : prev.custom.channel_mix,
      },
      targeting_retargeting: {
        funnel_stages: initialOption === "targeting_retargeting" ? initialFunnelStages : prev.targeting_retargeting.funnel_stages,
        channel_mix: initialOption === "targeting_retargeting" ? initialChannelMix : prev.targeting_retargeting.channel_mix,
      },
    }));
  }, [campaignData, setCampaignFormData]);

  // Handle clicks outside modal to close it
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

  // Get an available color from the palette
  const getAvailableColor = (excludeColor?: string): string => {
    const usedColors = persistentCustomFunnels
      .filter((f) => f.color !== excludeColor)
      .map((f) => f.color);
    const availableColors = colorPalette.filter((c) => !usedColors.includes(c));
    return availableColors.length > 0
      ? availableColors[0]
      : colorPalette[persistentCustomFunnels.length % colorPalette.length];
  };

  // Handle funnel selection
  const handleSelect = (id: string) => {
    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData.funnel_stages.length === 1
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

    const newChannelMix = campaignFormData?.funnel_stages?.includes(id)
      ? campaignFormData.channel_mix.filter((ch: any) => ch?.funnel_stage !== id)
      : [...(campaignFormData?.channel_mix || []), { funnel_stage: id }];

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: newFunnelStages,
      channel_mix: newChannelMix,
    }));

    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: newFunnelStages,
        channel_mix: newChannelMix,
      },
    }));
    setHasChanges(true);
  };

  // Handle option change (Custom vs Targeting-Retargeting)
  const handleOptionChange = (option: string) => {
    // Save current funnel_stages and channel_mix
    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: campaignFormData?.funnel_stages || [],
        channel_mix: campaignFormData?.channel_mix || [],
      },
    }));

    setSelectedOption(option);

    if (option === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);
      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "targeting_retargeting",
        funnel_stages:
          savedSelections.targeting_retargeting.funnel_stages.length > 0
            ? savedSelections.targeting_retargeting.funnel_stages
            : ["Targeting", "Retargeting"],
        channel_mix:
          savedSelections.targeting_retargeting.channel_mix.length > 0
            ? savedSelections.targeting_retargeting.channel_mix
            : [
                { funnel_stage: "Targeting" },
                { funnel_stage: "Retargeting" },
              ],
        // Do not overwrite custom_funnels
      }));
    } else {
      // Restore custom funnels from persistentCustomFunnels
      const restoredFunnels =
        persistentCustomFunnels.length > 0 ? persistentCustomFunnels : defaultFunnels;
      setCustomFunnels(restoredFunnels);
      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "custom",
        custom_funnels: restoredFunnels,
        funnel_stages:
          savedSelections.custom.funnel_stages.length > 0
            ? savedSelections.custom.funnel_stages
            : restoredFunnels.map((f) => f.name),
        channel_mix:
          savedSelections.custom.channel_mix.length > 0
            ? savedSelections.custom.channel_mix
            : restoredFunnels.map((f) => ({ funnel_stage: f.name })),
      }));
    }

    setHasChanges(true);
  };

  // Add a new funnel
  const handleAddFunnel = (name: string) => {
    if (!name.trim()) {
      toast.error("Funnel name cannot be empty", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Funnel name must be at least 2 characters", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (!/[a-zA-Z]/.test(name)) {
      toast.error("Funnel name must include at least one letter", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (
      persistentCustomFunnels.some(
        (funnel) => funnel.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      toast.error("A funnel with this name already exists", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const newColor = getAvailableColor();
    const newFunnel: Funnel = {
      id: name,
      name: name,
      color: newColor,
    };

    const updatedFunnels = [...persistentCustomFunnels, newFunnel];
    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: [...(prev.funnel_stages || []), name],
      channel_mix: [...(prev.channel_mix || []), { funnel_stage: name }],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: [...(prev.custom.funnel_stages || []), name],
        channel_mix: [...(prev.custom.channel_mix || []), { funnel_stage: name }],
      },
    }));

    setHasChanges(true);
    toast.success("Funnel added successfully", { duration: 3000 });
  };

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Funnel name cannot be empty", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    if (
      persistentCustomFunnels.some(
        (funnel) =>
          funnel.name.toLowerCase() === newName.toLowerCase() &&
          funnel.name !== oldId
      )
    ) {
      toast.error("A funnel with this name already exists", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const updatedFunnels = persistentCustomFunnels.map((f) =>
      f.name === oldId
        ? {
            ...f,
            id: newName,
            name: newName,
            color: f.color,
          }
        : f
    );

    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.map((stage: string) =>
        stage === oldId ? newName : stage
      ) || [],
      channel_mix: prev.channel_mix?.map((ch: any) =>
        ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
      ) || [],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: prev.custom.funnel_stages.map((stage: string) =>
          stage === oldId ? newName : stage
        ),
        channel_mix: prev.custom.channel_mix.map((ch: any) =>
          ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
        ),
      },
    }));

    setHasChanges(true);
    toast.success("Funnel updated successfully", { duration: 3000 });
  };

  // Remove a funnel
  const handleRemoveFunnel = (id: string) => {
    if (persistentCustomFunnels.length <= 1) {
      toast.error("You must have at least one funnel stage", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    const updatedFunnels = persistentCustomFunnels.filter((f) => f.name !== id);
    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.filter((name: string) => name !== id) || [],
      channel_mix: prev.channel_mix?.filter((ch: any) => ch?.funnel_stage !== id) || [],
    }));

    setSavedSelections((prev) => ({
      ...prev,
      custom: {
        funnel_stages: prev.custom.funnel_stages.filter((stage: string) => stage !== id),
        channel_mix: prev.custom.channel_mix.filter((ch: any) => ch?.funnel_stage !== id),
      },
    }));

    setHasChanges(true);
    toast.success("Funnel removed successfully", { duration: 3000 });
  };

  return (
    <div>
      <Toaster />
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
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
          {targetingRetargetingFunnels.map((funnel) => {
            const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
            return (
              <div key={funnel.id} className="relative w-full max-w-[685px]">
                <button
                  className={`cursor-pointer w-full ${
                    isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                  } rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200`}
                  onClick={() => handleSelect(funnel.name)}
                >
                  <div className="w-6 h-6" />
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
            const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
            return (
              <div
                key={`${funnel.id}-${index}`}
                className="relative w-full max-w-[685px]"
              >
                <button
                  className={`cursor-pointer w-full rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelect(funnel.name)}
                >
                  <div className="w-6 h-6" />
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
