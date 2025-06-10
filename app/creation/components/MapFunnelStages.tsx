"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import { useCampaigns } from "../../utils/CampaignsContext"
import { useVerification } from "app/utils/VerificationContext"
import { useComments } from "app/utils/CommentProvider"
import { PlusIcon, Edit2, Trash2, X, GripVertical, ChevronDown, Settings, Eye, Share2, Users } from "lucide-react"
import toast from "react-hot-toast"

// Define type for funnel objects
interface Funnel {
  id: string
  name: string
  color: string // tailwind color class or hex string
}

interface FunnelConfig {
  name: string
  stages: Funnel[]
  isShared?: boolean
  createdBy?: string
  sharedWith?: string[] // Array of account IDs that have access
  createdAt?: string
  updatedAt?: string
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
]

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
}

const hexToColorClass = (hex: string): string | null => {
  for (const [cls, val] of Object.entries(colorClassToHex)) {
    if (val.toLowerCase() === hex.toLowerCase()) return cls
  }
  return null
}

const isHexColor = (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color)

// Updated localStorage keys for cross-account functionality
const LOCAL_STORAGE_FUNNELS_KEY = "custom_funnels_v2"
const LOCAL_STORAGE_CONFIGS_KEY = "funnel_configurations_v2"
const SHARED_CONFIGS_KEY = "shared_funnel_configurations_v2"

// Helper to get current user/account info (you'll need to implement this based on your auth system)
const getCurrentUser = () => {
  // This should return current user info from your auth context
  // For now, returning mock data - replace with actual implementation
  return {
    id: "current_user_id",
    name: "Current User",
    accountId: "current_account_id",
    role: "admin", // or "user", "manager", etc.
  }
}

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
]

const MapFunnelStages = () => {
  const { campaignData, campaignFormData, cId, setCampaignFormData } = useCampaigns()
  const { setIsDrawerOpen, setClose } = useComments()
  const { verifyStep, setHasChanges } = useVerification()
  const [previousValidationState, setPreviousValidationState] = useState<boolean | null>(null)
  const [customFunnels, setCustomFunnels] = useState<Funnel[]>([])
  const [persistentCustomFunnels, setPersistentCustomFunnels] = useState<Funnel[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null)
  const [newFunnelName, setNewFunnelName] = useState("")
  const [newFunnelColor, setNewFunnelColor] = useState<string>(colorPalette[0])
  const [customColor, setCustomColor] = useState<string>(colorClassToHex[colorPalette[0]])
  const modalRef = useRef<HTMLDivElement>(null)

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)

  // Enhanced funnel configuration state for cross-account sharing
  const [funnelConfigs, setFunnelConfigs] = useState<FunnelConfig[]>([])
  const [sharedConfigs, setSharedConfigs] = useState<FunnelConfig[]>([])
  const [selectedConfigIdx, setSelectedConfigIdx] = useState<number | null>(null)
  const [selectedSharedConfigIdx, setSelectedSharedConfigIdx] = useState<number | null>(null)
  const [isSaveConfigModalOpen, setIsSaveConfigModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [newConfigName, setNewConfigName] = useState("")
  const [configToShare, setConfigToShare] = useState<FunnelConfig | null>(null)
  const [shareAsGlobal, setShareAsGlobal] = useState(false)

  // Get current user info
  const currentUser = getCurrentUser()
  const clientId = campaignFormData?.client_selection?.id

  // Default funnel stages
  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ]

  // --- Enhanced localStorage helpers for cross-account functionality ---
  const saveCustomFunnelsToStorage = (funnels: Funnel[]) => {
    if (!clientId) return
    try {
      localStorage.setItem(`${LOCAL_STORAGE_FUNNELS_KEY}_client_${clientId}`, JSON.stringify(funnels))
    } catch (e) {
      console.error("Failed to save custom funnels to localStorage:", e)
    }
  }

  const getCustomFunnelsFromStorage = (): Funnel[] | null => {
    if (!clientId) return null
    try {
      const data = localStorage.getItem(`${LOCAL_STORAGE_FUNNELS_KEY}_client_${clientId}`)
      if (data) {
        return JSON.parse(data)
      }
    } catch (e) {
      console.error("Failed to load custom funnels from localStorage:", e)
    }
    return null
  }

  // Enhanced config storage with sharing support
  const saveFunnelConfigsToStorage = (configs: FunnelConfig[]) => {
    if (!clientId) return
    try {
      localStorage.setItem(`${LOCAL_STORAGE_CONFIGS_KEY}_client_${clientId}`, JSON.stringify(configs))
    } catch (e) {
      console.error("Failed to save funnel configurations to localStorage:", e)
    }
  }

  const getFunnelConfigsFromStorage = (): FunnelConfig[] => {
    if (!clientId) return []
    try {
      const data = localStorage.getItem(`${LOCAL_STORAGE_CONFIGS_KEY}_client_${clientId}`)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.every((config) => config.name && Array.isArray(config.stages))) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Failed to load funnel configurations from localStorage:", e)
    }
    return []
  }

  // New: Shared configurations management
  const saveSharedConfigsToStorage = (configs: FunnelConfig[]) => {
    try {
      localStorage.setItem(SHARED_CONFIGS_KEY, JSON.stringify(configs))
    } catch (e) {
      console.error("Failed to save shared configurations to localStorage:", e)
    }
  }

  const getSharedConfigsFromStorage = (): FunnelConfig[] => {
    try {
      const data = localStorage.getItem(SHARED_CONFIGS_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          // Filter configs that are accessible to current user
          return parsed.filter(
            (config: FunnelConfig) =>
              config.isShared &&
              (!config.sharedWith ||
                config.sharedWith.includes(currentUser.accountId) ||
                config.createdBy === currentUser.id),
          )
        }
      }
    } catch (e) {
      console.error("Failed to load shared configurations from localStorage:", e)
    }
    return []
  }

  // Initialize funnel data and configurations on mount or clientId change
  useEffect(() => {
    // Load both personal and shared configurations
    const configs = getFunnelConfigsFromStorage()
    const shared = getSharedConfigsFromStorage()
    setFunnelConfigs(configs)
    setSharedConfigs(shared)

    if (!clientId) {
      setPersistentCustomFunnels(defaultFunnels)
      setCustomFunnels(defaultFunnels)
      setSelectedConfigIdx(null)
      setSelectedSharedConfigIdx(null)
      setSelectedPreset(null)
      setCampaignFormData((prev: any) => ({
        ...prev,
        funnel_type: "custom",
        funnel_stages: defaultFunnels.map((f) => f.name),
        channel_mix: defaultFunnels.map((f) => ({ funnel_stage: f.name })),
        custom_funnels: defaultFunnels,
      }))
      return
    }

    // Load existing funnel configuration
    let loadedCustomFunnels: Funnel[] = []
    const localStorageFunnels = getCustomFunnelsFromStorage()

    if (localStorageFunnels && Array.isArray(localStorageFunnels) && localStorageFunnels.length > 0) {
      loadedCustomFunnels = localStorageFunnels
    } else if (campaignData?.custom_funnels && campaignData.custom_funnels.length > 0) {
      loadedCustomFunnels = campaignData.custom_funnels.map((funnel: any, index: number) => ({
        id: funnel.id || funnel.name,
        name: funnel.name,
        color: funnel.color || colorPalette[index % colorPalette.length] || "bg-gray-500",
      }))
    } else {
      loadedCustomFunnels = defaultFunnels
    }

    setPersistentCustomFunnels(loadedCustomFunnels)
    setCustomFunnels(loadedCustomFunnels)

    // Restore saved state from campaignData
    const initialFunnelStages =
      campaignData?.funnel_stages && campaignData.funnel_stages.length > 0 ? campaignData.funnel_stages : []
    const initialChannelMix =
      campaignData?.channel_mix && campaignData.channel_mix.length > 0 ? campaignData.channel_mix : []

    setCampaignFormData((prev: any) => {
      const orderedFunnelStages =
        initialFunnelStages.length > 0
          ? loadedCustomFunnels.map((f) => f.name).filter((name) => initialFunnelStages.includes(name))
          : loadedCustomFunnels.map((f) => f.name)
      const orderedChannelMix =
        initialChannelMix.length > 0
          ? loadedCustomFunnels
              .map((f) => initialChannelMix.find((ch: any) => ch.funnel_stage === f.name))
              .filter((ch): ch is { funnel_stage: string } => ch !== undefined)
          : loadedCustomFunnels.map((f) => ({ funnel_stage: f.name }))

      return {
        ...prev,
        funnel_type: "custom",
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
        custom_funnels: loadedCustomFunnels,
      }
    })

    // Check if current funnel structure matches any saved config (personal or shared)
    const allConfigs = [...configs, ...shared]
    if (allConfigs.length > 0 && loadedCustomFunnels.length > 0) {
      const currentStageNames = loadedCustomFunnels.map((f) => f.name).sort()

      // Check personal configs first
      const matchingConfigIdx = configs.findIndex((config) => {
        const configStageNames = config.stages.map((s) => s.name).sort()
        return JSON.stringify(currentStageNames) === JSON.stringify(configStageNames)
      })

      // Check shared configs if no personal match
      const matchingSharedConfigIdx = shared.findIndex((config) => {
        const configStageNames = config.stages.map((s) => s.name).sort()
        return JSON.stringify(currentStageNames) === JSON.stringify(configStageNames)
      })

      if (matchingConfigIdx !== -1) {
        setSelectedConfigIdx(matchingConfigIdx)
        setSelectedSharedConfigIdx(null)
        setSelectedPreset(null)
      } else if (matchingSharedConfigIdx !== -1) {
        setSelectedSharedConfigIdx(matchingSharedConfigIdx)
        setSelectedConfigIdx(null)
        setSelectedPreset(null)
      } else {
        // Check presets
        const matchingPresetIdx = presetStructures.findIndex((preset) => {
          const presetStageNames = preset.stages.map((s) => s.name).sort()
          return JSON.stringify(currentStageNames) === JSON.stringify(presetStageNames)
        })

        if (matchingPresetIdx !== -1) {
          setSelectedPreset(matchingPresetIdx)
          setSelectedConfigIdx(null)
          setSelectedSharedConfigIdx(null)
        } else {
          setSelectedConfigIdx(null)
          setSelectedSharedConfigIdx(null)
          setSelectedPreset(null)
        }
      }
    }
  }, [clientId, campaignData, setCampaignFormData])

  // Initialize comments drawer
  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
  }, [setIsDrawerOpen, setClose])

  // Validate funnel stages for step verification
  useEffect(() => {
    const isValid = Array.isArray(campaignFormData?.funnel_stages) && campaignFormData.funnel_stages.length > 0
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId)
      setPreviousValidationState(isValid)
    }
  }, [campaignFormData, cId, verifyStep, previousValidationState])

  // Save configurations to localStorage when they change
  useEffect(() => {
    if (!clientId) return
    if (persistentCustomFunnels.length > 0) {
      saveCustomFunnelsToStorage(persistentCustomFunnels)
    }
  }, [persistentCustomFunnels, clientId])

  useEffect(() => {
    if (!clientId) return
    if (funnelConfigs.length > 0) {
      saveFunnelConfigsToStorage(funnelConfigs)
    }
  }, [funnelConfigs, clientId])

  useEffect(() => {
    if (sharedConfigs.length > 0) {
      saveSharedConfigsToStorage(sharedConfigs)
    }
  }, [sharedConfigs])

  // Handle clicks outside modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false)
        setIsSaveConfigModalOpen(false)
        setIsShareModalOpen(false)
      }
    }

    if (isModalOpen || isSaveConfigModalOpen || isShareModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen, isSaveConfigModalOpen, isShareModalOpen])

  // Get an available color from the palette
  const getAvailableColor = (excludeColor?: string): string => {
    const usedColors = persistentCustomFunnels.filter((f) => f.color !== excludeColor).map((f) => f.color)
    const availableColors = colorPalette.filter((c) => !usedColors.includes(c))
    return availableColors.length > 0
      ? availableColors[0]
      : colorPalette[persistentCustomFunnels.length % colorPalette.length]
  }

  // Validation functions
  const validateFunnelName = (name: string, isEdit = false, oldId?: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return "Funnel name cannot be empty"
    if (trimmed.length < 2) return "Funnel name must be at least 2 characters"
    if (!/[a-zA-Z]/.test(trimmed)) return "Funnel name must include at least one letter"
    if (
      persistentCustomFunnels.some(
        (funnel) => funnel.name.toLowerCase() === trimmed.toLowerCase() && (!isEdit || funnel.name !== oldId),
      )
    ) {
      return "A funnel with this name already exists"
    }
    return ""
  }

  const validateConfigName = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return "Configuration name cannot be empty"
    if (trimmed.length < 2) return "Configuration name must be at least 2 characters"
    if (!/[a-zA-Z]/.test(trimmed)) return "Configuration name must include at least one letter"
    if (funnelConfigs.some((config) => config.name.toLowerCase() === trimmed.toLowerCase())) {
      return "A configuration with this name already exists"
    }
    return ""
  }

  // Handle funnel selection
  const handleSelect = (id: string) => {
    if (campaignFormData?.funnel_stages?.includes(id) && campaignFormData.funnel_stages.length === 1) {
      toast.error("You must have at least one stage selected", { duration: 3000 })
      return
    }

    const newFunnelStages = campaignFormData?.funnel_stages
      ? campaignFormData.funnel_stages.includes(id)
        ? campaignFormData.funnel_stages.filter((name: string) => name !== id)
        : [...campaignFormData.funnel_stages, id]
      : [id]

    const newChannelMix = campaignFormData?.funnel_stages?.includes(id)
      ? campaignFormData.channel_mix.filter((ch: any) => ch?.funnel_stage !== id)
      : [...(campaignFormData?.channel_mix || []), { funnel_stage: id }]

    const orderedFunnelStages = persistentCustomFunnels
      .map((f) => f.name)
      .filter((name) => newFunnelStages.includes(name))

    const orderedChannelMix = persistentCustomFunnels
      .map((f) => newChannelMix.find((ch: any) => ch.funnel_stage === f.name))
      .filter((ch): ch is { funnel_stage: string } => ch !== undefined)

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: orderedFunnelStages,
      channel_mix: orderedChannelMix,
    }))

    setHasChanges(true)
  }

  // Add a new funnel
  const handleAddFunnel = (name: string, color: string) => {
    const error = validateFunnelName(name, false)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }

    const newFunnel: Funnel = { id: name, name: name, color: color }
    const updatedFunnels = [...persistentCustomFunnels, newFunnel]
    setPersistentCustomFunnels(updatedFunnels)
    setCustomFunnels(updatedFunnels)

    if (clientId) saveCustomFunnelsToStorage(updatedFunnels)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: [...(prev.funnel_stages || []), name],
      channel_mix: [...(prev.channel_mix || []), { funnel_stage: name }],
    }))

    setHasChanges(true)
    toast.success("Funnel added successfully", { duration: 3000 })
    setIsModalOpen(false)
  }

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string, newColor: string) => {
    const error = validateFunnelName(newName, true, oldId)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }

    const updatedFunnels = persistentCustomFunnels.map((f) =>
      f.name === oldId ? { ...f, id: newName, name: newName, color: newColor } : f,
    )

    setPersistentCustomFunnels(updatedFunnels)
    setCustomFunnels(updatedFunnels)

    if (clientId) saveCustomFunnelsToStorage(updatedFunnels)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.map((stage: string) => (stage === oldId ? newName : stage)) || [],
      channel_mix:
        prev.channel_mix?.map((ch: any) => (ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch)) || [],
    }))

    setHasChanges(true)
    toast.success("Funnel updated successfully", { duration: 3000 })
    setIsModalOpen(false)
  }

  // Remove a funnel
  const handleRemoveFunnel = (id: string) => {
    if (persistentCustomFunnels.length <= 1) {
      toast.error("You must have at least one funnel stage", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      })
      return
    }

    const updatedFunnels = persistentCustomFunnels.filter((f) => f.name !== id)
    setPersistentCustomFunnels(updatedFunnels)
    setCustomFunnels(updatedFunnels)

    if (clientId) saveCustomFunnelsToStorage(updatedFunnels)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: prev.funnel_stages?.filter((name: string) => name !== id) || [],
      channel_mix: prev.channel_mix?.filter((ch: any) => ch?.funnel_stage !== id) || [],
    }))

    setHasChanges(true)
    toast.success("Funnel removed successfully", { duration: 3000 })
  }

  // Handle drag and drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    const newFunnels = [...persistentCustomFunnels]
    ;[newFunnels[draggedIndex], newFunnels[index]] = [newFunnels[index], newFunnels[draggedIndex]]

    setPersistentCustomFunnels(newFunnels)
    setCustomFunnels(newFunnels)

    if (clientId) saveCustomFunnelsToStorage(newFunnels)

    setCampaignFormData((prev: any) => {
      const newFunnelNames = newFunnels.map((f) => f.name)
      const orderedFunnelStages = newFunnelNames.filter((name) => prev.funnel_stages?.includes(name))
      const orderedChannelMix = newFunnelNames.map(
        (name) => prev.channel_mix?.find((ch: any) => ch.funnel_stage === name) || { funnel_stage: name },
      )
      return {
        ...prev,
        custom_funnels: newFunnels,
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
      }
    })

    setHasChanges(true)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // When opening modal for add/edit, set color accordingly
  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === "add") {
        setNewFunnelColor(getAvailableColor())
        setCustomColor(colorClassToHex[getAvailableColor()])
      } else if (modalMode === "edit" && currentFunnel) {
        if (colorPalette.includes(currentFunnel.color)) {
          setNewFunnelColor(currentFunnel.color)
          setCustomColor(colorClassToHex[currentFunnel.color] || colorClassToHex[colorPalette[0]])
        } else if (isHexColor(currentFunnel.color)) {
          setNewFunnelColor(currentFunnel.color)
          setCustomColor(currentFunnel.color)
        } else {
          setNewFunnelColor(colorPalette[0])
          setCustomColor(colorClassToHex[colorPalette[0]])
        }
      }
    }
  }, [isModalOpen, modalMode, currentFunnel])

  // Helper functions for styling
  const getFunnelBgStyle = (color: string, isSelected: boolean) => {
    if (!isSelected) {
      return { className: "bg-gray-200", style: {} }
    }
    if (colorPalette.includes(color)) {
      return { className: color, style: {} }
    }
    if (isHexColor(color)) {
      return { className: "", style: { background: color } }
    }
    return { className: "bg-gray-200", style: {} }
  }

  const getFunnelTextColor = (color: string, isSelected: boolean) => {
    if (isSelected) {
      if (isHexColor(color)) {
        const hex = color.replace("#", "")
        const r = Number.parseInt(hex.substring(0, 2), 16)
        const g = Number.parseInt(hex.substring(2, 4), 16)
        const b = Number.parseInt(hex.substring(4, 6), 16)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        return luminance < 0.6 ? "text-white" : "text-gray-900"
      }
      return "text-white"
    }
    return "text-gray-500"
  }

  // Handle preset selection from dropdown
  const handlePresetSelect = (presetIdx: number) => {
    setSelectedPreset(presetIdx)
    setSelectedConfigIdx(null)
    setSelectedSharedConfigIdx(null)
    const preset = presetStructures[presetIdx]
    setPersistentCustomFunnels(preset.stages)
    setCustomFunnels(preset.stages)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: preset.stages,
      funnel_stages: preset.stages.map((f) => f.name),
      channel_mix: preset.stages.map((f) => ({ funnel_stage: f.name })),
    }))
    setHasChanges(true)
    toast.success("Preset structure applied", { duration: 2000 })
    setDropdownOpen(false)
  }

  // Handle personal config selection from dropdown
  const handleConfigSelect = (configIdx: number) => {
    setSelectedConfigIdx(configIdx)
    setSelectedSharedConfigIdx(null)
    setSelectedPreset(null)
    const config = funnelConfigs[configIdx]
    setPersistentCustomFunnels(config.stages)
    setCustomFunnels(config.stages)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: config.stages,
      funnel_stages: config.stages.map((f) => f.name),
      channel_mix: config.stages.map((f) => ({ funnel_stage: f.name })),
    }))
    setHasChanges(true)
    toast.success("Personal configuration applied", { duration: 2000 })
    setDropdownOpen(false)
  }

  // Handle shared config selection from dropdown
  const handleSharedConfigSelect = (configIdx: number) => {
    setSelectedSharedConfigIdx(configIdx)
    setSelectedConfigIdx(null)
    setSelectedPreset(null)
    const config = sharedConfigs[configIdx]
    setPersistentCustomFunnels(config.stages)
    setCustomFunnels(config.stages)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: config.stages,
      funnel_stages: config.stages.map((f) => f.name),
      channel_mix: config.stages.map((f) => ({ funnel_stage: f.name })),
    }))
    setHasChanges(true)
    toast.success(`Shared configuration "${config.name}" applied`, { duration: 2000 })
    setDropdownOpen(false)
  }

  // Save button handler (open modal to name config)
  const handleSaveConfiguration = () => {
    if (!clientId) {
      toast.error("Please select a client first to save funnel configurations.", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      })
      return
    }
    setNewConfigName("")
    setShareAsGlobal(false)
    setIsSaveConfigModalOpen(true)
  }

  // Actually save config after naming
  const handleSaveConfigConfirm = () => {
    const error = validateConfigName(newConfigName)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }

    const config: FunnelConfig = {
      name: newConfigName.trim(),
      stages: [...persistentCustomFunnels],
      isShared: shareAsGlobal,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(shareAsGlobal && { sharedWith: [] }), // Empty array means accessible to all
    }

    if (shareAsGlobal) {
      // Save to shared configurations
      const updatedSharedConfigs = [...sharedConfigs, config]
      setSharedConfigs(updatedSharedConfigs)
      saveSharedConfigsToStorage(updatedSharedConfigs)
      setSelectedSharedConfigIdx(updatedSharedConfigs.length - 1)
      setSelectedConfigIdx(null)
      toast.success(`"${newConfigName.trim()}" saved as shared configuration and available to all accounts!`, {
        duration: 3000,
      })
    } else {
      // Save to personal configurations
      const updatedConfigs = [...funnelConfigs, config]
      setFunnelConfigs(updatedConfigs)
      saveFunnelConfigsToStorage(updatedConfigs)
      setSelectedConfigIdx(updatedConfigs.length - 1)
      setSelectedSharedConfigIdx(null)
      toast.success(`"${newConfigName.trim()}" saved as personal configuration!`, { duration: 3000 })
    }

    setSelectedPreset(null)
    setIsSaveConfigModalOpen(false)
  }

  // Share an existing configuration
  const handleShareConfiguration = (config: FunnelConfig) => {
    setConfigToShare(config)
    setIsShareModalOpen(true)
  }

  const handleShareConfirm = () => {
    if (!configToShare) return

    const sharedConfig: FunnelConfig = {
      ...configToShare,
      isShared: true,
      sharedWith: [], // Empty array means accessible to all accounts
      updatedAt: new Date().toISOString(),
    }

    const updatedSharedConfigs = [...sharedConfigs, sharedConfig]
    setSharedConfigs(updatedSharedConfigs)
    saveSharedConfigsToStorage(updatedSharedConfigs)

    toast.success(`"${configToShare.name}" is now shared across all accounts!`, { duration: 3000 })
    setIsShareModalOpen(false)
    setConfigToShare(null)
  }

  // Delete a saved configuration
  const handleDeleteConfig = (configIdx: number, isShared = false) => {
    if (isShared) {
      const updatedConfigs = sharedConfigs.filter((_, idx) => idx !== configIdx)
      setSharedConfigs(updatedConfigs)
      saveSharedConfigsToStorage(updatedConfigs)
      if (selectedSharedConfigIdx === configIdx) {
        setSelectedSharedConfigIdx(null)
      } else if (selectedSharedConfigIdx !== null && selectedSharedConfigIdx > configIdx) {
        setSelectedSharedConfigIdx(selectedSharedConfigIdx - 1)
      }
    } else {
      const updatedConfigs = funnelConfigs.filter((_, idx) => idx !== configIdx)
      setFunnelConfigs(updatedConfigs)
      saveFunnelConfigsToStorage(updatedConfigs)
      if (selectedConfigIdx === configIdx) {
        setSelectedConfigIdx(null)
      } else if (selectedConfigIdx !== null && selectedConfigIdx > configIdx) {
        setSelectedConfigIdx(selectedConfigIdx - 1)
      }
    }
    toast.success("Configuration deleted successfully", { duration: 2000 })
  }

  // Helper to get the background style for a stage in saved config preview
  const getStagePreviewStyle = (color: string) => {
    if (colorPalette.includes(color)) {
      return { className: color, style: {} }
    }
    if (isHexColor(color)) {
      return { className: "", style: { background: color } }
    }
    return { className: "bg-gray-400", style: {} }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <PageHeaderWrapper
          className="text-[22px]"
          t1="How many funnel stage(s) would you like to activate to achieve your objective?"
        />
      </div>
      <div className="w-full flex items-start">
        <p className="text-gray-800 italic font-semibold text-base text-center max-w-2xl mt-3">
          Let's start with your campaign structure. Feel free to customize the number and name of phases as your liking.
          Save configurations to share them across all accounts.
        </p>
      </div>
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
              {selectedConfigIdx !== null
                ? funnelConfigs[selectedConfigIdx]?.name
                : selectedSharedConfigIdx !== null
                  ? `${sharedConfigs[selectedSharedConfigIdx]?.name} (Shared)`
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
                {/* Shared Configurations Section */}
                {sharedConfigs.length > 0 && (
                  <>
                    <li className="px-4 py-2 text-xs text-blue-600 font-semibold flex items-center gap-2">
                      <Users size={14} />
                      Shared Configurations (All Accounts)
                    </li>
                    {sharedConfigs.map((config, idx) => (
                      <li
                        key={`shared-config-${config.name}-${idx}`}
                        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                          selectedSharedConfigIdx === idx ? "bg-blue-100 font-bold" : ""
                        }`}
                        role="option"
                        aria-selected={selectedSharedConfigIdx === idx}
                        onClick={() => handleSharedConfigSelect(idx)}
                      >
                        <div className="flex items-center justify-between">
                          <span className={selectedSharedConfigIdx === idx ? "font-bold text-blue-700" : ""}>
                            {config.name}
                          </span>
                          <Share2 size={14} className="text-blue-500" />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created by: {config.createdBy === currentUser.id ? "You" : "Another user"}
                        </div>
                      </li>
                    ))}
                    <li className="border-t border-gray-200 my-1"></li>
                  </>
                )}

                {/* Personal Configurations Section */}
                {funnelConfigs.length > 0 && (
                  <>
                    <li className="px-4 py-2 text-xs text-gray-500 font-semibold">Your Personal Configurations</li>
                    {funnelConfigs.map((config, idx) => (
                      <li
                        key={`config-${config.name}-${idx}`}
                        className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                          selectedConfigIdx === idx ? "bg-blue-100 font-bold" : ""
                        }`}
                        role="option"
                        aria-selected={selectedConfigIdx === idx}
                        onClick={() => handleConfigSelect(idx)}
                      >
                        <span className={selectedConfigIdx === idx ? "font-bold text-blue-700" : ""}>
                          {config.name}
                        </span>
                      </li>
                    ))}
                    <li className="border-t border-gray-200 my-1"></li>
                  </>
                )}

                {/* Presets Section */}
                <li className="px-4 py-2 text-xs text-gray-500 font-semibold">Presets</li>
                {presetStructures.map((preset, idx) => (
                  <li
                    key={`preset-${preset.label}-${idx}`}
                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                      selectedPreset === idx && selectedConfigIdx === null && selectedSharedConfigIdx === null
                        ? "bg-blue-100 font-bold"
                        : ""
                    }`}
                    role="option"
                    aria-selected={
                      selectedPreset === idx && selectedConfigIdx === null && selectedSharedConfigIdx === null
                    }
                    onClick={() => handlePresetSelect(idx)}
                  >
                    <span
                      className={
                        selectedPreset === idx && selectedConfigIdx === null && selectedSharedConfigIdx === null
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
              Select a preset, personal configuration, or shared configuration to quickly apply a funnel structure.
              Shared configurations are available across all accounts.
            </span>
          </div>

          {/* Shared Configurations Display */}
          {sharedConfigs.length > 0 && (
            <div className="mt-8 w-full">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Users size={20} />
                Shared Configurations
              </h3>
              <div className="space-y-3">
                {sharedConfigs.map((config, idx) => (
                  <div
                    key={config.name}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedSharedConfigIdx === idx
                        ? "border-blue-500 bg-blue-50"
                        : "border-blue-200 bg-blue-25 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          {config.name}
                          <Share2 size={14} className="text-blue-500" />
                        </h4>
                        <p className="text-xs text-gray-500">
                          Created by: {config.createdBy === currentUser.id ? "You" : "Another user"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSharedConfigSelect(idx)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Apply this shared configuration"
                        >
                          <Eye size={16} />
                        </button>
                        {config.createdBy === currentUser.id && (
                          <button
                            onClick={() => handleDeleteConfig(idx, true)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete this shared configuration"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.stages.map((stage, stageIdx) => {
                        const { className: stageBgClass, style: stageBgStyle } = getStagePreviewStyle(stage.color)
                        return (
                          <div
                            key={`${stage.name}-${stageIdx}`}
                            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${stageBgClass}`}
                            style={stageBgStyle}
                          >
                            {stage.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Configurations Display */}
          {clientId && funnelConfigs.length > 0 && (
            <div className="mt-8 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Personal Configurations</h3>
              <div className="space-y-3">
                {funnelConfigs.map((config, idx) => (
                  <div
                    key={config.name}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedConfigIdx === idx
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">{config.name}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConfigSelect(idx)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Apply this configuration"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleShareConfiguration(config)}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Share this configuration with all accounts"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(idx, false)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete this configuration"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.stages.map((stage, stageIdx) => {
                        const { className: stageBgClass, style: stageBgStyle } = getStagePreviewStyle(stage.color)
                        return (
                          <div
                            key={`${stage.name}-${stageIdx}`}
                            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${stageBgClass}`}
                            style={stageBgStyle}
                          >
                            {stage.name}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {clientId && funnelConfigs.length === 0 && sharedConfigs.length === 0 && (
            <div className="mt-8 w-full">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Settings className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No saved configurations</h3>
                <p className="text-xs text-gray-500">Create and save your first funnel configuration to see it here.</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Funnel Configuration Area */}
        <div className="flex-1 flex flex-col justify-center items-center gap-[32px] w-full">
          {customFunnels.map((funnel, index) => {
            const isSelected = campaignFormData.funnel_stages?.includes(funnel.name)
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
            const { className: funnelBgClass, style: funnelBgStyle } = getFunnelBgStyle(funnel.color, isSelected)
            const textColor = getFunnelTextColor(funnel.color, isSelected)

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
                        e.stopPropagation()
                        setModalMode("edit")
                        setCurrentFunnel(funnel)
                        setNewFunnelName(funnel.name)
                        if (colorPalette.includes(funnel.color)) {
                          setNewFunnelColor(funnel.color)
                          setCustomColor(colorClassToHex[funnel.color] || colorClassToHex[colorPalette[0]])
                        } else if (isHexColor(funnel.color)) {
                          setNewFunnelColor(funnel.color)
                          setCustomColor(funnel.color)
                        } else {
                          setNewFunnelColor(colorPalette[0])
                          setCustomColor(colorClassToHex[colorPalette[0]])
                        }
                        setIsModalOpen(true)
                      }}
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      className="p-1 bg-white rounded-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFunnel(funnel.name)
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          <button
            className="flex items-center gap-2 text-blue-500 cursor-pointer text-[16px]"
            onClick={() => {
              setModalMode("add")
              setCurrentFunnel(null)
              setNewFunnelName("")
              setNewFunnelColor(getAvailableColor())
              setCustomColor(colorClassToHex[getAvailableColor()])
              setIsModalOpen(true)
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

      {/* Add/Edit Funnel Modal */}
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
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
                      setNewFunnelColor(color)
                      setCustomColor(colorClassToHex[color])
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
                      setCustomColor(e.target.value)
                      setNewFunnelColor(e.target.value)
                    }}
                    className="w-7 h-7 border-0 p-0 bg-transparent cursor-pointer"
                    aria-label="Custom color picker"
                  />
                  <input
                    type="text"
                    value={isHexColor(newFunnelColor) ? newFunnelColor : customColor}
                    onChange={(e) => {
                      let val = e.target.value
                      if (!val.startsWith("#")) val = "#" + val.replace(/[^0-9A-Fa-f]/g, "")
                      if (val.length > 7) val = val.slice(0, 7)
                      setCustomColor(val)
                      setNewFunnelColor(val)
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
                    handleAddFunnel(newFunnelName, newFunnelColor)
                  } else if (currentFunnel) {
                    handleEditFunnel(currentFunnel.name, newFunnelName, newFunnelColor)
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

      {/* Save Configuration Modal */}
      {isSaveConfigModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Save Funnel Configuration</h3>
              <button onClick={() => setIsSaveConfigModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="configName" className="block text-sm font-medium text-gray-700 mb-1">
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
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shareAsGlobal}
                  onChange={(e) => setShareAsGlobal(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Share with all accounts (make this configuration available to everyone)
                </span>
              </label>
              {shareAsGlobal && (
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <Share2 size={12} />
                  This configuration will be accessible across all accounts
                </p>
              )}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Configuration Modal */}
      {isShareModalOpen && configToShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Configuration</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to share "{configToShare.name}" with all accounts? This will make it available to
                everyone in the organization.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                  <Share2 size={16} />
                  Configuration Preview
                </div>
                <div className="flex flex-wrap gap-2">
                  {configToShare.stages.map((stage, idx) => {
                    const { className: stageBgClass, style: stageBgStyle } = getStagePreviewStyle(stage.color)
                    return (
                      <div
                        key={`${stage.name}-${idx}`}
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${stageBgClass}`}
                        style={stageBgStyle}
                      >
                        {stage.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleShareConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <Share2 size={16} />
                Share Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapFunnelStages
