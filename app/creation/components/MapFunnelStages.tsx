"use client";
import React, { useState, useEffect, useRef } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { PlusIcon, Edit2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

// Define type for funnel objects
interface Funnel {
  id: string;
  name: string;
  color: string;
}

// Expanded color palette for dynamic assignment
const colorPalette = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500 border border-orange-500",
  "bg-red-500 border border-red-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500 border border-pink-500",
  "bg-indigo-500",
  "bg-yellow-500 border border-yellow-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-amber-500 border border-amber-500",
  "bg-fuchsia-500 border border-fuchsia-500",
  "bg-emerald-500",
  "bg-violet-600 border border-violet-500",
  "bg-rose-600 border border-rose-500",
  "bg-sky-500",
  "bg-gray-800 border border-gray-700",
  "bg-blue-800 border border-blue-700",
  "bg-green-800 border border-green-700",
];

// LocalStorage key for custom funnels
const LOCAL_STORAGE_FUNNELS_KEY = "custom_funnels_v1";

// LocalStorage key for targeting/retargeting funnel state
const LOCAL_STORAGE_TRT_KEY = "targeting_retargeting_funnel_v1";

// Helper to get a unique plan key for localStorage based on cId
const getPlanKey = (baseKey: string, cId: string | undefined) => {
  // If cId is undefined, fallback to baseKey (for new plans, don't persist)
  return cId ? `${baseKey}_${cId}` : baseKey;
};

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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([]);
  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<Funnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [funnelNameError, setFunnelNameError] = useState<string>(""); // For validation error message
  const modalRef = useRef<HTMLDivElement>(null);

  // Default funnel stages for Custom option
  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ];

  // Funnel stages for Targeting-Retargeting option
  const targetingRetargetingFunnels: Funnel[] = [
    { id: "Targeting", name: "Targeting", color: colorPalette[0] },
    { id: "Retargeting", name: "Retargeting", color: colorPalette[1] },
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
    custom: { funnel_stages: [], channel_mix: [] },
    targeting_retargeting: { funnel_stages: [], channel_mix: [] },
  });

  // --- LocalStorage helpers for custom funnels ---
  const saveCustomFunnelsToStorage = (funnels: Funnel[]) => {
    if (!cId) return; // Don't persist for new plans
    try {
      localStorage.setItem(getPlanKey(LOCAL_STORAGE_FUNNELS_KEY, cId), JSON.stringify(funnels));
    } catch (e) {
      // ignore
    }
  };
  const getCustomFunnelsFromStorage = (): Funnel[] | null => {
    if (!cId) return null; // Don't load for new plans
    try {
      const data = localStorage.getItem(getPlanKey(LOCAL_STORAGE_FUNNELS_KEY, cId));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // --- LocalStorage helpers for targeting/retargeting funnel state ---
  const saveTRTStateToStorage = (funnel_stages: string[], channel_mix: { funnel_stage: string }[]) => {
    if (!cId) return; // Don't persist for new plans
    try {
      localStorage.setItem(
        getPlanKey(LOCAL_STORAGE_TRT_KEY, cId),
        JSON.stringify({ funnel_stages, channel_mix })
      );
    } catch (e) {
      // ignore
    }
  };
  const getTRTStateFromStorage = (): { funnel_stages: string[]; channel_mix: { funnel_stage: string }[] } | null => {
    if (!cId) return null; // Don't load for new plans
    try {
      const data = localStorage.getItem(getPlanKey(LOCAL_STORAGE_TRT_KEY, cId));
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // On plan change (cId), clear localStorage for new plans (no cId)
  useEffect(() => {
    if (!cId) {
      // New plan: clear any global (non-cId) keys to avoid carryover
      localStorage.removeItem(LOCAL_STORAGE_FUNNELS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_TRT_KEY);
    }
  }, [cId]);

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

  // Initialize funnel data from campaignData and localStorage
  useEffect(() => {
    // Check if campaignData.custom_funnels contains Targeting/Retargeting
    const isTargetingRetargeting = campaignData?.custom_funnels?.every((funnel: any) =>
      ["Targeting", "Retargeting"].includes(funnel.name)
    );

    // Try to load custom funnels from localStorage first (only for existing plans)
    let loadedCustomFunnels: Funnel[] = [];
    let localStorageFunnels: Funnel[] | null = null;
    if (!isTargetingRetargeting) {
      localStorageFunnels = getCustomFunnelsFromStorage();
    }

    if (
      localStorageFunnels &&
      Array.isArray(localStorageFunnels) &&
      localStorageFunnels.length > 0 &&
      !isTargetingRetargeting
    ) {
      loadedCustomFunnels = localStorageFunnels;
    } else if (
      campaignData?.custom_funnels &&
      campaignData.custom_funnels.length > 0 &&
      !isTargetingRetargeting
    ) {
      loadedCustomFunnels = campaignData.custom_funnels.map((funnel: any, index: number) => ({
        id: funnel.id || funnel.name,
        name: funnel.name,
        color: funnel.color || colorPalette[index % colorPalette.length] || "bg-gray-500",
      }));
    } else {
      loadedCustomFunnels = defaultFunnels;
    }

    // Set persistent custom funnels to maintain order
    setPersistentCustomFunnels(loadedCustomFunnels);

    // Restore saved state from campaignData
    const initialFunnelType = campaignData?.funnel_type || "";
    const initialFunnelStages =
      campaignData?.funnel_stages && campaignData.funnel_stages.length > 0
        ? campaignData.funnel_stages
        : [];
    const initialChannelMix =
      campaignData?.channel_mix && campaignData.channel_mix.length > 0
        ? campaignData.channel_mix
        : [];

    setSelectedOption(initialFunnelType);

    if (initialFunnelType === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);

      // Try to restore from localStorage for targeting/retargeting (only for existing plans)
      const trtState = getTRTStateFromStorage();
      setSavedSelections((prev) => ({
        ...prev,
        targeting_retargeting: {
          funnel_stages: trtState?.funnel_stages?.length
            ? trtState.funnel_stages
            : initialFunnelStages,
          channel_mix: trtState?.channel_mix?.length
            ? trtState.channel_mix
            : initialChannelMix,
        },
      }));

      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "targeting_retargeting",
        funnel_stages: trtState?.funnel_stages?.length
          ? trtState.funnel_stages
          : (initialFunnelStages.length > 0
              ? initialFunnelStages
              : ["Targeting", "Retargeting"]),
        channel_mix: trtState?.channel_mix?.length
          ? trtState.channel_mix
          : (initialChannelMix.length > 0
              ? initialChannelMix
              : [{ funnel_stage: "Targeting" }, { funnel_stage: "Retargeting" }]),
        custom_funnels: targetingRetargetingFunnels,
      }));
    } else if (initialFunnelType === "custom") {
      setCustomFunnels(loadedCustomFunnels);
      setSavedSelections((prev) => ({
        ...prev,
        custom: {
          funnel_stages: initialFunnelStages,
          channel_mix: initialChannelMix,
        },
      }));
      setCampaignFormData((prev: any) => {
        const orderedFunnelStages =
          initialFunnelStages.length > 0
            ? loadedCustomFunnels
                .map((f) => f.name)
                .filter((name) => initialFunnelStages.includes(name))
            : loadedCustomFunnels.map((f) => f.name);
        const orderedChannelMix =
          initialChannelMix.length > 0
            ? loadedCustomFunnels
                .map((f) => initialChannelMix.find((ch: any) => ch.funnel_stage === f.name))
                .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
            : loadedCustomFunnels.map((f) => ({ funnel_stage: f.name }));

        return {
          ...prev,
          funnel_type: "custom",
          funnel_stages: orderedFunnelStages,
          channel_mix: orderedChannelMix,
          custom_funnels: loadedCustomFunnels,
        };
      });
    }
    // eslint-disable-next-line
  }, [campaignData, setCampaignFormData, cId]);

  // Whenever persistentCustomFunnels changes, update localStorage (only for existing plans)
  useEffect(() => {
    if (!cId) return;
    // Only save if not targeting/retargeting
    if (
      persistentCustomFunnels.length > 0 &&
      !persistentCustomFunnels.every((f) => ["Targeting", "Retargeting"].includes(f.name))
    ) {
      saveCustomFunnelsToStorage(persistentCustomFunnels);
    }
  }, [persistentCustomFunnels, cId]);

  // Whenever targeting/retargeting funnel_stages or channel_mix changes, persist to localStorage (only for existing plans)
  useEffect(() => {
    if (!cId) return;
    if (
      selectedOption === "targeting_retargeting" &&
      Array.isArray(campaignFormData?.funnel_stages) &&
      Array.isArray(campaignFormData?.channel_mix)
    ) {
      saveTRTStateToStorage(
        campaignFormData.funnel_stages,
        campaignFormData.channel_mix
      );
    }
    // eslint-disable-next-line
  }, [selectedOption, campaignFormData?.funnel_stages, campaignFormData?.channel_mix, cId]);

  // Handle clicks outside modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
        setFunnelNameError(""); // Clear error on close
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

  // --- Funnel name validation function ---
  const validateFunnelName = (name: string, isEdit: boolean = false, oldId?: string): string => {
    const trimmed = name.trim();
    if (!trimmed) {
      return "Funnel name cannot be empty";
    }
    if (trimmed.length < 2) {
      return "Funnel name must be at least 2 characters";
    }
    // Only allow names that contain at least one alphabet (no only digits/special chars)
    if (!/[a-zA-Z]/.test(trimmed)) {
      return "Funnel name must include at least one letter";
    }
    // Disallow duplicate names (case-insensitive, except for self in edit)
    if (
      persistentCustomFunnels.some(
        (funnel) =>
          funnel.name.toLowerCase() === trimmed.toLowerCase() &&
          (!isEdit || funnel.name !== oldId)
      )
    ) {
      return "A funnel with this name already exists";
    }
    return "";
  };

  // Handle funnel selection
  const handleSelect = (id: string) => {
    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData.funnel_stages.length === 1
    ) {
      toast.error("You must have at least one stage selected", {
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

    // Ensure funnel_stages order matches persistentCustomFunnels when adding a new stage
    const orderedFunnelStages = selectedOption === "custom"
      ? persistentCustomFunnels
          .map((f) => f.name)
          .filter((name) => newFunnelStages.includes(name))
      : newFunnelStages;

    // Ensure channel_mix order matches persistentCustomFunnels
    const orderedChannelMix = selectedOption === "custom"
      ? persistentCustomFunnels
          .map((f) => newChannelMix.find((ch: any) => ch.funnel_stage === f.name))
          .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
      : newChannelMix;

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: orderedFunnelStages,
      channel_mix: orderedChannelMix,
    }));

    setSavedSelections((prev) => ({
      ...prev,
      [selectedOption]: {
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
      },
    }));

    // Persist targeting/retargeting state to localStorage (only for existing plans)
    if (selectedOption === "targeting_retargeting" && cId) {
      saveTRTStateToStorage(orderedFunnelStages, orderedChannelMix);
    }

    setHasChanges(true);
  };

  // Handle option change (Custom vs Targeting-Retargeting)
  const handleOptionChange = (option: string) => {
    // Save current funnel_stages and channel_mix
    if (selectedOption) {
      setSavedSelections((prev) => ({
        ...prev,
        [selectedOption]: {
          funnel_stages: campaignFormData?.funnel_stages || [],
          channel_mix: campaignFormData?.channel_mix || [],
        },
      }));
      // Persist targeting/retargeting state to localStorage (only for existing plans)
      if (selectedOption === "targeting_retargeting" && cId) {
        saveTRTStateToStorage(
          campaignFormData?.funnel_stages || [],
          campaignFormData?.channel_mix || []
        );
      }
    }

    setSelectedOption(option);

    if (option === "targeting_retargeting") {
      setCustomFunnels(targetingRetargetingFunnels);

      // Restore from localStorage if available, else from state (only for existing plans)
      const trtState = getTRTStateFromStorage();
      const defaultStages = ["Targeting", "Retargeting"];
      const defaultChannelMix = defaultStages.map(stage => ({ funnel_stage: stage }));

      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "targeting_retargeting",
        funnel_stages: trtState?.funnel_stages?.length
          ? trtState.funnel_stages
          : (savedSelections.targeting_retargeting.funnel_stages.length > 0
              ? savedSelections.targeting_retargeting.funnel_stages
              : defaultStages),
        channel_mix: trtState?.channel_mix?.length
          ? trtState.channel_mix
          : (savedSelections.targeting_retargeting.channel_mix.length > 0
              ? savedSelections.targeting_retargeting.channel_mix
              : defaultChannelMix),
        custom_funnels: targetingRetargetingFunnels,
      }));
    } else {
      // Restore from localStorage if available, else from state (only for existing plans)
      let restoredFunnels: Funnel[] = [];
      const localStorageFunnels = getCustomFunnelsFromStorage();
      if (localStorageFunnels && Array.isArray(localStorageFunnels) && localStorageFunnels.length > 0) {
        restoredFunnels = localStorageFunnels;
      } else {
        restoredFunnels = persistentCustomFunnels.length > 0 ? persistentCustomFunnels : defaultFunnels;
      }
      setCustomFunnels(restoredFunnels);
      setPersistentCustomFunnels(restoredFunnels);
      setCampaignFormData((prev: any) => {
        const funnelStages =
          savedSelections.custom.funnel_stages.length > 0
            ? restoredFunnels
                .map((f) => f.name)
                .filter((name) => savedSelections.custom.funnel_stages.includes(name))
            : restoredFunnels.map((f) => f.name);
        const channelMix =
          savedSelections.custom.channel_mix.length > 0
            ? restoredFunnels
                .map((f) => savedSelections.custom.channel_mix.find((ch: any) => ch.funnel_stage === f.name))
                .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
            : restoredFunnels.map((f) => ({ funnel_stage: f.name }));

        return {
          ...prev,
          funnel_type: "custom",
          custom_funnels: restoredFunnels,
          funnel_stages: funnelStages,
          channel_mix: channelMix,
        };
      });
    }

    setHasChanges(true);
  };

  // Add a new funnel
  const handleAddFunnel = (name: string) => {
    const error = validateFunnelName(name, false);
    if (error) {
      setFunnelNameError(error);
      toast.error(error, {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    setFunnelNameError("");

    const newColor = getAvailableColor();
    const newFunnel: Funnel = {
      id: name,
      name: name,
      color: newColor,
    };

    const updatedFunnels = [...persistentCustomFunnels, newFunnel];
    setPersistentCustomFunnels(updatedFunnels);
    setCustomFunnels(updatedFunnels);

    // Save to localStorage (only for existing plans)
    if (cId) saveCustomFunnelsToStorage(updatedFunnels);

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
    setIsModalOpen(false);
  };

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string) => {
    const error = validateFunnelName(newName, true, oldId);
    if (error) {
      setFunnelNameError(error);
      toast.error(error, {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }
    setFunnelNameError("");

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

    // Save to localStorage (only for existing plans)
    if (cId) saveCustomFunnelsToStorage(updatedFunnels);

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
    setIsModalOpen(false);
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

    // Save to localStorage (only for existing plans)
    if (cId) saveCustomFunnelsToStorage(updatedFunnels);

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
                      setFunnelNameError("");
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
              setFunnelNameError("");
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
                onClick={() => {
                  setIsModalOpen(false);
                  setFunnelNameError("");
                }}
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
                onChange={(e) => {
                  setNewFunnelName(e.target.value);
                  if (funnelNameError) {
                    // Live validation feedback
                    if (modalMode === "add") {
                      setFunnelNameError(validateFunnelName(e.target.value, false));
                    } else if (modalMode === "edit" && currentFunnel) {
                      setFunnelNameError(validateFunnelName(e.target.value, true, currentFunnel.name));
                    }
                  }
                }}
                className={`w-full px-3 py-2 border ${funnelNameError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter funnel name"
              />
              {funnelNameError && (
                <p className="text-red-500 text-xs mt-1">{funnelNameError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFunnelNameError("");
                }}
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
                  // Only close modal if no error
                  // (handleAddFunnel/handleEditFunnel will close modal on success)
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