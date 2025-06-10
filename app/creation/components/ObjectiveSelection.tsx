"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
import Switch from "react-switch"
import up from "../../../public/arrow-down.svg"
import down2 from "../../../public/arrow-down-2.svg"
import checkmark from "../../../public/mingcute_check-fill.svg"
import facebook from "../../../public/facebook.svg"
import ig from "../../../public/ig.svg"
import youtube from "../../../public/youtube.svg"
import TheTradeDesk from "../../../public/TheTradeDesk.svg"
import Quantcast from "../../../public/quantcast.svg"
import google from "../../../public/social/google.svg"
import x from "../../../public/x.svg"
import linkedin from "../../../public/linkedin.svg"
import Display from "../../../public/Display.svg"
import yahoo from "../../../public/yahoo.svg"
import bing from "../../../public/bing.svg"
import tictok from "../../../public/tictok.svg"
import Button from "./common/button"
import { useCampaigns } from "../../utils/CampaignsContext"
import { getPlatformIcon } from "../../../components/data"
import axios from "axios"
import { FaSpinner } from "react-icons/fa"

const platformIcons = {
  Facebook: facebook,
  Instagram: ig,
  YouTube: youtube,
  TheTradeDesk: TheTradeDesk,
  Quantcast: Quantcast,
  Google: google,
  "Twitter/X": x,
  LinkedIn: linkedin,
  TikTok: tictok,
  "Display & Video": Display,
  Yahoo: yahoo,
  Bing: bing,
  "Apple Search": google,
  "The Trade Desk": TheTradeDesk,
  QuantCast: Quantcast,
}

const ObjectiveSelection = () => {
  const [openItems, setOpenItems] = useState({ Awareness: true })
  const [statuses, setStatuses] = useState({})
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const savedOptions = localStorage.getItem("selectedOptions")
    return savedOptions ? JSON.parse(savedOptions) : {}
  })
  const [isEditable, setIsEditable] = useState({})
  const [previousSelectedOptions, setPreviousSelectedOptions] = useState({})
  const [selectedNetworks, setSelectedNetworks] = useState({
    Awareness: new Set(),
    Consideration: new Set(),
    Conversion: new Set(),
    Loyalty: new Set(),
  })
  const [validatedPlatforms, setValidatedPlatforms] = useState(() => {
    const savedPlatforms = localStorage.getItem("validatedPlatforms")
    return savedPlatforms
      ? JSON.parse(savedPlatforms, (key, value) => (value.dataType === "Set" ? new Set(value.value) : value))
      : {
          Awareness: new Set(),
          Consideration: new Set(),
          Conversion: new Set(),
          Loyalty: new Set(),
        }
  })
  const [dropdownOpen, setDropdownOpen] = useState("")
  const [showInput, setShowInput] = useState("")
  const [customValue, setCustomValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [buyObjSearch, setBuyObjSearch] = useState("")
  const [buyTypeSearch, setBuyTypeSearch] = useState("")
  const [view, setView] = useState<"channel" | "adset">("channel")

  const { campaignFormData, setCampaignFormData, buyObj, buyType, setBuyObj, setBuyType } = useCampaigns()

  // Track plan ID and seen stages
  const seenStagesRef = useRef(new Set())
  const currentPlanIdRef = useRef(null)

  // Update previousSelectedOptions whenever selectedOptions changes
  useEffect(() => {
    setPreviousSelectedOptions(selectedOptions)
  }, [selectedOptions])

  // Initialize view state and sync with campaign data
  useEffect(() => {
    setView("channel")
    setCampaignFormData((prev) => ({
      ...prev,
      objective_level: "Channel level",
    }))
  }, [setCampaignFormData])

  // Initialize or reset state for new plan and sync selections
  useEffect(() => {
    const currentPlanId = campaignFormData?.planId || "default"
    const storedStatuses = localStorage.getItem("funnelStageStatuses")
    const storedSeenStages = localStorage.getItem("seenFunnelStages")
    const storedOptions = localStorage.getItem("selectedOptions")
    const storedPlatforms = localStorage.getItem("validatedPlatforms")

    // Detect if this is a new plan
    if (currentPlanId !== currentPlanIdRef.current) {
      // Reset localStorage and state for new plan
      localStorage.removeItem("funnelStageStatuses")
      localStorage.removeItem("seenFunnelStages")
      localStorage.removeItem("selectedOptions")
      localStorage.removeItem("validatedPlatforms")
      seenStagesRef.current = new Set()
      setStatuses({})
      setSelectedOptions({})
      setPreviousSelectedOptions({})
      setValidatedPlatforms({
        Awareness: new Set(),
        Consideration: new Set(),
        Conversion: new Set(),
        Loyalty: new Set(),
      })
      setIsEditable({})
      currentPlanIdRef.current = currentPlanId
    } else {
      // Load seen stages and statuses from localStorage for existing plan
      if (storedSeenStages) {
        try {
          seenStagesRef.current = new Set(JSON.parse(storedSeenStages))
        } catch {
          seenStagesRef.current = new Set()
        }
      }
      if (storedStatuses) {
        try {
          setStatuses(JSON.parse(storedStatuses))
        } catch {
          setStatuses({})
        }
      }
      if (storedOptions) {
        try {
          setSelectedOptions(JSON.parse(storedOptions))
          setPreviousSelectedOptions(JSON.parse(storedOptions))
        } catch {
          setSelectedOptions({})
          setPreviousSelectedOptions({})
        }
      }
      if (storedPlatforms) {
        try {
          setValidatedPlatforms(
            JSON.parse(storedPlatforms, (key, value) =>
              value.dataType === "Set" ? new Set(value.data ? [] : value.value) : value,
            ),
          )
        } catch {
          setValidatedPlatforms({
            Awareness: new Set(),
            Consideration: new Set(),
            Conversion: new Set(),
            Loyalty: new Set(),
          })
        }
      }
    }

    // Initialize statuses for new or unseen stages
    if (campaignFormData?.funnel_stages) {
      const initialStatuses = { ...statuses }
      let shouldUpdateStorage = false

      campaignFormData.funnel_stages.forEach((stage) => {
        if (!seenStagesRef.current.has(stage)) {
          seenStagesRef.current.add(stage)
          initialStatuses[stage] = "Not Started"
          shouldUpdateStorage = true
        } else if (!(stage in initialStatuses)) {
          initialStatuses[stage] = "Not Started"
          shouldUpdateStorage = true
        }
        if (campaignFormData.validatedStages?.[stage]) {
          initialStatuses[stage] = "Completed"
        }
      })

      setStatuses(initialStatuses)
      if (shouldUpdateStorage) {
        localStorage.setItem("seenFunnelStages", JSON.stringify(Array.from(seenStagesRef.current)))
      }
    }
  }, [campaignFormData?.planId, campaignFormData?.funnel_stages, campaignFormData?.validatedStages])

  // Sync selectedOptions with campaignFormData on initial load
  useEffect(() => {
    const initialSelectedOptions = { ...selectedOptions }
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    channelMix?.forEach((stage) => {
      const stageName = stage.funnel_stage
      ;[
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "ooh",
        "print",
        "in_game",
        "e_commerce",
        "broadcast",
        "messaging",
        "mobile",
      ].forEach((category) => {
        const platforms = Array.isArray(stage[category]) ? stage[category] : []
        platforms.forEach((platform) => {
          const platformName = platform.platform_name

          // Handle channel level selections
          const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`
          const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`
          if (platform.buy_type && !initialSelectedOptions[buyTypeKey]) {
            initialSelectedOptions[buyTypeKey] = platform.buy_type
          }
          if (platform.objective_type && !initialSelectedOptions[buyObjectiveKey]) {
            initialSelectedOptions[buyObjectiveKey] = platform.objective_type
          }

          // Handle adset level selections
          if (platform.ad_sets && Array.isArray(platform.ad_sets)) {
            platform.ad_sets.forEach((adset, adsetIndex) => {
              const adsetBuyTypeKey = `${stageName}-${category}-${platformName}-adset-${adsetIndex}-buy_type`
              const adsetBuyObjectiveKey = `${stageName}-${category}-${platformName}-adset-${adsetIndex}-objective_type`
              if (adset.buy_type && !initialSelectedOptions[adsetBuyTypeKey]) {
                initialSelectedOptions[adsetBuyTypeKey] = adset.buy_type
              }
              if (adset.objective_type && !initialSelectedOptions[adsetBuyObjectiveKey]) {
                initialSelectedOptions[adsetBuyObjectiveKey] = adset.objective_type
              }
            })
          }
        })
      })
    })
    setSelectedOptions(initialSelectedOptions)
    setPreviousSelectedOptions(initialSelectedOptions)
    localStorage.setItem("selectedOptions", JSON.stringify(initialSelectedOptions))
  }, [campaignFormData?.channel_mix])

  // Sync selectedNetworks with channel_mix
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
      const updatedNetworks = channelMix.reduce(
        (acc, ch) => {
          const platformsWithFormats = [
            ...(ch?.social_media?.map((sm) => sm?.platform_name) || []),
            ...(ch?.display_networks?.map((dn) => dn?.platform_name) || []),
            ...(ch?.search_engines?.map((se) => se?.platform_name) || []),
            ...(ch?.streaming?.map((st) => st?.platform_name) || []),
            ...(ch?.mobile?.map((mb) => mb?.platform_name) || []),
            ...(ch?.messaging?.map((ms) => ms?.platform_name) || []),
            ...(ch?.in_game?.map((ig) => ig?.platform_name) || []),
            ...(ch?.e_commerce?.map((ec) => ec?.platform_name) || []),
            ...(ch?.broadcast?.map((bc) => bc?.platform_name) || []),
            ...(ch?.print?.map((pr) => pr?.platform_name) || []),
            ...(ch?.ooh?.map((oh) => oh?.platform_name) || []),
          ]
          acc[ch.funnel_stage] = new Set(platformsWithFormats)
          return acc
        },
        {
          Awareness: new Set(),
          Consideration: new Set(),
          Conversion: new Set(),
          Loyalty: new Set(),
        },
      )
      setSelectedNetworks(updatedNetworks)
    }
  }, [campaignFormData?.channel_mix])

  // Update statuses so "Not Started" is removed as soon as any option is selected
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      const updatedStatuses = {}
      campaignFormData.funnel_stages.forEach((stageName) => {
        if (campaignFormData.validatedStages?.[stageName] || validatedPlatforms[stageName]?.size > 0) {
          updatedStatuses[stageName] = "Completed"
        } else {
          // Check if any option is selected for this stage
          const hasAnySelection = Object.keys(selectedOptions).some((key) => {
            return key.startsWith(`${stageName}-`) && selectedOptions[key]
          })
          if (hasAnySelection) {
            updatedStatuses[stageName] = ""
          } else {
            updatedStatuses[stageName] = "Not Started"
          }
        }
      })
      setStatuses(updatedStatuses)
      localStorage.setItem("funnelStageStatuses", JSON.stringify(updatedStatuses))
    }
  }, [
    selectedOptions,
    validatedPlatforms,
    campaignFormData?.funnel_stages,
    campaignFormData?.validatedStages,
    isEditable,
  ])

  // Persist selectedOptions to localStorage
  useEffect(() => {
    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions))
  }, [selectedOptions])

  // Persist validatedPlatforms to localStorage
  useEffect(() => {
    const serializedPlatforms = JSON.stringify(validatedPlatforms, (key, value) =>
      value instanceof Set ? { dataType: "Set", value: Array.from(value) } : value,
    )
    localStorage.setItem("validatedPlatforms", serializedPlatforms)
  }, [validatedPlatforms])

  // Force context update after validation
  useEffect(() => {
    if (campaignFormData?.validatedStages) {
      setCampaignFormData((prev) => ({ ...prev }))
    }
  }, [campaignFormData?.validatedStages, setCampaignFormData])

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }))
  }

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => (prev === key ? "" : key))
    setBuyObjSearch("")
    setBuyTypeSearch("")
  }

  const handleToggleChange = (checked: boolean) => {
    const newView = checked ? "adset" : "channel"
    setView(newView)
    setCampaignFormData((prev) => ({
      ...prev,
      objective_level: checked ? "Adset level" : "Channel level",
    }))
  }

  const handleSelectOption = (platformName, option, category, stageName, dropDownName, adsetIndex = null) => {
    const key =
      adsetIndex !== null
        ? `${stageName}-${category}-${platformName}-adset-${adsetIndex}-${dropDownName}`
        : `${stageName}-${category}-${platformName}-${dropDownName}`

    setSelectedOptions((prev) => {
      const newOptions = { ...prev, [key]: option }
      localStorage.setItem("selectedOptions", JSON.stringify(newOptions))
      return newOptions
    })

    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const updatedChannelMix = channelMix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const normalizedCategory = category.toLowerCase().replace(" ", "_")
        const updatedStage = { ...stage }
        updatedStage[normalizedCategory] = (stage[normalizedCategory] || []).map((platform) => {
          if (platform.platform_name === platformName) {
            const updatedPlatform = { ...platform }

            if (adsetIndex !== null) {
              // Handle adset level selection
              if (!updatedPlatform.ad_sets) updatedPlatform.ad_sets = []
              if (updatedPlatform.ad_sets[adsetIndex]) {
                updatedPlatform.ad_sets[adsetIndex] = {
                  ...updatedPlatform.ad_sets[adsetIndex],
                  [dropDownName]: option,
                }
              }
            } else {
              // Handle channel level selection
              updatedPlatform[dropDownName] = option
            }

            return updatedPlatform
          }
          return platform
        })

        // Ensure platform exists in channel_mix
        if (!updatedStage[normalizedCategory].some((p) => p.platform_name === platformName)) {
          const newPlatform = { platform_name: platformName }
          if (adsetIndex !== null) {
            newPlatform["ad_sets"] = []
            newPlatform["ad_sets"][adsetIndex] = { [dropDownName]: option }
          } else {
            newPlatform[dropDownName] = option
          }
          updatedStage[normalizedCategory].push(newPlatform)
        }
        return updatedStage
      }
      return stage
    })

    setCampaignFormData((prev) => ({
      ...prev,
      channel_mix: updatedChannelMix,
    }))
    setDropdownOpen("")
    setOpenItems((prev) => ({ ...prev, [stageName]: true }))
  }

  const handleValidate = (stageName) => {
    if (
      (campaignFormData.validatedStages && campaignFormData.validatedStages[stageName]) ||
      statuses[stageName] === "Completed"
    )
      return

    setStatuses((prev) => ({
      ...prev,
      [stageName]: "Completed",
    }))
    setIsEditable((prev) => ({ ...prev, [stageName]: false }))

    const channelMix = Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix.find((ch) => ch.funnel_stage === stageName)
      : null

    const validatedPlatformsSet = new Set()
    if (channelMix) {
      ;[
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "mobile",
        "messaging",
        "in_game",
        "e_commerce",
        "broadcast",
        "print",
        "ooh",
      ].forEach((category) => {
        const platforms = channelMix[category] || []
        platforms.forEach((platform) => {
          if (view === "channel") {
            if (platform.buy_type && platform.objective_type) {
              validatedPlatformsSet.add(platform.platform_name)
            }
          } else if (view === "adset" && platform.ad_sets) {
            platform.ad_sets.forEach((adset) => {
              if (adset.buy_type && adset.objective_type) {
                validatedPlatformsSet.add(`${platform.platform_name}-${adset.audience_type}`)
              }
            })
          }
        })
      })
    }

    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: validatedPlatformsSet,
    }))

    setCampaignFormData((prev) => {
      const updatedChannelMix = prev.channel_mix.map((stage) => {
        if (stage.funnel_stage === stageName) {
          return {
            ...stage,
            social_media: stage.social_media?.map((p) => ({ ...p, isValidated: true })) || [],
            display_networks: stage.display_networks?.map((p) => ({ ...p, isValidated: true })) || [],
            search_engines: stage.search_engines?.map((p) => ({ ...p, isValidated: true })) || [],
            streaming: stage.streaming?.map((p) => ({ ...p, isValidated: true })) || [],
            mobile: stage.mobile?.map((p) => ({ ...p, isValidated: true })) || [],
            messaging: stage.messaging?.map((p) => ({ ...p, isValidated: true })) || [],
            in_game: stage.in_game?.map((p) => ({ ...p, isValidated: true })) || [],
            e_commerce: stage.e_commerce?.map((p) => ({ ...p, isValidated: true })) || [],
            broadcast: stage.broadcast?.map((p) => ({ ...p, isValidated: true })) || [],
            print: stage.print?.map((p) => ({ ...p, isValidated: true })) || [],
            ooh: stage.ooh?.map((p) => ({ ...p, isValidated: true })) || [],
          }
        }
        return stage
      })
      return {
        ...prev,
        validatedStages: { ...prev.validatedStages, [stageName]: true },
        channel_mix: updatedChannelMix,
      }
    })

    if (navigator.vibrate) navigator.vibrate(300)
  }

  const hasCompletePlatformSelection = (platformName, category, stageName, adsetIndex = null) => {
    if (adsetIndex !== null) {
      const buyTypeKey = `${stageName}-${category}-${platformName}-adset-${adsetIndex}-buy_type`
      const buyObjectiveKey = `${stageName}-${category}-${platformName}-adset-${adsetIndex}-objective_type`
      return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey]
    } else {
      const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`
      const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`
      return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey]
    }
  }

  const hasCompleteSelection = (stageName) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0) return false

    return Array.from(selectedNetworks[stageName]).some((platformName) => {
      const categories = [
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "mobile",
        "messaging",
        "in_game",
        "e_commerce",
        "broadcast",
        "print",
        "ooh",
      ]

      if (view === "channel") {
        return categories.some((category) => hasCompletePlatformSelection(platformName, category, stageName))
      } else {
        // For adset view, check if any adset has complete selection
        const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
        const stageData = channelMix.find((ch) => ch.funnel_stage === stageName)
        if (!stageData) return false

        return categories.some((category) => {
          const platforms = stageData[category] || []
          const platform = platforms.find((p) => p.platform_name === platformName)
          if (!platform || !platform.ad_sets) return false

          return platform.ad_sets.some((_, adsetIndex) =>
            hasCompletePlatformSelection(platformName, category, stageName, adsetIndex),
          )
        })
      }
    })
  }

  const renderCompletedPlatform = (platformName, category, stageName, adsetIndex = null) => {
    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_")
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const stageData = channelMix.find((ch) => ch.funnel_stage === stageName)

    if (!stageData) return null

    const platform = stageData[normalizedCategory]?.find((p) => p.platform_name === platformName)
    if (!platform) return null

    let platformData
    let displayName = platformName

    if (adsetIndex !== null && platform.ad_sets && platform.ad_sets[adsetIndex]) {
      platformData = platform.ad_sets[adsetIndex]
      displayName = `${platformName} (${platformData.audience_type || `Adset ${adsetIndex + 1}`})`
    } else {
      platformData = platform
    }

    const buyTypeKey =
      adsetIndex !== null
        ? `${stageName}-${category}-${platformName}-adset-${adsetIndex}-buy_type`
        : `${stageName}-${category}-${platformName}-buy_type`
    const buyObjectiveKey =
      adsetIndex !== null
        ? `${stageName}-${category}-${platformName}-adset-${adsetIndex}-objective_type`
        : `${stageName}-${category}-${platformName}-objective_type`

    return (
      <div
        key={`${platformName}-${adsetIndex || "channel"}`}
        className="flex flex-col gap-4 min-w-[150px] max-w-[200px]"
      >
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image src={getPlatformIcon(platformName) || "/placeholder.svg"} className="size-4" alt={platformName} />
          <p className="text-sm font-medium text-[#061237] truncate">{displayName}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.buy_type || selectedOptions[buyTypeKey] || "Buy type"}
          </div>
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.objective_type || selectedOptions[buyObjectiveKey] || "Buy objective"}
          </div>
        </div>
      </div>
    )
  }

  const hasValidatedPlatformsForCategory = (category, stageName) => {
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const stageData = channelMix.find((ch) => ch.funnel_stage === stageName)
    return stageData && stageData[category]?.length > 0
  }

  const handleSaveCustomValue = async (field) => {
    if (!customValue.trim()) {
      toast.error("Please enter a value", { id: "custom-value-error" })
      return
    }

    const endpoint = field === "obj" ? "/buy-objectives" : "/buy-types"
    setLoading(true)
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}${endpoint}`,
        { data: { text: customValue } },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        },
      )
      const data = res?.data?.data
      if (field === "obj") {
        setBuyObj((prev) => [...prev, data])
      } else {
        setBuyType((prev) => [...prev, data])
      }
      setCustomValue("")
      setShowInput("")
    } catch (error) {
      console.error("Error saving custom value:", error)
      toast.error("Failed to save custom value")
    } finally {
      setLoading(false)
    }
  }

  const filteredBuyObj = buyObj?.filter((option) => option?.text?.toLowerCase().includes(buyObjSearch.toLowerCase()))
  const filteredBuyType = buyType?.filter((option) => option?.text?.toLowerCase().includes(buyTypeSearch.toLowerCase()))

  const getStageRecap = (stageName) => {
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const stageData = channelMix.find((ch) => ch.funnel_stage === stageName)
    if (!stageData) return "No selections made yet."

    const categories = [
      "social_media",
      "display_networks",
      "search_engines",
      "streaming",
      "mobile",
      "messaging",
      "in_game",
      "e_commerce",
      "broadcast",
      "print",
      "ooh",
    ]

    const recapArr = []
    categories.forEach((category) => {
      const platforms = Array.isArray(stageData[category]) ? stageData[category] : []
      platforms.forEach((platform) => {
        if (view === "channel") {
          const buyType =
            platform.buy_type || selectedOptions[`${stageName}-${category}-${platform.platform_name}-buy_type`]
          const objectiveType =
            platform.objective_type ||
            selectedOptions[`${stageName}-${category}-${platform.platform_name}-objective_type`]
          if (buyType || objectiveType) {
            recapArr.push(
              `<strong>${platform.platform_name}</strong>: <strong>Objective</strong>: ${objectiveType || "No objective"}, <strong>Buy Type</strong>: ${buyType || "No buy type"}`,
            )
          }
        } else if (view === "adset" && platform.ad_sets) {
          platform.ad_sets.forEach((adset, adsetIndex) => {
            const buyType =
              adset.buy_type ||
              selectedOptions[`${stageName}-${category}-${platform.platform_name}-adset-${adsetIndex}-buy_type`]
            const objectiveType =
              adset.objective_type ||
              selectedOptions[`${stageName}-${category}-${platform.platform_name}-adset-${adsetIndex}-objective_type`]
            if (buyType || objectiveType) {
              recapArr.push(
                `<strong>${platform.platform_name} (${adset.audience_type || `Adset ${adsetIndex + 1}`})</strong>: <strong>Objective</strong>: ${objectiveType || "No objective"}, <strong>Buy Type</strong>: ${buyType || "No buy type"}`,
              )
            }
          })
        }
      })
    })
    if (recapArr.length === 0) return "No selections made yet."
    return recapArr.join(" | ")
  }

  const handleEdit = (stageName) => {
    setIsEditable((prev) => ({ ...prev, [stageName]: true }))
    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: new Set(),
    }))
    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: { ...prev.validatedStages, [stageName]: false },
    }))
    setStatuses((prev) => {
      const newStatus = "Not Started"
      const newStatuses = { ...prev, [stageName]: newStatus }
      return newStatuses
    })
  }

  const renderPlatformSelections = (platforms, category, stageName) => {
    return platforms.map((platform) => {
      if (view === "channel") {
        // Channel level rendering
        const platformKey = `${stageName}-${category}-${platform.platform_name}`
        const selectedObj =
          selectedOptions[`${stageName}-${category}-${platform.platform_name}-objective_type`] ||
          platform.objective_type
        const selectedBuy =
          selectedOptions[`${stageName}-${category}-${platform.platform_name}-buy_type`] || platform.buy_type

        return (
          <div key={platformKey} className="flex items-center gap-8">
            <div className="w-[180px]">
              <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit min-w-[150px]">
                {getPlatformIcon(platform.platform_name) ? (
                  <Image
                    src={getPlatformIcon(platform.platform_name) || "/placeholder.svg"}
                    className="size-4"
                    alt={platform.platform_name}
                  />
                ) : null}
                <p className="text-base font-medium text-[#061237] capitalize">{platform.platform_name}</p>
              </div>
            </div>
            {renderDropdowns(platform.platform_name, category, stageName, selectedObj, selectedBuy, platformKey)}
          </div>
        )
      } else {
        // Adset level rendering
        if (!platform.ad_sets || platform.ad_sets.length === 0) return null

        return (
          <div key={`${platform.platform_name}-adsets`} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg w-fit">
              {getPlatformIcon(platform.platform_name) ? (
                <Image
                  src={getPlatformIcon(platform.platform_name) || "/placeholder.svg"}
                  className="size-4"
                  alt={platform.platform_name}
                />
              ) : null}
              <p className="text-base font-semibold text-[#061237] capitalize">{platform.platform_name}</p>
            </div>
            {platform.ad_sets.map((adset, adsetIndex) => {
              const adsetKey = `${stageName}-${category}-${platform.platform_name}-adset-${adsetIndex}`
              const selectedObj =
                selectedOptions[
                  `${stageName}-${category}-${platform.platform_name}-adset-${adsetIndex}-objective_type`
                ] || adset.objective_type
              const selectedBuy =
                selectedOptions[`${stageName}-${category}-${platform.platform_name}-adset-${adsetIndex}-buy_type`] ||
                adset.buy_type

              return (
                <div key={adsetKey} className="flex items-center gap-8 ml-8">
                  <div className="w-[180px]">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shrink-0 w-fit min-w-[150px]">
                      <p className="text-sm font-medium text-[#061237]">
                        {adset.audience_type || `Adset ${adsetIndex + 1}`}
                      </p>
                    </div>
                  </div>
                  {renderDropdowns(
                    platform.platform_name,
                    category,
                    stageName,
                    selectedObj,
                    selectedBuy,
                    adsetKey,
                    adsetIndex,
                  )}
                </div>
              )
            })}
          </div>
        )
      }
    })
  }

  const renderDropdowns = (
    platformName,
    category,
    stageName,
    selectedObj,
    selectedBuy,
    platformKey,
    adsetIndex = null,
  ) => {
    return (
      <>
        <div className="relative min-w-[200px]">
          <div
            className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleDropdown(platformKey + "obj")}
          >
            <p className="text-sm font-medium text-[#061237]">{selectedObj || "Buy Objective"}</p>
            <Image src={down2 || "/placeholder.svg"} alt="dropdown" />
          </div>
          {dropdownOpen === platformKey + "obj" && (
            <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <ul>
                <li className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-[5px] outline-none"
                    placeholder="Search objectives..."
                    value={buyObjSearch}
                    onChange={(e) => setBuyObjSearch(e.target.value)}
                    autoFocus
                  />
                </li>
                {filteredBuyObj?.length === 0 && <li className="px-4 py-2 text-gray-400">No objectives found</li>}
                {filteredBuyObj?.map((option, i) => (
                  <li
                    key={`${platformKey}-objective-${i}`}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      handleSelectOption(platformName, option?.text, category, stageName, "objective_type", adsetIndex)
                      setBuyObjSearch("")
                    }}
                  >
                    {option?.text}
                  </li>
                ))}
                {showInput !== `${platformKey}+custom` ? (
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => setShowInput(`${platformKey}+custom`)}
                  >
                    Add Custom
                  </li>
                ) : (
                  <div className="w-[90%] mx-auto mb-2">
                    <input
                      className="w-full p-2 border rounded-[5px] outline-none"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                    />
                    <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                      <button className="w-full p-[5px] border rounded-[5px]" onClick={() => setShowInput("")}>
                        Cancel
                      </button>
                      <button
                        className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                        onClick={() => handleSaveCustomValue("obj")}
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
        <div className="relative min-w-[150px]">
          <div
            className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
            onClick={() => toggleDropdown(platformKey)}
          >
            <p className="text-sm font-medium text-[#061237]">{selectedBuy || "Buy Type"}</p>
            <Image src={down2 || "/placeholder.svg"} alt="dropdown" />
          </div>
          {dropdownOpen === platformKey && (
            <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <ul>
                <li className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-[5px] outline-none"
                    placeholder="Search types..."
                    value={buyTypeSearch}
                    onChange={(e) => setBuyTypeSearch(e.target.value)}
                    autoFocus
                  />
                </li>
                {filteredBuyType?.length === 0 && <li className="px-4 py-2 text-gray-400">No types found</li>}
                {filteredBuyType?.map((option, i) => (
                  <li
                    key={`${platformKey}-type-${i}`}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      handleSelectOption(platformName, option?.text, category, stageName, "buy_type", adsetIndex)
                      setBuyTypeSearch("")
                    }}
                  >
                    {option?.text}
                  </li>
                ))}
                {showInput !== `${platformKey}+custom+buy` ? (
                  <li
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => setShowInput(`${platformKey}+custom+buy`)}
                  >
                    Add Custom
                  </li>
                ) : (
                  <div className="w-[90%] mx-auto mb-2">
                    <input
                      className="w-full p-2 border rounded-[5px] outline-none"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                    />
                    <div className="flex gap-[10px] w-full justify-between items-center my-[5px]">
                      <button className="w-full p-[5px] border rounded-[5px]" onClick={() => setShowInput("")}>
                        Cancel
                      </button>
                      <button
                        className="w-full p-[5px] bg-blue-500 text-white rounded-[5px] flex justify-center items-center"
                        onClick={() => handleSaveCustomValue("buy")}
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
      </>
    )
  }

  // Helper: For adset view after validation, only show categories with at least one platform with adsets
  const hasAnyAdsetInCategory = (category, stageName) => {
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const stageData = channelMix.find((ch) => ch.funnel_stage === stageName)
    if (!stageData) return false
    const platforms = Array.isArray(stageData[category]) ? stageData[category] : []
    return platforms.some((platform) => Array.isArray(platform.ad_sets) && platform.ad_sets.length > 0)
  }

  // Helper: For adset view after validation, only show platforms with adsets
  const getPlatformsWithAdsets = (platforms) => {
    return platforms.filter((platform) => Array.isArray(platform.ad_sets) && platform.ad_sets.length > 0)
  }

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
      {/* Granularity Toggle */}
      <div className="flex justify-center gap-3 w-full">
        <p className="font-medium">Channel Granularity</p>
        <Switch
          checked={view === "adset"}
          onChange={handleToggleChange}
          onColor="#5cd08b"
          offColor="#3175FF"
          handleDiameter={18}
          uncheckedIcon={false}
          checkedIcon={false}
          height={24}
          width={48}
          borderRadius={24}
          activeBoxShadow="0 0 2px 3px rgba(37, 99, 235, 0.2)"
          className="react-switch"
        />
        <p className="font-medium">Ad Set Granularity</p>
      </div>

      {campaignFormData?.funnel_stages?.map((stageName) => {
        const stage = campaignFormData?.custom_funnels?.find((s) => s?.name === stageName)
        if (!stage) return null
        return (
          <div key={stageName} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 max-w-[950px] h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
              rounded-t-[10px] ${openItems[stage.name] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-4">
                {stage.icon && (
                  <Image src={stage.icon || "/placeholder.svg"} className="size-5" alt={`${stage.name} icon`} />
                )}
                <p className="font-semibold text-[#061237] whitespace-nowrap">{stage.name}</p>
              </div>
              <div id={`status-${stageName}`} className="flex items-center gap-2">
                {statuses[stageName] === "Completed" ? (
                  <>
                    <Image
                      className="w-5 h-5 rounded-full p-1 bg-green-500"
                      src={checkmark || "/placeholder.svg"}
                      alt="Completed"
                    />
                    <p className="text-green-500 font-semibold text-base">Completed</p>
                  </>
                ) : statuses[stageName] === "Not Started" ? (
                  <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">Not Started</p>
                ) : null}
              </div>
              <div>
                {openItems[stage.name] ? (
                  <Image src={up || "/placeholder.svg"} alt="collapse" />
                ) : (
                  <Image src={down2 || "/placeholder.svg"} alt="expand" />
                )}
              </div>
            </div>
            {!openItems[stage.name] && (
              <div
                className="w-full px-6 py-2 bg-[#F5F7FA] border-x border-b border-[rgba(0,0,0,0.07)] text-sm text-[#061237] rounded-b-none rounded-t-none"
                dangerouslySetInnerHTML={{
                  __html: `<span class="font-semibold">Recap: </span>${getStageRecap(stageName)}`,
                }}
              />
            )}
            {openItems[stage.name] && (
              <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
                {isEditable[stageName] !== true && statuses[stageName] === "Completed" ? (
                  <div className="flex flex-col w-full gap-12">
                    {[
                      "social_media",
                      "display_networks",
                      "search_engines",
                      "streaming",
                      "mobile",
                      "messaging",
                      "in_game",
                      "e_commerce",
                      "broadcast",
                      "print",
                      "ooh",
                    ]
                      // Only show categories with at least one platform with adsets in adset view after validation
                      .filter((category) => {
                        if (view === "adset") {
                          return hasAnyAdsetInCategory(category, stage.name)
                        }
                        return hasValidatedPlatformsForCategory(category, stage.name)
                      })
                      .map((category) => (
                        <div key={category} className="w-full">
                          <h3 className="text-xl font-semibold text-[#061237] mb-6 capitalize">
                            {category?.replace("_", " ")}
                          </h3>
                          <div className="flex flex-wrap gap-8">
                            {Array.from(selectedNetworks[stage.name] || []).map((platform) => {
                              if (view === "channel") {
                                return renderCompletedPlatform(platform, category, stage.name)
                              } else {
                                // For adset view, render each adset only for platforms with adsets
                                const channelMix = Array.isArray(campaignFormData?.channel_mix)
                                  ? campaignFormData.channel_mix
                                  : []
                                const stageData = channelMix.find((ch) => ch.funnel_stage === stage.name)
                                const normalizedCategory = category.toLowerCase().replaceAll(" ", "_")
                                const platformData = stageData?.[normalizedCategory]?.find(
                                  (p) => p.platform_name === platform,
                                )

                                if (!platformData?.ad_sets || platformData.ad_sets.length === 0) return null

                                return platformData.ad_sets.map((_, adsetIndex) =>
                                  renderCompletedPlatform(platform, category, stage.name, adsetIndex),
                                )
                              }
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  [
                    "social_media",
                    "display_networks",
                    "search_engines",
                    "streaming",
                    "mobile",
                    "messaging",
                    "in_game",
                    "e_commerce",
                    "broadcast",
                    "print",
                    "ooh",
                  ].map((category) => {
                    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_")
                    const platforms = Array.isArray(campaignFormData?.channel_mix)
                      ? campaignFormData.channel_mix.find((ch) => ch.funnel_stage === stageName)?.[
                          normalizedCategory
                        ] || []
                      : []

                    // Filter platforms based on view
                    const filteredPlatforms =
                      view === "adset"
                        ? platforms.filter((platform) => platform.ad_sets && platform.ad_sets.length > 0)
                        : platforms

                    if (filteredPlatforms.length === 0) return null

                    return (
                      <div key={category} className="w-full md:flex flex-col items-start gap-6 md:w-4/5">
                        <h3 className="text-xl font-semibold text-[#061237] capitalize">
                          {category?.replace("_", " ")}
                        </h3>
                        <div className="flex flex-col gap-8">
                          {renderPlatformSelections(filteredPlatforms, category, stageName)}
                        </div>
                      </div>
                    )
                  })
                )}
                {statuses[stageName] !== "Completed" && (
                  <div className="flex justify-end mt-6 w-full">
                    <Button
                      text="Validate"
                      variant="primary"
                      onClick={() => handleValidate(stageName)}
                      disabled={!hasCompleteSelection(stageName)}
                    />
                  </div>
                )}
                {statuses[stageName] === "Completed" && (
                  <div className="flex justify-end mt-2 w-full">
                    <Button
                      text="Edit"
                      variant="primary"
                      className="bg-blue-500"
                      onClick={() => handleEdit(stageName)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ObjectiveSelection
