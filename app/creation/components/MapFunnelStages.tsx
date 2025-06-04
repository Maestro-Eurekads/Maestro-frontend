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
  const handleAddFunnel = (name: string) => {
    const error = validateFunnelName(name, false);
    if (error) {
      toast.error(error, {
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
  const handleEditFunnel = (oldId: string, newName: string) => {
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-[32px] mt-[56px]">
        {customFunnels.map((funnel, index) => {
          const isSelected = campaignFormData.funnel_stages?.includes(funnel.name);
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
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
                  className={`flex-1 cursor-pointer w-full rounded-lg py-4 flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSelected
                      ? `${funnel.color} text-white`
                      : "bg-white text-black shadow-md hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelect(funnel.name)}
                  type="button"
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
                    handleAddFunnel(newFunnelName);
                  } else if (currentFunnel) {
                    handleEditFunnel(currentFunnel.name, newFunnelName);
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