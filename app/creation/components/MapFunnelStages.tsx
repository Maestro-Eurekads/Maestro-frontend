"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";

import PageHeaderWrapper from "../../../components/PageHeaderWapper";

import { useCampaigns } from "../../utils/CampaignsContext";

import { useVerification } from "app/utils/VerificationContext";

import { useComments } from "app/utils/CommentProvider";

import {
  PlusIcon,
  Edit2,
  Trash2,
  X,
  GripVertical,
  ChevronDown,
  Loader,
} from "lucide-react";


import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { colorClassToHex, colorPalette } from "components/Options";
import SaveProgressButton from "app/utils/SaveProgressButton";
import { useSearchParams } from "next/navigation";
import { useActive } from "app/utils/ActiveContext";
import { toast } from "sonner";
import SaveAllProgressButton from "./SaveProgres/SaveAllProgressButton";

// Define type for funnel objects

interface Funnel {
  id: string;

  name: string;

  color: string; // tailwind color class or hex string
}

interface FunnelConfig {
  name: string;

  stages: Funnel[];

  deleted?: boolean; // Add deleted property
}

// Color palette for quick selection (tailwind classes)



// For color picker, map tailwind class to color value for <input type="color">



const hexToColorClass = (hex: string): string | null => {
  for (const [cls, val] of Object.entries(colorClassToHex)) {
    if (val.toLowerCase() === hex.toLowerCase()) return cls;
  }

  return null;
};

const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color);

// Preset funnel structures for dropdown

const presetStructures: { label: string; stages: Funnel[] }[] = [
  {
    label: "Standard (Awareness, Consideration, Conversion)",

    stages: [
      { id: "Awareness", name: "Awareness", color: colorPalette[0] },

      { id: "Consideration", name: "Consideration", color: colorPalette[1] },

      { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    ],
  },

  {
    label: "Full (Awareness, Consideration, Conversion, Loyalty)",

    stages: [
      { id: "Awareness", name: "Awareness", color: colorPalette[0] },

      { id: "Consideration", name: "Consideration", color: colorPalette[1] },

      { id: "Conversion", name: "Conversion", color: colorPalette[2] },

      { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
    ],
  },

  {
    label: "Simple (Conversion only)",

    stages: [{ id: "Conversion", name: "Conversion", color: colorPalette[2] }],
  },

  {
    label: "Branding (Awareness, Loyalty)",

    stages: [
      { id: "Awareness", name: "Awareness", color: colorPalette[0] },

      { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
    ],
  },
];

// Helper to normalize funnel stages for comparison

const normalizeFunnelStages = (stages: Funnel[]) =>
  stages?.map((f) => f?.name?.toLowerCase())?.sort()?.join(",");

const MapFunnelStages = () => {
  const {
    campaignData,
    campaignFormData,
    cId,
    setCampaignFormData,
    jwt,
    loadingCampaign,
    updateCampaign,
    getActiveCampaign,
  } = useCampaigns();
  const query = useSearchParams();
  const documentId = query.get("campaignId");
  const { setIsDrawerOpen, setClose } = useComments();
  const { setChange } = useActive()

  const { verifyStep, setHasChanges } = useVerification();

  const [previousValidationState, setPreviousValidationState] = useState<
    boolean | null
  >(null);

  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([]);

  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<
    Funnel[]
  >([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);

  const [newFunnelName, setNewFunnelName] = useState("");

  const [newFunnelColor, setNewFunnelColor] = useState<string>(colorPalette[0]);

  const [customColor, setCustomColor] = useState<string>(
    colorClassToHex[colorPalette[0]]
  );

  const modalRef = useRef<HTMLDivElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [funnelConfigs, setFunnelConfigs] = useState<FunnelConfig[]>([]);
  const [selectedConfigIdx, setSelectedConfigIdx] = useState<number | null>(null);
  const [isSaveConfigModalOpen, setIsSaveConfigModalOpen] = useState(false);
  const [newConfigName, setNewConfigName] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<number | null>(null);
  // Get clientId and mediaPlanId safely
  const clientId = campaignFormData?.client_selection?.id ?? "";
  const mediaPlanId = campaignFormData?.media_plan_id ?? "";




  // Default funnel stages

  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ];

  // Filter active (non-deleted) configurations
  const activeConfigs = funnelConfigs.filter((config) => !config.deleted);

  // Initialize funnel data and configurations

  useEffect(() => {
    if (!loadingCampaign) {
      const isNewPlan = !mediaPlanId || mediaPlanId === "";

      // Load configurations from campaignFormData first, then fall back to campaignData

      let configs: FunnelConfig[] = [];

      if (campaignData?.funnel_configs?.length) {
        configs = campaignData.funnel_configs;
      } else if (campaignData?.client?.custom_funnel_configs?.length) {
        configs = campaignData.client.custom_funnel_configs;
      }


      setFunnelConfigs(configs);

      // Load funnels from campaignFormData first

      let loadedCustomFunnels: Funnel[] = [];

      if (campaignFormData?.custom_funnels?.length > 0) {
        loadedCustomFunnels = campaignFormData.custom_funnels;
      } else if (isNewPlan || !clientId) {
        loadedCustomFunnels = defaultFunnels;
      } else if (campaignData?.custom_funnels?.length > 0) {
        loadedCustomFunnels = campaignData.custom_funnels.map(
          (funnel: any, index: number) => ({
            id: funnel.id || funnel.name || `funnel-${index}`,
            name: funnel.name || `Funnel ${index + 1}`,
            color: funnel?.color ||
              colorPalette[index % colorPalette.length] ||
              "bg-gray-500",
          })
        );
      } else {
        loadedCustomFunnels = defaultFunnels;
      }

      setPersistentCustomFunnels(loadedCustomFunnels);
      setCustomFunnels(loadedCustomFunnels);
      // Update campaignFormData 
      setCampaignFormData((prev: any) => {
        const orderedFunnelStages = loadedCustomFunnels.map((f) => f?.name);
        const orderedChannelMix = loadedCustomFunnels.map((f) => {
          // if (prev?.channel_mix && prev.channel_mix.length > 0) {
          const existingChannel = prev?.channel_mix && prev?.channel_mix?.length > 0 && prev?.channel_mix?.find(
            (ch: any) => ch?.funnel_stage === f?.name
          );
          return existingChannel ? existingChannel : { funnel_stage: f?.name };
          // }
        });

        const updatedFormData = {
          ...prev,

          funnel_type: "custom",

          funnel_stages: orderedFunnelStages,
          channel_mix: orderedChannelMix,
          custom_funnels: loadedCustomFunnels,
          funnel_configs: configs,
        };


        return updatedFormData;
      });

      // Match current funnels to configs or presets to set dropdown selection
      // Only consider active (non-deleted) configurations
      const activeConfigsForMatching = configs.filter(
        (config) => !config.deleted
      );

      const currentFunnelKey = normalizeFunnelStages(loadedCustomFunnels);
      const matchingConfigIdx = configs.findIndex(
        (config) =>
          !config.deleted &&
          normalizeFunnelStages(config.stages) === currentFunnelKey
      );

      const matchingPresetIdx = presetStructures.findIndex(
        (preset) => normalizeFunnelStages(preset.stages) === currentFunnelKey
      );

      // Load saved selection from campaignFormData

      const savedConfigIdx = campaignFormData?.selected_config_idx;
      const savedPresetIdx = campaignFormData?.selected_preset_idx;

      if (
        savedConfigIdx !== undefined &&
        savedConfigIdx !== null &&
        configs.length > savedConfigIdx &&
        !configs[savedConfigIdx]?.deleted &&
        normalizeFunnelStages(configs[savedConfigIdx].stages) ===
        currentFunnelKey
      ) {
        setSelectedConfigIdx(savedConfigIdx);

        setSelectedPreset(null);
      } else if (
        savedPresetIdx !== undefined &&
        savedPresetIdx !== null &&
        presetStructures.length > savedPresetIdx &&
        normalizeFunnelStages(presetStructures[savedPresetIdx].stages) ===
        currentFunnelKey
      ) {
        setSelectedPreset(savedPresetIdx);

        setSelectedConfigIdx(null);
      } else if (matchingConfigIdx !== -1) {
        setSelectedConfigIdx(matchingConfigIdx);

        setSelectedPreset(null);

        setCampaignFormData((prev: any) => ({
          ...prev,

          selected_config_idx: matchingConfigIdx,

          selected_preset_idx: null,
        }));
      } else if (matchingPresetIdx !== -1) {
        setSelectedPreset(matchingPresetIdx);

        setSelectedConfigIdx(null);

        setCampaignFormData((prev: any) => ({
          ...prev,

          selected_config_idx: null,

          selected_preset_idx: matchingPresetIdx,
        }));
      } else {
        setSelectedConfigIdx(null);

        setSelectedPreset(isNewPlan || !clientId ? 1 : null);

        setCampaignFormData((prev: any) => ({
          ...prev,

          selected_config_idx: null,
          selected_preset_idx: isNewPlan || !clientId ? 1 : null,
        }));
      }
    }
  }, [clientId, mediaPlanId, campaignData, loadingCampaign]);

  // Initialize comments drawer

  useEffect(() => {
    setIsDrawerOpen(false);
    setClose(false);
  }, [setIsDrawerOpen, setClose]);

  // Validate funnel stages

  useEffect(() => {
    const isValid =
      Array.isArray(campaignFormData?.funnel_stages) &&
      campaignFormData.funnel_stages.length > 0;

    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId);

      setPreviousValidationState(isValid);


    }
  }, [campaignFormData, cId, verifyStep, previousValidationState]);

  // Update campaignFormData when funnels change

  useEffect(() => {
    if (persistentCustomFunnels.length > 0) {
      setCampaignFormData((prev: any) => ({
        ...prev,
        custom_funnels: persistentCustomFunnels,
      }));

      // Update selection if current funnels match a config or preset
      // Only consider active (non-deleted) configurations
      const currentFunnelKey = normalizeFunnelStages(persistentCustomFunnels);

      const matchingConfigIdx = funnelConfigs.findIndex(
        (config) =>
          !config.deleted &&
          normalizeFunnelStages(config.stages) === currentFunnelKey
      );

      const matchingPresetIdx = presetStructures.findIndex(
        (preset) => normalizeFunnelStages(preset.stages) === currentFunnelKey
      );

      // Use functional updates to avoid dependency issues
      if (matchingConfigIdx !== -1) {
        setSelectedConfigIdx((prevIdx) => {
          if (prevIdx !== matchingConfigIdx) {
            setSelectedPreset(null);
            setCampaignFormData((prev: any) => ({
              ...prev,
              selected_config_idx: matchingConfigIdx,
              selected_preset_idx: null,
            }));
            return matchingConfigIdx;
          }
          return prevIdx;
        });
      } else if (matchingPresetIdx !== -1) {
        setSelectedPreset((prevIdx) => {
          if (prevIdx !== matchingPresetIdx) {
            setSelectedConfigIdx(null);
            setCampaignFormData((prev: any) => ({
              ...prev,
              selected_config_idx: null,
              selected_preset_idx: matchingPresetIdx,
            }));
            return matchingPresetIdx;
          }
          return prevIdx;
        });
      }
    }
  }, [persistentCustomFunnels, funnelConfigs]); // Removed selectedConfigIdx and selectedPreset from dependencies

  // Update campaignFormData when funnel configs change

  useEffect(() => {
    if (funnelConfigs.length > 0) {
      setCampaignFormData((prev: any) => ({
        ...prev,

        funnel_configs: funnelConfigs,
      }));
    }
  }, [funnelConfigs]);

  // Handle clicks outside modal

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);

        setIsSaveConfigModalOpen(false);

        setIsDeleteModalOpen(false);
      }
    };

    if (isModalOpen || isSaveConfigModalOpen || isDeleteModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, isSaveConfigModalOpen, isDeleteModalOpen]);

  // Get an available color

  const getAvailableColor = (excludeColor?: string): string => {
    const usedColors = persistentCustomFunnels
      .filter((f) => f.color !== excludeColor)
      .map((f) => f.color);

    const availableColors = colorPalette?.filter((c) => !usedColors?.includes(c));

    return availableColors?.length > 0
      ? availableColors[0]
      : colorPalette[persistentCustomFunnels?.length % colorPalette?.length];
  };

  // Funnel name validation

  const validateFunnelName = (
    name: string,
    isEdit = false,
    oldId?: string
  ): string => {
    const trimmed = name.trim();

    if (!trimmed) return "Funnel name cannot be empty";

    if (trimmed.length < 2) return "Funnel name must be at least 2 characters";

    if (!/[a-zA-Z]/.test(trimmed))
      return "Funnel name must include at least one letter";

    if (
      persistentCustomFunnels.some(
        (funnel) =>
          funnel?.name?.toLowerCase() === trimmed?.toLowerCase() &&
          (!isEdit || funnel?.name !== oldId)
      )
    ) {
      return "A funnel with this name already exists";
    }

    return "";
  };

  // Funnel config name validation

  const validateConfigName = (name: string): string => {
    const trimmed = name.trim();

    if (!trimmed) return "Configuration name cannot be empty";

    if (trimmed.length < 2)
      return "Configuration name must be at least 2 characters";

    if (!/[a-zA-Z]/.test(trimmed))
      return "Configuration name must include at least one letter";

    if (
      activeConfigs.some(
        (config) => config?.name?.toLowerCase() === trimmed?.toLowerCase()
      )
    ) {
      return "A configuration with this name already exists";
    }

    return "";
  };

  // Handle funnel selection

  const handleSelect = (id: string) => {
    if (
      campaignFormData?.funnel_stages?.includes(id) &&
      campaignFormData?.funnel_stages?.length === 1
    ) {
      toast.error("You must have at least one stage selected");

      return;
    }

    const newFunnelStages = campaignFormData?.funnel_stages
      ? campaignFormData?.funnel_stages?.includes(id)
        ? campaignFormData?.funnel_stages?.filter((name: string) => name !== id)
        : [...campaignFormData?.funnel_stages, id]
      : [id];

    const newChannelMix = campaignFormData?.funnel_stages?.includes(id)
      ? campaignFormData?.channel_mix?.filter(
        (ch: any) => ch?.funnel_stage !== id
      )
      : [...(campaignFormData?.channel_mix || []), { funnel_stage: id }];

    const orderedFunnelStages = persistentCustomFunnels

      .map((f) => f?.name)

      .filter((name) => newFunnelStages.includes(name));

    const orderedChannelMix = persistentCustomFunnels

      .map((f) => newChannelMix?.find((ch: any) => ch?.funnel_stage === f?.name))

      .filter((ch): ch is { funnel_stage: string } => !!ch);

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
      toast.error(error);

      return;
    }

    const newFunnel: Funnel = { id: name, name, color };

    const updatedFunnels = [...persistentCustomFunnels, newFunnel];

    setPersistentCustomFunnels(updatedFunnels);

    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,

      custom_funnels: updatedFunnels,

      funnel_stages: [...(prev.funnel_stages || []), name],

      channel_mix: [...(prev.channel_mix || []), { funnel_stage: name }],

      selected_config_idx: null,

      selected_preset_idx: null,
    }));

    setHasChanges(true);

    setSelectedConfigIdx(null);

    setSelectedPreset(null);

    toast.success("Funnel added successfully");

    setIsModalOpen(false);


  };

  // Edit an existing funnel

  const handleEditFunnel = (
    oldId: string,
    newName: string,
    newColor: string
  ) => {
    const error = validateFunnelName(newName, true, oldId);
    if (error) {
      toast.error(error);

      return;
    }

    const updatedFunnels = persistentCustomFunnels.map((f) =>
      f.name === oldId
        ? { ...f, id: newName, name: newName, color: newColor }
        : f
    );

    setPersistentCustomFunnels(updatedFunnels);

    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,

      custom_funnels: updatedFunnels,

      funnel_stages: (prev?.funnel_stages || []).map((stage: string) =>
        (stage === oldId && oldId !== newName) ? newName : stage
      ),

      channel_mix: (prev?.channel_mix || []).map((ch: any) =>
        (ch?.funnel_stage === oldId && oldId !== newName) ? { funnel_stage: newName } : ch
      ),

      selected_config_idx: null,

      selected_preset_idx: null,
    }));

    setHasChanges(true);

    setSelectedConfigIdx(null);

    setSelectedPreset(null);

    toast.success("Funnel updated successfully");

    setIsModalOpen(false);


  };

  // Remove a funnel

  const handleRemoveFunnel = (id: string) => {
    if (persistentCustomFunnels?.length <= 1) {
      toast.error("You must have at least one funnel stage");

      return;
    }

    const updatedFunnels = persistentCustomFunnels?.filter((f) => f.name !== id);

    setPersistentCustomFunnels(updatedFunnels);

    setCustomFunnels(updatedFunnels);

    setCampaignFormData((prev: any) => ({
      ...prev,

      custom_funnels: updatedFunnels,

      funnel_stages: (prev?.funnel_stages || []).filter(
        (name: string) => name !== id
      ),

      channel_mix: (prev?.channel_mix || []).filter(
        (ch: any) => ch?.funnel_stage !== id
      ),

      selected_config_idx: null,

      selected_preset_idx: null,
    }));

    setHasChanges(true);

    setSelectedConfigIdx(null);

    setSelectedPreset(null);

    toast.success("Funnel removed successfully");


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

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);

      setDragOverIndex(null);

      return;
    }

    const newFunnels = [...persistentCustomFunnels];
    [newFunnels[draggedIndex], newFunnels[index]] = [
      newFunnels[index],
      newFunnels[draggedIndex],
    ];

    setPersistentCustomFunnels(newFunnels);

    setCustomFunnels(newFunnels);

    setCampaignFormData((prev: any) => {
      const newFunnelNames = newFunnels.map((f) => f?.name);

      const orderedFunnelStages = newFunnelNames.filter((name) =>
        prev?.funnel_stages?.includes(name)
      );

      const orderedChannelMix = newFunnelNames.map(
        (name) =>
          prev?.channel_mix?.find((ch: any) => ch?.funnel_stage === name) || {
            funnel_stage: name,
          }
      );

      return {
        ...prev,

        custom_funnels: newFunnels,

        funnel_stages: orderedFunnelStages,

        channel_mix: orderedChannelMix,

        selected_config_idx: null,

        selected_preset_idx: null,
      };
    });

    setHasChanges(true);
    setSelectedConfigIdx(null);
    setSelectedPreset(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);

    setDragOverIndex(null);
  };

  // Set color when opening modal

  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === "add") {
        const availableColor = getAvailableColor();

        setNewFunnelColor(availableColor);

        setCustomColor(colorClassToHex[availableColor]);
      } else if (modalMode === "edit" && currentFunnel) {
        if (colorPalette?.includes(currentFunnel?.color)) {
          setNewFunnelColor(currentFunnel?.color);

          setCustomColor(
            colorClassToHex[currentFunnel?.color] ||
            colorClassToHex[colorPalette[0]]
          );
        } else if (isHexColor(currentFunnel?.color)) {
          setNewFunnelColor(currentFunnel?.color);

          setCustomColor(currentFunnel?.color);
        } else {
          setNewFunnelColor(colorPalette[0]);

          setCustomColor(colorClassToHex[colorPalette[0]]);
        }
      }
    }
  }, [isModalOpen, modalMode, currentFunnel]);

  // Helper to get funnel background style

  const getFunnelBgStyle = (color: string, isSelected: boolean) => {
    if (!isSelected) return { className: "bg-gray-200", style: {} };

    if (colorPalette.includes(color)) return { className: color, style: {} };

    if (isHexColor(color))
      return { className: "", style: { background: color } };

    return { className: "bg-gray-200", style: {} };
  };

  // Helper to get funnel text color

  const getFunnelTextColor = (color: string, isSelected: boolean) => {
    if (isSelected && isHexColor(color)) {
      const hex = color.replace("#", "");

      const r = Number.parseInt(hex.substring(0, 2), 16);
      const g = Number.parseInt(hex.substring(2, 4), 16);
      const b = Number.parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.6 ? "text-white" : "text-gray-900";
    }

    return isSelected ? "text-white" : "text-gray-500";
  };

  // Handle preset selection

  const handlePresetSelect = (presetIdx: number) => {
    setSelectedPreset(presetIdx);

    setSelectedConfigIdx(null);

    const preset = presetStructures[presetIdx];

    setPersistentCustomFunnels(preset.stages);

    setCustomFunnels(preset.stages);

    setCampaignFormData((prev: any) => ({
      ...prev,

      custom_funnels: preset?.stages,

      funnel_stages: preset?.stages?.map((f) => f?.name),

      channel_mix: preset?.stages?.map((f) => ({ funnel_stage: f?.name })),

      selected_config_idx: null,

      selected_preset_idx: presetIdx,
    }));

    setHasChanges(true);
    toast.success("Preset structure applied");
    setDropdownOpen(false);


  };

  // Handle saved config selection

  const handleConfigSelect = (configIdx: number) => {

    setSelectedConfigIdx(configIdx);

    setSelectedPreset(null);

    const config = funnelConfigs[configIdx];

    setPersistentCustomFunnels(config.stages);

    setCustomFunnels(config.stages);

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: config?.stages,
      funnel_stages: config?.stages?.map((f) => f?.name),
      channel_mix: config?.stages?.map((f) => ({ funnel_stage: f?.name })),
      selected_config_idx: configIdx,
      selected_preset_idx: null,
    }));

    setHasChanges(true);
    toast.success("Funnel configuration applied");
    setDropdownOpen(false);
  };

  // Save configuration

  const handleSaveConfiguration = () => {
    // Check if a plan exists (campaign has been created)
    if (!cId || !campaignData) {
      toast.error("Please save your plan first before saving funnel configuration. Use the 'Save' button above to create your plan.");
      return;
    }

    // Check if funnel stages are selected
    if (!campaignFormData?.funnel_stages || campaignFormData.funnel_stages.length === 0) {
      toast.error("Please select at least one funnel stage before saving configuration.");
      return;
    }

    setChange(true)
    setNewConfigName("");
    setIsSaveConfigModalOpen(true);
  };

  // Confirm save config

  const handleSaveConfigConfirm = async () => {
    // Double-check if a plan exists before saving configuration
    if (!cId || !campaignData) {
      toast.error("Please save your plan first before saving funnel configuration. Use the 'Save' button above to create your plan.");
      setIsSaveConfigModalOpen(false);
      return;
    }

    setChange(true)
    const error = validateConfigName(newConfigName);

    if (error) {
      toast.error(error);
      return;
    }

    const config = {
      name: newConfigName.trim(),
      stages: [...persistentCustomFunnels],
      deleted: false, // Explicitly set deleted to false for new configs
    };

    const updatedConfigs = [...funnelConfigs, config];
    setFunnelConfigs(updatedConfigs);
    const newConfigIdx = updatedConfigs.length - 1;
    setSelectedConfigIdx(newConfigIdx);
    setSelectedPreset(null);
    setCampaignFormData((prev: any) => ({
      ...prev,

      funnel_configs: updatedConfigs,
      selected_config_idx: newConfigIdx,
      selected_preset_idx: null,
    }));

    // Since we now require a plan to be saved first, we can always save to the server
    setSavingConfig(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}`,

        {
          data: {
            custom_funnel_configs: updatedConfigs,
          },
        },

        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      toast.success(`"${newConfigName.trim()}" configuration saved!`);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      toast.error(
        "Failed to update funnel configs on server. Please try again."
      );
    } finally {
      setSavingConfig(false);
    }

    setIsSaveConfigModalOpen(false);

  };

  // Open delete confirmation modal

  const handleDeleteConfig = (configIdx: number) => {
    setChange(true)
    setConfigToDelete(configIdx);

    setIsDeleteModalOpen(true);
  };

  // Confirm delete configuration - Mark as deleted instead of removing

  const handleDeleteConfigConfirm = () => {
    if (configToDelete === null) return;

    // Mark the configuration as deleted instead of removing it
    const updatedConfigs = funnelConfigs.map((config, idx) =>
      idx === configToDelete ? { ...config, deleted: true } : config
    );

    setFunnelConfigs(updatedConfigs);

    let newSelectedConfigIdx = selectedConfigIdx;

    let newSelectedPresetIdx = selectedPreset;

    // If the deleted config was currently selected, reset to default
    if (selectedConfigIdx === configToDelete) {
      newSelectedConfigIdx = null;

      newSelectedPresetIdx = 1; // Fallback to "Full" preset

      setPersistentCustomFunnels(defaultFunnels);

      setCustomFunnels(defaultFunnels);

      setCampaignFormData((prev: any) => ({
        ...prev,

        funnel_configs: updatedConfigs,

        custom_funnels: defaultFunnels,

        funnel_stages: defaultFunnels.map((f) => f.name),

        channel_mix: defaultFunnels.map((f) => ({ funnel_stage: f.name })),

        selected_config_idx: null,

        selected_preset_idx: 1,
      }));
    } else {
      // Just update the configs without changing selection
      setCampaignFormData((prev: any) => ({
        ...prev,

        funnel_configs: updatedConfigs,
      }));
    }

    setSelectedConfigIdx(newSelectedConfigIdx);

    setSelectedPreset(newSelectedPresetIdx);

    setHasChanges(true);

    // Update on server if clientId exists
    if (clientId) {
      axios
        .put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}`,
          {
            data: {
              custom_funnel_configs: updatedConfigs,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        )
        .catch((err) => {
          console.error("Failed to update funnel configs on Strapi:", err);
        });
    }

    toast.success("Configuration deleted successfully");



    setIsDeleteModalOpen(false);

    setConfigToDelete(null);
  };

  // Helper for stage preview style

  const getStagePreviewStyle = (color: string) => {
    if (colorPalette.includes(color)) return { className: color, style: {} };

    if (isHexColor(color))
      return { className: "", style: { background: color } };

    return { className: "bg-gray-400", style: {} };
  };



  return (
    <div className="relative">
      <div className="flex flex-row justify-between w-full">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
        />
        {/* <SaveProgressButton setIsOpen={undefined} /> */}
        <SaveAllProgressButton />
      </div>

      <div className="w-full flex items-start">
        <p className="text-gray-800 italic font-semibold text-base text-center max-w-2xl mt-3">
          Let's start with your campaign structure. Feel free to customize the
          number and name of phases as your liking
        </p>
      </div>


      {loadingCampaign ? (
        <>
          <div className=" h-full">
            <div className="">
              <div>
                <Skeleton height={24} width="75%" />
                <Skeleton height={24} width="50%" />
              </div>
              <div>
                <Skeleton height={24} width="100%" />
                <Skeleton height={24} width="83.33%" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-[56px] w-full">
            <div className="w-full md:w-[320px] flex flex-col items-center">
              <div className="relative w-full">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm text-gray-700 text-base font-medium focus:outline-none"
                  onClick={() => setDropdownOpen((open) => !open)}
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  {selectedConfigIdx !== null &&
                    !funnelConfigs[selectedConfigIdx]?.deleted
                    ? funnelConfigs[selectedConfigIdx]?.name
                    : selectedPreset !== null
                      ? presetStructures[selectedPreset].label
                      : "Choose a funnel structure"}

                  <ChevronDown className="ml-2" size={18} />
                </button>

                {dropdownOpen && (
                  <ul
                    className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                    role="listbox"
                  >
                    {activeConfigs?.length > 0 && (
                      <>
                        <li className="px-4 py-2 text-xs text-gray-500 font-semibold">
                          Saved Configurations
                        </li>

                        {activeConfigs?.map((config, activeIdx) => {
                          // Find the original index in the full funnelConfigs array
                          const originalIdx = funnelConfigs.findIndex(
                            (c) => c === config
                          );

                          return (
                            <li
                              key={`config-${config.name}-${originalIdx}`}
                              className={`px-4 py-3 cursor-pointer hover:bg-blue-50 flex justify-between items-center ${selectedConfigIdx === originalIdx
                                ? "bg-blue-100"
                                : ""
                                }`}
                              role="option"
                              aria-selected={selectedConfigIdx === originalIdx}
                              onClick={() => handleConfigSelect(originalIdx)}
                            >
                              <span
                                className={
                                  selectedConfigIdx === originalIdx
                                    ? "font-bold text-blue-700"
                                    : ""
                                }
                              >
                                {config.name}
                              </span>

                              <button
                                className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleDeleteConfig(originalIdx);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            </li>
                          );
                        })}

                        <li className="border-t border-gray-200 my-1"></li>
                      </>
                    )}

                    <li className="px-4 py-2 text-xs text-gray-500 font-semibold">
                      Presets
                    </li>

                    {presetStructures?.map((preset, idx) => (
                      <li
                        key={`preset-${preset.label}-${idx}`}
                        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${selectedPreset === idx && selectedConfigIdx === null
                          ? "bg-blue-100 font-bold"
                          : ""
                          }`}
                        role="option"
                        aria-selected={
                          selectedPreset === idx && selectedConfigIdx === null
                        }
                        onClick={() => handlePresetSelect(idx)}
                      >
                        <span
                          className={
                            selectedPreset === idx && selectedConfigIdx === null
                              ? "font-bold text-blue-700"
                              : ""
                          }
                        >
                          {preset.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 text-xs text-gray-500 text-center">
                <span>
                  Select a preset or a saved configuration to quickly apply a
                  funnel structure. You can further customize on the right.
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center gap-[32px] w-full">
              {customFunnels.map((funnel, index) => {
                const isSelected =
                  campaignFormData?.funnel_stages?.includes(funnel.name) ??
                  false;

                const isDragging = draggedIndex === index;

                const isDragOver =
                  dragOverIndex === index &&
                  draggedIndex !== null &&
                  draggedIndex !== index;

                const { className: funnelBgClass, style: funnelBgStyle } =
                  getFunnelBgStyle(funnel.color, isSelected);

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

                            setNewFunnelName(funnel?.name);

                            if (colorPalette?.includes(funnel?.color)) {
                              setNewFunnelColor(funnel?.color);

                              setCustomColor(
                                colorClassToHex[funnel?.color] ||
                                colorClassToHex[colorPalette[0]]
                              );
                            } else if (isHexColor(funnel?.color)) {
                              setNewFunnelColor(funnel?.color);

                              setCustomColor(funnel?.color);
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

                            handleRemoveFunnel(funnel?.name);
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

              <button
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleSaveConfiguration}
                type="button"
              >
                Save Funnel Configuration
              </button>
            </div>

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
                          borderColor:
                            newFunnelColor === color ? "#2563eb" : "#e5e7eb",

                          boxShadow:
                            newFunnelColor === color
                              ? "0 0 0 2px #2563eb"
                              : undefined,
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
                        value={
                          isHexColor(newFunnelColor)
                            ? newFunnelColor
                            : customColor
                        }
                        onChange={(e) => {
                          setCustomColor(e.target.value);

                          setNewFunnelColor(e.target.value);
                        }}
                        className="w-7 h-7 border-0 p-0 bg-transparent cursor-pointer"
                        aria-label="Custom color picker"
                      />

                      <input
                        type="text"
                        value={
                          isHexColor(newFunnelColor)
                            ? newFunnelColor
                            : customColor
                        }
                        onChange={(e) => {
                          let val = e.target.value;

                          if (!val.startsWith("#"))
                            val = "#" + val.replace(/[^0-9A-Fa-f]/g, "");

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
                        handleAddFunnel(newFunnelName, newFunnelColor);
                      } else if (currentFunnel) {
                        handleEditFunnel(
                          currentFunnel.name,
                          newFunnelName,
                          newFunnelColor
                        );
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

          {isSaveConfigModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div
                ref={modalRef}
                className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    Name your funnel configuration
                  </h3>

                  <button
                    onClick={() => setIsSaveConfigModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="configName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Configuration Name
                  </label>

                  <input
                    type="text"
                    id="configName"
                    value={newConfigName}
                    onChange={(e) => setNewConfigName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter configuration name"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsSaveConfigModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveConfigConfirm}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {savingConfig ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeleteModalOpen && configToDelete !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
              <div
                ref={modalRef}
                className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-shrink-0">
                    <Trash2 size={24} className="text-red-500" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Delete Configuration
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Are you sure you want to delete the
                      <span className="font-semibold text-red-600">
                        "{funnelConfigs[configToDelete]?.name}"
                      </span>
                      configuration? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setIsDeleteModalOpen(false); setConfigToDelete(null) }}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteConfigConfirm}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          )}
        </>
      )}


    </div>
  );
};

export default MapFunnelStages;