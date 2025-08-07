"use client"
import React from "react"
import { memo, useState, useCallback, useEffect, createContext, useContext, useRef } from "react"
import Image, { type StaticImageData } from "next/image"
import { FaAngleRight, FaSpinner } from "react-icons/fa"
import { MdDelete, MdAdd } from "react-icons/md"
import { useEditing } from "../../../utils/EditingContext"
import { useCampaigns } from "../../../utils/CampaignsContext"
import facebook from "../../../../public/facebook.svg"
import ig from "../../../../public/ig.svg"
import youtube from "../../../../public/youtube.svg"
import TheTradeDesk from "../../../../public/TheTradeDesk.svg"
import Quantcast from "../../../../public/quantcast.svg"
import google from "../../../../public/social/google.svg"
import x from "../../../../public/x.svg"
import linkedin from "../../../../public/linkedin.svg"
import Display from "../../../../public/Display.svg"
import yahoo from "../../../../public/yahoo.svg"
import bing from "../../../../public/bing.svg"
import tictok from "../../../../public/tictok.svg"
import { Plus } from "lucide-react"
import { useActive } from "app/utils/ActiveContext"
import { removeKeysRecursively } from "utils/removeID"
import { getPlatformIcon, mediaTypes } from "components/data"
import axios from "axios"
import { toast } from "sonner"


// --- Custom Audience Types Context (Global, for all stages) ---
const CustomAudienceTypesContext = createContext<{
  customAudienceTypes: string[]
  addCustomAudienceType: (type: string) => void
}>({
  customAudienceTypes: [],
  addCustomAudienceType: () => { },
})

// Helper for thousand separator
function formatWithThousandSeparator(value: string | number) {
  if (value === undefined || value === null) return ""
  const cleaned = String(value).replace(/,/g, "")
  if (cleaned === "") return ""
  if (!isNaN(Number(cleaned))) {
    if (cleaned.includes(".")) {
      const [int, dec] = cleaned.split(".")
      return Number(int).toLocaleString("en-US") + "." + dec.replace(/[^0-9]/g, "")
    }
    return Number(cleaned).toLocaleString("en-US")
  }
  return value
}

// Types
interface AdSetType {
  id: number
  addsetNumber: number
}

interface OutletType {
  id: number
  outlet: string
  icon: StaticImageData
}

interface AdSetFlowProps {
  stageName: string
  onInteraction?: () => void
  onValidate?: () => void
  isValidateDisabled?: boolean
  onEditStart?: () => void
  platformName?: any
  modalOpen?: boolean
  granularity?: "channel" | "adset"
  onPlatformStateChange?: (stageName: string, platformName: string, isOpen: boolean) => void
}

interface AudienceData {
  audience_type: string
  name?: string
  size?: string
  description?: string
}

interface AdSetData {
  id?: number
  name: string
  audience_type: string
  size?: string
  description?: string
  extra_audiences?: AudienceData[]
  format?: any[]
}

interface Format {
  id: number
  format_type: string
  num_of_visuals: string
}

interface Platform {
  id: number
  platform_name: string
  buy_type: string | null
  objective_type: string | null
  campaign_start_date: string | null
  campaign_end_date: string | null
  format: Format[]
  ad_sets: AdSetData[]
}

interface FunnelStage {
  id: number
  funnel_stage: string
  funnel_stage_timeline_start_date: string | null
  funnel_stage_timeline_end_date: string | null
  search_engines: Platform[]
  display_networks: Platform[]
  social_media: Platform[]
}

// Platform icons mapping
const platformIcons: Record<string, StaticImageData> = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  Youtube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  Linkedin: linkedin,
  TikTok: tictok,
  "Display & Video": Display,
  Yahoo: yahoo,
  Bing: bing,
  "Apple Search": google,
  "The Trade Desk": TheTradeDesk,
  QuantCast: Quantcast,
}

// Context for dropdown management
const DropdownContext = createContext<{
  openDropdownId: number | null | string
  setOpenDropdownId: (id: number | null | string) => void
}>({
  openDropdownId: null,
  setOpenDropdownId: () => { },
})

// Utility functions
const findPlatform = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
): { platform: Platform; channelType: string } | null => {
  // Ensure campaignData is an array
  if (!Array.isArray(campaignData)) {
    console.warn("findPlatform: campaignData is not an array:", campaignData)
    return null
  }

  const stage = campaignData.find((stage) => stage.funnel_stage === stageName)
  if (!stage) {
    console.warn("findPlatform: Stage not found:", stageName)
    return null
  }

  const channelTypes = mediaTypes
  for (const channelType of channelTypes) {
    // Ensure the channel type exists and is an array
    if (!stage[channelType] || !Array.isArray(stage[channelType])) {
      console.warn(`findPlatform: ${channelType} is not an array in stage ${stageName}:`, stage[channelType])
      continue
    }

    const platform = stage[channelType].find((p) => p.platform_name === platformName)
    if (platform) {
      return { platform, channelType }
    }
  }
  return null
}

const updateMultipleAdSets = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
  adSets: AdSetData[],
): FunnelStage[] => {
  const updatedCampaignData = JSON.parse(JSON.stringify(campaignData))
  const stageIndex = updatedCampaignData.findIndex((stage: FunnelStage) => stage.funnel_stage === stageName)
  if (stageIndex === -1) {
    console.error(`Stage "${stageName}" not found`)
    return campaignData
  }

  const stage = updatedCampaignData[stageIndex]
  const channelTypes = mediaTypes
  let platformFound = false

  for (const channelType of channelTypes) {
    const platformIndex = stage[channelType].findIndex((platform: Platform) => platform.platform_name === platformName)
    if (platformIndex !== -1) {
      const platform = stage[channelType][platformIndex]
      platform.ad_sets = adSets
      platformFound = true
      break
    }
  }

  if (!platformFound) {
    console.error(`Platform "${platformName}" not found in stage "${stageName}"`)
    return campaignData
  }

  return updatedCampaignData
}

// --- Channel-level state isolation with persistence ---
const getChannelStateKey = (campaignId?: string | number) => {
  return `channelLevelAudienceState_${campaignId || "default"}`
}

// Load initial state from sessionStorage
const loadChannelStateFromStorage = (campaignId?: string | number) => {
  if (typeof window === "undefined") return {}
  try {
    const key = getChannelStateKey(campaignId)
    const stored = sessionStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    if (error?.response?.status === 401) {
      const event = new Event("unauthorizedEvent")
      window.dispatchEvent(event)
    }
    console.error("Error loading channel state from storage:", error)
    return {}
  }
}

// Save state to sessionStorage
const saveChannelStateToStorage = (state: any, campaignId?: string | number) => {
  if (typeof window === "undefined") return
  try {
    const key = getChannelStateKey(campaignId)
    sessionStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    if (error?.response?.status === 401) {
      const event = new Event("unauthorizedEvent")
      window.dispatchEvent(event)
    }
    console.error("Error saving channel state to storage:", error)
  }
}

// Initialize with data from storage
const channelLevelAudienceState: {
  [stageName: string]: {
    [platformName: string]: {
      name: string
      audience_type: string
      size: string
      description: string
    }
  }
} = {}

// Make channel state globally accessible for recap
if (typeof window !== "undefined") {
  ; (window as any).channelLevelAudienceState = channelLevelAudienceState
}

// AdSet Component - Updated to handle granularity properly with complete separation
const AdSet = memo(function AdSet({
  adset,
  index,
  isEditing,
  onDelete,
  onUpdate,
  audienceType,
  adSetName,
  adSetSize,
  adSetDescription,
  onInteraction,
  adsets,
  extra_audiences,
  onUpdateExtraAudiences,
  granularity = "adset",
  channelAudienceState,
  setChannelAudienceState,
  stageName,
  platformName,
  onAddNewAdSet,
}: {
  adset: AdSetType
  index: number
  isEditing: boolean
  onDelete: (id: number) => void
  onUpdate: (id: number, data: Partial<AdSetData>) => void
  audienceType?: string
  adSetName?: string
  adSetSize?: string
  adSetDescription?: string
  onInteraction: () => void
  adsets: AdSetType[]
  extra_audiences?: AudienceData[]
  onUpdateExtraAudiences: (audiences: AudienceData[]) => void
  granularity?: "channel" | "adset"
  channelAudienceState?: {
    name: string
    audience_type: string
    size: string
    description: string
  }
  setChannelAudienceState?: (data: { name: string; audience_type: string; size: string; description: string }) => void
  stageName?: string
  platformName?: string
  onAddNewAdSet?: () => void
}) {
  // For channel granularity, use local state (not campaignFormData)
  const [channelAudience, setChannelAudience] = useState<{
    name: string
    audience_type: string
    size: string
    description: string
  }>(
    channelAudienceState || {
      name: "",
      audience_type: "",
      size: "",
      description: "",
    },
  )

  // For adset granularity, use props/state as before
  const [audience, setAudience] = useState<string>(audienceType || "")
  const [name, setName] = useState<string>(adSetName || "")
  const [size, setSize] = useState<string>(adSetSize || "")
  const [description, setDescription] = useState<string>(adSetDescription || "")
  const [extraAudience, setExtraAudience] = useState<AudienceData[]>(extra_audiences || [])

  // For channel, update local state only
  useEffect(() => {
    if (granularity === "channel") {
      if (channelAudienceState) {
        setChannelAudience(channelAudienceState)
      }
    } else {
      if (audienceType !== undefined) setAudience(audienceType)
      if (adSetName !== undefined) setName(adSetName)
      if (adSetSize !== undefined) setSize(adSetSize)
      if (adSetDescription !== undefined) setDescription(adSetDescription)
    }
    // eslint-disable-next-line
  }, [audienceType, adSetName, adSetSize, adSetDescription, channelAudienceState, granularity])

  const updateExtraAudienceMap = (updatedList: AudienceData[]) => {
    setExtraAudience(updatedList)
    const cleaned = updatedList.filter((item) => item.audience_type?.trim())
    onUpdateExtraAudiences(cleaned)
    onInteraction()
  }

  // --- Channel-level handlers ---
  const handleChannelAudienceChange = (field: keyof typeof channelAudience, value: string) => {
    const updated = { ...channelAudience, [field]: value }
    setChannelAudience(updated)
    setChannelAudienceState && setChannelAudienceState(updated)
    onInteraction()
  }

  // --- Adset-level handlers ---
  const handleAudienceSelect = useCallback(
    (selectedAudience: string) => {
      setAudience(selectedAudience)
      // Immediate update
      setTimeout(() => {
        onUpdate(adset.id, { audience_type: selectedAudience })
      }, 0)
      onInteraction()
    },
    [adset.id, onUpdate, onInteraction],
  )

  const handleExtraAudienceSelect = (selected: string, idx: number) => {
    if (!selected) return
    const updated = [...extraAudience]
    updated[idx] = {
      ...updated[idx],
      audience_type: selected,
    }
    updateExtraAudienceMap(updated)
  }

  const handleDeleteExtraAudience = (idx: number) => {
    const updated = [...extraAudience]
    updated.splice(idx, 1)
    updateExtraAudienceMap(updated)
  }

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value
      setName(newName)
      // Immediate update with debouncing
      setTimeout(() => {
        onUpdate(adset.id, { name: newName })
      }, 0)
      onInteraction()
    },
    [adset.id, onUpdate, onInteraction],
  )

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/,/g, "")
      if (!/^\d*\.?\d*$/.test(inputValue)) {
        return
      }
      setSize(inputValue)
      // Immediate update with debouncing
      setTimeout(() => {
        onUpdate(adset?.id, { size: inputValue })
      }, 0)
      onInteraction()
    },
    [adset.id, onUpdate, onInteraction],
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value
      setDescription(newDescription)
      // Immediate update with debouncing
      setTimeout(() => {
        onUpdate(adset?.id, { description: newDescription })
      }, 0)
      onInteraction()
    },
    [adset.id, onUpdate, onInteraction],
  )

  const handleExtraAudienceSizeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value.replace(/,/g, "")
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return
    }
    const updated = [...extraAudience]
    updated[index].size = inputValue
    updateExtraAudienceMap(updated)
  }

  const handleExtraAudienceDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updated = [...extraAudience]
    updated[index].description = e.target.value
    updateExtraAudienceMap(updated)
  }

  // --- Channel-level add audience logic ---
  const isChannelParentFilled =
    channelAudience?.name.trim() !== "" &&
    channelAudience?.audience_type.trim() !== "" &&
    channelAudience?.size.trim() !== ""

  // --- Adset-level add audience logic ---
  const isParentFilled = name.trim() !== "" && audience.trim() !== "" && size.trim() !== ""

  const canAddNewAudience =
    isParentFilled &&
    (extraAudience?.length === 0 ||
      (extraAudience?.length > 0 && extraAudience[extraAudience?.length - 1]?.audience_type?.trim()))

  // COMPLETE SEPARATION: Channel level shows only channel fields, no ad set numbers or extra audiences
  if (granularity === "channel") {
    // Reduce the space between the audience field and the next channel
    // Remove px-4 and margin-top/margin-bottom, and use tighter vertical spacing
    return (
      <div
        className="flex gap-2 items-start w-full"
        style={{ marginTop: 4, marginBottom: 4, paddingLeft: 0, paddingRight: 0 }}
      >
        <div className="w-[200px]">
          <AudienceDropdownWithCallback
            onSelect={(val) => handleChannelAudienceChange("audience_type", val)}
            initialValue={channelAudience?.audience_type}
            dropdownId={adset?.id + "-channel"}
          />
        </div>
        <input
          type="text"
          placeholder="Enter audience name"
          value={channelAudience.name}
          onChange={(e) => handleChannelAudienceChange("name", e.target.value)}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px] ${!isEditing ? "cursor-not-allowed" : ""
            }`}
        />
        <input
          type="text"
          placeholder="Enter size"
          value={formatWithThousandSeparator(channelAudience?.size)}
          onChange={(e) => {
            const inputValue = e.target.value.replace(/,/g, "")
            if (!/^\d*\.?\d*$/.test(inputValue)) return
            handleChannelAudienceChange("size", inputValue)
          }}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? "cursor-not-allowed" : ""
            }`}
          inputMode="numeric"
          pattern="[0-9,]*"
        />
        <input
          type="text"
          placeholder="Description"
          value={channelAudience.description}
          onChange={(e) => handleChannelAudienceChange("description", e.target.value)}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[120px] ${!isEditing ? "cursor-not-allowed" : ""
            }`}
        />
      </div>
    )
  }

  // COMPLETE SEPARATION: Ad set level shows full view with ad set numbers and extra audiences
  return (
    <div className="flex gap-2 items-start w-full px-4">
      <div className="relative">
        <p className="relative z-[1] text-[#3175FF] text-sm whitespace-nowrap font-bold flex gap-4 items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          {`Ad set n°${adset?.addsetNumber}`}
        </p>
      </div>
      <div className="w-[200px]">
        <AudienceDropdownWithCallback onSelect={handleAudienceSelect} initialValue={audience} dropdownId={adset?.id} />
        <div className="mt-4 space-y-2">
          <div>
            {extraAudience?.map((audi, index) => (
              <div key={`${adset?.id}-${index}`} className="flex items-center justify-between gap-4 mb-2">
                <AudienceDropdownWithCallback
                  onSelect={(value: string) => handleExtraAudienceSelect(value, index)}
                  initialValue={audi?.audience_type}
                  dropdownId={`${adset?.id}-${index}`}
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={audi.name || ""}
                  onChange={(e) => {
                    const updated = [...extraAudience]
                    updated[index].name = e.target.value
                    updateExtraAudienceMap(updated)
                  }}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[120px]"
                />
                <input
                  type="text"
                  placeholder="Size"
                  value={formatWithThousandSeparator(audi?.size || "")}
                  onChange={(e) => handleExtraAudienceSizeChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[80px]"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={audi?.description || ""}
                  onChange={(e) => handleExtraAudienceDescriptionChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[100px]"
                />
                <button
                  disabled={!isEditing}
                  onClick={() => handleDeleteExtraAudience(index)}
                  className={`flex items-center justify-center rounded-full px-4 py-2 bg-[#FF5955] text-white ${!isEditing ? "cursor-not-allowed opacity-50" : ""
                    }`}
                >
                  <MdDelete /> <span className="text-white font-bold">Delete</span>
                </button>
              </div>
            ))}
          </div>
          <button
            className={`text-[14px] mt-2 font-semibold flex items-center gap-1 ${canAddNewAudience && extraAudience?.length < 10
              ? "text-[#3175FF] cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
              }`}
            onClick={() => {
              if (canAddNewAudience) {
                const updated = [...extraAudience, { audience_type: "", name: "", size: "", description: "" }]
                updateExtraAudienceMap(updated)
              }
            }}
            disabled={extraAudience?.length >= 10}
          >
            <Plus size={14} />
            <p>Add new audience</p>
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Enter ad set name"
        value={name}
        onChange={handleNameChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[120px] ${!isEditing ? "cursor-not-allowed" : ""
          }`}
      />
      <input
        type="text"
        placeholder="Enter size"
        value={formatWithThousandSeparator(size)}
        onChange={handleSizeChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? "cursor-not-allowed" : ""
          }`}
        inputMode="numeric"
        pattern="[0-9,]*"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[100px] ${!isEditing ? "cursor-not-allowed" : ""
          }`}
      />
      <div className="flex items-center gap-2">
        <button
          disabled={!isEditing}
          onClick={() => onDelete(adset?.id)}
          className={`flex items-center gap-2 rounded-full px-3 py-2 bg-[#FF5955] text-white text-sm font-bold ${!isEditing ? "cursor-not-allowed opacity-50" : ""
            }`}
        >
          <MdDelete /> <span>Delete</span>
        </button>
        {/* "New ad set" button on the same line as delete */}
        {onAddNewAdSet && (
          <button
            onClick={onAddNewAdSet}
            disabled={adsets?.length >= 10}
            className={`flex gap-2 items-center text-white ${adsets?.length >= 10 ? "bg-gray-400" : "bg-[#3175FF]"
              } px-3 py-2 rounded-full text-sm font-bold`}
            style={{ minWidth: 0 }}
          >
            <MdAdd />
            <span>{adsets?.length >= 10 ? "Max" : "New ad set"}</span>
          </button>
        )}
      </div>
    </div>
  )
})

// AudienceDropdownWithCallback Component - Updated with PUT request logic
const AudienceDropdownWithCallback = memo(function AudienceDropdownWithCallback({
  onSelect,
  initialValue,
  dropdownId,
}: {
  onSelect: (option: string) => void
  initialValue?: string
  dropdownId: number | string
}) {
  // Safely access context with error handling
  const dropdownContext = useContext(DropdownContext)
  const customAudienceContext = useContext(CustomAudienceTypesContext)
  const campaignsContext = useCampaigns()

  // Provide fallbacks if contexts are not available
  const { openDropdownId, setOpenDropdownId } = dropdownContext || {}
  const { customAudienceTypes = [], addCustomAudienceType = () => { } } = customAudienceContext || {}
  const { jwt, agencyData } = campaignsContext || {}

  // Default options
  const defaultOptions = ["Lookalike audience", "Retargeting audience", "Broad audience", "Behavioral audience"]

  // Merge default and custom, deduped - Updated to use agencyData with proper error handling
  const mergedAudienceOptions = Array.from(
    new Set([
      ...defaultOptions,
      ...(customAudienceTypes || []),
      ...(agencyData?.custom_audience_type?.map((item: any) => item?.text).filter(Boolean) || []),
    ]),
  )

  const [selected, setSelected] = useState<string>(initialValue || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const [loading, setLoading] = useState(false)

  const isOpen = openDropdownId === dropdownId

  useEffect(() => {
    if (initialValue) setSelected(initialValue)
  }, [initialValue])

  // If a custom value is selected but not in options, add it to context
  useEffect(() => {
    if (selected && !defaultOptions.includes(selected) && !customAudienceTypes.includes(selected)) {
      addCustomAudienceType(selected)
    }
    // eslint-disable-next-line
  }, [selected])

  const filteredOptions = (mergedAudienceOptions || []).filter((option) =>
    option?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
  )

  const handleSelect = useCallback(
    (option: string) => {
      try {
        if (!option || typeof option !== 'string') {
          console.error('Invalid option selected:', option);
          return;
        }
        setSelected(option)
        if (setOpenDropdownId) {
          setOpenDropdownId(null)
        }
        setSearchTerm("")
        onSelect(option)
      } catch (error) {
        console.error('Error in handleSelect:', error);
        toast.error('Failed to select audience type. Please try again.');
      }
    },
    [onSelect, setOpenDropdownId],
  )

  const toggleOpen = useCallback(() => {
    try {
      setOpenDropdownId(isOpen ? null : dropdownId)
      setSearchTerm("")
      setShowCustomInput(false)
      setCustomValue("")
    } catch (error) {
      console.error('Error in toggleOpen:', error);
      // Reset to a safe state
      setOpenDropdownId(null)
      setSearchTerm("")
      setShowCustomInput(false)
      setCustomValue("")
    }
  }, [isOpen, setOpenDropdownId, dropdownId])

  // Updated handleSaveCustomAudience to use PUT request to agencies endpoint
  const handleSaveCustomAudience = async () => {
    const value = customValue.trim();
    if (value.length < 2) {
      toast.error("Custom audience must be at least 2 characters.");
      return;
    }
    if (!/[a-zA-Z]/.test(value)) {
      toast.error("Custom audience must contain at least one alphabet.");
      return;
    }

    // Check if agencyData exists before proceeding
    if (!agencyData?.documentId) {
      toast.error("Agency data not available. Please try again.");
      return;
    }

    setLoading(true)
    try {
      // Get existing custom audience types from agencyData with proper null checking
      const existingCustomAudienceTypes = agencyData?.custom_audience_type || []

      // Use PUT request to update the agency's custom_audience_type array
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/agencies/${agencyData.documentId}`,
        { data: { custom_audience_type: [...existingCustomAudienceTypes, { text: customValue }] } },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      )

      const data = res?.data?.data
      addCustomAudienceType(customValue)
      setSelected(customValue)
      onSelect(customValue)
      setCustomValue("")
      setShowCustomInput(false)
      setOpenDropdownId(null)
      setSearchTerm("")
      toast.success("Custom audience type saved successfully")
    } catch (error: any) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent")
        window.dispatchEvent(event)
      } else {
        console.error("Error saving custom audience:", error)
        toast.error("Failed to save custom audience type")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest(`[data-dropdown-id="${dropdownId}"]`)) {
        setOpenDropdownId(null)
        setShowCustomInput(false)
        setSearchTerm("")
        setCustomValue("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, dropdownId, setOpenDropdownId])

  return (
    <div style={{ width: "200px" }}>
      <div className="relative border-2 border-[#0000001A] rounded-[10px] w-full" data-dropdown-id={dropdownId}>
        <button
          onClick={toggleOpen}
          className="relative z-10 min-w-0 w-full bg-white text-left border border-[#0000001A] rounded-lg text-[#656565] text-sm flex items-center justify-between py-4 px-4"
          style={{
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          type="button"
        >
          <span
            style={{
              display: "block",
              maxWidth: "calc(100% - 24px)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={selected || "Your audience type"}
          >
            {selected || "Your audience type"}
          </span>
          <svg
            className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute mt-1 top-full z-50 w-full bg-white border-2 border-[#0000001A] rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            <ul>
              <li className="px-2 py-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-[5px] outline-none"
                  placeholder="Search audiences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </li>
              {filteredOptions.length === 0 && <li className="px-4 py-2 text-gray-400">No audiences found</li>}
              {filteredOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="p-4 cursor-pointer text-[#656565] text-sm text-center whitespace-normal break-words hover:bg-gray-100"
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    maxWidth: 300,
                  }}
                  title={option}
                >
                  {option}
                </li>
              ))}
              {!showCustomInput ? (
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-[#656565] text-sm text-center"
                  onClick={() => setShowCustomInput(true)}
                >
                  Add Custom
                </li>
              ) : (
                <div className="w-[90%] mx-auto mb-2">
                  <input
                    className="w-full p-2 border rounded-[5px] outline-none"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Enter custom audience"
                  />
                  <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                    <button
                      className="w-full p-[5px] border rounded-[5px]"
                      onClick={() => {
                        setShowCustomInput(false)
                        setCustomValue("")
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                      onClick={handleSaveCustomAudience}
                      disabled={loading}
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
})

// NonFacebookOutlet Component (unchanged)
const NonFacebookOutlet = memo(function NonFacebookOutlet({
  outlet,
  setSelected,
  onInteraction,
}: {
  outlet: OutletType
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
  onInteraction: () => void
}) {
  const handleSelect = useCallback(() => {
    setSelected((prev) => [...prev, outlet.outlet])
    onInteraction()
  }, [outlet.outlet, setSelected, onInteraction])

  return (
    <div className="flex items-center gap-4">
      <div className="relative border border-[#0000001A] rounded-[10px]" onClick={handleSelect}>
        <button className="relative min-w-[150px] w-fit max-w-[300px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          <Image src={outlet.icon || "/placeholder.svg"} alt={outlet.outlet} className="w-[22px] h-[22px]" />
          <span className="text-[#061237] font-medium whitespace-nowrap">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
      </div>
    </div>
  )
})

// AdsetSettings Component - PATCH: Fix channel granularity recap to not show previous plan's channel audience
const AdsetSettings = memo(function AdsetSettings({
  outlet,
  stageName,
  onInteraction,
  defaultOpen,
  isCollapsed,
  setCollapsed,
  granularity = "adset",
  onPlatformStateChange,
}: {
  outlet: OutletType
  stageName: string
  onInteraction: () => void
  defaultOpen?: boolean
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  granularity?: "channel" | "adset"
  onPlatformStateChange?: (stageName: string, platformName: string, isOpen: boolean) => void
}) {
  const { isEditing } = useEditing()
  const { campaignFormData, setCampaignFormData, updateCampaign, getActiveCampaign, campaignData } = useCampaigns()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [adsets, setAdSets] = useState<AdSetType[]>([])
  const [adSetDataMap, setAdSetDataMap] = useState<Record<number, AdSetData>>({})
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null)

  // --- Channel-level state for this stage/platform with persistence ---
  const [channelAudienceState, setChannelAudienceState] = useState<{
    name: string
    audience_type: string
    size: string
    description: string
  }>(() => {
    // Try to load from storage first
    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    const storedState = loadChannelStateFromStorage(campaignId)
    if (storedState[stageName] && storedState[stageName][outlet.outlet]) {
      return { ...storedState[stageName][outlet.outlet] }
    }
    // Fallback to in-memory state
    if (channelLevelAudienceState[stageName] && channelLevelAudienceState[stageName][outlet.outlet]) {
      return { ...channelLevelAudienceState[stageName][outlet.outlet] }
    }
    return { name: "", audience_type: "", size: "", description: "" }
  })

  // Keep channelLevelAudienceState in sync and persist to storage
  useEffect(() => {
    if (!channelLevelAudienceState[stageName]) channelLevelAudienceState[stageName] = {}
    channelLevelAudienceState[stageName][outlet.outlet] = { ...channelAudienceState }
    // Update global reference for recap access
    if (typeof window !== "undefined") {
      ; (window as any).channelLevelAudienceState = channelLevelAudienceState
    }
    // Persist to sessionStorage
    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    saveChannelStateToStorage(channelLevelAudienceState, campaignId)
  }, [channelAudienceState, stageName, outlet.outlet, campaignFormData?.id, campaignFormData?.media_plan_id])

  useEffect(() => {
    // Load channel state from storage on component mount
    if (granularity === "channel") {
      const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
      const storedState = loadChannelStateFromStorage(campaignId)
      // Merge stored state into in-memory state
      Object.keys(storedState).forEach((stageName) => {
        if (!channelLevelAudienceState[stageName]) {
          channelLevelAudienceState[stageName] = {}
        }
        Object.keys(storedState[stageName]).forEach((platformName) => {
          channelLevelAudienceState[stageName][platformName] = storedState[stageName][platformName]
        })
      })
      // Update global reference
      if (typeof window !== "undefined") {
        ; (window as any).channelLevelAudienceState = channelLevelAudienceState
      }
      // Update local state if this platform has stored data
      if (storedState[stageName] && storedState[stageName][outlet.outlet]) {
        setChannelAudienceState({ ...storedState[stageName][outlet.outlet] })
      }
    }
  }, [granularity, stageName, outlet.outlet, campaignFormData?.id, campaignFormData?.media_plan_id])

  // FIXED: Initialize ad sets from campaign data every time the component mounts or data changes
  useEffect(() => {
    if (!campaignFormData?.channel_mix) return

    const result = findPlatform(campaignFormData.channel_mix, stageName, outlet.outlet)
    const platform = result?.platform

    if (defaultOpen && !selectedPlatforms.includes(outlet.outlet)) {
      setSelectedPlatforms((prev) => [...prev, outlet.outlet])
    }

    // GRANULARITY SEPARATION: Only initialize ad sets for adset granularity
    if (granularity === "adset") {
      if (!platform || !platform.ad_sets || platform.ad_sets.length === 0) {
        // Only create default ad set if none exist
        if (adsets.length === 0) {
          const newAdSetId = Date.now()
          setAdSets([{ id: newAdSetId, addsetNumber: 1 }])
          setAdSetDataMap({
            [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
          })
        }
        return
      }

      // Load existing ad sets from campaign data
      const newAdSets = platform.ad_sets.map((adSet, index) => ({
        id: adSet.id || Date.now() + index,
        addsetNumber: index + 1,
      }))
      const newAdSetDataMap: Record<number, AdSetData> = {}
      platform.ad_sets.forEach((adSet, index) => {
        const id = newAdSets[index].id
        newAdSetDataMap[id] = {
          name: adSet.name || "",
          audience_type: adSet.audience_type || "",
          size: adSet.size || "",
          description: adSet.description || "",
          extra_audiences: adSet?.extra_audiences,
          format: adSet?.format,
        }
      })
      setAdSets(newAdSets)
      setAdSetDataMap(newAdSetDataMap)
    } else {
      // For channel granularity, we don't need ad sets
      setAdSets([{ id: Date.now(), addsetNumber: 1 }]) // Single dummy ad set for rendering
      setAdSetDataMap({})
    }
  }, [
    stageName,
    outlet.outlet,
    selectedPlatforms,
    defaultOpen,
    granularity,
    campaignFormData?.channel_mix,
    // Remove campaignData.channel_mix dependency to avoid conflicts
  ])

  // Track platform open/closed state and notify parent
  useEffect(() => {
    const isOpen = selectedPlatforms.includes(outlet.outlet) && !isCollapsed
    onPlatformStateChange?.(stageName, outlet.outlet, isOpen)
  }, [selectedPlatforms, isCollapsed, stageName, outlet.outlet, onPlatformStateChange])

  // --- BEGIN PATCH: Ensure platform closes when last ad set is deleted ---
  // We need to inform the parent (AdSetFlow) to collapse the outlet when the last ad set is deleted.
  // We'll use a ref to avoid stale closure in deleteAdSet.
  const setCollapsedRef = useRef(setCollapsed)
  useEffect(() => {
    setCollapsedRef.current = setCollapsed
  }, [setCollapsed])

  // GRANULARITY SEPARATION: Only allow adding ad sets in adset granularity
  const addNewAddset = useCallback(() => {
    if (granularity !== "adset") return // Prevent adding ad sets in channel granularity
    if (adsets.length >= 10) {
      console.warn("Maximum limit of 10 ad sets reached")
      return
    }
    const newAdSetId = Date.now()
    const newAdSet = { id: newAdSetId, addsetNumber: adsets.length + 1 }
    const newAdSetData = { name: "", audience_type: "", size: "", description: "" }

    // Update local state
    setAdSets((prev) => {
      const updated = [...prev, newAdSet]

      // Immediately persist the new ad set
      if (campaignFormData?.channel_mix) {
        const allAdSetData = { ...adSetDataMap, [newAdSetId]: newAdSetData }

        const adSetsToSave = updated.map((adset) => {
          const data = allAdSetData[adset.id] || {
            name: "",
            audience_type: "",
            size: "",
            description: "",
          }
          return {
            id: adset.id,
            name: data.name,
            audience_type: data.audience_type,
            size: data.size,
            description: data.description,
            extra_audiences: "extra_audiences" in data ? (data as any).extra_audiences || [] : [],
            format: "format" in data ? (data as any).format : undefined,
          }
        })

        const updatedChannelMix = updateMultipleAdSets(
          campaignFormData.channel_mix,
          stageName,
          outlet.outlet,
          adSetsToSave,
        )

        setTimeout(() => {
          setCampaignFormData((prevData) => ({
            ...prevData,
            channel_mix: updatedChannelMix,
          }))
        }, 0)
      }

      return updated
    })

    setAdSetDataMap((prev) => ({
      ...prev,
      [newAdSetId]: newAdSetData,
    }))

    onInteraction && onInteraction()
  }, [
    onInteraction,
    adsets,
    adSetDataMap,
    granularity,
    campaignFormData,
    stageName,
    outlet.outlet,
    setCampaignFormData,
  ])

  const deleteAdSet = useCallback(
    async (id: number) => {
      // GRANULARITY SEPARATION: Only allow deleting ad sets in adset granularity
      if (granularity !== "adset") return

      try {
        // We'll need to know if this is the last ad set before updating state
        let isLastAdSet = false
        setAdSets((prev) => {
          const newAdSets = prev.filter((adset) => adset.id !== id)
          isLastAdSet = newAdSets.length === 0
          // PATCH: If last ad set, close the platform (collapse and deselect)
          if (isLastAdSet) {
            setSelectedPlatforms((prevPlatforms) => prevPlatforms.filter((p) => p !== outlet.outlet))
            // Collapse the outlet in parent
            setCollapsedRef.current(true)
            // Do NOT create a new dummy ad set here!
          }
          return newAdSets
        })
        setAdSetDataMap((prev) => {
          const newMap = { ...prev }
          delete newMap[id]
          return newMap
        })

        // Only persist ad sets if there are any left
        const adSetsToSave = adsets
          .filter((adset) => adset.id !== id)
          .map((adset) => {
            const data = adSetDataMap[adset.id] || {
              name: "",
              audience_type: "",
              size: "",
              description: "",
            }
            return {
              id: adset.id,
              name: data.name,
              audience_type: data.audience_type,
              size: data.size,
              description: data.description,
              extra_audiences: data.extra_audiences || [],
            }
          })
          .filter((data) => data.name || data.audience_type)

        const updatedChannelMix = updateMultipleAdSets(
          campaignFormData.channel_mix,
          stageName,
          outlet.outlet,
          adSetsToSave,
        )

        setCampaignFormData((prevData) => ({
          ...prevData,
          channel_mix: updatedChannelMix,
        }))

        const cleanData = removeKeysRecursively(campaignFormData, [
          "id",
          "documentId",
          "createdAt",
          "publishedAt",
          "updatedAt",
        ])

        await updateCampaign({
          ...cleanData,
          channel_mix: removeKeysRecursively(updatedChannelMix, ["id", "isValidated", "validatedStages"]),
        })

        await getActiveCampaign(campaignFormData)
        onInteraction && onInteraction()
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent")
          window.dispatchEvent(event)
        }
      }
    },
    [
      adsets,
      adSetDataMap,
      campaignFormData,
      stageName,
      outlet.outlet,
      setCampaignFormData,
      updateCampaign,
      getActiveCampaign,
      onInteraction,
      granularity,
    ],
  )
  // --- END PATCH ---

  const updateAdSetData = useCallback(
    (id: number, data: Partial<AdSetData>) => {
      // GRANULARITY SEPARATION: Only update ad set data in adset granularity
      if (granularity === "adset") {
        setAdSetDataMap((prev) => {
          const updated = {
            ...prev,
            [id]: { ...prev[id], ...data },
          }

          // Immediately persist the updated data
          if (campaignFormData?.channel_mix && selectedPlatforms.includes(outlet.outlet)) {
            const adSetsToSave = adsets.map((adset) => {
              const adsetData = updated[adset.id] || {
                name: "",
                audience_type: "",
                size: "",
                description: "",
              }
              return {
                id: adset.id,
                name: adsetData.name,
                audience_type: adsetData.audience_type,
                size: adsetData.size,
                description: adsetData.description,
                extra_audiences: adsetData.extra_audiences || [],
                format: adsetData.format,
              }
            })

            const updatedChannelMix = updateMultipleAdSets(
              campaignFormData.channel_mix,
              stageName,
              outlet.outlet,
              adSetsToSave,
            )

            // Use setTimeout to ensure state update happens after current render
            setTimeout(() => {
              setCampaignFormData((prevData) => ({
                ...prevData,
                channel_mix: updatedChannelMix,
              }))
            }, 0)
          }

          return updated
        })
      }
      onInteraction && onInteraction()
    },
    [
      onInteraction,
      granularity,
      campaignFormData,
      selectedPlatforms,
      outlet.outlet,
      stageName,
      adsets,
      setCampaignFormData,
    ],
  )

  // Remove the old persistence useEffect and replace with a debounced version
  useEffect(() => {
    if (!isEditing || !selectedPlatforms.includes(outlet.outlet) || granularity !== "adset") {
      return
    }

    if (!campaignFormData?.channel_mix) return

    // Debounce the persistence to avoid too many updates
    const timeoutId = setTimeout(() => {
      const adSetsToSave = adsets.map((adset) => {
        const data = adSetDataMap[adset.id] || {
          name: "",
          audience_type: "",
          size: "",
          description: "",
        }
        return {
          id: adset.id,
          name: data.name,
          audience_type: data.audience_type,
          size: data.size,
          description: data.description,
          extra_audiences: data.extra_audiences || [],
          format: data.format,
        }
      })

      const updatedChannelMix = updateMultipleAdSets(
        campaignFormData.channel_mix,
        stageName,
        outlet.outlet,
        adSetsToSave,
      )

      setCampaignFormData((prevData) => ({
        ...prevData,
        channel_mix: updatedChannelMix,
      }))

      console.log(`[${outlet.outlet}] Persisted ad sets:`, adSetsToSave)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [
    isEditing,
    selectedPlatforms,
    outlet.outlet,
    adsets,
    adSetDataMap,
    setCampaignFormData,
    stageName,
    granularity,
    campaignFormData?.channel_mix,
  ])

  // Debug useEffect to track ad set changes
  useEffect(() => {
    console.log(
      `[${outlet.outlet}] Ad sets updated:`,
      adsets.length,
      adsets.map((a) => a.id),
    )
    console.log(`[${outlet.outlet}] Ad set data:`, Object.keys(adSetDataMap))
  }, [adsets, adSetDataMap, outlet.outlet])

  const handleSelectOutlet = useCallback(() => {
    setSelectedPlatforms((prev) => [...prev, outlet.outlet])
    onInteraction()
  }, [outlet.outlet, onInteraction])

  const handleToggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed)
  }, [isCollapsed, setCollapsed])

  // PATCH: Only show channel-level recap if the user has interacted with the channel audience fields in this session
  // This prevents previous plan's channel audience from showing in recap for new plans
  const [hasChannelAudienceInteraction, setHasChannelAudienceInteraction] = useState(false)
  // Track interaction with channel audience fields
  useEffect(() => {
    if (granularity === "channel") {
      // If any field is filled, mark as interacted
      if (
        channelAudienceState.audience_type ||
        channelAudienceState.name ||
        channelAudienceState.size ||
        channelAudienceState.description
      ) {
        setHasChannelAudienceInteraction(true)
      }
    }
    // eslint-disable-next-line
  }, [
    channelAudienceState.audience_type,
    channelAudienceState.name,
    channelAudienceState.size,
    channelAudienceState.description,
    granularity,
  ])

  // Updated recap rows to handle granularity properly with complete separation
  const recapRows: {
    type: string
    name: string
    size: string
    description?: string
    adSetNumber?: number
    isExtra: boolean
  }[] = []

  if (granularity === "channel") {
    // Only show recap if user has interacted with channel audience fields in this session
    if (
      hasChannelAudienceInteraction &&
      (channelAudienceState.audience_type ||
        channelAudienceState.name ||
        channelAudienceState.size ||
        channelAudienceState.description)
    ) {
      recapRows.push({
        type: channelAudienceState.audience_type,
        name: channelAudienceState.name,
        size: channelAudienceState.size,
        description: channelAudienceState.description,
        isExtra: false,
      })
    }
  } else {
    // Ad set level: ONLY show individual ad sets, ignore channel data
    adsets.forEach((adset) => {
      const adSetData = adSetDataMap[adset.id] || {
        name: "",
        audience_type: "",
        size: "",
        description: "",
        extra_audiences: [],
      }

      if (adSetData.audience_type || adSetData.name || adSetData.size || adSetData.description) {
        recapRows.push({
          type: adSetData.audience_type || "",
          name: adSetData.name || "",
          size: adSetData.size || "",
          description: adSetData.description || "",
          adSetNumber: adset.addsetNumber,
          isExtra: false,
        })
      }

      if (Array.isArray(adSetData.extra_audiences)) {
        adSetData.extra_audiences.forEach((ea) => {
          if (ea.audience_type || ea.name || ea.size || ea.description) {
            recapRows.push({
              type: ea.audience_type || "",
              name: ea.name || "",
              size: ea.size || "",
              description: ea.description || "",
              adSetNumber: adset.addsetNumber,
              isExtra: true,
            })
          }
        })
      }
    })
  }

  if (!selectedPlatforms.includes(outlet.outlet)) {
    return <NonFacebookOutlet outlet={outlet} setSelected={setSelectedPlatforms} onInteraction={onInteraction} />
  }

  // PATCH: If there are no ad sets left, immediately collapse the outlet and show only the channel selection
  if (granularity === "adset" && adsets.length === 0) {
    // Defensive: ensure collapsed state is set
    if (!isCollapsed) {
      setCollapsed(true)
    }
    return <NonFacebookOutlet outlet={outlet} setSelected={setSelectedPlatforms} onInteraction={onInteraction} />
  }

  // Reduce vertical space between channels for channel granularity
  return (
    <div
      className={`flex flex-col w-full max-w-[1024px] ${granularity === "channel" ? "gap-1" : "gap-2"}`}
      style={granularity === "channel" ? { marginTop: 4, marginBottom: 4, paddingTop: 4, paddingBottom: 4 } : {}}
    >
      <div className="flex items-center gap-8">
        <div className="relative flex items-center gap-4">
          <button
            className="relative min-w-[150px] max-w-[300px] w-fit z-20 flex gap-4 justify-between cursor-pointer items-center bg-[#F9FAFB] border border-[#0000001A] border-solid py-4 px-4 rounded-[10px]"
            onClick={handleToggleCollapsed}
            type="button"
          >
            <Image src={outlet.icon || "/placeholder.svg"} alt={outlet.outlet} className="w-[22px] h-[22px]" />
            <span className="text-[#061237] font-medium">{outlet.outlet}</span>
            <FaAngleRight className={`transition-transform duration-200 ${isCollapsed ? "" : "rotate-90"}`} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
          <div
            className="relative w-full"
            style={
              granularity === "channel"
                ? { minHeight: "0px", marginTop: 4, marginBottom: 4, paddingTop: 4, paddingBottom: 4 }
                : { minHeight: `${Math.max(194, (adsets.length + 1) * 80)}px` }
            }
          >
            {adsets.length > 0 && (
              <>
                {adsets.map((adset, index) => (
                  <div
                    key={adset.id}
                    className="relative"
                    style={
                      granularity === "channel"
                        ? { marginTop: 4, marginBottom: 4, paddingTop: 0, paddingBottom: 0 }
                        : {
                          marginTop: index === 0 ? "20px" : "0px",
                          marginBottom: "20px",
                        }
                    }
                  >
                    <AdSet
                      key={adset.id}
                      adset={adset}
                      index={index}
                      isEditing={isEditing}
                      onDelete={deleteAdSet}
                      onUpdate={updateAdSetData}
                      audienceType={adSetDataMap[adset.id]?.audience_type}
                      adSetName={adSetDataMap[adset.id]?.name}
                      adSetSize={adSetDataMap[adset.id]?.size}
                      adSetDescription={adSetDataMap[adset.id]?.description}
                      extra_audiences={(adSetDataMap[adset.id]?.extra_audiences as AudienceData[]) || []}
                      onUpdateExtraAudiences={(extraAudienceArray) =>
                        updateAdSetData(adset.id, {
                          extra_audiences: extraAudienceArray,
                        })
                      }
                      onInteraction={onInteraction}
                      adsets={adsets}
                      granularity={granularity}
                      channelAudienceState={channelAudienceState}
                      setChannelAudienceState={setChannelAudienceState}
                      stageName={stageName}
                      platformName={outlet.outlet}
                      onAddNewAdSet={granularity === "adset" ? addNewAddset : undefined}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </DropdownContext.Provider>
      )}

      {isCollapsed && recapRows.length > 0 && (
        <div className="mt-2 mb-4">
          <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
            <div className="font-semibold text-[#061237] mb-2 text-sm">
              Audience Recap ({granularity === "channel" ? "Channel Level" : "Ad Set Level"})
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-[#061237]">
                <thead>
                  <tr>
                    {granularity === "adset" && <th className="text-left pr-4 py-1">Ad Set</th>}
                    <th className="text-left pr-4 py-1">Audience Type</th>
                    <th className="text-left pr-4 py-1">Audience Name</th>
                    <th className="text-left pr-4 py-1">
                      {granularity === "channel" ? "Total Size" : "Audience Size"}
                    </th>
                    <th className="text-left pr-4 py-1">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {recapRows.map((row, idx) => (
                    <tr key={idx} className={row.isExtra ? "bg-[#F9FAFB]" : ""}>
                      {granularity === "adset" && row.adSetNumber && (
                        <td className="pr-4 py-1">
                          {row.isExtra ? `Ad set n°${row.adSetNumber} (Extra)` : `Ad set n°${row.adSetNumber}`}
                        </td>
                      )}
                      <td className="pr-4 py-1">{row.type}</td>
                      <td className="pr-4 py-1">{row.name}</td>
                      <td className="pr-4 py-1">{formatWithThousandSeparator(row.size)}</td>
                      <td className="pr-4 py-1">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
)

// Main AdSetFlow Component
const globalCustomAudienceTypes: string[] = []
let globalSetCustomAudienceTypes: ((types: string[]) => void) | null = null

const AdSetFlow = memo(function AdSetFlow({
  stageName,
  onInteraction,
  onValidate,
  isValidateDisabled,
  onEditStart,
  platformName,
  modalOpen,
  granularity = "adset",
  onPlatformStateChange,
}: AdSetFlowProps) {
  const { isEditing, setIsEditing } = useEditing()
  const { active } = useActive()
  const { campaignFormData, updateCampaign, getActiveCampaign, campaignData } = useCampaigns()
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({})
  const [hasInteraction, setHasInteraction] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoOpen, setAutoOpen] = useState<Record<string, string[]>>({})
  const [collapsedOutlets, setCollapsedOutlets] = useState<Record<string, boolean>>({})
  const [customAudienceTypes, setCustomAudienceTypes] = useState<string[]>(() => {
    if (globalCustomAudienceTypes.length > 0) {
      return [...globalCustomAudienceTypes]
    }
    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem("customAudienceTypes")
        if (stored) {
          return JSON.parse(stored)
        }
      } catch (e) { }
    }
    return []
  })

  useEffect(() => {
    globalCustomAudienceTypes.length = 0
    customAudienceTypes.forEach((t) => globalCustomAudienceTypes.push(t))
    if (globalSetCustomAudienceTypes !== setCustomAudienceTypes) {
      globalSetCustomAudienceTypes = setCustomAudienceTypes
    }
  }, [customAudienceTypes])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("customAudienceTypes", JSON.stringify(customAudienceTypes))
    }
  }, [customAudienceTypes])

  useEffect(() => {
    function handleCustomAudienceUpdate(e: any) {
      if (Array.isArray(e.detail)) {
        setCustomAudienceTypes(e.detail)
      }
    }
    window.addEventListener("customAudienceTypesUpdated", handleCustomAudienceUpdate)
    return () => {
      window.removeEventListener("customAudienceTypesUpdated", handleCustomAudienceUpdate)
    }
  }, [])

  const addCustomAudienceType = useCallback((type: string) => {
    setCustomAudienceTypes((prev) => {
      if (!prev.includes(type)) {
        const updated = [...prev, type]
        globalCustomAudienceTypes.length = 0
        updated.forEach((t) => globalCustomAudienceTypes.push(t))
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("customAudienceTypes", JSON.stringify(updated))
          window.dispatchEvent(new CustomEvent("customAudienceTypesUpdated", { detail: updated }))
        }
        if (globalSetCustomAudienceTypes && globalSetCustomAudienceTypes !== setCustomAudienceTypes) {
          globalSetCustomAudienceTypes(updated)
        }
        return updated
      }
      return prev
    })
  }, [])

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {}
    const channelMix = campaignFormData?.channel_mix || []

    channelMix &&
      channelMix?.length > 0 &&
      channelMix.forEach((stage: any) => {
        const {
          funnel_stage,
          search_engines,
          display_networks,
          social_media,
          streaming,
          mobile,
          ooh,
          broadcast,
          in_game,
          e_commerce,
          messaging,
          print,
        } = stage

        if (!platformsByStage[funnel_stage]) platformsByStage[funnel_stage] = []
          ;[
            search_engines,
            display_networks,
            social_media,
            streaming,
            mobile,
            ooh,
            broadcast,
            in_game,
            e_commerce,
            messaging,
            print,
          ].forEach((platforms) => {
            if (Array.isArray(platforms)) {
              platforms.forEach((platform: any) => {
                const icon = getPlatformIcon(platform?.platform_name)
                platformsByStage[funnel_stage].push({
                  id: Math.floor(Math.random() * 1000000),
                  outlet: platform.platform_name,
                  icon: icon,
                })
              })
            }
          })
      })
    return platformsByStage
  }, [campaignFormData, modalOpen])

  useEffect(() => {
    if (campaignFormData && campaignFormData?.channel_mix) {
      const data = getPlatformsFromStage()
      setPlatforms(data)

      const autoOpenPlatforms = {}
      if (granularity === "adset") {
        // Existing adset logic
        for (const stage of campaignFormData.channel_mix) {
          const platformsWithAdsets = [
            ...(Array.isArray(stage.search_engines) ? stage.search_engines : []),
            ...(Array.isArray(stage.display_networks) ? stage.display_networks : []),
            ...(Array.isArray(stage.social_media) ? stage.social_media : []),
            ...(Array.isArray(stage.streaming) ? stage.streaming : []),
            ...(Array.isArray(stage.ooh) ? stage.ooh : []),
            ...(Array.isArray(stage.broadcast) ? stage.broadcast : []),
            ...(Array.isArray(stage.messaging) ? stage.messaging : []),
            ...(Array.isArray(stage.print) ? stage.print : []),
            ...(Array.isArray(stage.e_commerce) ? stage.e_commerce : []),
            ...(Array.isArray(stage.in_game) ? stage.in_game : []),
            ...(Array.isArray(stage.mobile) ? stage.mobile : []),
          ]
            .filter((p) => p.ad_sets && p.ad_sets.length > 0)
            .map((p) => p.platform_name)

          if (platformsWithAdsets.length > 0) {
            autoOpenPlatforms[stage.funnel_stage] = platformsWithAdsets
          }
        }
      } else if (granularity === "channel") {
        // New channel granularity logic
        const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
        // Check both sessionStorage and in-memory state for channel-level audience data
        let channelStateToCheck = {}

        // First try to load from sessionStorage
        if (typeof window !== "undefined") {
          try {
            const key = `channelLevelAudienceState_${campaignId || "default"}`
            const stored = sessionStorage.getItem(key)
            if (stored) {
              channelStateToCheck = JSON.parse(stored)
            }
          } catch (error) {
            console.error("Error loading channel state for auto-open:", error)
          }
        }

        // Fallback to in-memory state if no stored data
        if (
          Object.keys(channelStateToCheck).length === 0 &&
          typeof window !== "undefined" &&
          (window as any).channelLevelAudienceState
        ) {
          channelStateToCheck = (window as any).channelLevelAudienceState
        }

        // Check each stage for platforms with channel-level audience data
        for (const stage of campaignFormData.channel_mix) {
          const stageName = stage.funnel_stage
          const stageChannelData = channelStateToCheck[stageName]

          if (stageChannelData) {
            const platformsWithChannelData = Object.entries(stageChannelData)
              .filter(([platformName, data]: [string, any]) => data.audience_type || data.name || data.size)
              .map(([platformName]) => platformName)

            if (platformsWithChannelData.length > 0) {
              autoOpenPlatforms[stageName] = platformsWithChannelData
            }
          }
        }
      }

      setAutoOpen(autoOpenPlatforms)
    }
  }, [modalOpen, granularity])

  const handleInteraction = useCallback(() => {
    setHasInteraction(true)
    onInteraction && onInteraction()
  }, [onInteraction])

  const updateCampaignData = async (data) => {
    const calcPercent = Math.ceil((active / 10) * 100)
    try {
      await updateCampaign({
        ...data,
        progress_percent:
          campaignFormData?.progress_percent > calcPercent ? campaignFormData?.progress_percent : calcPercent,
      })
      await getActiveCampaign(data)
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent")
        window.dispatchEvent(event)
      }
      throw error
    }
  }

  const cleanData = campaignData
    ? removeKeysRecursively(campaignData, ["id", "documentId", "createdAt", "publishedAt", "updatedAt"])
    : {}

  const handleStepThree = async () => {
    await updateCampaignData({
      ...cleanData,
      channel_mix: removeKeysRecursively(campaignFormData?.channel_mix, ["id", "isValidated", "validatedStages"]),
    })
      .then(() => {
        setIsEditing(false)
        onValidate()
      })
      .catch((err) => { })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (isEditing) {
      onEditStart && onEditStart()
    }
  }, [isEditing])

  useEffect(() => {
    if (modalOpen) {
      setIsEditing(true)
    }
  }, [modalOpen])

  useEffect(() => {
    if (platforms[stageName]) {
      const initialCollapsed: Record<string, boolean> = {}
      platforms[stageName].forEach((outlet) => {
        initialCollapsed[outlet.outlet] = false
      })
      setCollapsedOutlets(initialCollapsed)
    }
  }, [platforms, stageName])

  const handleToggleCollapsed = (outletName: string) => {
    setCollapsedOutlets((prev) => ({
      ...prev,
      [outletName]: !prev[outletName],
    }))
  }

  return (
    <CustomAudienceTypesContext.Provider
      value={{
        customAudienceTypes,
        addCustomAudienceType,
      }}
    >
      <div
        className={`w-full p-4 ${granularity === "channel" ? "space-y-4" : "space-y-4"}`}
        style={granularity === "channel" ? { marginTop: 12, marginBottom: 4, paddingTop: 4, paddingBottom: 4 } : {}}
      >
        {platformName
          ? platforms[stageName]
            ?.filter((outlet) =>
              Array.isArray(platformName) ? platformName.includes(outlet.outlet) : outlet.outlet === platformName,
            )
            .map((outlet) => (
              <AdsetSettings
                key={outlet.id}
                outlet={outlet}
                stageName={stageName}
                onInteraction={handleInteraction}
                defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
                isCollapsed={collapsedOutlets[outlet.outlet] ?? false}
                setCollapsed={(collapsed) =>
                  setCollapsedOutlets((prev) => ({
                    ...prev,
                    [outlet.outlet]: collapsed,
                  }))
                }
                granularity={granularity}
                onPlatformStateChange={onPlatformStateChange}
              />
            ))
          : platforms[stageName]?.map((outlet) => (
            <AdsetSettings
              key={outlet.id}
              outlet={outlet}
              stageName={stageName}
              onInteraction={handleInteraction}
              defaultOpen={autoOpen[stageName]?.includes(outlet.outlet)}
              isCollapsed={collapsedOutlets[outlet.outlet] ?? false}
              setCollapsed={(collapsed) =>
                setCollapsedOutlets((prev) => ({
                  ...prev,
                  [outlet.outlet]: collapsed,
                }))
              }
              granularity={granularity}
              onPlatformStateChange={onPlatformStateChange}
            />
          ))}
      </div>
    </CustomAudienceTypesContext.Provider>
  )
})



export default AdSetFlow
