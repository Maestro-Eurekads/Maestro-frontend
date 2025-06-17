import type React from "react"
import { useState, useEffect, useRef } from "react"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import { useCampaigns } from "../../utils/CampaignsContext"
import { useVerification } from "app/utils/VerificationContext"
import { useComments } from "app/utils/CommentProvider"
import { PlusIcon, Edit2, Trash2, X, GripVertical, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import { updateClient } from "app/homepage/functions/clients"

// Define type for funnel objects
interface Funnel {
  id: string
  name: string
  color: string // tailwind color class or hex string
}

interface FunnelConfig {
  name: string
  stages: Funnel[]
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

// LocalStorage keys - Scoped to client for configs, client and media plan for funnels
const LOCAL_STORAGE_FUNNELS_KEY = "custom_funnels_v1"
const LOCAL_STORAGE_CONFIGS_KEY = "funnel_configurations_v1"

// Helper to get a unique key for localStorage based on clientId and optionally mediaPlanId
const getClientKey = (baseKey: string, clientId: string | undefined, mediaPlanId?: string) => {
  if (!clientId) return baseKey
  let key = `${baseKey}_client_${clientId}`
  if (mediaPlanId && baseKey === LOCAL_STORAGE_FUNNELS_KEY) {
    key += `_media_${mediaPlanId}`
  }
  console.debug(`Generated storage key: ${key}`)
  return key
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [funnelConfigs, setFunnelConfigs] = useState<FunnelConfig[]>([])
  const [selectedConfigIdx, setSelectedConfigIdx] = useState<number | null>(null)
  const [isSaveConfigModalOpen, setIsSaveConfigModalOpen] = useState(false)
  const [newConfigName, setNewConfigName] = useState("")

  // Get clientId and mediaPlanId safely
  const clientId = campaignFormData?.client_selection?.id ?? ""
  const mediaPlanId = campaignFormData?.media_plan_id ?? ""

  // Default funnel stages
  const defaultFunnels: Funnel[] = [
    { id: "Awareness", name: "Awareness", color: colorPalette[0] },
    { id: "Consideration", name: "Consideration", color: colorPalette[1] },
    { id: "Conversion", name: "Conversion", color: colorPalette[2] },
    { id: "Loyalty", name: "Loyalty", color: colorPalette[3] },
  ]

  // --- LocalStorage helpers for custom funnels ---
  const saveCustomFunnelsToStorage = (funnels: Funnel[]) => {
    if (!clientId) return
    try {
      const key = getClientKey(LOCAL_STORAGE_FUNNELS_KEY, clientId, mediaPlanId)
      localStorage.setItem(key, JSON.stringify(funnels))
      console.debug(`Saved custom funnels to ${key}:`, funnels)
    } catch (e) {
      console.log("Failed to save custom funnels to localStorage:", e)
      toast.error("Failed to save funnels", { duration: 3000 })
    }
  }

  const getCustomFunnelsFromStorage = (): Funnel[] | null => {
    if (!clientId) return null
    try {
      const key = getClientKey(LOCAL_STORAGE_FUNNELS_KEY, clientId, mediaPlanId)
      const data = localStorage.getItem(key)
      console.debug(`Retrieved custom funnels from ${key}:`, data)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.every(f => f.id && f.name && f.color)) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Failed to load custom funnels from localStorage:", e)
      toast.error("Failed to load funnels", { duration: 3000 })
    }
    return null
  }

  // --- LocalStorage helpers for funnel configurations ---
  const saveFunnelConfigsToStorage = (configs: FunnelConfig[]) => {
    if (!clientId) return
    try {
      const key = getClientKey(LOCAL_STORAGE_CONFIGS_KEY, clientId)
      localStorage.setItem(key, JSON.stringify(configs))
      console.debug(`Saved funnel configs to ${key}:`, configs)
    } catch (e) {
      console.error("Failed to save funnel configurations to localStorage:", e)
      toast.error("Failed to save configurations", { duration: 3000 })
    }
  }

  const getFunnelConfigsFromStorage = (): FunnelConfig[] => {
    if (!clientId) return []
    try {
      const key = getClientKey(LOCAL_STORAGE_CONFIGS_KEY, clientId)
      const data = localStorage.getItem(key)
      console.debug(`Retrieved funnel configs from ${key}:`, data)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.every(config => config.name && Array.isArray(config.stages))) {
          return parsed
        }
      }
    } catch (e) {
      console.error("Failed to load funnel configurations from localStorage:", e)
      toast.error("Failed to load configurations", { duration: 3000 })
    }
    return []
  }

  // Initialize funnel data and configurations
  useEffect(() => {
    console.debug(`Initializing with clientId: ${clientId}, mediaPlanId: ${mediaPlanId}`)
    const configs = getFunnelConfigsFromStorage()
    setFunnelConfigs(configs)

    let loadedCustomFunnels: Funnel[] = []
    const localStorageFunnels = getCustomFunnelsFromStorage()
    const isNewPlan = !mediaPlanId || mediaPlanId === ""

    if (!clientId) {
      loadedCustomFunnels = defaultFunnels
      setSelectedConfigIdx(null)
      setSelectedPreset(1) // Select "Full" preset by default
      localStorage.removeItem(getClientKey(LOCAL_STORAGE_FUNNELS_KEY, clientId, mediaPlanId))
      localStorage.removeItem(getClientKey(LOCAL_STORAGE_CONFIGS_KEY, clientId))
    } else if (isNewPlan) {
      // For new plans, always use default funnels
      loadedCustomFunnels = defaultFunnels
      setSelectedConfigIdx(null)
      setSelectedPreset(1) // Select "Full" preset
    } else if (localStorageFunnels && localStorageFunnels.length > 0) {
      loadedCustomFunnels = localStorageFunnels
    } else if (campaignData?.custom_funnels?.length > 0) {
      loadedCustomFunnels = campaignData.custom_funnels.map((funnel: any, index: number) => ({
        id: funnel.id || funnel.name || `funnel-${index}`,
        name: funnel.name || `Funnel ${index + 1}`,
        color: funnel.color || colorPalette[index % colorPalette.length] || "bg-gray-500",
      }))
    } else {
      loadedCustomFunnels = defaultFunnels
      setSelectedPreset(1) // Select "Full" preset
    }

    setPersistentCustomFunnels(loadedCustomFunnels)
    setCustomFunnels(loadedCustomFunnels)

    setCampaignFormData((prev: any) => {
      const initialFunnelStages = Array.isArray(campaignData?.funnel_stages) ? campaignData.funnel_stages : []
      const initialChannelMix = Array.isArray(campaignData?.channel_mix) ? campaignData.channel_mix : []
      const orderedFunnelStages = initialFunnelStages.length > 0 && !isNewPlan
        ? loadedCustomFunnels.map(f => f.name).filter(name => initialFunnelStages.includes(name))
        : loadedCustomFunnels.map(f => f.name)
      const orderedChannelMix = initialChannelMix.length > 0 && !isNewPlan
        ? loadedCustomFunnels
            .map(f => initialChannelMix.find((ch: any) => ch?.funnel_stage === f.name))
            .filter((ch): ch is { funnel_stage: string } => !!ch)
        : loadedCustomFunnels.map(f => ({ funnel_stage: f.name }))

      const updatedFormData = {
        ...prev,
        funnel_type: "custom",
        funnel_stages: orderedFunnelStages,
        channel_mix: orderedChannelMix,
        custom_funnels: loadedCustomFunnels,
      }
      console.debug("Updated campaignFormData:", updatedFormData)
      return updatedFormData
    })

    // Only try to match a configuration for existing plans
    if (configs.length > 0 && loadedCustomFunnels.length > 0 && !isNewPlan) {
      const currentStageNames = loadedCustomFunnels.map(f => f.name).sort()
      const matchingConfigIdx = configs.findIndex(config => {
        const configStageNames = config.stages.map(s => s.name).sort()
        return JSON.stringify(currentStageNames) === JSON.stringify(configStageNames)
      })

      if (matchingConfigIdx !== -1) {
        setSelectedConfigIdx(matchingConfigIdx)
        setSelectedPreset(null)
        console.debug(`Selected config index: ${matchingConfigIdx}`)
      } else {
        const matchingPresetIdx = presetStructures.findIndex(preset => {
          const presetStageNames = preset.stages.map(s => s.name).sort()
          return JSON.stringify(currentStageNames) === JSON.stringify(presetStageNames)
        })

        setSelectedPreset(matchingPresetIdx !== -1 ? matchingPresetIdx : null)
        setSelectedConfigIdx(null)
        console.debug(`Selected preset index: ${matchingPresetIdx !== -1 ? matchingPresetIdx : null}`)
      }
    } else {
      setSelectedConfigIdx(null)
      setSelectedPreset(isNewPlan || !clientId ? 1 : null) // "Full" preset for new plans or no client
      console.debug("No configs or funnels, reset selection")
    }
  }, [clientId, mediaPlanId, campaignData, setCampaignFormData])

  // Initialize comments drawer
  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
  }, [setIsDrawerOpen, setClose])

  // Validate funnel stages
  useEffect(() => {
    const isValid = Array.isArray(campaignFormData?.funnel_stages) && campaignFormData.funnel_stages.length > 0
    if (isValid !== previousValidationState) {
      verifyStep("step2", isValid, cId)
      setPreviousValidationState(isValid)
      console.debug(`Validation status: ${isValid}`)
    }
  }, [campaignFormData, cId, verifyStep, previousValidationState])

  // Save custom funnels to localStorage
  useEffect(() => {
    if (clientId && persistentCustomFunnels.length > 0) {
      saveCustomFunnelsToStorage(persistentCustomFunnels)
    }
  }, [persistentCustomFunnels, clientId, mediaPlanId])

  // Save funnel configurations to localStorage
  useEffect(() => {
    if (clientId && funnelConfigs.length > 0) {
      saveFunnelConfigsToStorage(funnelConfigs)
    }
  }, [funnelConfigs, clientId])

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false)
        setIsSaveConfigModalOpen(false)
      }
    }

    if (isModalOpen || isSaveConfigModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen, isSaveConfigModalOpen])

  // Get an available color
  const getAvailableColor = (excludeColor?: string): string => {
    const usedColors = persistentCustomFunnels.filter(f => f.color !== excludeColor).map(f => f.color)
    const availableColors = colorPalette.filter(c => !usedColors.includes(c))
    return availableColors.length > 0
      ? availableColors[0]
      : colorPalette[persistentCustomFunnels.length % colorPalette.length]
  }

  // Funnel name validation
  const validateFunnelName = (name: string, isEdit = false, oldId?: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return "Funnel name cannot be empty"
    if (trimmed.length < 2) return "Funnel name must be at least 2 characters"
    if (!/[a-zA-Z]/.test(trimmed)) return "Funnel name must include at least one letter"
    if (
      persistentCustomFunnels.some(
        funnel => funnel.name.toLowerCase() === trimmed.toLowerCase() && (!isEdit || funnel.name !== oldId)
      )
    ) {
      return "A funnel with this name already exists"
    }
    return ""
  }

  // Funnel config name validation
  const validateConfigName = (name: string): string => {
    const trimmed = name.trim()
    if (!trimmed) return "Configuration name cannot be empty"
    if (trimmed.length < 2) return "Configuration name must be at least 2 characters"
    if (!/[a-zA-Z]/.test(trimmed)) return "Configuration name must include at least one letter"
    if (funnelConfigs.some(config => config.name.toLowerCase() === trimmed.toLowerCase())) {
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
      .map(f => f.name)
      .filter(name => newFunnelStages.includes(name))

    const orderedChannelMix = persistentCustomFunnels
      .map(f => newChannelMix.find((ch: any) => ch?.funnel_stage === f.name))
      .filter((ch): ch is { funnel_stage: string } => !!ch)

    setCampaignFormData((prev: any) => ({
      ...prev,
      funnel_stages: orderedFunnelStages,
      channel_mix: orderedChannelMix,
    }))
    setHasChanges(true)
    console.debug("Selected funnel:", id, "New stages:", orderedFunnelStages)
  }

  // Add a new funnel
  const handleAddFunnel = (name: string, color: string) => {
    const error = validateFunnelName(name, false)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }

    const newFunnel: Funnel = { id: name, name, color }
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
    console.debug("Added funnel:", newFunnel)
  }

  // Edit an existing funnel
  const handleEditFunnel = (oldId: string, newName: string, newColor: string) => {
    const error = validateFunnelName(newName, true, oldId)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }

    const updatedFunnels = persistentCustomFunnels.map(f =>
      f.name === oldId ? { ...f, id: newName, name: newName, color: newColor } : f
    )

    setPersistentCustomFunnels(updatedFunnels)
    setCustomFunnels(updatedFunnels)

    if (clientId) saveCustomFunnelsToStorage(updatedFunnels)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: (prev.funnel_stages || []).map((stage: string) => (stage === oldId ? newName : stage)),
      channel_mix: (prev.channel_mix || []).map((ch: any) =>
        ch.funnel_stage === oldId ? { ...ch, funnel_stage: newName } : ch
      ),
    }))

    setHasChanges(true)
    toast.success("Funnel updated successfully", { duration: 3000 })
    setIsModalOpen(false)
    console.debug("Edited funnel:", { oldId, newName, newColor })
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

    const updatedFunnels = persistentCustomFunnels.filter(f => f.name !== id)
    setPersistentCustomFunnels(updatedFunnels)
    setCustomFunnels(updatedFunnels)

    if (clientId) saveCustomFunnelsToStorage(updatedFunnels)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: updatedFunnels,
      funnel_stages: (prev.funnel_stages || []).filter((name: string) => name !== id),
      channel_mix: (prev.channel_mix || []).filter((ch: any) => ch?.funnel_stage !== id),
    }))

    setHasChanges(true)
    toast.success("Funnel removed successfully", { duration: 3000 })
    console.debug("Removed funnel:", id)
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
      const newFunnelNames = newFunnels.map(f => f.name)
      const orderedFunnelStages = newFunnelNames.filter(name => prev.funnel_stages?.includes(name))
      const orderedChannelMix = newFunnelNames.map(
        name => prev.channel_mix?.find((ch: any) => ch?.funnel_stage === name) || { funnel_stage: name }
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
    console.debug("Reordered funnels:", newFunnels)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Set color when opening modal
  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === "add") {
        const availableColor = getAvailableColor()
        setNewFunnelColor(availableColor)
        setCustomColor(colorClassToHex[availableColor])
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

  // Helper to get funnel background style
  const getFunnelBgStyle = (color: string, isSelected: boolean) => {
    if (!isSelected) return { className: "bg-gray-200", style: {} }
    if (colorPalette.includes(color)) return { className: color, style: {} }
    if (isHexColor(color)) return { className: "", style: { background: color } }
    return { className: "bg-gray-200", style: {} }
  }

  // Helper to get funnel text color
  const getFunnelTextColor = (color: string, isSelected: boolean) => {
    if (isSelected && isHexColor(color)) {
      const hex = color.replace("#", "")
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance < 0.6 ? "text-white" : "text-gray-900"
    }
    return isSelected ? "text-white" : "text-gray-500"
  }

  // Handle preset selection
  const handlePresetSelect = (presetIdx: number) => {
    setSelectedPreset(presetIdx)
    setSelectedConfigIdx(null)
    const preset = presetStructures[presetIdx]
    setPersistentCustomFunnels(preset.stages)
    setCustomFunnels(preset.stages)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: preset.stages,
      funnel_stages: preset.stages.map(f => f.name),
      channel_mix: preset.stages.map(f => ({ funnel_stage: f.name })),
    }))
    setHasChanges(true)
    toast.success("Preset structure applied", { duration: 2000 })
    setDropdownOpen(false)
    console.debug("Applied preset:", preset.label)
  }

  // Handle saved config selection
  const handleConfigSelect = (configIdx: number) => {
    setSelectedConfigIdx(configIdx)
    setSelectedPreset(null)
    const config = funnelConfigs[configIdx]
    setPersistentCustomFunnels(config.stages)
    setCustomFunnels(config.stages)

    setCampaignFormData((prev: any) => ({
      ...prev,
      custom_funnels: config.stages,
      funnel_stages: config.stages.map(f => f.name),
      channel_mix: config.stages.map(f => ({ funnel_stage: f.name })),
    }))
    setHasChanges(true)
    toast.success("Funnel configuration applied", { duration: 2000 })
    setDropdownOpen(false)
    console.debug("Applied config:", config.name)
  }

  // Save configuration
  const handleSaveConfiguration = () => {
    if (!clientId) {
      toast.error("Please select a client to save funnel configurations.", {
        style: { background: "red", color: "white", textAlign: "center" },
        duration: 3000,
      })
      return
    }
    setNewConfigName("")
    setIsSaveConfigModalOpen(true)
  }

  // Confirm save config
  const handleSaveConfigConfirm = () => {
    const error = validateConfigName(newConfigName)
    if (error) {
      toast.error(error, { style: { background: "red", color: "white", textAlign: "center" }, duration: 3000 })
      return
    }
    const config: FunnelConfig = {
      name: newConfigName.trim(),
      stages: [...persistentCustomFunnels],
    }
    const updatedConfigs = [...funnelConfigs, config]
    setFunnelConfigs(updatedConfigs)
    if (clientId) saveFunnelConfigsToStorage(updatedConfigs)
    setSelectedConfigIdx(updatedConfigs.length - 1)
    setSelectedPreset(null)
    setIsSaveConfigModalOpen(false)
    toast.success(`"${newConfigName.trim()}" configuration saved!`, { duration: 3000 })
    console.debug("Saved new config:", config)
  }

  // Delete a saved configuration
  const handleDeleteConfig = (configIdx: number) => {
    const updatedConfigs = funnelConfigs.filter((_, idx) => idx !== configIdx)
    setFunnelConfigs(updatedConfigs)
    if (clientId) saveFunnelConfigsToStorage(updatedConfigs)
    if (selectedConfigIdx === configIdx) {
      setSelectedConfigIdx(null)
    } else if (selectedConfigIdx !== null && selectedConfigIdx > configIdx) {
      setSelectedConfigIdx(selectedConfigIdx - 1)
    }
    toast.success("Configuration deleted successfully", { duration: 2000 })
    console.debug("Deleted config at index:", configIdx)
  }

  // Helper for stage preview style
  const getStagePreviewStyle = (color: string) => {
    if (colorPalette.includes(color)) return { className: color, style: {} }
    if (isHexColor(color)) return { className: "", style: { background: color } }
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
          Let's start with your campaign structure. Feel free to customize the number and name of phases as your liking
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-start gap-8 mt-[56px] w-full">
        <div className="w-full md:w-[320px] flex flex-col items-center">
          <div className="relative w-full">
            <button
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm text-gray-700 text-base font-medium focus:outline-none"
              onClick={() => setDropdownOpen(open => !open)}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {selectedConfigIdx !== null
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
                {funnelConfigs.length > 0 && (
                  <>
                    <li className="px-4 py-2 text-xs text-gray-500 font-semibold">Saved Configurations</li>
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
                <li className="px-4 py-2 text-xs text-gray-500 font-semibold">Presets</li>
                {presetStructures.map((preset, idx) => (
                  <li
                    key={`preset-${preset.label}-${idx}`}
                    className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                      selectedPreset === idx && selectedConfigIdx === null ? "bg-blue-100 font-bold" : ""
                    }`}
                    role="option"
                    aria-selected={selectedPreset === idx && selectedConfigIdx === null}
                    onClick={() => handlePresetSelect(idx)}
                  >
                    <span
                      className={selectedPreset === idx && selectedConfigIdx === null ? "font-bold text-blue-700" : ""}
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
              Select a preset or a saved configuration to quickly apply a funnel structure. You can further customize on
              the right.
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center gap-[32px] w-full">
          {customFunnels.map((funnel, index) => {
            const isSelected = campaignFormData?.funnel_stages?.includes(funnel.name) ?? false
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
                    style={{ ...funnelBgStyle, opacity: 1, border: isSelected ? "none" : "1px solid #e5e7eb" }}
                  >
                    <p className="text-[16px]">{funnel.name}</p>
                  </button>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                    <button
                      className="p-1 bg-white rounded-full shadow-sm"
                      onClick={e => {
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
                      onClick={e => {
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
                onChange={e => setNewFunnelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter funnel name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colorPalette.map(color => (
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
                    onChange={e => {
                      setCustomColor(e.target.value)
                      setNewFunnelColor(e.target.value)
                    }}
                    className="w-7 h-7 border-0 p-0 bg-transparent cursor-pointer"
                    aria-label="Custom color picker"
                  />
                  <input
                    type="text"
                    value={isHexColor(newFunnelColor) ? newFunnelColor : customColor}
                    onChange={e => {
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
      {isSaveConfigModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Name your funnel configuration</h3>
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
                onChange={e => setNewConfigName(e.target.value)}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapFunnelStages