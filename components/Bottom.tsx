"use client"
import Image from "next/image"
import clsx from "clsx"
import Continue from "../public/arrow-back-outline.svg"
import Back from "../public/eva_arrow-back-outline.svg"
import { useActive } from "../app/utils/ActiveContext"
import AlertMain from "../components/Alert/AlertMain"
import { useState, useEffect, useRef } from "react"
import { useCampaigns } from "../app/utils/CampaignsContext"
import { BiLoader } from "react-icons/bi"
import { useSelectedDates } from "../app/utils/SelectedDatesContext"
import { useEditing } from "app/utils/EditingContext"
import { Toaster } from "react-hot-toast"
import SaveProgressButton from "app/utils/SaveProgressButton"

interface BottomProps {
  setIsOpen: (isOpen: boolean) => void
}

const CHANNEL_TYPES = [
  { key: "social_media", title: "Social media" },
  { key: "display_networks", title: "Display Networks" },
  { key: "search_engines", title: "Search Engines" },
  { key: "streaming", title: "Streaming" },
  { key: "ooh", title: "OOH" },
  { key: "broadcast", title: "Broadcast" },
  { key: "messaging", title: "Messaging" },
  { key: "print", title: "Print" },
  { key: "e_commerce", title: "E Commerce" },
  { key: "in_game", title: "In Game" },
  { key: "mobile", title: "Mobile" },
]

// FIXED: Add function to clear channel state when starting new campaign
const clearChannelStateForNewCampaign = () => {
  if (typeof window === "undefined") return
  try {
    // Clear all channel state keys from sessionStorage
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith("channelLevelAudienceState_")) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))
    // Clear global state
    if ((window as any).channelLevelAudienceState) {
      Object.keys((window as any).channelLevelAudienceState).forEach((stageName) => {
        delete (window as any).channelLevelAudienceState[stageName]
      })
    }
    console.log("Cleared all channel state for new campaign")
  } catch (error) {
    console.error("Error clearing channel state:", error)
  }
}

const Bottom = ({ setIsOpen }: BottomProps) => {
  const { active, setActive, subStep, setSubStep } = useActive()
  const { midcapEditing } = useEditing()
  const [triggerFormatError, setTriggerFormatError] = useState(false)
  const [validateStep, setValidateStep] = useState(false)
  const { selectedDates } = useSelectedDates()
  const [isHovered, setIsHovered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [hasFormatSelected, setHasFormatSelected] = useState(false)
  const {
    createCampaign,
    updateCampaign,
    campaignData,
    campaignFormData,
    cId,
    getActiveCampaign,
    copy,
    isEditingBuyingObjective,
    isStepZeroValid,
    setIsStepZeroValid,
    selectedOption,
    setCampaignFormData,
    requiredFields,
    currencySign,
    jwt,
    agencyId,
  } = useCampaigns()

  // --- Persist format selection for active === 4 ---
  const hasProceededFromFormatStep = useRef(false)
  const hasInitializedStep4 = useRef(false)

  // Helper function to check if format has previews
  const formatHasPreviews = (format) => {
    return format && format.previews && format.previews.length > 0
  }

  // Helper function to preserve formats with previews
  const preserveFormatsWithPreviews = (platforms) => {
    if (!platforms) return []
    return platforms.map((platform) => {
      if (!platform.format) return { ...platform, format: [] }
      // Keep formats that have previews, remove others
      const formatsWithPreviews = platform.format.filter(formatHasPreviews)
      return { ...platform, format: formatsWithPreviews }
    })
  }

  const validateFormatSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    const validatedStages = campaignFormData?.validatedStages || {}
    let hasValidFormat = false

    for (const stage of selectedStages) {
      const stageData = campaignFormData?.channel_mix?.find((mix) => mix?.funnel_stage === stage)
      if (stageData) {
        const hasFormatSelected = [
          ...(stageData.social_media || []),
          ...(stageData.display_networks || []),
          ...(stageData.search_engines || []),
          ...(stageData.streaming || []),
          ...(stageData.ooh || []),
          ...(stageData.broadcast || []),
          ...(stageData.messaging || []),
          ...(stageData.print || []),
          ...(stageData.e_commerce || []),
          ...(stageData.in_game || []),
          ...(stageData.mobile || []),
        ].some(
          (platform) =>
            (platform.format?.length > 0 && platform.format.some((f) => f.format_type && f.num_of_visuals)) ||
            platform.ad_sets?.some((adset) => adset.format?.some((f) => f.format_type && f.num_of_visuals)),
        )

        const isStageValidated = validatedStages[stage]
        if (hasFormatSelected || isStageValidated) {
          hasValidFormat = true
          break
        }
      }
    }

    return hasValidFormat
  }

  // Modified useEffect to preserve formats with previews
  useEffect(() => {
    if (active === 4 && !hasProceededFromFormatStep.current && !hasInitializedStep4.current) {
      hasInitializedStep4.current = true
      setCampaignFormData((prevFormData) => ({
        ...prevFormData,
        channel_mix:
          prevFormData.channel_mix?.map((mix) => ({
            ...mix,
            social_media: preserveFormatsWithPreviews(mix.social_media),
            display_networks: preserveFormatsWithPreviews(mix.display_networks),
            search_engines: preserveFormatsWithPreviews(mix.search_engines),
            streaming: preserveFormatsWithPreviews(mix.streaming),
            ooh: preserveFormatsWithPreviews(mix.ooh),
            broadcast: preserveFormatsWithPreviews(mix.broadcast),
            messaging: preserveFormatsWithPreviews(mix.messaging),
            print: preserveFormatsWithPreviews(mix.print),
            e_commerce: preserveFormatsWithPreviews(mix.e_commerce),
            in_game: preserveFormatsWithPreviews(mix.in_game),
            mobile: preserveFormatsWithPreviews(mix.mobile),
          })) || [],
        validatedStages: {},
      }))

      // Check if there are any formats with previews
      const hasExistingPreviews = campaignFormData.channel_mix?.some((mix) =>
        CHANNEL_TYPES.some(({ key }) => mix[key]?.some((platform) => platform.format?.some(formatHasPreviews))),
      )
      setHasFormatSelected(hasExistingPreviews)
    }
  }, [active, setCampaignFormData])

  // Reset initialization flag when leaving step 4
  useEffect(() => {
    if (active !== 4) {
      hasInitializedStep4.current = false
    }
  }, [active])

  // Update hasFormatSelected and log state
  useEffect(() => {
    const isFormatSelected = validateFormatSelection()
    setHasFormatSelected(isFormatSelected)
  }, [active, campaignFormData])

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      const storedValue = localStorage.getItem(`triggerFormatError_${cId}`)
      setTriggerFormatError(storedValue === "true")
    }
  }, [cId])

  useEffect(() => {
    if (typeof window !== "undefined" && cId) {
      localStorage.setItem(`triggerFormatError_${cId}`, triggerFormatError.toString())
    }
  }, [triggerFormatError, cId])

  const validateBuyObjectiveSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    const validatedStages = campaignFormData?.validatedStages || {}

    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false
    }

    for (const stage of selectedStages) {
      const stageData = campaignFormData.channel_mix.find((mix) => mix.funnel_stage === stage)
      if (stageData && validatedStages[stage]) {
        const hasValidChannel = CHANNEL_TYPES.some((channel) =>
          (stageData[channel.key] || []).some((platform) => platform.buy_type && platform.objective_type),
        )
        if (hasValidChannel) {
          return true
        }
      }
    }
    return false
  }

  const validateChannelSelection = () => {
    const selectedStages = campaignFormData?.funnel_stages || []
    if (!selectedStages.length || !campaignFormData?.channel_mix) {
      return false
    }
    return campaignFormData.channel_mix.some((mix) => CHANNEL_TYPES.some((channel) => mix[channel.key]?.length > 0))
  }

  // --- Custom back handler for active === 5 to persist step 4 if user had format selected and continued ---
  const handleBack = () => {
    if (active === 5 && hasProceededFromFormatStep.current) {
      setActive(4)
      return
    }

    if (active === 7) {
      if (subStep > 0) {
        setSubStep((prev) => prev - 1)
      } else {
        setActive(5)
      }
    } else {
      if (subStep > 0) {
        setSubStep((prev) => prev - 1)
      } else {
        setActive((prev) => Math.max(0, prev - 1))
        if (active === 8) setSubStep(1)
      }
    }
  }

  useEffect(() => {
    setIsStepZeroValid(requiredFields.every(Boolean))
  }, [requiredFields, setIsStepZeroValid])

  const handleContinue = () => {
    // FIXED: Clear channel state when moving to step 3 (Adset and Audiences step)
    if (active === 3) {
      clearChannelStateForNewCampaign()
    }

    // Handle subStep logic first (for step 7)
    if (active === 7) {
      if (subStep < 1) {
        setSubStep((prev) => prev + 1)
        return // Stop here so we don't advance the main step yet
      } else {
        setSubStep(0)
        setActive(8)
        return
      }
    }

    // Handle specific jumps
    if (active === 0) {
      setActive(1)
    } else if (active === 1) {
      setActive(2)
    } else if (active === 2 || active === 3) {
      setActive(4)
    } else if (active === 4) {
      setActive(5)
    } else if (active === 5) {
      setActive(7) // Skip to step 7
    } else if (active === 6 || active === 8) {
      setActive(9)
    } else if (active === 9) {
      setActive(10)
    } else {
      // Default next step
      setActive((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    setActive((prev) => Math.min(9, prev + 1))
  }

  return (
    <footer id="footer" className="w-full relative">
      <SaveProgressButton setIsOpen={setIsOpen} />
      <Toaster position="bottom-right" />
      {alert && <AlertMain alert={alert} />}
      <div className="flex justify-between w-full">
        {active === 0 ? (
          <div />
        ) : (
          <button
            className={clsx(
              "bottom_black_back_btn",
              active === 0 && subStep === 0 && "opacity-50 cursor-not-allowed",
              active > 0 && "hover:bg-gray-200",
            )}
            onClick={handleBack}
            disabled={active === 0 && subStep === 0}
          >
            <Image src={Back || "/placeholder.svg"} alt="Back" />
            <p>Back</p>
          </button>
        )}
        {active === 10 ? (
          <button className="bottom_black_next_btn hover:bg-blue-500" onClick={() => setIsOpen(true)}>
            <p>Confirm</p>
            <Image src={Continue || "/placeholder.svg"} alt="Continue" />
          </button>
        ) : (
          <div className="flex justify-center items-center gap-3">
            <button
              className={clsx(
                "bottom_black_next_btn whitespace-nowrap",
                active === 10 && "opacity-50 cursor-not-allowed",
                active < 10 && "hover:bg-blue-500",
                active === 4 && !hasFormatSelected && "px-3 py-2", // Add padding for longer text
              )}
              onClick={active === 4 && !hasFormatSelected ? handleSkip : handleContinue}
              disabled={active === 10}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? (
                <center>
                  <BiLoader className="animate-spin" />
                </center>
              ) : (
                <>
                  <p
                    style={
                      active === 4 && !hasFormatSelected
                        ? {
                            fontSize: "14px",
                            whiteSpace: "normal",
                            lineHeight: "16px",
                            textAlign: "center",
                            maxWidth: 120,
                          }
                        : {}
                    }
                  >
                    {active === 0
                      ? "Start"
                      : active === 4 && !hasFormatSelected
                        ? "Not mandatory step, skip"
                        : "Continue"}
                  </p>
                  <Image src={Continue || "/placeholder.svg"} alt="Continue" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </footer>
  )
}

export default Bottom
