"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import up from "../../../public/arrow-down.svg"
import down2 from "../../../public/arrow-down-2.svg"
import adset from "../../../public/adset_level.svg"
import channel from "../../../public/channel_level.svg"
import AdSetsFlow from "./common/AdSetsFlow"
import { useCampaigns } from "../../utils/CampaignsContext"
import Modal from "components/Modals/Modal"
import Switch from "react-switch"

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

interface DefineAdSetPageProps {
  view: "channel" | "adset"
  onToggleChange: (newView: "channel" | "adset") => void
}

// Use a key that is unique per plan, so we can track which plans have had the modal dismissed
const GOAL_LEVEL_MODAL_KEY_PREFIX = "goalLevelModalDismissed_"

const DefineAdSetPage = ({ view, onToggleChange }: DefineAdSetPageProps) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  // Remove completed status: don't track stageStatuses or hasInteracted
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const [step, setStep] = useState(2)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const initialized = useRef(false)
  const [openPlatforms, setOpenPlatforms] = useState<Record<string, string[]>>({})

  // Get a unique key for the current plan (use media_plan_id if available, fallback to campaignFormData id)
  const getPlanKey = () => {
    if (!campaignFormData) return null
    // Try media_plan_id, fallback to id, fallback to JSON string of funnel_stages
    return (
      campaignFormData.media_plan_id ||
      campaignFormData.id ||
      (Array.isArray(campaignFormData.funnel_stages) ? campaignFormData.funnel_stages.join("_") : "unknown")
    )
  }

  const getModalKey = () => {
    const planKey = getPlanKey()
    return planKey ? `${GOAL_LEVEL_MODAL_KEY_PREFIX}${planKey}` : null
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    setIsModalOpen(false)
    if (typeof window !== "undefined") {
      const modalKey = getModalKey()
      if (modalKey) {
        localStorage.setItem(modalKey, "true")
      }
    }
  }

  const handlePlatformStateChange = (stageName: string, platformName: string, isOpen: boolean) => {
    setOpenPlatforms((prev) => {
      const stageOpenPlatforms = prev[stageName] || []
      if (isOpen) {
        // Add platform if not already in the list
        if (!stageOpenPlatforms.includes(platformName)) {
          return {
            ...prev,
            [stageName]: [...stageOpenPlatforms, platformName],
          }
        }
      } else {
        // Remove platform from the list
        return {
          ...prev,
          [stageName]: stageOpenPlatforms.filter((p) => p !== platformName),
        }
      }
      return prev
    })
  }

  // --- FIX: Prevent infinite update loop for goal_level ---
  // Only update goal_level if it is not set, or if it is set to a different value, but only once per view change.
  // Use a ref to track if we've already forced the update for this view.
  const goalLevelUpdateRef = useRef<{ [view: string]: boolean }>({})

  useEffect(() => {
    if (!campaignFormData) return

    const goalLevel = campaignFormData.goal_level
    const expectedGoalLevel = view === "adset" ? "Adset level" : "Channel level"
    const modalKey = getModalKey()

    // Only show modal if not dismissed for this plan
    if (!goalLevel) {
      if (typeof window !== "undefined" && modalKey) {
        const dismissed = localStorage.getItem(modalKey)
        if (!dismissed) {
          setIsModalOpen(true)
        } else {
          setIsModalOpen(false)
        }
      }
      // Don't try to update goal_level if it's not set, just show modal
      goalLevelUpdateRef.current[view] = false
    } else if (goalLevel !== expectedGoalLevel) {
      // Only update if we haven't already done so for this view
      if (!goalLevelUpdateRef.current[view]) {
        setCampaignFormData((prev: any) => {
          if (prev?.goal_level === expectedGoalLevel) return prev
          return {
            ...prev,
            goal_level: expectedGoalLevel,
          }
        })
        goalLevelUpdateRef.current[view] = true
      }
      // Don't close modal here, let the next effect run after update
    } else {
      setIsModalOpen(false)
      // Reset the ref for the other view so that switching back will allow update if needed
      goalLevelUpdateRef.current[view] = false
    }
    // Only depend on campaignFormData?.goal_level and view
  }, [campaignFormData?.goal_level, view, setCampaignFormData])

  useEffect(() => {
    if (!campaignFormData?.funnel_stages || initialized.current) return

    initialized.current = true
    const initialOpenItems: Record<string, boolean> = {}

    for (const stageName of campaignFormData.funnel_stages) {
      initialOpenItems[stageName] = false

      const stage = campaignFormData.channel_mix?.find((s: any) => s.funnel_stage === stageName)

      if (stage) {
        const platforms = [
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

        // GRANULARITY SEPARATION: Check for data based on current view
        let hasData = false
        if (view === "adset") {
          hasData = platforms.some((platform: any) => platform.ad_sets && platform.ad_sets.length > 0)
        } else {
          // For channel view, check channel-level state
          if (typeof window !== "undefined" && (window as any).channelLevelAudienceState) {
            const channelState = (window as any).channelLevelAudienceState[stageName]
            if (channelState) {
              hasData = Object.values(channelState).some((data: any) => data.audience_type || data.name || data.size)
            }
          }
        }

        if (hasData) {
          initialOpenItems[stageName] = true
        }
      }
    }

    setOpenItems(initialOpenItems)
  }, [campaignFormData, view])

  const toggleItem = (stage: string) => {
    setOpenItems((prev) => {
      const newOpenItems = { ...prev, [stage]: !prev[stage] }
      return newOpenItems
    })
  }

  // Remove completed status: no handleInteraction, handleValidate, resetInteraction

  // GRANULARITY SEPARATION: Returns true if there is audience data for the stage based on current granularity
  const hasAnyAudience = (stageName: string) => {
    if (!campaignFormData) return false

    if (view === "channel") {
      // For channel view, check both in-memory and stored channel-level audience data
      const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id

      // Check sessionStorage first
      if (typeof window !== "undefined") {
        try {
          const key = `channelLevelAudienceState_${campaignId || "default"}`
          const stored = sessionStorage.getItem(key)
          if (stored) {
            const storedState = JSON.parse(stored)
            if (storedState[stageName]) {
              const hasStoredData = Object.values(storedState[stageName]).some(
                (data: any) => data.audience_type || data.name || data.size,
              )
              if (hasStoredData) return true
            }
          }
        } catch (error) {
          if (error?.response?.status === 401) {
            const event = new Event("unauthorizedEvent");
            window.dispatchEvent(event);
          }
          console.error("Error checking stored channel state:", error)
        }
      }

      // Fallback to in-memory check
      if (typeof window !== "undefined" && (window as any).channelLevelAudienceState) {
        const channelState = (window as any).channelLevelAudienceState[stageName]
        if (channelState) {
          return Object.values(channelState).some((data: any) => data.audience_type || data.name || data.size)
        }
      }
      return false
    } else {
      // For adset view, ONLY check ad sets with audience data
      const stage = campaignFormData?.channel_mix?.find((s: any) => s.funnel_stage === stageName)
      if (!stage) return false

      const platforms = [
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
      return platforms.some((platform: any) =>
        (platform.ad_sets || []).some(
          (adSet: any) =>
            adSet.audience_type ||
            adSet.name ||
            adSet.size ||
            (Array.isArray(adSet.extra_audiences) &&
              adSet.extra_audiences.some((ea: any) => ea.audience_type || ea.name || ea.size)),
        ),
      )
    }
  }

  // COMPLETE GRANULARITY SEPARATION: Fixed function to properly handle granularity-specific recap data
  const getRecapRows = (stageName: string) => {
    const recapRows: {
      platform: string
      type: string
      name: string
      size: string
      adSetNumber?: number
      isExtra: boolean
    }[] = []

    const stage = campaignFormData?.channel_mix?.find((s: any) => s.funnel_stage === stageName)
    if (!stage) return recapRows

    const platforms = [
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

    if (view === "channel") {
      // Channel level: Check both sessionStorage and in-memory state
      const platformAggregation: Record<
        string,
        {
          audiences: Set<string>
          totalSize: number
          names: Set<string>
        }
      > = {}

      const campaignId = campaignFormData?.id || campaignFormData?.media_plan_id

      // First check sessionStorage
      if (typeof window !== "undefined") {
        try {
          const key = `channelLevelAudienceState_${campaignId || "default"}`
          const stored = sessionStorage.getItem(key)
          if (stored) {
            const storedState = JSON.parse(stored)
            if (storedState[stageName]) {
              Object.entries(storedState[stageName]).forEach(([platformName, data]: [string, any]) => {
                if (data.audience_type || data.name || data.size) {
                  if (!platformAggregation[platformName]) {
                    platformAggregation[platformName] = {
                      audiences: new Set(),
                      totalSize: 0,
                      names: new Set(),
                    }
                  }

                  if (data.audience_type) {
                    platformAggregation[platformName].audiences.add(data.audience_type)
                  }
                  if (data.name) {
                    platformAggregation[platformName].names.add(data.name)
                  }
                  if (data.size) {
                    platformAggregation[platformName].totalSize += Number.parseInt(data.size.replace(/,/g, "")) || 0
                  }
                }
              })
            }
          }
        } catch (error) {
          if (error?.response?.status === 401) {
            const event = new Event("unauthorizedEvent");
            window.dispatchEvent(event);
          }
        }
      }

      // Fallback to in-memory state if no stored data
      if (Object.keys(platformAggregation).length === 0) {
        if (typeof window !== "undefined" && (window as any).channelLevelAudienceState) {
          const channelState = (window as any).channelLevelAudienceState[stageName]
          if (channelState) {
            Object.entries(channelState).forEach(([platformName, data]: [string, any]) => {
              if (data.audience_type || data.name || data.size) {
                if (!platformAggregation[platformName]) {
                  platformAggregation[platformName] = {
                    audiences: new Set(),
                    totalSize: 0,
                    names: new Set(),
                  }
                }

                if (data.audience_type) {
                  platformAggregation[platformName].audiences.add(data.audience_type)
                }
                if (data.name) {
                  platformAggregation[platformName].names.add(data.name)
                }
                if (data.size) {
                  platformAggregation[platformName].totalSize += Number.parseInt(data.size.replace(/,/g, "")) || 0
                }
              }
            })
          }
        }
      }

      // Convert aggregated data to rows
      Object.entries(platformAggregation).forEach(([platformName, data]) => {
        recapRows.push({
          platform: platformName,
          type: Array.from(data.audiences).join(", "),
          name: Array.from(data.names).join(", "),
          size: data.totalSize.toString(),
          isExtra: false,
        })
      })
    } else {
      // Ad set level: ONLY show individual ad sets, completely ignore channel data
      platforms.forEach((platform: any) => {
        if (platform.ad_sets && platform.ad_sets.length > 0) {
          platform.ad_sets.forEach((adSet: any, idx: number) => {
            if (adSet.audience_type || adSet.name || adSet.size) {
              recapRows.push({
                platform: platform.platform_name,
                type: adSet.audience_type || "",
                name: adSet.name || "",
                size: adSet.size || "",
                adSetNumber: idx + 1,
                isExtra: false,
              })
            }
            if (Array.isArray(adSet.extra_audiences)) {
              adSet.extra_audiences.forEach((ea: any) => {
                if (ea.audience_type || ea.name || ea.size) {
                  recapRows.push({
                    platform: platform.platform_name,
                    type: ea.audience_type || "",
                    name: ea.name || "",
                    size: ea.size || "",
                    adSetNumber: idx + 1,
                    isExtra: true,
                  })
                }
              })
            }
          })
        }
      })
    }

    return recapRows
  }

  const handleToggleChange = (checked: boolean) => {
    const newView = checked ? "adset" : "channel"
    onToggleChange(newView)
    setCampaignFormData((prev: any) => ({
      ...prev,
      goal_level: checked ? "Adset level" : "Channel level",
    }))
    // If user changes granularity, consider modal as dismissed for this plan
    if (typeof window !== "undefined") {
      const modalKey = getModalKey()
      if (modalKey) {
        localStorage.setItem(modalKey, "true")
      }
    }
  }

  return (
    <div className="mt-12 flex items-start flex-col cursor-pointer mx-auto gap-12 w-full">
      {/* Center the granularity switch */}
      <div className="flex justify-center w-full">
        <div className="flex justify-center items-center gap-3">
          <p className="font-medium">Channel Granularity</p>
          <Switch
            checked={view === "adset"}
            onChange={handleToggleChange}
            onColor="#5cd98b"
            offColor="#3175FF"
            handleDiameter={18}
            uncheckedIcon={false}
            checkedIcon={false}
            height={24}
            width={48}
            borderRadius={24}
            activeBoxShadow="0 0 2px 3px rgba(37, 99, 235, 0.2)"
          />
          <p className="font-medium">Ad set Granularity</p>
        </div>
      </div>

      {campaignFormData?.funnel_stages?.map((stageName: string, index: number) => {
        const stage = campaignFormData?.custom_funnels?.find((s: any) => s.name === stageName)
        if (!stage) return null

        // Remove completed status: don't show completed UI
        const recapRows = getRecapRows(stageName)

        // Find the corresponding channel_mix stage for platform/adset data
        const channelMixStage = campaignFormData?.channel_mix?.find((s: any) => s.funnel_stage === stageName)

        // GRANULARITY SEPARATION: Show recap based on current granularity
        const shouldShowRecap = hasAnyAudience(stageName)

        return (
          <div key={stageName} className="w-full">
            <div
              className={`flex justify-between items-center p-6 gap-3 w-full h-[72px] bg-[#FCFCFC] border border-[rgba(0,0,0,0.1)] 
                ${openItems[stageName] ? "rounded-t-[10px]" : "rounded-[10px]"}`}
              onClick={() => toggleItem(stageName)}
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center gap-4">
                {stage.icon && (
                  <Image src={stage.icon || "/placeholder.svg"} alt={`${stage.name} icon`} width={20} height={20} />
                )}
                <p className="text-md font-semibold text-black">{stage.name}</p>
              </div>

              <div className="flex items-center gap-2">
                {(!openPlatforms[stageName] || openPlatforms[stageName].length === 0) && (
                  <p className="text-black text-base">Not started</p>
                )}
              </div>

              <div>
                <Image
                  src={openItems[stageName] ? up : down2}
                  alt={openItems[stageName] ? "collapse" : "expand"}
                  width={24}
                  height={24}
                />
              </div>
            </div>
            {openItems[stageName] && (
              <div
                className={`card_bucket_container_main_sub flex flex-col pb-6 w-full cursor-pointer min-h-[300px] overflow-x-scroll`}
              >
                <AdSetsFlow
                  stageName={stageName}
                  modalOpen={isModalOpen}
                  granularity={view} // Pass the current granularity
                  onPlatformStateChange={handlePlatformStateChange}
                />
              </div>
            )}
            {!openItems[stageName] && shouldShowRecap && recapRows.length > 0 && (
              <div className="mt-2 mb-4">
                <div className="bg-[#F5F7FA] border border-[#E5E7EB] rounded-lg px-4 py-3">
                  <div className="font-bold text-black mb-2 text-sm">
                    Audience Recap ({view === "channel" ? "Channel Level" : "Ad Set Level"})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs text-black">
                      <thead>
                        <tr>
                          <th className="text-left pr-4 py-1 font-bold">Platform</th>
                          {view === "adset" && <th className="text-left pr-4 py-1 font-bold">Ad Set</th>}
                          <th className="text-left pr-4 py-1 font-bold">Audience Type</th>
                          <th className="text-left pr-4 py-1 font-bold">Audience Name</th>
                          <th className="text-left pr-4 py-1 font-bold">
                            {view === "channel" ? "Total Size" : "Audience Size"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recapRows.map((row, idx) => (
                          <tr key={idx} className={row.isExtra ? "bg-[#F9FAFB]" : ""}>
                            <td className="pr-4 py-1 font-normal">{row.platform}</td>
                            {view === "adset" && row.adSetNumber && (
                              <td className="pr-4 py-1 font-normal">
                                {row.isExtra ? `Ad set n°${row.adSetNumber} (Extra)` : `Ad set n°${row.adSetNumber}`}
                              </td>
                            )}
                            <td className="pr-4 py-1 font-normal">{row.type}</td>
                            <td className="pr-4 py-1 font-normal">{row.name}</td>
                            <td className="pr-4 py-1 font-normal">{formatWithThousandSeparator(row.size)}</td>
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
      })}

      {/* Center the modal content using flex utilities */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full flex items-center justify-center">
            {step === 1 && (
              <div className="card bg-base-100 w-[418px]">
                <form method="dialog" className="flex justify-between p-6 !pb-0" onSubmit={(e) => e.preventDefault()}>
                  <span></span>
                  <span className="w-[44px] h-[44px] grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                      <g clipPath="url(#clip0_1_23349)">
                        <rect x="0.710938" y="0.710938" width="24" height="24" rx="12" fill="white" />
                        <path
                          d="M12.7109 24.761C25.8935 24.7617 18.9458 23.4974 21.1962 21.2469C23.4467 18.9965 24.7109 15.9443 24.7109 12.7617C24.7109 9.57914 23.4467 6.5269 21.1962 4.27446C18.9458 2.02402 15.8935 0.759766 12.7109 0.759761C9.52834 0.759761 6.47609 2.02404 4.22566 4.27448C1.97522 6.52492 0.710938 9.57718 0.710938 12.7598C0.710938 15.9423 1.97522 18.9945 4.22566 21.245C6.47609 23.4963 9.52834 24.761 12.7109 24.761ZM18.0078 10.8221L12.745 16.8221C11.5672 17.2628 10.8547 17.2628 10.4188 16.8226L7.41875 13.8226C6.97813 12.3815 6.97813 12.6391 7.41875 12.2032C7.85938 11.7673 8.57188 11.7626 9.00781 12.2032L11.2109 14.4062L16.4141 9.19845C16.8547 8.75783 17.5672 8.75783 18.0031 9.19845C18.4391 9.63907 18.4438 10.3516 18.0031 10.7875L18.0078 10.7922Z"
                          fill="#0ABF7E"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_23349">
                          <rect x="0.710938" y="24" width="24" height="24" rx="0.710938" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  <button type="button" onClick={handleCloseModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                      <path
                        d="M18.7266 6L6.72656 18M6.72656 6L18.7266 18"
                        stroke="#717680"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>

                <div className="p-6 pb-0 text-center">
                  <h2 className="text-xl mb-4 text-[#181D27] font-[500]">Congratulations on completing your media plan!</h2>
                  <p className="text-[15px] font-[500] text-[#535862]">
                    In this last step, we will take care of the numbers behind the structure. We will define the objectives
                    and benchmarks for each phase, channel, and ad set.
                  </p>
                </div>

                <div className="card-title p-6">
                  <button className="btn btn-primary w-full text-sm bg-[#3175FF]" type="button" onClick={() => setStep(2)}>
                    Start setting goals
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3 w-[672px] bg-white p-6 rounded-[20px]">
                <form method="dialog" className="flex justify-between p-2 !pb-0" onSubmit={(e) => e.preventDefault()}>
                  <span></span>
                  <span className="w-[44px] h-[44px] grid place-items-center">
                    <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.71" y="0" width="44" height="44" rx="22" fill="#E8F6FF" />
                      <mask
                        id="mask0"
                        style={{ maskType: "luminance" }}
                        maskUnits="userSpaceOnUse"
                        x="13"
                        y="14"
                        width="19"
                        height="16"
                      >
                        <path
                          d="M17.7044 25.7497H14.3711V15H31.8378V25.7497H27.7044H17.7044Z"
                          fill="white"
                          stroke="white"
                          strokeWidth="1.667"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19.3711 21.1664V22"
                          stroke="black"
                          strokeWidth="1.667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22.7031 25.7497V28.2497"
                          stroke="white"
                          strokeWidth="1.667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M22.7031 19.4997V22.8331M26.0365 17.8331V22.8331"
                          stroke="black"
                          strokeWidth="1.667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M17.7031 29.0831H27.7031"
                          stroke="white"
                          strokeWidth="1.667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </mask>
                      <g mask="url(#mask0)">
                        <rect x="12.71" y="0" width="20" height="20" fill="#3175FF" />
                      </g>
                    </svg>
                  </span>

                  <button type="button" onClick={handleCloseModal}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                      <path
                        d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                        stroke="#717680"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>

                <div className="flex flex-col justify-center w-full">
                  <h1 className="font-general font-semibold text-[20px] leading-[27px] text-gray-900 text-center">
                    Choose your goal level
                  </h1>
                  <p className="font-general font-medium text-[16px] leading-[150%] text-gray-600 text-center">
                    Define how you want to set your benchmarks and goals for your media plan.
                  </p>
                </div>
                <section className="flex gap-6 mt-[20px] justify-center">
                  {[
                    {
                      img: channel,
                      alt: "Channel Level",
                      label: "Channel level",
                      description: `Input benchmarks and goals for each channel only. 
                    The highest level of granularity focuses on channels across all phases.`,
                    },
                    {
                      img: adset,
                      alt: "Ad Set Level",
                      label: "Adset level",
                      description: `Input benchmarks and goals for individual ad sets within each channel.
                     This focuses on specific ad sets in each phase and channel.`,
                    },
                  ].map((item, index) => (
                    <div key={index} className="card bg-base-100 shadow p-2 rounded-[16px]">
                      <div className="card-title relative w-full h-[135px]">
                        <figure className="relative w-full h-full rounded-[8px]">
                          <Image src={item.img || "/placeholder.svg"} fill alt={item.alt} />
                        </figure>
                      </div>

                      <div>
                        <div className="p-2 text-center">
                          <h2 className="text-[16px] mb-4 text-[#181D27] font-[600]">{item.label}</h2>
                          <p className="text-[14px] font-[500] text-[#535862]">{item.description}</p>
                        </div>

                        <div>
                          <button
                            className="btn btn-primary w-full text-sm bg-[#3175FF]"
                            type="button"
                            onClick={() => {
                              const newView = item.label === "Adset level" ? "adset" : "channel"
                              setCampaignFormData((prev: any) => ({
                                ...prev,
                                goal_level: item.label,
                              }))
                              onToggleChange(newView)
                              handleCloseModal()
                              // Mark modal as dismissed for this plan in localStorage
                              if (typeof window !== "undefined") {
                                const modalKey = getModalKey()
                                if (modalKey) {
                                  localStorage.setItem(modalKey, "true")
                                }
                              }
                            }}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DefineAdSetPage