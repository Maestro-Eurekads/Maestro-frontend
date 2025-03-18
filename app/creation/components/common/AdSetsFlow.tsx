"use client"

import type React from "react"

import Image, { type StaticImageData } from "next/image"
import { FaAngleRight } from "react-icons/fa"
import { MdDelete, MdAdd } from "react-icons/md"
import { useState, useCallback, memo, useMemo, useEffect, useRef } from "react"

// Import platform icons

import facebook from "../../../../public/facebook.svg";
import ig from "../../../../public/ig.svg";
import youtube from "../../../../public/youtube.svg";
import TheTradeDesk from "../../../../public/TheTradeDesk.svg";
import Quantcast from "../../../../public/quantcast.svg";
import speaker from "../../../../public/mdi_megaphone.svg";
import google from "../../../../public/social/google.svg";
import x from "../../../../public/x.svg";
import linkedin from "../../../../public/linkedin.svg";
import Display from "../../../../public/Display.svg";
import yahoo from "../../../../public/yahoo.svg";
import bing from "../../../../public/bing.svg";
import tictok from "../../../../public/tictok.svg";
import { useEditing } from "../../../utils/EditingContext"
import { useCampaigns } from "../../../utils/CampaignsContext"

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
}

// Add these new types at the top of the file, after the existing interfaces

interface AdSetData {
  id?: number
  name: string
  audience_type: string
  size?: string
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

const getPlatformIcon = (platformName: string): StaticImageData | null => {
  return platformIcons[platformName] || null
}

/**
 * Finds a platform in the campaign data
 * @param campaignData - The campaign data containing funnel stages
 * @param stageName - The funnel stage name (e.g., "Awareness", "Consideration")
 * @param platformName - The platform name (e.g., "Google", "Instagram")
 * @returns The platform object and its channel type, or null if not found
 */
const findPlatform = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
): { platform: Platform; channelType: string } | null => {
  // Find the stage
  const stage = campaignData.find((stage) => stage.funnel_stage === stageName)
  if (!stage) return null

  // Check each channel type to find the platform
  const channelTypes = ["search_engines", "display_networks", "social_media"] as const

  for (const channelType of channelTypes) {
    const platform = stage[channelType].find((p) => p.platform_name === platformName)
    if (platform) {
      return { platform, channelType }
    }
  }

  return null
}

/**
 * Updates an ad set in the campaign data
 * @param campaignData - The campaign data containing funnel stages
 * @param stageName - The funnel stage name (e.g., "Awareness", "Consideration")
 * @param platformName - The platform name (e.g., "Google", "Instagram")
 * @param adSetIndex - The index of the ad set to update
 * @param adSetData - The new ad set data
 * @returns The updated campaign data
 */
const updateAdSet = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
  adSetIndex: number,
  adSetData: AdSetData,
): FunnelStage[] => {
  // Create a deep copy of the campaign data to avoid mutating the original
  const updatedCampaignData = JSON.parse(JSON.stringify(campaignData))

  // Find the stage
  const stageIndex = updatedCampaignData.findIndex((stage: FunnelStage) => stage.funnel_stage === stageName)

  if (stageIndex === -1) {
    console.error(`Stage "${stageName}" not found`)
    return campaignData
  }

  const stage = updatedCampaignData[stageIndex]

  // Check each channel type to find the platform
  const channelTypes = ["search_engines", "display_networks", "social_media"] as const
  let platformFound = false

  for (const channelType of channelTypes) {
    const platformIndex = stage[channelType].findIndex((platform: Platform) => platform.platform_name === platformName)

    if (platformIndex !== -1) {
      // Platform found in this channel
      const platform = stage[channelType][platformIndex]

      // Initialize ad_sets array if it doesn't exist
      if (!platform.ad_sets) {
        platform.ad_sets = []
      }

      // Update existing ad set or add a new one
      if (adSetIndex < platform.ad_sets.length) {
        // Update existing ad set
        platform.ad_sets[adSetIndex] = {
          ...platform.ad_sets[adSetIndex],
          ...adSetData,
        }
      } else if (adSetIndex === platform.ad_sets.length) {
        // Add new ad set
        platform.ad_sets.push({
          id: Date.now(), // Generate a temporary ID
          ...adSetData,
        })
      } else {
        console.error(`Ad set index ${adSetIndex} is out of bounds`)
        return campaignData
      }

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

/**
 * Updates multiple ad sets in the campaign data
 * @param campaignData - The campaign data containing funnel stages
 * @param stageName - The funnel stage name (e.g., "Awareness", "Consideration")
 * @param platformName - The platform name (e.g., "Google", "Instagram")
 * @param adSets - Array of ad set data to update or add
 * @returns The updated campaign data
 */
const updateMultipleAdSets = (
  campaignData: FunnelStage[],
  stageName: string,
  platformName: string,
  adSets: AdSetData[],
): FunnelStage[] => {
  // Create a deep copy of the campaign data to avoid mutating the original
  const updatedCampaignData = JSON.parse(JSON.stringify(campaignData))

  // Find the stage
  const stageIndex = updatedCampaignData.findIndex((stage: FunnelStage) => stage.funnel_stage === stageName)

  if (stageIndex === -1) {
    console.error(`Stage "${stageName}" not found`)
    return campaignData
  }

  const stage = updatedCampaignData[stageIndex]

  // Check each channel type to find the platform
  const channelTypes = ["search_engines", "display_networks", "social_media"] as const
  let platformFound = false

  for (const channelType of channelTypes) {
    const platformIndex = stage[channelType].findIndex((platform: Platform) => platform.platform_name === platformName)

    if (platformIndex !== -1) {
      // Platform found in this channel
      const platform = stage[channelType][platformIndex]

      // Replace the entire ad_sets array
      platform.ad_sets = adSets.map((adSet) => ({
        id: adSet.id || Date.now(),
        ...adSet,
      }))

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

// Update the AdSet component to include the update functionality
const AdSet = memo(function AdSet({
  adset,
  index,
  isEditing,
  onDelete,
  onUpdate,
  audienceType,
  adSetName,
  adSetSize,
}: {
  adset: AdSetType
  index: number
  isEditing: boolean
  onDelete: (id: number) => void
  onUpdate: (id: number, data: Partial<AdSetData>) => void
  audienceType?: string
  adSetName?: string
  adSetSize?: string
}) {
  const [audience, setAudience] = useState<string>(audienceType || "")
  const [name, setName] = useState<string>(adSetName || "")
  const [size, setSize] = useState<string>(adSetSize || "")

  // Update local state when props change
  useEffect(() => {
    if (audienceType !== undefined) setAudience(audienceType)
    if (adSetName !== undefined) setName(adSetName)
    if (adSetSize !== undefined) setSize(adSetSize)
  }, [audienceType, adSetName, adSetSize])

  const positionClass = index === 0 ? "top-1/2 -translate-y-1/2" : index === 1 ? "top-0" : "bottom-0"

  const lineClass =
    index === 0
      ? "hidden"
      : index === 1
        ? "top-1/2 rounded-tl-[10px] border-t-2"
        : "bottom-1/2 rounded-bl-[10px] border-b-2"

  // Handle audience selection from the dropdown
  const handleAudienceSelect = useCallback(
    (selectedAudience: string) => {
      setAudience(selectedAudience)
      onUpdate(adset.id, { audience_type: selectedAudience })
    },
    [adset.id, onUpdate],
  )

  // Handle name change
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value
      setName(newName)
      onUpdate(adset.id, { name: newName })
    },
    [adset.id, onUpdate],
  )

  // Handle size change
  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSize = e.target.value
      setSize(newSize)
      onUpdate(adset.id, { size: newSize })
    },
    [adset.id, onUpdate],
  )

  return (
    <div className={`absolute ${positionClass}`}>
      <span className={`border-l-2 border-[#0000001A] h-[70px] w-8 absolute -left-4 ${lineClass}`}></span>
      <div className="flex gap-2 items-center w-full px-4">
        <div className="relative">
          <p className="relative z-[999] text-[#3175FF] text-sm whitespace-nowrap font-bold flex gap-4 items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
            {`Ad set n°${adset.addsetNumber}`}
          </p>
          <hr className="border border-[#0000001A] w-[50px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
        </div>

        <AudienceDropdownWithCallback onSelect={handleAudienceSelect} initialValue={audience} />

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
          value={size}
          onChange={handleSizeChange}
          disabled={!isEditing}
          className={`text-black text-sm font-semibold flex gap-4 items-center border border-[#D0D5DD] py-4 px-2 rounded-[10px] h-[52px] w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !isEditing ? "cursor-not-allowed" : ""
          }`}
        />
        <button
          disabled={!isEditing}
          onClick={() => onDelete(adset.id)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 bg-[#FF5955] text-white text-sm font-bold ${
            !isEditing ? "cursor-not-allowed" : ""
          }`}
        >
          <MdDelete /> <span>Delete</span>
        </button>
      </div>
    </div>
  )
})

// Create a new AudienceDropdown component that accepts a callback
const AudienceDropdownWithCallback = memo(function AudienceDropdownWithCallback({
  onSelect,
  initialValue,
}: {
  onSelect: (option: string) => void
  initialValue?: string
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string>(initialValue || "")

  // Update selected when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setSelected(initialValue)
    }
  }, [initialValue])

  const options = useMemo(
    () => ["Lookalike audience", "Retargeting audience", "Broad audience", "Behavioral audience"],
    [],
  )

  const handleSelect = useCallback(
    (option: string) => {
      setSelected(option)
      setOpen(false)
      onSelect(option)
    },
    [onSelect],
  )

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return (
    <div className="relative border-2 border-[#0000001A] rounded-[10px] z-50">
      <button
        onClick={toggleOpen}
        className="relative z-30 w-[172px] bg-white text-left border border-[#0000001A] rounded-lg text-[#656565] text-sm flex items-center justify-between py-4 px-4"
      >
        <span className="truncate">{selected || "Your audience type"}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute mt-1 left-0 top-full z-[999] w-full bg-white border-2 border-[#0000001A] rounded-lg shadow-lg overflow-hidden">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className="p-4 cursor-pointer text-[#656565] text-sm text-center whitespace-nowrap hover:bg-gray-100"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})

const NonFacebookOutlet = memo(function NonFacebookOutlet({
  outlet,
  setSelected,
}: {
  outlet: OutletType
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const handleSelect = useCallback(() => {
    setSelected((prev) => [...prev, outlet.outlet])
  }, [outlet.outlet, setSelected])

  return (
    <div className="flex items-center gap-4">
      <div className="relative border border-[#0000001A] rounded-[10px]" onClick={handleSelect}>
        <button className="relative w-[150px] z-20 flex gap-4 justify-between items-center bg-[#F9FAFB] border border-[#0000001A] py-4 px-2 rounded-[10px]">
          <Image src={outlet.icon || "/placeholder.svg"} alt={outlet.outlet} className="w-[22px] h-[22px]" />
          <span className="text-[#061237] font-medium whitespace-nowrap">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
      </div>
    </div>
  )
})

// Update the AdsetSettings component to use the new update functionality
const AdsetSettings = memo(function AdsetSettings({
  outlet,
  stageName,
}: {
  outlet: OutletType
  stageName: string
}) {
  const { isEditing } = useEditing()
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [adsets, setAdSets] = useState<AdSetType[]>([])
  const [adSetDataMap, setAdSetDataMap] = useState<Record<number, AdSetData>>({})
  const initialized = useRef(false)

  // Load existing ad sets from campaignFormData when platform is selected
  useEffect(() => {
    if (!campaignFormData?.channel_mix || !selectedPlatforms.includes(outlet.outlet)) return

    // Only initialize once when the platform is selected
    if (initialized.current) return
    initialized.current = true

    const result = findPlatform(campaignFormData.channel_mix, stageName, outlet.outlet)
    if (!result) return

    const { platform } = result

    if (platform.ad_sets && platform.ad_sets.length > 0) {
      // Create local adsets from the platform's ad_sets
      const newAdSets = platform.ad_sets.map((adSet, index) => ({
        id: adSet.id || Date.now() + index,
        addsetNumber: index + 1,
      }))

      // Create adSetDataMap from the platform's ad_sets
      const newAdSetDataMap: Record<number, AdSetData> = {}
      platform.ad_sets.forEach((adSet, index) => {
        const id = newAdSets[index].id
        newAdSetDataMap[id] = {
          name: adSet.name || "",
          audience_type: adSet.audience_type || "",
          size: adSet.size || "",
        }
      })

      setAdSets(newAdSets)
      setAdSetDataMap(newAdSetDataMap)
    } else {
      // Initialize with one empty ad set if none exist
      const newAdSetId = Date.now()
      setAdSets([
        {
          id: newAdSetId,
          addsetNumber: 1,
        },
      ])
      setAdSetDataMap({
        [newAdSetId]: {
          name: "",
          audience_type: "",
          size: "",
        },
      })
    }
  }, [campaignFormData, stageName, outlet.outlet, selectedPlatforms])

  const adsetAmount = adsets.length

  const addNewAddset = useCallback(() => {
    const newAdSetId = Date.now()
    setAdSets((prev) => [
      ...prev,
      {
        id: newAdSetId,
        addsetNumber: prev.length + 1,
      },
    ])

    // Initialize the new ad set data
    setAdSetDataMap((prev) => ({
      ...prev,
      [newAdSetId]: {
        name: "",
        audience_type: "",
        size: "",
      },
    }))
  }, [])

  const deleteAdSet = useCallback((id: number) => {
    setAdSets((prev) => prev.filter((adset) => adset.id !== id))

    // Remove the ad set data
    setAdSetDataMap((prev) => {
      const newMap = { ...prev }
      delete newMap[id]
      return newMap
    })
  }, [])

  // Function to update ad set data locally
  const updateAdSetData = useCallback((id: number, data: Partial<AdSetData>) => {
    setAdSetDataMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...data,
      },
    }))
  }, [])

  // Function to save changes to the campaign data
  const saveChangesToCampaign = useCallback(() => {
    if (!campaignFormData?.channel_mix) return

    // Convert the local ad set data to the format expected by the API
    const adSetsToSave = adsets
      .map((adset) => {
        const data = adSetDataMap[adset.id] || { name: "", audience_type: "" }
        return {
          id: adset.id,
          name: data.name,
          audience_type: data.audience_type,
          size: data.size,
        }
      })
      .filter((data) => data.name || data.audience_type) // Filter out empty ad sets

    if (adSetsToSave.length === 0) return

    // Update the campaign data using the updateMultipleAdSets function
    const updatedChannelMix = updateMultipleAdSets(campaignFormData.channel_mix, stageName, outlet.outlet, adSetsToSave)

    // Update the campaign form data
    setCampaignFormData((prevData) => ({
      ...prevData,
      channel_mix: updatedChannelMix,
    }))
  }, [adsets, adSetDataMap, campaignFormData, stageName, outlet.outlet, setCampaignFormData])

  // Save changes when editing mode is turned off
  useEffect(() => {
    if (!isEditing && selectedPlatforms.includes(outlet.outlet)) {
      saveChangesToCampaign()
    }
  }, [isEditing, selectedPlatforms, outlet.outlet, saveChangesToCampaign])

  const buttonPositionClass = adsetAmount === 1 ? "top-0" : adsetAmount === 2 ? "bottom-0" : "hidden"

  const linePositionClass =
    adsetAmount === 1
      ? "top-1/2 rounded-tl-[10px] border-t-2"
      : adsetAmount === 2
        ? "bottom-1/2 rounded-bl-[10px] border-b-2"
        : ""

  const handleSelectOutlet = useCallback(() => {
    setSelectedPlatforms((prev) => [...prev, outlet.outlet])
  }, [outlet.outlet, setSelectedPlatforms])

  if (!selectedPlatforms.includes(outlet.outlet)) {
    return <NonFacebookOutlet outlet={outlet} setSelected={setSelectedPlatforms} />
  }

  return (
    <div className="flex items-center gap-8 w-full max-w-[1024px]">
      <div className="relative">
        <button className="relative w-[150px] z-20 flex gap-4 justify-between cursor-pointer items-center bg-[#F9FAFB] border border-[#0000001A] border-solid py-4 px-4 rounded-[10px]">
          <Image src={outlet.icon || "/placeholder.svg"} alt={outlet.outlet} className="w-[22px] h-[22px]" />
          <span className="text-[#061237] font-medium">{outlet.outlet}</span>
          <FaAngleRight />
        </button>
        <hr className="border border-[#0000001A] w-[100px] absolute bottom-1/2 translate-y-1/2 -right-0 translate-x-3/4" />
      </div>
      <div className="relative w-full min-h-[194px]">
        <div className={`absolute ${buttonPositionClass}`}>
          <span className={`border-l-2 border-[#0000001A] h-[78px] w-8 absolute -left-4 ${linePositionClass}`}></span>
          <button
            onClick={addNewAddset}
            className="flex gap-2 items-center text-white bg-[#3175FF] px-4 py-2 rounded-full text-sm font-bold z-20 relative"
          >
            <MdAdd />
            <span>New add set</span>
          </button>
        </div>
        {adsets.map((adset, index) => {
          const adSetData = adSetDataMap[adset.id] || { name: "", audience_type: "", size: "" }
          return (
            <AdSet
              key={adset.id}
              adset={adset}
              index={index}
              isEditing={isEditing}
              onDelete={deleteAdSet}
              onUpdate={updateAdSetData}
              audienceType={adSetData.audience_type}
              adSetName={adSetData.name}
              adSetSize={adSetData.size}
            />
          )
        })}
      </div>
    </div>
  )
})

// Update the AdSetFlow component to include the campaign data update functionality
const AdSetFlow = memo(function AdSetFlow({ stageName }: AdSetFlowProps) {
  const { isEditing, setIsEditing } = useEditing()
  const { campaignFormData } = useCampaigns()
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({})

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {}
    const channelMix = campaignFormData?.channel_mix || []

    channelMix.forEach((stage: any) => {
      const { funnel_stage, search_engines, display_networks, social_media } = stage

      if (!platformsByStage[funnel_stage]) {
        platformsByStage[funnel_stage] = []
      }

      // Process search engines
      if (Array.isArray(search_engines)) {
        search_engines.forEach((platform: any) => {
          const icon = getPlatformIcon(platform?.platform_name)
          if (icon) {
            platformsByStage[funnel_stage].push({
              id: Math.floor(Math.random() * 1000000),
              outlet: platform.platform_name,
              icon,
            })
          }
        })
      }

      // Process display networks
      if (Array.isArray(display_networks)) {
        display_networks.forEach((platform: any) => {
          const icon = getPlatformIcon(platform?.platform_name)
          if (icon) {
            platformsByStage[funnel_stage].push({
              id: Math.floor(Math.random() * 1000000),
              outlet: platform.platform_name,
              icon,
            })
          }
        })
      }

      // Process social media
      if (Array.isArray(social_media)) {
        social_media.forEach((platform: any) => {
          const icon = getPlatformIcon(platform?.platform_name)
          if (icon) {
            platformsByStage[funnel_stage].push({
              id: Math.floor(Math.random() * 1000000),
              outlet: platform.platform_name,
              icon,
            })
          }
        })
      }
    })

    return platformsByStage
  }, [campaignFormData])

  useEffect(() => {
    if (campaignFormData) {
      const data = getPlatformsFromStage()
      setPlatforms(data)
    }
  }, [campaignFormData, getPlatformsFromStage])

  const handleValidate = useCallback(() => {
    setIsEditing(false)
    // Don't update state here, let the useEffect in AdsetSettings handle it
  }, [setIsEditing])

  return (
    <div className="w-full space-y-4 p-4">
      {platforms[stageName]?.map((outlet) => (
        <AdsetSettings key={outlet.id} outlet={outlet} stageName={stageName} />
      ))}
      {isEditing && (
        <div className="flex justify-end gap-2 w-full">
          <button
            onClick={handleValidate}
            className="bg-[#3175FF] w-[142px] h-[52px] text-white px-6 py-3 rounded-md text-sm font-bold"
          >
            <span>Validate</span>
          </button>
        </div>
      )}
    </div>
  )
})
export default AdSetFlow

