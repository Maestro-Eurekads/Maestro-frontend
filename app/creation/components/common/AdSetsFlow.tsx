"use client"

import type React from "react"
import { memo, useState, useCallback, useEffect, useRef, createContext, useContext } from "react"
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
import toast from "react-hot-toast"

// --- Custom Audience Types Context (Global, for all stages) ---
const CustomAudienceTypesContext = createContext<{
  customAudienceTypes: string[]
  addCustomAudienceType: (type: string) => void
}>({
  customAudienceTypes: [],
  addCustomAudienceType: () => {},
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
  setOpenDropdownId: () => {},
})

// Utility functions
const findPlatform = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
): { platform: Platform; channelType: string } | null => {
  const stage = campaignData.find((stage) => stage.funnel_stage === stageName)
  if (!stage) return null

  const channelTypes = mediaTypes
  for (const channelType of channelTypes) {
    const platform = stage[channelType].find((p) => p.platform_name === platformName)
    if (platform) return { platform, channelType }
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
    console.error("Error saving channel state to storage:", error)
  }
}

// --- Adset-level state isolation with persistence ---
const getAdsetStateKey = (campaignId?: string | number) => {
  return `adsetLevelAudienceState_${campaignId || "default"}`
}

const loadAdsetStateFromStorage = (campaignId?: string | number) => {
  if (typeof window === "undefined") return {}
  try {
    const key = getAdsetStateKey(campaignId)
    const stored = sessionStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error("Error loading adset state from storage:", error)
    return {}
  }
}

const saveAdsetStateToStorage = (state: any, campaignId?: string | number) => {
  if (typeof window === "undefined") return
  try {
    const key = getAdsetStateKey(campaignId)
    sessionStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.error("Error saving adset state to storage:", error)
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
  ;(window as any).channelLevelAudienceState = channelLevelAudienceState
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
      onUpdate(adset.id, { audience_type: selectedAudience })
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
      onUpdate(adset.id, { name: newName })
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
      onUpdate(adset.id, { size: inputValue })
      onInteraction()
    },
    [adset.id, onUpdate, onInteraction],
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDescription = e.target.value
      setDescription(newDescription)
      onUpdate(adset.id, { description: newDescription })
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
    channelAudience.name.trim() !== "" &&
    channelAudience.audience_type.trim() !== "" &&
    channelAudience.size.trim() !== ""

  // --- Adset-level add audience logic ---
  const isParentFilled = name.trim() !== "" && audience.trim() !== "" && size.trim() !== ""

  const canAddNewAudience =
    isParentFilled &&
    (extraAudience.length === 0 ||
      (extraAudience.length > 0 && extraAudience[extraAudience.length - 1]?.audience_type?.trim()))

  // COMPLETE SEPARATION: Channel level shows only channel fields, no ad set numbers or extra audiences
  if (granularity === "channel") {
    return (
      <div className="flex gap-2 items-start w-full px-4">
        <div className="w-[200px]">
          <AudienceDropdownWithCallback
            onSelect={(val) => handleChannelAudienceChange("audience_type", val)}
            initialValue={channelAudience.audience_type}
            dropdownId={adset.id + "-channel"}
          />
        </div>
        <input
          type="text"
          placeholder="Enter audience name"
          value={channelAudience.name}
          onChange={(e) => handleChannelAudienceChange("name", e.target.value)}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px] ${
            !isEditing ? "cursor-not-allowed" : ""
          }`}
        />
        <input
          type="text"
          placeholder="Enter size"
          value={formatWithThousandSeparator(channelAudience.size)}
          onChange={(e) => {
            const inputValue = e.target.value.replace(/,/g, "")
            if (!/^\d*\.?\d*$/.test(inputValue)) return
            handleChannelAudienceChange("size", inputValue)
          }}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !isEditing ? "cursor-not-allowed" : ""
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
          className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[180px] ${
            !isEditing ? "cursor-not-allowed" : ""
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
          {`Ad set n°${adset.addsetNumber}`}
        </p>
      </div>
      <div className="w-[200px]">
        <AudienceDropdownWithCallback onSelect={handleAudienceSelect} initialValue={audience} dropdownId={adset.id} />
        <div className="mt-4 space-y-2">
          <div>
            {extraAudience?.map((audi, index) => (
              <div key={`${adset.id}-${index}`} className="flex items-center justify-between gap-4 mb-2">
                <AudienceDropdownWithCallback
                  onSelect={(value: string) => handleExtraAudienceSelect(value, index)}
                  initialValue={audi?.audience_type}
                  dropdownId={`${adset.id}-${index}`}
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
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px]"
                />
                <input
                  type="text"
                  placeholder="Size"
                  value={formatWithThousandSeparator(audi.size || "")}
                  onChange={(e) => handleExtraAudienceSizeChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[100px]"
                  inputMode="numeric"
                  pattern="[0-9,]*"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={audi.description || ""}
                  onChange={(e) => handleExtraAudienceDescriptionChange(e, index)}
                  disabled={!isEditing}
                  className="text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[180px]"
                />
                <button
                  disabled={!isEditing}
                  onClick={() => handleDeleteExtraAudience(index)}
                  className={`flex items-center justify-center rounded-full px-6 py-2 bg-[#FF5955] text-white ${
                    !isEditing ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <MdDelete /> <span className="text-white font-bold">Delete</span>
                </button>
              </div>
            ))}
          </div>
          <button
            className={`text-[14px] mt-2 font-semibold flex items-center gap-1 ${
              canAddNewAudience && extraAudience?.length < 10
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
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[160px] ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
      />
      <input
        type="text"
        placeholder="Enter size"
        value={formatWithThousandSeparator(size)}
        onChange={handleSizeChange}
        disabled={!isEditing}
        className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isEditing ? "cursor-not-allowed" : ""
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
        className={`text-black text-sm font-semibold border border-gray-300 py-3 px-3 rounded-lg h-[48px] w-[180px] ${
          !isEditing ? "cursor-not-allowed" : ""
        }`}
      />
      <button
        disabled={!isEditing}
        onClick={() => onDelete(adset.id)}
        className={`flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5955] text-white text-sm font-bold ${
          !isEditing ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <MdDelete /> <span>Delete</span>
      </button>
    </div>
  )
})

// AudienceDropdownWithCallback Component (unchanged)
const AudienceDropdownWithCallback = memo(function AudienceDropdownWithCallback({
  onSelect,
  initialValue,
  dropdownId,
}: {
  onSelect: (option: string) => void
  initialValue?: string
  dropdownId: number | string
}) {
  const { openDropdownId, setOpenDropdownId } = useContext(DropdownContext)
  const { customAudienceTypes, addCustomAudienceType } = useContext(CustomAudienceTypesContext)
  const { jwt, agencyData } = useCampaigns()

  // Default options
  const defaultOptions = ["Lookalike audience", "Retargeting audience", "Broad audience", "Behavioral audience"]

  // Merge default and custom, deduped
  const mergedAudienceOptions = Array.from(
    new Set([
      ...defaultOptions,
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
      setSelected(option)
      setOpenDropdownId(null)
      setSearchTerm("")
      onSelect(option)
    },
    [onSelect, setOpenDropdownId],
  )

  const toggleOpen = useCallback(() => {
    setOpenDropdownId(isOpen ? null : dropdownId)
    setSearchTerm("")
    setShowCustomInput(false)
    setCustomValue("")
  }, [isOpen, setOpenDropdownId, dropdownId])

  const handleSaveCustomAudience = async () => {
    if (!customValue.trim()) {
      toast.error("Please enter a custom audience type", {
        id: "custom-audience-error",
      })
      return
    }

    setLoading(true)
    try {
      const existingCustomAudienceTypes = agencyData?.custom_audience_type || []
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/agencies/${agencyData?.documentId}`,
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
    } catch (error) {
      console.error("Error saving custom audience type:", error)
      toast.error("Failed to save custom audience type")
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

// AdsetSettings Component - Updated with complete granularity separation and platform state tracking
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
  const { campaignFormData, setCampaignFormData, updateCampaign, getActiveCampaign, agencyData } = useCampaigns()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [adsets, setAdSets] = useState<AdSetType[]>([])
  const [adSetDataMap, setAdSetDataMap] = useState<Record<number, AdSetData>>({})
  const [openDropdownId, setOpenDropdownId] = useState<number | string | null>(null)
  const initialized = useRef(false)

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

  // --- Adset-level state for this stage/platform with persistence ---
  // adsetAudienceState shape: { [stageName]: { [platformName]: { [adsetId]: AdSetData } } }
  const [adsetAudienceState, setAdsetAudienceState] = useState<any>(() => {
    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    const stored = loadAdsetStateFromStorage(campaignId)
    return stored || {}
  })

  // Keep channelLevelAudienceState in sync and persist to storage
  useEffect(() => {
    if (!channelLevelAudienceState[stageName]) channelLevelAudienceState[stageName] = {}
    channelLevelAudienceState[stageName][outlet.outlet] = { ...channelAudienceState }

    // Update global reference for recap access
    if (typeof window !== "undefined") {
      ;(window as any).channelLevelAudienceState = channelLevelAudienceState
    }

    // Persist to sessionStorage
    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    saveChannelStateToStorage(channelLevelAudienceState, campaignId)
  }, [channelAudienceState, stageName, outlet.outlet, campaignFormData?.id, campaignFormData?.media_plan_id])

  // Keep adsetAudienceState in sync and persist to storage
  useEffect(() => {
    if (granularity !== "adset") return
    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    saveAdsetStateToStorage(adsetAudienceState, campaignId)
  }, [adsetAudienceState, campaignFormData?.id, campaignFormData?.media_plan_id, granularity])

  // On mount, load adset-level state from storage and initialize adsets/adSetDataMap accordingly
  useEffect(() => {
    if (!campaignFormData?.channel_mix) return
    if (initialized.current) return
    initialized.current = true

    const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
    const storedAdsetState = loadAdsetStateFromStorage(campaignId)

    const result = findPlatform(campaignFormData.channel_mix, stageName, outlet.outlet)
    const platform = result?.platform

    if (defaultOpen && !selectedPlatforms.includes(outlet.outlet)) {
      setSelectedPlatforms((prev) => [...prev, outlet.outlet])
    }

    if (granularity === "adset") {
      // Try to load from sessionStorage first
      if (
        storedAdsetState &&
        storedAdsetState[stageName] &&
        storedAdsetState[stageName][outlet.outlet] &&
        Object.keys(storedAdsetState[stageName][outlet.outlet]).length > 0
      ) {
        const adsetObj = storedAdsetState[stageName][outlet.outlet]
        const adsetIds = Object.keys(adsetObj).map((id) => Number(id))
        const newAdSets = adsetIds.map((id, idx) => ({
          id,
          addsetNumber: idx + 1,
        }))
        setAdSets(newAdSets)
        setAdSetDataMap(
          adsetIds.reduce((acc, id) => {
            acc[id] = adsetObj[id]
            return acc
          }, {} as Record<number, AdSetData>),
        )
        setAdsetAudienceState(storedAdsetState)
        return
      }

      // Fallback to platform data if no sessionStorage
      if (!platform) {
        const newAdSetId = Date.now()
        setAdSets([{ id: newAdSetId, addsetNumber: 1 }])
        setAdSetDataMap({
          [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
        })
        setAdsetAudienceState((prev: any) => {
          const updated = { ...prev }
          if (!updated[stageName]) updated[stageName] = {}
          if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
          updated[stageName][outlet.outlet][newAdSetId] = { name: "", audience_type: "", size: "", description: "" }
          return updated
        })
        return
      }

      if (platform.ad_sets && platform.ad_sets.length > 0) {
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
          }
        })
        setAdSets(newAdSets)
        setAdSetDataMap(newAdSetDataMap)
        setAdsetAudienceState((prev: any) => {
          const updated = { ...prev }
          if (!updated[stageName]) updated[stageName] = {}
          if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
          newAdSets.forEach((adset) => {
            updated[stageName][outlet.outlet][adset.id] = newAdSetDataMap[adset.id]
          })
          return updated
        })
      } else {
        const newAdSetId = Date.now()
        setAdSets([{ id: newAdSetId, addsetNumber: 1 }])
        setAdSetDataMap({
          [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
        })
        setAdsetAudienceState((prev: any) => {
          const updated = { ...prev }
          if (!updated[stageName]) updated[stageName] = {}
          if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
          updated[stageName][outlet.outlet][newAdSetId] = { name: "", audience_type: "", size: "", description: "" }
          return updated
        })
      }
    } else {
      // For channel granularity, we don't need ad sets
      setAdSets([{ id: Date.now(), addsetNumber: 1 }]) // Single dummy ad set for rendering
      setAdSetDataMap({})
    }
  }, [stageName, outlet.outlet, selectedPlatforms, defaultOpen, granularity, campaignFormData?.id, campaignFormData?.media_plan_id])

  // Track platform open/closed state and notify parent
  useEffect(() => {
    const isOpen = selectedPlatforms.includes(outlet.outlet) && !isCollapsed
    onPlatformStateChange?.(stageName, outlet.outlet, isOpen)
  }, [selectedPlatforms, isCollapsed, stageName, outlet.outlet, onPlatformStateChange])

  // GRANULARITY SEPARATION: Only allow adding ad sets in adset granularity
  const addNewAddset = useCallback(() => {
    if (granularity !== "adset") return // Prevent adding ad sets in channel granularity

    if (adsets.length >= 10) {
      console.warn("Maximum limit of 10 ad sets reached")
      return
    }

    const newAdSetId = Date.now()
    setAdSets((prev) => [...prev, { id: newAdSetId, addsetNumber: prev.length + 1 }])
    setAdSetDataMap((prev) => ({
      ...prev,
      [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
    }))
    setAdsetAudienceState((prev: any) => {
      const updated = { ...prev }
      if (!updated[stageName]) updated[stageName] = {}
      if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
      updated[stageName][outlet.outlet][newAdSetId] = { name: "", audience_type: "", size: "", description: "" }
      return updated
    })
    onInteraction && onInteraction()
  }, [onInteraction, adsets.length, granularity, stageName, outlet.outlet])

  const deleteAdSet = useCallback(
    async (id: number) => {
      // GRANULARITY SEPARATION: Only allow deleting ad sets in adset granularity
      if (granularity !== "adset") return

      try {
        setAdSets((prev) => {
          const newAdSets = prev.filter((adset) => adset.id !== id)
          if (newAdSets.length === 0) {
            setSelectedPlatforms((prevPlatforms) => prevPlatforms.filter((p) => p !== outlet.outlet))
            const newAdSetId = Date.now()
            setTimeout(() => {
              setAdSets([{ id: newAdSetId, addsetNumber: 1 }])
              setAdSetDataMap({
                [newAdSetId]: { name: "", audience_type: "", size: "", description: "" },
              })
              setAdsetAudienceState((prev: any) => {
                const updated = { ...prev }
                if (!updated[stageName]) updated[stageName] = {}
                if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
                updated[stageName][outlet.outlet][newAdSetId] = { name: "", audience_type: "", size: "", description: "" }
                return updated
              })
            }, 0)
          }
          return newAdSets
        })

        setAdSetDataMap((prev) => {
          const newMap = { ...prev }
          delete newMap[id]
          return newMap
        })

        setAdsetAudienceState((prev: any) => {
          const updated = { ...prev }
          if (updated[stageName] && updated[stageName][outlet.outlet]) {
            delete updated[stageName][outlet.outlet][id]
          }
          return updated
        })

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
        console.error("Failed to delete ad set:", error)
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

  const updateAdSetData = useCallback(
    (id: number, data: Partial<AdSetData>) => {
      // GRANULARITY SEPARATION: Only update ad set data in adset granularity
      if (granularity === "adset") {
        setAdSetDataMap((prev) => ({
          ...prev,
          [id]: { ...prev[id], ...data },
        }))
        setAdsetAudienceState((prev: any) => {
          const updated = { ...prev }
          if (!updated[stageName]) updated[stageName] = {}
          if (!updated[stageName][outlet.outlet]) updated[stageName][outlet.outlet] = {}
          updated[stageName][outlet.outlet][id] = { ...((updated[stageName][outlet.outlet][id] || {})), ...data }
          return updated
        })
      }
      onInteraction && onInteraction()
    },
    [onInteraction, granularity, stageName, outlet.outlet],
  )

  // GRANULARITY SEPARATION: Only persist ad set data in adset granularity
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // --- PATCH: Always update campaignFormData with latest adsets/adSetDataMap on any change ---
  useEffect(() => {
    if (granularity === "adset" && selectedPlatforms.includes(outlet.outlet)) {
      if (!campaignFormData?.channel_mix) return

      // Clear previous timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      // Throttle updates to prevent infinite loops
      updateTimeoutRef.current = setTimeout(() => {
        // Always use the latest adsets/adSetDataMap for saving
        const adSetsToSave = adsets
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

        // PATCH: Always update campaignFormData, even if adSetsToSave is empty (to clear out old ad sets)
        const updatedChannelMix = updateMultipleAdSets(
          campaignFormData.channel_mix,
          stageName,
          outlet.outlet,
          adSetsToSave,
        )

        setCampaignFormData((prevData) => {
          // Prevent unnecessary updates
          if (JSON.stringify(prevData.channel_mix) === JSON.stringify(updatedChannelMix)) {
            return prevData
          }
          return {
            ...prevData,
            channel_mix: updatedChannelMix,
          }
        })
      }, 300) // 300ms throttle
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [
    isEditing,
    selectedPlatforms.includes(outlet.outlet),
    granularity,
    adsets,
    adSetDataMap,
    stageName,
    outlet.outlet,
    campaignFormData?.channel_mix,
    setCampaignFormData,
  ])
  // --- END PATCH ---

  const handleSelectOutlet = useCallback(() => {
    setSelectedPlatforms((prev) => [...prev, outlet.outlet])
    onInteraction()
  }, [outlet.outlet, onInteraction])

  const handleToggleCollapsed = useCallback(() => {
    setCollapsed(!isCollapsed)
  }, [isCollapsed, setCollapsed])

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
    // Channel level: ONLY use channel-level state for this platform
    if (
      channelAudienceState.audience_type ||
      channelAudienceState.name ||
      channelAudienceState.size ||
      channelAudienceState.description
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

  // --- BEGIN PATCH: Show recap in adset granularity when collapsed ---
  let showRecapRows = recapRows
  if (
    granularity === "adset" &&
    isCollapsed &&
    recapRows.length === 0 &&
    adsetAudienceState &&
    adsetAudienceState[stageName] &&
    adsetAudienceState[stageName][outlet.outlet]
  ) {
    // Build recapRows from adsetAudienceState
    const adsetObj = adsetAudienceState[stageName][outlet.outlet]
    // PATCH: Sort adsetIds by their addsetNumber if possible, else by id
    const adsetIds = Object.keys(adsetObj)
      .map((id) => Number(id))
      .sort((a, b) => a - b)
    showRecapRows = []
    adsetIds.forEach((adsetId, idx) => {
      const adSetData = adsetObj[adsetId] || {}
      if (adSetData.audience_type || adSetData.name || adSetData.size || adSetData.description) {
        showRecapRows.push({
          type: adSetData.audience_type || "",
          name: adSetData.name || "",
          size: adSetData.size || "",
          description: adSetData.description || "",
          adSetNumber: idx + 1,
          isExtra: false,
        })
      }
      if (Array.isArray(adSetData.extra_audiences)) {
        adSetData.extra_audiences.forEach((ea) => {
          if (ea.audience_type || ea.name || ea.size || ea.description) {
            showRecapRows.push({
              type: ea.audience_type || "",
              name: ea.name || "",
              size: ea.size || "",
              description: ea.description || "",
              adSetNumber: idx + 1,
              isExtra: true,
            })
          }
        })
      }
    })
  }
  // --- END PATCH ---

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1024px]">
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
          {/* GRANULARITY SEPARATION: Only show "New ad set" button in adset granularity */}
          {!isCollapsed && granularity === "adset" && (
            <button
              onClick={addNewAddset}
              disabled={adsets.length >= 10}
              className={`flex gap-2 items-center text-white ${
                adsets.length >= 10 ? "bg-gray-400" : "bg-[#3175FF]"
              } px-4 py-2 rounded-full text-sm font-bold z-10 relative`}
              style={{ marginLeft: "8px" }}
            >
              <MdAdd />
              <span>{adsets.length >= 10 ? "Max limit reached" : "New ad set"}</span>
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
          <div className="relative w-full" style={{ minHeight: `${Math.max(194, (adsets.length + 1) * 100)}px` }}>
            {adsets.length > 0 && (
              <>
                {adsets.map((adset, index) => (
                  <div
                    key={adset.id}
                    className="relative"
                    style={{
                      marginTop: index === 0 ? "20px" : "0px",
                      marginBottom: "20px",
                    }}
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
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </DropdownContext.Provider>
      )}
      {isCollapsed && showRecapRows.length > 0 && (
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
                  {showRecapRows.map((row, idx) => (
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
})

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
      } catch (e) {}
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

    if (channelMix && channelMix.length > 0) {
      channelMix.forEach((stage: any) => {
        const {
          funnel_stage,
          search_engines = [],
          display_networks = [],
          social_media = [],
          streaming = [],
          mobile = [],
          ooh = [],
          broadcast = [],
          in_game = [],
          e_commerce = [],
          messaging = [],
          print = [],
        } = stage

        if (!platformsByStage[funnel_stage]) platformsByStage[funnel_stage] = []

        const allPlatforms = [
          ...(search_engines || []),
          ...(display_networks || []),
          ...(social_media || []),
          ...(streaming || []),
          ...(mobile || []),
          ...(ooh || []),
          ...(broadcast || []),
          ...(in_game || []),
          ...(e_commerce || []),
          ...(messaging || []),
          ...(print || []),
        ]

        allPlatforms.forEach((platform: any) => {
          if (platform && platform.platform_name) {
            const icon = getPlatformIcon(platform.platform_name)
            platformsByStage[funnel_stage].push({
              id: Math.floor(Math.random() * 1000000),
              outlet: platform.platform_name,
              icon: icon,
            })
          }
        })
      })
    }
    return platformsByStage
  }, [campaignFormData, modalOpen])

  useEffect(() => {
    if (campaignFormData && campaignFormData?.channel_mix) {
      const data = getPlatformsFromStage()
      setPlatforms(data)

      const autoOpenPlatforms = {}

      if (granularity === "adset" && campaignFormData.channel_mix && campaignFormData.channel_mix?.length > 0) {
        // Existing adset logic
        // Try to auto-open platforms with adset data in sessionStorage
        const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id
        let adsetStateToCheck = {}
        if (typeof window !== "undefined") {
          try {
            const key = `adsetLevelAudienceState_${campaignId || "default"}`
            const stored = sessionStorage.getItem(key)
            if (stored) {
              adsetStateToCheck = JSON.parse(stored)
            }
          } catch (error) {
            console.error("Error loading adset state for auto-open:", error)
          }
        }
        for (const stage of campaignFormData.channel_mix) {
          const stageName = stage.funnel_stage
          const stageAdsetData = adsetStateToCheck[stageName]
          if (stageAdsetData) {
            const platformsWithAdsetData = Object.entries(stageAdsetData)
              .filter(
                ([platformName, adsetsObj]: [string, any]) =>
                  adsetsObj &&
                  Object.values(adsetsObj).some(
                    (adset: any) =>
                      adset &&
                      (adset.audience_type || adset.name || adset.size || (Array.isArray(adset.extra_audiences) && adset.extra_audiences.length > 0)),
                  ),
              )
              .map(([platformName]) => platformName)
            if (platformsWithAdsetData.length > 0) {
              autoOpenPlatforms[stageName] = platformsWithAdsetData
            }
          }
        }
        // Fallback to previous logic if nothing in sessionStorage
        if (Object.keys(autoOpenPlatforms).length === 0) {
          for (const stage of campaignFormData.channel_mix) {
            const platformsWithAdsets = [
              ...(stage.search_engines || []),
              ...(stage.display_networks || []),
              ...(stage.social_media || []),
              ...(stage.streaming || []),
              ...(stage.ooh || []),
              ...(stage.broadcast || []),
              ...(stage.messaging || []),
              ...(stage.print || []),
              ...(stage.e_commerce || []),
              ...(stage.in_game || []),
              ...(stage.mobile || []),
            ]
              .filter((p) => p && p.ad_sets && Array.isArray(p.ad_sets) && p.ad_sets.length > 0)
              .map((p) => p.platform_name)

            if (platformsWithAdsets.length > 0) {
              autoOpenPlatforms[stage.funnel_stage] = platformsWithAdsets
            }
          }
        }
      } else if (granularity === "channel") {
        // Channel granularity logic remains the same
        const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id

        let channelStateToCheck = {}

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

        if (
          Object.keys(channelStateToCheck).length === 0 &&
          typeof window !== "undefined" &&
          (window as any).channelLevelAudienceState
        ) {
          channelStateToCheck = (window as any).channelLevelAudienceState
        }

        for (const stage of campaignFormData.channel_mix) {
          const stageName = stage.funnel_stage
          const stageChannelData = channelStateToCheck[stageName]

          if (stageChannelData) {
            const platformsWithChannelData = Object.entries(stageChannelData)
              .filter(([platformName, data]: [string, any]) => data && (data.audience_type || data.name || data.size))
              .map(([platformName]) => platformName)

            if (platformsWithChannelData.length > 0) {
              autoOpenPlatforms[stageName] = platformsWithChannelData
            }
          }
        }
      }

      setAutoOpen(autoOpenPlatforms)
    }
  }, [modalOpen, granularity, campaignFormData])

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
      .catch((err) => {})
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
    if (platformName) {
      setIsEditing(true)
    }
  }, [])

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
      <div className="w-full space-y-4 p-4">
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
                  setCollapsed={(collapsed) => handleToggleCollapsed(outlet.outlet)}
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
                setCollapsed={(collapsed) => handleToggleCollapsed(outlet.outlet)}
                granularity={granularity}
                onPlatformStateChange={onPlatformStateChange}
              />
            ))}
      </div>
    </CustomAudienceTypesContext.Provider>
  )
})

export default AdSetFlow