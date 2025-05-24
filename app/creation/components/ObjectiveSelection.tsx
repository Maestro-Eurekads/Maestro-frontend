"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import toast from "react-hot-toast"
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
import { funnelStages, getPlatformIcon } from "../../../components/data"
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
  const [dropdownOpen, setDropdownOpen] = useState({})
  const [showInput, setShowInput] = useState("")
  const [customValue, setCustomValue] = useState("")
  const [loading, setLoading] = useState(false)

  // New: Search states for buy objectives and buy types
  const [buyObjSearch, setBuyObjSearch] = useState("")
  const [buyTypeSearch, setBuyTypeSearch] = useState("")

  const { campaignFormData, setCampaignFormData, buyObj, buyType, setBuyObj, setBuyType } = useCampaigns()

  // --- Track if this is the first time the user is seeing the current funnel_stages set ---
  // We'll use a ref to persist the "seen" set of funnel_stages across reloads
  const seenStagesRef = useRef(new Set())

  // On mount, load seen stages from localStorage
  useEffect(() => {
    const seen = localStorage.getItem("seenFunnelStages")
    if (seen) {
      try {
        seenStagesRef.current = new Set(JSON.parse(seen))
      } catch {
        seenStagesRef.current = new Set()
      }
    }
  }, [])

  // Whenever funnel_stages changes, add them to the seen set and persist
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      let changed = false
      campaignFormData.funnel_stages.forEach((stage) => {
        if (!seenStagesRef.current.has(stage)) {
          seenStagesRef.current.add(stage)
          changed = true
        }
      })
      if (changed) {
        localStorage.setItem("seenFunnelStages", JSON.stringify(Array.from(seenStagesRef.current)))
      }
    }
  }, [campaignFormData?.funnel_stages])

  // Initialize statuses and sync selectedNetworks
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      // Only clear statuses if this is the first time seeing these stages
      // Otherwise, keep previous statuses (from localStorage or validatedStages)
      let initialStatuses = {}
      let shouldInit = false

      // Try to load from localStorage first
      const storedStatuses = localStorage.getItem("funnelStageStatuses")
      if (storedStatuses) {
        try {
          initialStatuses = JSON.parse(storedStatuses)
        } catch {
          initialStatuses = {}
        }
      }

      // If a stage is not in localStorage, set to Not Started
      campaignFormData.funnel_stages.forEach((stage) => {
        if (!(stage in initialStatuses)) {
          initialStatuses[stage] = "Not Started"
          shouldInit = true
        }
      })

      // If a stage is in validatedStages, always set to Completed
      if (campaignFormData.validatedStages) {
        Object.entries(campaignFormData.validatedStages).forEach(([stage, completed]) => {
          if (completed) {
            initialStatuses[stage] = "Completed"
          }
        })
      }

      setStatuses(initialStatuses)
      if (shouldInit) {
        localStorage.setItem("funnelStageStatuses", JSON.stringify(initialStatuses))
      }

      // Sync selectedNetworks with channel_mix
      const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
      const updatedNetworks = channelMix.reduce((acc, ch) => {
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
      }, {})
      setSelectedNetworks((prev) => ({ ...prev, ...updatedNetworks }))
    }
  }, [campaignFormData?.funnel_stages, campaignFormData?.channel_mix, campaignFormData?.validatedStages])

  // Update statuses based on selectedOptions and validatedPlatforms
  useEffect(() => {
    if (campaignFormData?.funnel_stages) {
      // Always prefer "Completed" if validatedStages or validatedPlatforms has it
      const updatedStatuses = { ...statuses }
      campaignFormData.funnel_stages.forEach((stageName) => {
        // If validatedStages or validatedPlatforms has this stage, always "Completed"
        const isValidated =
          (campaignFormData.validatedStages && campaignFormData.validatedStages[stageName]) ||
          (validatedPlatforms[stageName] && validatedPlatforms[stageName].size > 0)
        const hasSelected = hasCompleteSelection(stageName)

        if (isValidated) {
          updatedStatuses[stageName] = "Completed"
        } else if (hasSelected) {
          updatedStatuses[stageName] = "In Progress"
        } else {
          updatedStatuses[stageName] = "Not Started"
        }
      })
      setStatuses(updatedStatuses)
      localStorage.setItem("funnelStageStatuses", JSON.stringify(updatedStatuses))
    }
    // eslint-disable-next-line
  }, [selectedOptions, validatedPlatforms, campaignFormData?.funnel_stages, campaignFormData?.validatedStages])

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

  // Sync selectedOptions with campaignFormData only on initial load if not already set
  useEffect(() => {
    const initialSelectedOptions = {}
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
            const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`
            const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`
            if (platform.buy_type && !selectedOptions[buyTypeKey]) {
              initialSelectedOptions[buyTypeKey] = platform.buy_type
            }
            if (platform.objective_type && !selectedOptions[buyObjectiveKey]) {
              initialSelectedOptions[buyObjectiveKey] = platform.objective_type
            }
          })
        })
    })
    setSelectedOptions((prev) => ({ ...prev, ...initialSelectedOptions }))
    // eslint-disable-next-line
  }, [campaignFormData?.channel_mix])

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }))
  }

  const toggleDropdown = (key) => {
    setDropdownOpen((prev) => (prev === key ? "" : key))
    // Reset search fields when opening a dropdown
    setBuyObjSearch("")
    setBuyTypeSearch("")
  }

  const handleSelectOption = (platformName, option, category, stageName, dropDownName) => {
    const key = `${stageName}-${category}-${platformName}-${dropDownName}`
    setSelectedOptions((prev) => ({ ...prev, [key]: option }))

    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const updatedChannelMix = channelMix.map((stage) => {
      if (stage.funnel_stage === stageName) {
        const updatedStage = { ...stage }
        const normalizedCategory = category.toLowerCase().replace(" ", "_")
        updatedStage[normalizedCategory] = (stage[normalizedCategory] || []).map((platform) => {
          if (platform.platform_name === platformName) {
            return { ...platform, [dropDownName]: option }
          }
          return platform
        })
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
    // Prevent duplicate validation
    if (statuses[stageName] === "Completed") return

    setStatuses((prev) => {
      const newStatuses = { ...prev, [stageName]: "Completed" }
      localStorage.setItem("funnelStageStatuses", JSON.stringify(newStatuses))
      return newStatuses
    })
    setIsEditable((prev) => ({ ...prev, [stageName]: true }))

    // Get all platforms from channel_mix for this stage
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
          validatedPlatformsSet.add(platform.platform_name)
        })
      })
    }

    setValidatedPlatforms((prev) => ({
      ...prev,
      [stageName]: validatedPlatformsSet,
    }))

    setCampaignFormData((prev) => ({
      ...prev,
      validatedStages: { ...prev.validatedStages, [stageName]: true },
    }))
    setPreviousSelectedOptions(selectedOptions)

    if (navigator.vibrate) navigator.vibrate(300)
  }

  const hasCompletePlatformSelection = (platformName, category, stageName) => {
    const buyTypeKey = `${stageName}-${category}-${platformName}-buy_type`
    const buyObjectiveKey = `${stageName}-${category}-${platformName}-objective_type`
    return !!selectedOptions[buyTypeKey] && !!selectedOptions[buyObjectiveKey]
  }

  const hasCompleteSelection = (stageName) => {
    if (!selectedNetworks[stageName] || selectedNetworks[stageName].size === 0) return false

    return Array.from(selectedNetworks[stageName]).some((platformName) => {
      // Check all possible platform categories
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

      // Return true if any category has complete platform selection
      return categories.some((category) => hasCompletePlatformSelection(platformName, category, stageName))
    })
  }

  const renderCompletedPlatform = (platformName, category, stageName) => {
    const normalizedCategory = category.toLowerCase().replaceAll(" ", "_")
    const channelMix = Array.isArray(campaignFormData?.channel_mix) ? campaignFormData.channel_mix : []
    const platformData = channelMix
      .find((ch) => ch.funnel_stage === stageName)
      ?.[normalizedCategory]?.find((p) => p.platform_name === platformName)

    // Only render if platform exists in the category
    if (!platformData) return null

    return (
      <div key={platformName} className="flex flex-col gap-4 min-w-[150px] max-w-[200px]">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg">
          <Image src={getPlatformIcon(platformName) || "/placeholder.svg"} className="size-4" alt={platformName} />
          <p className="text-sm font-medium text-[#061237] truncate">{platformName}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.buy_type || "Buy type"}
          </div>
          <div className="px-4 py-2 bg-white border text-center truncate border-gray-300 rounded-lg">
            {platformData.objective_type || "Buy objective"}
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

  // Filtered buyObj and buyType based on search
  const filteredBuyObj = buyObj?.filter((option) =>
    option?.text?.toLowerCase().includes(buyObjSearch.toLowerCase())
  )
  const filteredBuyType = buyType?.filter((option) =>
    option?.text?.toLowerCase().includes(buyTypeSearch.toLowerCase())
  )

  // Recap line helper: returns a string summary of selections for a stage
  const getStageRecap = (stageName) => {
    // Find all platforms for this stage
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

    let recapArr = []
    categories.forEach((category) => {
      const platforms = Array.isArray(stageData[category]) ? stageData[category] : []
      platforms.forEach((platform) => {
        const buyType = platform.buy_type || selectedOptions[`${stageName}-${category}-${platform.platform_name}-buy_type`]
        const objectiveType = platform.objective_type || selectedOptions[`${stageName}-${category}-${platform.platform_name}-objective_type`]
        if (buyType || objectiveType) {
          // Make the channel (platform) name bold
          recapArr.push(
            `<strong>${platform.platform_name}</strong>: ${objectiveType || "No objective"}, ${buyType || "No buy type"}`
          )
        }
      })
    })
    if (recapArr.length === 0) return "No selections made yet."
    // Join with separator and render as HTML
    return recapArr.join(" | ")
  }

  return (
    <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
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
                  <Image src={stage.icon} className="size-5" alt={`${stage.name} icon`} />
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
                ) : statuses[stageName] === "In Progress" ? (
                  <p className="text-[#3175FF] font-semibold text-base whitespace-nowrap">In Progress</p>
                ) : (
                  <p className="text-[#061237] opacity-50 text-base whitespace-nowrap">Not Started</p>
                )}
              </div>
              <div>
                {openItems[stage.name] ? (
                  <Image src={up || "/placeholder.svg"} alt="collapse" />
                ) : (
                  <Image src={down2 || "/placeholder.svg"} alt="expand" />
                )}
              </div>
            </div>
            {/* Recap line below each stage - only show when collapsed */}
            {!openItems[stage.name] && (
              <div
                className="w-full px-6 py-2 bg-[#F5F7FA] border-x border-b border-[rgba(0,0,0,0.07)] text-sm text-[#061237] rounded-b-none rounded-t-none"
                // Render HTML for bold channels
                dangerouslySetInnerHTML={{
                  __html: `<span class="font-semibold">Recap: </span>${getStageRecap(stageName)}`,
                }}
              />
            )}
            {openItems[stage.name] && (
              <div className="flex items-start flex-col gap-8 p-6 bg-white border border-gray-300 rounded-b-lg">
                {statuses[stageName] === "Completed" ? (
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
                      .filter((category) => hasValidatedPlatformsForCategory(category, stage.name))
                      .map((category) => (
                        <div key={category} className="w-full">
                          <h3 className="text-xl font-semibold text-[#061237] mb-6 capitalize">
                            {category?.replace("_", " ")}
                          </h3>
                          <div className="flex flex-wrap gap-8">
                            {Array.from(selectedNetworks[stage.name] || []).map((platform) =>
                              renderCompletedPlatform(platform, category, stage.name),
                            )}
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
                    if (platforms.length === 0) return null

                    return (
                      <div key={category} className="w-full md:flex flex-col items-start gap-6 md:w-4/5">
                        <h3 className="text-xl font-semibold text-[#061237] capitalize">
                          {category?.replace("_", " ")}
                        </h3>
                        <div className="flex flex-col gap-8">
                          {platforms.map((platform) => {
                            const platformKey = `${stage.name}-${category}-${platform.platform_name}`
                            const selectedObj =
                              selectedOptions[`${stageName}-${category}-${platform.platform_name}-objective_type`]
                            const selectedBuy =
                              selectedOptions[`${stageName}-${category}-${platform.platform_name}-buy_type`]

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
                                    <p className="text-base font-medium text-[#061237] capitalize">
                                      {platform.platform_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="relative min-w-[200px]">
                                  <div
                                    className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                    onClick={() => toggleDropdown(platformKey + "obj")}
                                  >
                                    <p className="text-sm font-medium text-[#061237]">
                                      {selectedObj || "Buy Objective"}
                                    </p>
                                    <Image src={down2 || "/placeholder.svg"} alt="dropdown" />
                                  </div>
                                  {dropdownOpen === platformKey + "obj" && (
                                    <div className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                      <ul>
                                        {/* Search input for buy objectives */}
                                        <li className="px-2 py-2">
                                          <input
                                            type="text"
                                            className="w-full p-2 border rounded-[5px] outline-none"
                                            placeholder="Search objectives..."
                                            value={buyObjSearch}
                                            onChange={e => setBuyObjSearch(e.target.value)}
                                            autoFocus
                                          />
                                        </li>
                                        {filteredBuyObj?.length === 0 && (
                                          <li className="px-4 py-2 text-gray-400">No objectives found</li>
                                        )}
                                        {filteredBuyObj?.map((option, i) => (
                                          <li
                                            key={`${platformKey}-objective-${i}`}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                              handleSelectOption(
                                                platform.platform_name,
                                                option?.text,
                                                category,
                                                stage.name,
                                                "objective_type",
                                              )
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
                                              <button
                                                className="w-full p-[5px] border rounded-[5px]"
                                                onClick={() => setShowInput("")}
                                              >
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
                                        {/* Search input for buy types */}
                                        <li className="px-2 py-2">
                                          <input
                                            type="text"
                                            className="w-full p-2 border rounded-[5px] outline-none"
                                            placeholder="Search types..."
                                            value={buyTypeSearch}
                                            onChange={e => setBuyTypeSearch(e.target.value)}
                                            autoFocus
                                          />
                                        </li>
                                        {filteredBuyType?.length === 0 && (
                                          <li className="px-4 py-2 text-gray-400">No types found</li>
                                        )}
                                        {filteredBuyType.map((option, i) => (
                                          <li
                                            key={`${platformKey}-type-${i}`}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                              handleSelectOption(
                                                platform.platform_name,
                                                option?.text,
                                                category,
                                                stage.name,
                                                "buy_type",
                                              )
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
                                              <button
                                                className="w-full p-[5px] border rounded-[5px]"
                                                onClick={() => setShowInput("")}
                                              >
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
                              </div>
                            )
                          })}
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
                      onClick={() => {
                        setIsEditable((prev) => ({
                          ...prev,
                          [stage.name]: false,
                        }))
                        setSelectedOptions(previousSelectedOptions)
                        setStatuses((prev) => {
                          const newStatuses = {
                            ...prev,
                            [stageName]: hasCompleteSelection(stageName) ? "In Progress" : "Not Started",
                          }
                          localStorage.setItem("funnelStageStatuses", JSON.stringify(newStatuses))
                          return newStatuses
                        })
                        setValidatedPlatforms((prev) => ({
                          ...prev,
                          [stageName]: new Set(),
                        }))
                        setCampaignFormData((prev) => ({
                          ...prev,
                          validatedStages: { ...prev.validatedStages, [stageName]: false },
                        }))
                      }}
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