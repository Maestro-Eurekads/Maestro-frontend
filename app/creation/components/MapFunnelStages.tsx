"use client";
import React, { useState, useEffect, useRef } from "react";
import PageHeaderWrapper from "../../../components/PageHeaderWapper";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useVerification } from "app/utils/VerificationContext";
import { useComments } from "app/utils/CommentProvider";
import { PlusIcon, Edit2, Trash2, X, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

// Define type for funnel objects
interface Funnel {
  id: string;
  name: string;
  color: string; // tailwind color class or hex string
}

// Color palette for quick selection (tailwind classes)
const colorPalette = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-yellow-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-amber-500",
  "bg-fuchsia-500",
  "bg-emerald-500",
  "bg-violet-600",
  "bg-rose-600",
  "bg-sky-500",
  "bg-gray-800",
  "bg-blue-800",
  "bg-green-800",
];

// For color picker, map tailwind class to color value for <input type="color">
const colorClassToHex: Record<string, string> = {
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#22C55E",
  "bg-orange-500": "#F59E42",
  "bg-red-500": "#EF4444",
  "bg-purple-500": "#A855F7",
  "bg-teal-500": "#14B8A6",
  "bg-pink-500": "#EC4899",
  "bg-indigo-500": "#6366F1",
  "bg-yellow-500": "#FACC15",
  "bg-cyan-500": "#06B6D4",
  "bg-lime-500": "#84CC16",
  "bg-amber-500": "#F59E42",
  "bg-fuchsia-500": "#D946EF",
  "bg-emerald-500": "#10B981",
  "bg-violet-600": "#7C3AED",
  "bg-rose-600": "#F43F5E",
  "bg-sky-500": "#0EA5E9",
  "bg-gray-800": "#1F2937",
  "bg-blue-800": "#1E40AF",
  "bg-green-800": "#166534",
};

const hexToColorClass = (hex: string): string | null => {
  for (const [cls, val] of Object.entries(colorClassToHex)) {
    if (val.toLowerCase() === hex.toLowerCase()) return cls;
  }
  return null;
};

const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

// LocalStorage key for custom funnels
const LOCAL_STORAGE_FUNNELS_KEY = "custom_funnels_v1";

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
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([]);
  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<Funnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  // newFunnelColor can be a tailwind class or a hex string
  const [newFunnelColor, setNewFunnelColor] = useState<string>(colorPalette[0]);
  // customColor is always a hex string
  const [customColor, setCustomColor] = useState<string>(colorClassToHex[colorPalette[0]]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Default funnel stages
  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ];

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

  // On plan change (cId), clear localStorage for new plans (no cId)
  useEffect(() => {
    if (!cId) {
      // New plan: clear any global (non-cId) keys to avoid carryover
      localStorage.removeItem(LOCAL_STORAGE_FUNNELS_KEY);
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
    // Try to load custom funnels from localStorage first (only for existing plans)
    let loadedCustomFunnels: Funnel[] = [];
    let localStorageFunnels: Funnel[] | null = null;
    localStorageFunnels = getCustomFunnelsFromStorage();

    if (
      localStorageFunnels &&
      Array.isArray(localStorageFunnels) &&
      localStorageFunnels.length > 0
    ) {
      loadedCustomFunnels = localStorageFunnels;
    } else if (
      campaignData?.custom_funnels &&
      campaignData.custom_funnels.length > 0
    ) {
      loadedCustomFunnels = campaignData.custom_funnels.map((funnel: any, index: number) => ({
        id: funnel.id || funnel.name,
        name: funnel.name,
        color: funnel.color || colorPalette[index % colorPalette.length] || "bg-gray-500",
      }));
    } else {
      loadedCustomFunnels = defaultFunnels;
    }

    setPersistentCustomFunnels(loadedCustomFunnels);
    setCustomFunnels(loadedCustomFunnels);

    // Restore saved state from campaignData
    const initialFunnelStages =
      campaignData?.funnel_stages && campaignData.funnel_stages.length > 0
        ? campaignData.funnel_stages
        : [];
    const initialChannelMix =
      campaignData?.channel_mix && campaignData.channel_mix.length > 0
        ? campaignData.channel_mix
        : [];

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
    // eslint-disable-next-line
  }, [campaignData, setCampaignFormData, cId]);

  // Whenever persistentCustomFunnels changes, update localStorage (only for existing plans)
  useEffect(() => {
    if (!cId) return;
    if (persistentCustomFunnels.length > 0) {
      saveCustomFunnelsToStorage(persistentCustomFunnels);
    }
  }, [persistentCustomFunnels, cId]);

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
    const orderedFunnelStages = persistentCustomFunnels
      .map((f) => f.name)
      .filter((name) => newFunnelStages.includes(name));

    // Ensure channel_mix order matches persistentCustomFunnels
    const orderedChannelMix = persistentCustomFunnels
      .map((f) => newChannelMix.find((ch: any) => ch.funnel_stage === f.name))
      .filter((ch): ch is { funnel_stage: string } => ch !== undefined);

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: orderedFunnelStages,
      channel_mix: orderedChannelMix,
    }));

    setHasChanges(true);
  };

  // Add a new funnel
  const handleAddFunnel = (name: string, color: string) => {
    const error = validateFunnelName(name, false);
    if (error) {
      toast.error(error, {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      });
      return;
    }

    // If color is a palette class, use as is. If it's a hex, use as is.
    const newFunnel: Funnel = {
      id: name,
      name: name,
      color: color,
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

    setHasChanges(true);
    toast.success("Funnel added successfully", { duration: 3000 });
    setIsModalOpen(false);
  };

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string, newColor: string) => {
    const error = validateFunnelName(newName, true, oldId);
    if (error) {
      toast.error(error, {
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
            color: newColor,
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

    setHasChanges(true);
    toast.success("Funnel removed successfully", { duration: 3000 });
  };

  // Handle drag and drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // SWAP logic: swap draggedIndex and index
  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newFunnels = [...persistentCustomFunnels];
    // Swap the two elements
    [newFunnels[draggedIndex], newFunnels[index]] = [newFunnels[index], newFunnels[draggedIndex]];

    setPersistentCustomFunnels(newFunnels);
    setCustomFunnels(newFunnels);

    // Save to localStorage (only for existing plans)
    if (cId) saveCustomFunnelsToStorage(newFunnels);

    // Reorder funnel_stages and channel_mix to match new order
    setCampaignFormData((prev: any) => {
      // Only keep funnel_stages that are present in newFunnels, in new order
      const newFunnelNames = newFunnels.map((f) => f.name);
      const orderedFunnelStages = newFunnelNames.filter((name) =>
        prev.funnel_stages?.includes(name)
      );
      // Reorder channel_mix to match newFunnels order
      const orderedChannelMix = newFunnelNames
        .map((name) =>
          prev.channel_mix?.find((ch: any) => ch.funnel_stage === name) ||
          { funnel_stage: name }
        );
      return {
        ...prev,
        custom_funnels: newFunnels,
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
      };
    });

    setHasChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // When opening modal for add/edit, set color accordingly
  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === "add") {
        setNewFunnelColor(getAvailableColor());
        setCustomColor(colorClassToHex[getAvailableColor()]);
      } else if (modalMode === "edit" && currentFunnel) {
        // If the color is a palette class, set both accordingly. If it's a hex, set newFunnelColor to hex and customColor to hex.
        if (colorPalette.includes(currentFunnel.color)) {
          setNewFunnelColor(currentFunnel.color);
          setCustomColor(colorClassToHex[currentFunnel.color] || colorClassToHex[colorPalette[0]]);
        } else if (isHexColor(currentFunnel.color)) {
          setNewFunnelColor(currentFunnel.color);
          setCustomColor(currentFunnel.color);
        } else {
          setNewFunnelColor(colorPalette[0]);
          setCustomColor(colorClassToHex[colorPalette[0]]);
        }
      }
    }
    // eslint-disable-next-line
  }, [isModalOpen, modalMode, currentFunnel]);

  // Helper to get the background style for a funnel color (palette or hex)
  // Modified: Always return gray bg for deselected (isSelected === false)
  const getFunnelBgStyle = (color: string, isSelected: boolean) => {
    if (!isSelected) {
      // Always gray for deselected
      return { className: "bg-gray-200", style: {} };
    }
    if (colorPalette.includes(color)) {
      return { className: color, style: {} };
    }
    if (isHexColor(color)) {
      return { className: "", style: { background: color } };
    }
    return { className: "bg-gray-200", style: {} };
  };

  // Helper to get the text color for a funnel color (palette or hex)
  const getFunnelTextColor = (color: string, isSelected: boolean) => {
    if (isSelected) {
      // If hex, use white text for dark colors, black for light
      if (isHexColor(color)) {
        // Simple luminance check
        const hex = color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.6 ? "text-white" : "text-gray-900";
      }
      // For palette, always white
      return "text-white";
    }
    return "text-gray-500";
  };

  // --- BEGIN MODAL RENDER ---
  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
        />
      </div>
      {/* Inserted phrase below the title */}
      <div className="w-full flex justify-center">
        <p className="text-gray-800 italic font-semibold text-base text-center max-w-2xl mt-3">
          Let's start with your campaign structure. Feel free to customize the number and name of phases as your liking
        </p>
      </div>
      <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
        {customFunnels.map((funnel, index) => {
          const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
          const { className: funnelBgClass, style: funnelBgStyle } = getFunnelBgStyle(funnel.color, isSelected);
          const textColor = getFunnelTextColor(funnel.color, isSelected);

          return (
            <div
              key={`${funnel.id}-${index}`}
              className={`relative w-full max-w-[685px] transition-all duration-150
                ${isDragging ? "opacity-50" : ""}
                ${isDragOver ? "ring-2 ring-blue-400" : ""}
              `}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              style={{ cursor: "grab" }}
            >
              <div className="flex items-center">
                <span
                  className="flex items-center justify-center mr-2 cursor-grab"
                  title="Drag to reorder"
                  tabIndex={-1}
                  aria-label="Drag handle"
                  style={{ touchAction: "none" }}
                >
                  <GripVertical size={20} className="text-gray-400" />
                </span>
                <button
                  className={`flex-1 cursor-pointer w-full rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${funnelBgClass} ${textColor}`}
                  onClick={() => handleSelect(funnel.name)}
                  type="button"
                  style={{
                    ...funnelBgStyle,
                    opacity: 1,
                    border: isSelected ? "none" : "1px solid #e5e7eb",
                  }}
                >
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
                      // If palette, set class; if hex, set hex
                      if (colorPalette.includes(funnel.color)) {
                        setNewFunnelColor(funnel.color);
                        setCustomColor(colorClassToHex[funnel.color] || colorClassToHex[colorPalette[0]]);
                      } else if (isHexColor(funnel.color)) {
                        setNewFunnelColor(funnel.color);
                        setCustomColor(funnel.color);
                      } else {
                        setNewFunnelColor(colorPalette[0]);
                        setCustomColor(colorClassToHex[colorPalette[0]]);
                      }
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
            </div>
          );
        })}
        <button
          className="flex items-center gap-2 text-blue-500 cursor-pointer text-[16px]"
          onClick={() => {
            setModalMode("add");
            setCurrentFunnel(null);
            setNewFunnelName("");
            setNewFunnelColor(getAvailableColor());
            setCustomColor(colorClassToHex[getAvailableColor()]);
            setIsModalOpen(true);
          }}
        >
          <PlusIcon className="text-blue-500" />
          Add new funnel
        </button>
      </div>

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
                }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter funnel name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${color}`}
                    style={{
                      borderColor: newFunnelColor === color ? "#2563eb" : "#e5e7eb",
                      boxShadow: newFunnelColor === color ? "0 0 0 2px #2563eb" : undefined,
                    }}
                    aria-label={`Select color ${color}`}
                    onClick={() => {
                      setNewFunnelColor(color);
                      setCustomColor(colorClassToHex[color]);
                    }}
                  >
                    {newFunnelColor === color && (
                      <span
                        className="block w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: colorClassToHex[color] }}
                      />
                    )}
                  </button>
                ))}
                <div className="flex items-center ml-2">
                  <input
                    type="color"
                    value={isHexColor(newFunnelColor) ? newFunnelColor : customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setNewFunnelColor(e.target.value);
                    }}
                    className="w-7 h-7 border-0 p-0 bg-transparent cursor-pointer"
                    aria-label="Custom color picker"
                  />
                  {/* Add a text input for HEX value, allowing copy/paste */}
                  <input
                    type="text"
                    value={isHexColor(newFunnelColor) ? newFunnelColor : customColor}
                    onChange={(e) => {
                      let val = e.target.value;
                      // Only allow # and 6 hex digits
                      if (!val.startsWith("#")) val = "#" + val.replace(/[^0-9A-Fa-f]/g, "");
                      if (val.length > 7) val = val.slice(0, 7);
                      setCustomColor(val);
                      setNewFunnelColor(val);
                    }}
                    className="ml-2 w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="#000000"
                    maxLength={7}
                    spellCheck={false}
                    autoComplete="off"
                    inputMode="text"
                  />
                </div>
              </div>
              {/* Removed color circle and hex text display below the color picker as per instructions */}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalMode === "add") {
                    handleAddFunnel(newFunnelName, newFunnelColor);
                  } else if (currentFunnel) {
                    handleEditFunnel(currentFunnel.name, newFunnelName, newFunnelColor);
                  }
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