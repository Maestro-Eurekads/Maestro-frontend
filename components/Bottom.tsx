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
import AskForApproval from "./ApprovalModals/AskforApporval"
import ApprovalModals from "./ApprovalModals/ApprovalModals"
import { toast } from "sonner"
import { hasFormatEntered } from "./data";

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
    selectedOption,
    setCampaignFormData,
    currencySign,
    jwt,
    agencyId,
    platformName
  } = useCampaigns()

  // --- Persist format selection for active === 4 ---
  const hasProceededFromFormatStep = useRef(false)
  const hasInitializedStep4 = useRef(false)







  // Reset initialization flag when leaving step 4
  useEffect(() => {
    if (active !== 4) {
      hasInitializedStep4.current = false
    }
  }, [active])



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

  // Monitor campaign data to update hasFormatSelected state
  useEffect(() => {
    console.log('Bottom component - Format selection useEffect triggered:', {
      active,
      platformName,
      hasChannelMix: !!campaignFormData?.channel_mix,
      channelMixLength: campaignFormData?.channel_mix?.length
    })

    if (campaignFormData?.channel_mix) {
      const formatSelected = hasFormatEntered(campaignFormData.channel_mix)
      console.log('Bottom component - Format selection result:', formatSelected)
      setHasFormatSelected(formatSelected)
    } else {
      console.log('Bottom component - No channel mix, setting hasFormatSelected to false')
      setHasFormatSelected(false)
    }
  }, [campaignFormData?.channel_mix, active, platformName])





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



  const handleContinue = () => {
    // Step 0 validation
    if (active === 0) {
      if (!campaignFormData?.media_plan) {
        toast.error("Media Plan name is required");
        return;
      }
      if (!campaignFormData?.budget_details_currency?.id) {
        toast.error("Currency is required");
        return;
      }
      setActive(1);
      return;
    }

    // Step 2: Select channel mix - At least one channel mix selected
    if (active === 2) {
      const CHANNEL_KEYS = [
        'social_media', 'display_networks', 'search_engines', 'streaming', 'ooh',
        'broadcast', 'messaging', 'print', 'e_commerce', 'in_game', 'mobile'
      ];
      const hasSelectedChannel =
        Array.isArray(campaignFormData?.channel_mix) &&
        campaignFormData.channel_mix.some((mix) =>
          CHANNEL_KEYS.some((key) => Array.isArray(mix?.[key]) && mix[key].length > 0)
        );
      if (!hasSelectedChannel) {
        toast.error("Please select at least one channel mix before proceeding!");
        return;
      }
      setActive(3);
      return;
    }

    // Step 3: Configure ad sets and audiences - At least one ad set/audience must be configured
    // if (active === 3) {
    //   // Assume at least one channel mix entry with ad_sets or similar (customize as needed)
    //   const hasAdSets = Array.isArray(campaignFormData?.channel_mix) &&
    //     campaignFormData.channel_mix.some(
    //       (mix) => Array.isArray(mix?.ad_sets) && mix.ad_sets.length > 0
    //     );
    //   if (!hasAdSets) {
    //     toast.error("Please configure at least one ad set or audience before proceeding!");
    //     return;
    //   }
    //   setActive(4);
    //   return;
    // }


    // Step 7: Plan campaign schedule - Start and end dates must be selected
    if (active === 7) {
      const isValidDate = (d) => {
        // Allow null, undefined, or empty string for dates that haven't been set yet
        if (!d || d === "" || d === null || d === undefined) {
          return false;
        }
        // Check if it's a valid date string in yyyy-MM-dd format
        return typeof d === 'string' && d.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(d);
      };
      if (!isValidDate(campaignFormData?.campaign_timeline_start_date) || !isValidDate(campaignFormData?.campaign_timeline_end_date)) {
        toast.error("Please select both start and end dates before proceeding!");
        return;
      }
      if (subStep < 1) {
        setSubStep((prev) => prev + 1);
        return;
      } else {
        setSubStep(0);
        setActive(8);
        return;
      }
    }

    // Step 8: Allocate budget - budget must not be empty
    if (active === 8) {
      const amount = campaignFormData?.campaign_budget?.amount;
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        toast.error("Please enter a valid budget amount before proceeding!");
        return;
      }
      setActive(9);
      return;
    }

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
    } else if (active === 2) {
      setActive(3)
    } else if (active === 3) {
      setActive(4)
    } else if (active === 4) {
      setActive(5)
    } else if (active === 5) {
      setActive(7)
    } else if (active === 7) {
      setActive(8)
    } else if (active === 8) {
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
    <footer id="footer" className="w-full">
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
            <Image src={Back} alt="Back" />
            <p>Back</p>
          </button>
        )}
        {active === 10 ? (
          // <button className="bottom_black_next_btn hover:bg-blue-500" onClick={() => setIsOpen(true)}>
          //   <p>Confirssssm</p>
          //   <Image src={Continue} alt="Continue" />
          // </button>
          <ApprovalModals />

        ) : (
          <div className="flex justify-center items-center gap-3">
            <button
              className={clsx(
                "bottom_black_next_btn whitespace-nowrap",
                active === 10 && "opacity-50 cursor-not-allowed",
                active < 10 && "hover:bg-blue-500",
                active === 4 && !hasFormatSelected, // Add padding for longer text
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
                    {(() => {
                      const buttonText = active === 0
                        ? "Start"
                        : active === 4 && !hasFormatSelected
                          ? (platformName > 0) ? "Continue" : "Not mandatory step, skip"
                          : "Continue"

                      console.log('Bottom component - Button text logic:', {
                        active,
                        hasFormatSelected,
                        platformName,
                        buttonText
                      })

                      return buttonText
                    })()}
                  </p>
                  <Image src={Continue} alt="Continue" />
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
