"use client"

import { useEffect, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import Button from "./common/button"
import up from "../../../public/arrow-down.svg"
import down2 from "../../../public/arrow-down-2.svg"
import { formatNumberWithCommas, getCurrencySymbol, getPlatformIcon, mediaTypes } from "components/data"
import { useCampaigns } from "app/utils/CampaignsContext"
import { toast } from "react-toastify"
import { FaCheckCircle } from "react-icons/fa"

interface OutletType {
  id: number
  outlet: string
  icon: StaticImageData
  ad_sets: any
  budget: {
    fixed_value: string | number
    percentage_value: string | number
  }
  channel: any
}

// Helper functions
const calculateNetFromGross = (grossAmount, fees) => {
  const totalFees = fees.reduce((total, fee) => total + Number(fee.amount || 0), 0)
  return Math.max(0, Number(grossAmount) - totalFees)
}

const calculateGrossFromNet = (netAmount, fees) => {
  const totalFees = fees.reduce((total, fee) => total + Number(fee.amount || 0), 0)
  return Number(netAmount) + totalFees
}

const calculateRemainingBudget = (netAmount, fees, campaignFormData, campaignBudgetType) => {
  const totalFees = fees.reduce((total, fee) => total + Number(fee.amount || 0), 0)
  let totalAvailableBudget

  if (campaignBudgetType === "gross") {
    totalAvailableBudget = Number(netAmount) || 0
  } else {
    totalAvailableBudget = (Number(netAmount) || 0) + totalFees
  }

  const subBudgets =
    campaignFormData?.channel_mix?.reduce((acc, stage) => {
      return acc + (Number(stage?.stage_budget?.fixed_value) || 0)
    }, 0) || 0

  let remainingBudget
  if (campaignBudgetType === "gross") {
    remainingBudget = totalAvailableBudget - totalFees - subBudgets
  } else {
    remainingBudget = (Number(netAmount) || 0) - subBudgets
  }

  return remainingBudget > 0 ? remainingBudget.toFixed(2) : "0.00"
}

// Helper to format percentage without decimal
const formatPercent = (value) => {
  return `${Math.round(Number(value))}`
}

// Helper function to calculate total height needed for all ad sets and their extra audiences
const calculateTotalLineHeight = (adSets) => {
  if (!adSets || adSets.length === 0) return 0
  let totalHeight = 0
  adSets.forEach((adSet, index) => {
    totalHeight += 110
    if (adSet.extra_audiences && adSet.extra_audiences.length > 0) {
      totalHeight += adSet.extra_audiences.length * 110
    }
  })
  return totalHeight
}

// Helper function to calculate the position for the horizontal line to reach the last item
const calculateHorizontalLinePosition = (adSets) => {
  if (!adSets || adSets.length === 0) return 0
  let position = 0
  adSets.forEach((adSet, index) => {
    position += 110
    if (adSet.extra_audiences && adSet.extra_audiences.length > 0) {
      position += adSet.extra_audiences.length * 110
    }
  })
  return position - 110
}

const ConfiguredSetPage = ({ netAmount, fees = [], campaignBudgetType = "gross" }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({})
  const [stageStatus, setStageStatus] = useState<Record<string, string>>({})
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({})
  const [validatedStages, setValidatedStages] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Record<string, any[]>>({})

  const funnelStages: string[] = Array.isArray(campaignFormData?.funnel_stages) ? campaignFormData.funnel_stages : []

  // Initialize state for all stages
  useEffect(() => {
    if (funnelStages.length > 0) {
      setOpenItems((prev) => {
        const next = { ...prev }
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false
        })
        return next
      })

      setOpenChannels((prev) => {
        const next = { ...prev }
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false
        })
        return next
      })

      setStageStatus((prev) => {
        const next = { ...prev }
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = "Not started"
        })
        return next
      })

      setValidatedStages((prev) => {
        const next = { ...prev }
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = false
        })
        return next
      })

      setResults((prev) => {
        const next = { ...prev }
        funnelStages.forEach((s) => {
          if (!(s in next)) next[s] = []
        })
        return next
      })
    }
  }, [campaignFormData?.funnel_stages])

  const getPlatformsFromStage = (channelMix) => {
    if (channelMix?.length > 0) {
      const platformsByStage: Record<string, OutletType[]> = {}

      channelMix.forEach((stage: any) => {
        const { funnel_stage } = stage
        if (!platformsByStage[funnel_stage]) {
          platformsByStage[funnel_stage] = []
        }

        mediaTypes.forEach((channel) => {
          if (Array.isArray(stage[channel])) {
            stage[channel].forEach((platform: any) => {
              const icon = getPlatformIcon(platform?.platform_name)
              if (icon) {
                platformsByStage[funnel_stage].push({
                  id: Math.floor(Math.random() * 1000000),
                  outlet: platform.platform_name,
                  ad_sets: platform?.ad_sets,
                  icon,
                  budget: platform?.budget,
                  channel,
                })
              }
            })
          }
        })
      })

      return platformsByStage
    }
    return {}
  }

  useEffect(() => {
    if (campaignFormData?.channel_mix) {
      setPlatforms(getPlatformsFromStage(campaignFormData.channel_mix))
    }
  }, [campaignFormData])

  useEffect(() => {
    funnelStages.forEach((stageName) => {
      const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)
      if (stageData?.stage_budget?.fixed_value > 0) {
        setStageStatus((prev) => ({
          ...prev,
          [stageName]: validatedStages[stageName] ? "Completed" : "In progress",
        }))
      } else {
        setStageStatus((prev) => ({
          ...prev,
          [stageName]: "Not started",
        }))
      }
    })
  }, [campaignFormData, validatedStages])

  const toggleItem = (stage) => {
    setOpenItems((prev) => ({ ...prev, [stage]: !prev[stage] }))
  }

  const toggleChannel = (stage) => {
    setOpenChannels((prev) => ({ ...prev, [stage]: !prev[stage] }))
  }

  const isButtonEnabled = (stage) => {
    const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stage)
    if (stageData?.stage_budget?.fixed_value) return true

    const hasPlatformBudget = mediaTypes.some((type) =>
      stageData?.[type]?.some((platform) => platform?.budget?.fixed_value && Number(platform.budget.fixed_value) > 0),
    )

    const hasAdSetBudget = mediaTypes.some((type) =>
      stageData?.[type]?.some((platform) =>
        platform?.ad_sets?.some((adSet) => adSet?.budget?.fixed_value && Number(adSet.budget.fixed_value) > 0),
      ),
    )

    return hasPlatformBudget || hasAdSetBudget
  }

  const handleValidateClick = (stage) => {
    setValidatedStages((prev) => ({ ...prev, [stage]: true }))
    setStageStatus((prev) => ({ ...prev, [stage]: "Completed" }))

    const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stage)
    const newResults = []

    if (stageData?.stage_budget?.fixed_value) {
      newResults.push({
        platform: "Top",
        budget: stageData.stage_budget.fixed_value,
        currency: campaignFormData?.campaign_budget?.currency,
      })
    }

    mediaTypes.forEach((type) => {
      stageData?.[type]?.forEach((platform) => {
        if (platform?.budget?.fixed_value) {
          newResults.push({
            platform: platform.platform_name,
            budget: platform.budget.fixed_value,
            currency: campaignFormData?.campaign_budget?.currency,
          })
        }

        platform?.ad_sets?.forEach((adSet) => {
          if (adSet?.budget?.fixed_value) {
            newResults.push({
              platform: `${platform.platform_name} - ${adSet.name}`,
              budget: adSet.budget.fixed_value,
              currency: campaignFormData?.campaign_budget?.currency,
            })
          }
        })
      })
    })

    setResults((prev) => ({ ...prev, [stage]: newResults }))
  }

  // Fixed handleAutoSplitBudget with correct audience size-based allocation
  const handleAutoSplitBudget = (stage, channel, platform) => {
    // Find the correct stage data using stage name
    const stageName = stage.name // stage comes from custom_funnels, so use .name
    const stageData = campaignFormData.channel_mix.find((ch) => ch.funnel_stage === stageName)

    const findPlatform = Array.isArray(stageData?.[channel])
      ? stageData[channel].find((ch) => ch?.platform_name === platform)
      : undefined

    if (stageData && findPlatform) {
      const totalPlatformBudget = Number(findPlatform?.budget?.fixed_value)

      if (!totalPlatformBudget || totalPlatformBudget <= 0) {
        toast.error("Please set platform budget first before auto-splitting", {
          position: "bottom-right",
        })
        return
      }

      // Calculate total audience size and collect all audience items
      let totalAudienceSize = 0
      const audienceItems = []

      findPlatform?.ad_sets?.forEach((adSet, adSetIndex) => {
        // Main ad set audience size - ensure we parse as number and remove commas
        const mainAudienceSize = Number(String(adSet?.size || "0").replace(/,/g, "")) || 0

        if (mainAudienceSize > 0) {
          totalAudienceSize += mainAudienceSize
          audienceItems.push({
            type: "main",
            adSetIndex,
            audienceSize: mainAudienceSize,
            extraIndex: null,
          })
        }

        // Extra audiences
        if (Array.isArray(adSet?.extra_audiences)) {
          adSet.extra_audiences.forEach((extraAudience, extraIndex) => {
            const extraAudienceSize = Number(String(extraAudience?.size || "0").replace(/,/g, "")) || 0

            if (extraAudienceSize > 0) {
              totalAudienceSize += extraAudienceSize
              audienceItems.push({
                type: "extra",
                adSetIndex,
                audienceSize: extraAudienceSize,
                extraIndex,
              })
            }
          })
        }
      })

      // If no audience data available, fall back to equal split
      if (totalAudienceSize === 0 || audienceItems.length === 0) {
        toast.warning("No audience size data available, falling back to equal split", {
          position: "bottom-right",
        })

        const totalAdSetCount = findPlatform?.ad_sets?.reduce((acc, ad) => {
          const extraAudienceCount = ad?.extra_audiences?.length || 0
          return acc + 1 + extraAudienceCount
        }, 0)

        if (!totalAdSetCount) return

        const splitBudget = (totalPlatformBudget / totalAdSetCount).toFixed(2)

        const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
          if (ch.funnel_stage === stageName) {
            if (ch[channel]) {
              ch[channel] = ch[channel].map((p) => {
                if (p.platform_name === platform) {
                  return {
                    ...p,
                    ad_sets: p.ad_sets?.map((adSet) => {
                      const updatedExtraAudiences = adSet.extra_audiences?.map((extraAudience) => ({
                        ...extraAudience,
                        budget: {
                          fixed_value: splitBudget,
                          percentage_value: ((Number(splitBudget) / totalPlatformBudget) * 100).toFixed(1),
                        },
                      }))

                      return {
                        ...adSet,
                        budget: {
                          fixed_value: splitBudget,
                          percentage_value: ((Number(splitBudget) / totalPlatformBudget) * 100).toFixed(1),
                        },
                        extra_audiences: updatedExtraAudiences,
                      }
                    }),
                  }
                }
                return p
              })
            }
          }
          return ch
        })

        setCampaignFormData({
          ...campaignFormData,
          channel_mix: updatedChannelMix,
        })
        return
      }

      // Calculate budget allocations for each audience item
      const budgetAllocations = audienceItems.map((item) => {
        const allocation = totalPlatformBudget * (item.audienceSize / totalAudienceSize)
        return {
          ...item,
          budgetAllocation: Number(allocation.toFixed(2)),
          percentage: Number(((allocation / totalPlatformBudget) * 100).toFixed(1)),
        }
      })

      // Apply the budget allocations to the campaign data
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          if (ch[channel]) {
            ch[channel] = ch[channel].map((p) => {
              if (p.platform_name === platform) {
                return {
                  ...p,
                  ad_sets: p.ad_sets?.map((adSet, adSetIndex) => {
                    // Find the main ad set allocation
                    const mainAllocation = budgetAllocations.find(
                      (item) => item.type === "main" && item.adSetIndex === adSetIndex,
                    )

                    // Find extra audience allocations for this ad set
                    const extraAllocations = budgetAllocations.filter(
                      (item) => item.type === "extra" && item.adSetIndex === adSetIndex,
                    )

                    // Update extra audiences
                    const updatedExtraAudiences =
                      adSet.extra_audiences?.map((extraAudience, extraIndex) => {
                        const extraAllocation = extraAllocations.find((item) => item.extraIndex === extraIndex)

                        return {
                          ...extraAudience,
                          budget: {
                            fixed_value: extraAllocation ? extraAllocation.budgetAllocation.toString() : "0",
                            percentage_value: extraAllocation ? extraAllocation.percentage.toString() : "0",
                          },
                        }
                      }) || []

                    return {
                      ...adSet,
                      budget: {
                        fixed_value: mainAllocation ? mainAllocation.budgetAllocation.toString() : "0",
                        percentage_value: mainAllocation ? mainAllocation.percentage.toString() : "0",
                      },
                      extra_audiences: updatedExtraAudiences,
                    }
                  }),
                }
              }
              return p
            })
          }
        }
        return ch
      })

      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
      })
    } else {
      toast.error("Could not find platform data for budget allocation", {
        position: "bottom-right",
      })
    }
  }

  const handleResetBudget = (stage, channel, platform) => {
    // Use stage.name instead of stage.funnel_stage
    const stageName = stage.name
    const stageData = campaignFormData.channel_mix.find((ch) => ch.funnel_stage === stageName)

    if (stageData) {
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          if (ch[channel]) {
            ch[channel] = ch[channel].map((p) => {
              if (p.platform_name === platform) {
                return {
                  ...p,
                  ad_sets: p.ad_sets?.map((adSet) => {
                    const updatedExtraAudiences = adSet.extra_audiences?.map((extraAudience) => ({
                      ...extraAudience,
                      budget: {
                        fixed_value: "",
                        percentage_value: "",
                      },
                    }))

                    return {
                      ...adSet,
                      budget: {
                        fixed_value: "",
                        percentage_value: "",
                      },
                      extra_audiences: updatedExtraAudiences,
                    }
                  }),
                }
              }
              return p
            })
          }
        }
        return ch
      })

      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
      })

      toast.success("Budget allocation reset successfully", {
        position: "bottom-right",
      })
    }
  }

  // PATCH: handleStageBudgetUpdate now also recalculates channel percentages when gross/net budget is reduced
  // ENHANCED: If the stage budget is reduced below the sum of channel budgets, clear all channel budgets.
  const handleStageBudgetUpdate = (stageName, value, isPercentage = false) => {
    let newBudget = 0
    let newPercentage = 0

    // Get current stage budget for calculations
    const currentStageBudget =
      Number(campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)?.stage_budget?.fixed_value) ||
      0

    // Only trigger this logic if user is editing the budget amount (not percentage)
    if (
      !isPercentage &&
      (value === "" || value === "0" || value.replace(/,/g, "") === "" || Number(value.replace(/,/g, "")) === 0)
    ) {
      // Clear all channel/platform/adset budgets for this phase
      const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          // Clear stage budget
          const clearedCh = {
            ...ch,
            stage_budget: {
              ...ch.stage_budget,
              fixed_value: "",
              percentage_value: "",
            },
          }

          // Clear all channel/platform/adset budgets
          mediaTypes.forEach((type) => {
            if (clearedCh[type]) {
              clearedCh[type] = clearedCh[type].map((p) => ({
                ...p,
                budget: {
                  ...p.budget,
                  fixed_value: "",
                  percentage_value: "",
                },
                ad_sets: Array.isArray(p.ad_sets)
                  ? p.ad_sets.map((adSet) => ({
                      ...adSet,
                      budget: {
                        fixed_value: "",
                        percentage_value: "",
                      },
                      extra_audiences: Array.isArray(adSet.extra_audiences)
                        ? adSet.extra_audiences.map((extra) => ({
                            ...extra,
                            budget: {
                              fixed_value: "",
                              percentage_value: "",
                            },
                          }))
                        : [],
                    }))
                  : [],
              }))
            }
          })

          return clearedCh
        }
        return ch
      })

      // For bottom-up, also clear campaign_budget.amount if all stages are empty
      const newCampaignBudget = { ...campaignFormData.campaign_budget }
      if (
        campaignFormData?.campaign_budget?.budget_type === "bottom_up" &&
        updatedChannelMix.every(
          (stage) => !stage.stage_budget?.fixed_value || Number(stage.stage_budget.fixed_value) === 0,
        )
      ) {
        newCampaignBudget.amount = ""
      }

      setCampaignFormData({
        ...campaignFormData,
        channel_mix: updatedChannelMix,
        ...(campaignFormData?.campaign_budget?.budget_type === "bottom_up" && {
          campaign_budget: newCampaignBudget,
        }),
      })

      return
    }

    if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
      // Bottom-up logic: Calculate total dynamically
      const otherStagesTotal =
        campaignFormData?.channel_mix?.reduce((acc, stage) => {
          if (stage.funnel_stage === stageName) {
            return acc // Skip current stage
          }
          return acc + (Number(stage?.stage_budget?.fixed_value) || 0)
        }, 0) || 0

      if (isPercentage) {
        // User entered percentage - need to calculate budget from percentage
        const percentageValue = Math.min(100, Math.max(0, Number(value) || 0))
        newPercentage = percentageValue

        // For bottom-up, we need to determine what total budget this percentage should be based on
        // Use a reasonable minimum total if no existing total
        const existingTotal = otherStagesTotal + currentStageBudget
        const minimumTotal = Math.max(existingTotal, 10000) // Use existing or minimum 10k
        newBudget = (minimumTotal * percentageValue) / 100

        // Validate that percentage doesn't exceed 100%
        if (percentageValue > 100) {
          toast("Percentage cannot exceed 100%", {
            position: "bottom-right",
            type: "error",
            theme: "colored",
          })
          return
        }
      } else {
        // User entered budget amount
        const inputValue = Number(value.replace(/,/g, "")) || 0
        newBudget = inputValue

        // Calculate percentage based on projected total
        const projectedTotal = otherStagesTotal + newBudget
        newPercentage = projectedTotal > 0 ? (newBudget / projectedTotal) * 100 : 0

        // Cap at 100% if needed
        if (newPercentage > 100) {
          newPercentage = 100
          // Recalculate budget to match 100%
          const maxAllowedBudget = otherStagesTotal > 0 ? otherStagesTotal : newBudget
          newBudget = maxAllowedBudget

          toast("Budget adjusted to maintain reasonable percentage", {
            position: "bottom-right",
            type: "warning",
            theme: "colored",
          })
        }
      }
    } else {
      // Top-down logic (existing)
      const totalBudget = campaignBudgetType === "gross" ? calculateNetFromGross(netAmount, fees) : netAmount || 0

      if (isPercentage) {
        // User entered percentage, calculate budget
        const percentageValue = Math.min(100, Math.max(0, Number(value) || 0))
        newPercentage = percentageValue
        if (campaignBudgetType === "gross") {
          const grossBudget = (netAmount * percentageValue) / 100
          newBudget = calculateNetFromGross(grossBudget, fees)
        } else {
          newBudget = (totalBudget * percentageValue) / 100
        }
      } else {
        // User entered budget amount
        const inputValue = Number(value.replace(/,/g, "")) || 0
        if (campaignBudgetType === "gross" && fees.length > 0) {
          newBudget = calculateNetFromGross(inputValue, fees)
          newPercentage = netAmount ? (inputValue / netAmount) * 100 : 0
        } else {
          newBudget = inputValue
          newPercentage = totalBudget ? (newBudget / totalBudget) * 100 : 0
        }

        // Limit percentage to 100%
        if (newPercentage > 100) {
          newPercentage = 100
          if (campaignBudgetType === "gross" && fees.length > 0) {
            const maxGrossBudget = netAmount
            newBudget = calculateNetFromGross(maxGrossBudget, fees)
          } else {
            newBudget = totalBudget
          }

          toast("Budget cannot exceed 100% of available budget", {
            position: "bottom-right",
            type: "error",
            theme: "colored",
          })
        }
      }

      // Top-down validation
      const currentTotal =
        campaignFormData?.channel_mix?.reduce((acc, stage) => {
          return acc + (Number(stage?.stage_budget?.fixed_value) || 0)
        }, 0) || 0

      const availableBudget = campaignBudgetType === "gross" ? calculateNetFromGross(netAmount, fees) : netAmount

      if (currentTotal - currentStageBudget + newBudget > availableBudget) {
        toast("The sum of all stage budgets cannot exceed the available budget.", {
          position: "bottom-right",
          type: "error",
          theme: "colored",
        })
        return
      }
    }

    // PATCH: When reducing the stage budget, also recalculate channel percentages
    // ENHANCED: If the sum of channel budgets is greater than the new stage budget, clear all channel budgets.
    const updatedChannelMix = campaignFormData.channel_mix.map((ch) => {
      if (ch.funnel_stage === stageName) {
        // If the new stage budget is zero, clear all channel budgets and percentages
        let updatedCh = {
          ...ch,
          stage_budget: {
            ...ch.stage_budget,
            fixed_value: newBudget.toString(),
            percentage_value: newPercentage.toFixed(1),
          },
        }

        // Calculate sum of all channel budgets
        let sumChannelBudgets = 0
        mediaTypes.forEach((type) => {
          if (ch[type]) {
            sumChannelBudgets += ch[type].reduce((acc, p) => acc + (Number(p?.budget?.fixed_value) || 0), 0)
          }
        })

        // If the new stage budget is zero or less than sum of channel budgets, clear all channel budgets
        if (newBudget === 0 || sumChannelBudgets > newBudget) {
          const clearedChannels = {}
          mediaTypes.forEach((type) => {
            if (ch[type]) {
              clearedChannels[type] = ch[type].map((p) => ({
                ...p,
                budget: {
                  ...p.budget,
                  fixed_value: "",
                  percentage_value: "",
                },
                ad_sets: Array.isArray(p.ad_sets)
                  ? p.ad_sets.map((adSet) => ({
                      ...adSet,
                      budget: {
                        fixed_value: "",
                        percentage_value: "",
                      },
                      extra_audiences: Array.isArray(adSet.extra_audiences)
                        ? adSet.extra_audiences.map((extra) => ({
                            ...extra,
                            budget: {
                              fixed_value: "",
                              percentage_value: "",
                            },
                          }))
                        : [],
                    }))
                  : [],
              }))
            }
          })

          updatedCh = {
            ...updatedCh,
            ...clearedChannels,
          }
        } else {
          // For each channel, recalculate percentage_value based on new stage budget
          const recalculatedChannels = {}
          mediaTypes.forEach((type) => {
            if (ch[type]) {
              recalculatedChannels[type] = ch[type].map((p) => {
                const channelBudget = Number(p?.budget?.fixed_value) || 0
                // If the channel budget is greater than the new stage budget, cap it
                let newChannelBudget = channelBudget
                if (channelBudget > newBudget) {
                  newChannelBudget = newBudget
                }

                return {
                  ...p,
                  budget: {
                    ...p.budget,
                    fixed_value: newChannelBudget.toString(),
                    // PATCH: recalculate channel percentage as a percentage of the *stage budget* (not total campaign budget)
                    percentage_value:
                      newBudget > 0
                        ? ((newChannelBudget / newBudget) * 100).toFixed(1)
                        : "",
                  },
                }
              })
            }
          })

          updatedCh = {
            ...updatedCh,
            ...recalculatedChannels,
          }
        }

        return updatedCh
      }
      return ch
    })

    // Calculate new total for bottom-up approach
    const newNetTotal = updatedChannelMix.reduce(
      (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
      0,
    )

    setCampaignFormData({
      ...campaignFormData,
      channel_mix: updatedChannelMix,
      // Update main campaign budget for bottom-up approach
      ...(campaignFormData?.campaign_budget?.budget_type === "bottom_up" && {
        campaign_budget: {
          ...campaignFormData.campaign_budget,
          amount:
            campaignBudgetType === "gross"
              ? calculateGrossFromNet(newNetTotal, fees).toString()
              : newNetTotal.toString(),
        },
      }),
    })
  }

  // New function to handle platform budget updates
  const handlePlatformBudgetUpdate = (stageName, platformOutlet, value, isPercentage = false) => {
    const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)
    if (!stageData) return

    const stageBudget = Number(stageData.stage_budget?.fixed_value) || 0
    if (stageBudget === 0) {
      toast("Please set stage budget first", {
        position: "bottom-right",
        type: "error",
        theme: "colored",
      })
      return
    }

    let newBudget = 0
    let newPercentage = 0

    if (isPercentage) {
      // User entered percentage, calculate budget
      const percentageValue = Math.min(100, Math.max(0, Number(value) || 0)) // Limit to 0-100%
      newPercentage = percentageValue
      newBudget = (stageBudget * percentageValue) / 100
    } else {
      // User entered budget, calculate percentage
      const budgetValue = Number(value.replace(/,/g, "")) || 0
      newBudget = budgetValue
      newPercentage = stageBudget ? (newBudget / stageBudget) * 100 : 0
    }

    // --- PATCH: Fix for bottom-up: always enforce sum of platform budgets <= stage budget and % <= 100 ---
    const channelTypes = mediaTypes
    let totalPlatformBudget = 0

    for (const channelType of channelTypes) {
      if (stageData[channelType]) {
        totalPlatformBudget += stageData[channelType].reduce((acc, p) => {
          if (p.platform_name === platformOutlet) {
            return acc + newBudget
          }
          return acc + (Number(p?.budget?.fixed_value) || 0)
        }, 0)
      }
    }

    if (totalPlatformBudget > stageBudget) {
      toast("The sum of all channels budgets cannot exceed the stage budget.", {
        position: "bottom-right",
        type: "error",
        theme: "colored",
      })
      return
    }

    // If the new platform budget is greater than the stage budget, clear the platform budget
    if (newBudget > stageBudget) {
      newBudget = 0
      newPercentage = 0
    }

    // Always cap percentage at 100 for both bottom-up and top-down
    if (newPercentage > 100) {
      newPercentage = 100
      newBudget = stageBudget

      toast("Percentage cannot exceed 100%", {
        position: "bottom-right",
        type: "error",
        theme: "colored",
      })
    }

    // Update the campaign data
    setCampaignFormData((prevData) => {
      const updatedChannelMix = prevData.channel_mix.map((ch) => {
        if (ch.funnel_stage === stageName) {
          const updatedChannelType = channelTypes.find((type) =>
            ch[type]?.some((p) => p.platform_name === platformOutlet),
          )

          if (updatedChannelType) {
            return {
              ...ch,
              [updatedChannelType]: ch[updatedChannelType].map((p) =>
                p.platform_name === platformOutlet
                  ? {
                      ...p,
                      budget: {
                        ...p.budget,
                        fixed_value: newBudget ? newBudget.toString() : "",
                        // PATCH: recalculate channel percentage as a percentage of the *stage budget* (not total campaign budget)
                        percentage_value: newBudget === 0 ? "" : ((newBudget / (stageBudget || 1)) * 100).toFixed(1),
                      },
                      // If the platform budget is cleared, also clear ad_sets budgets
                      ad_sets:
                        newBudget === 0 && Array.isArray(p.ad_sets)
                          ? p.ad_sets.map((adSet) => ({
                              ...adSet,
                              budget: {
                                fixed_value: "",
                                percentage_value: "",
                              },
                              extra_audiences: Array.isArray(adSet.extra_audiences)
                                ? adSet.extra_audiences.map((extra) => ({
                                    ...extra,
                                    budget: {
                                      fixed_value: "",
                                      percentage_value: "",
                                    },
                                  }))
                                : [],
                            }))
                          : p.ad_sets,
                    }
                  : p,
              ),
            }
          }
        }
        return ch
      })

      return {
        ...prevData,
        channel_mix: updatedChannelMix,
      }
    })
  }

  if (!campaignFormData?.custom_funnels || campaignFormData.custom_funnels.length === 0) {
    return (
      <div className="mt-12 text-red-500">
        Error: Funnel stages are not configured. Please set up funnel stages first.
      </div>
    )
  }

  // --- RECAP REWRITE STARTS HERE ---
  const getStageRecap = (stageName) => {
    const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)
    const currency = campaignFormData?.campaign_budget?.currency || "EUR"
    const stageBudget = Number(stageData?.stage_budget?.fixed_value) || 0

    let totalBudget
    if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
      totalBudget =
        Number(campaignFormData?.campaign_budget?.amount) ||
        campaignFormData?.channel_mix?.reduce(
          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
          0,
        ) ||
        0
    } else {
      totalBudget = campaignBudgetType === "gross" ? calculateNetFromGross(netAmount, fees) : netAmount || 0
    }

    const stagePercentage = totalBudget ? (stageBudget / totalBudget) * 100 : 0
    const totalFees = fees.reduce((total, fee) => total + Number(fee.amount || 0), 0)
    const remainingBudget = calculateRemainingBudget(netAmount, fees, campaignFormData, campaignBudgetType)

    // Build a vertical list of channels (platforms) with their budget and % of phase (stage) budget
    const channelRows: {
      icon: StaticImageData | string
      name: string
      budget: number
      percent: number
    }[] = []

    if (stageData) {
      mediaTypes.forEach((type) => {
        if (stageData[type]) {
          stageData[type].forEach((platform) => {
            const budget = Number(platform?.budget?.fixed_value) || 0
            // PATCH: percent is now of phase (stage) budget, not total campaign budget
            let percent = 0
            percent = stageBudget > 0 ? (budget / stageBudget) * 100 : 0

            channelRows.push({
              icon: getPlatformIcon(platform.platform_name) || "/placeholder.svg",
              name: platform.platform_name,
              budget,
              percent,
            })
          })
        }
      })
    }

    // Get the funnel stage label (e.g. "Awareness") for this stageName
    const funnelStageLabel =
      campaignFormData?.custom_funnels?.find((f) => f.name === stageName)?.name || stageName

    return (
      <div className="mb-2 mt-1 text-sm text-gray-700 bg-[#F4F6FA] rounded px-4 py-1 border border-[#E5E7EB]">
        <div className="mb-1 flex flex-col gap-0.5">
          <div className="font-semibold mb-0.5">Recap</div>
          <div>
            <span className="font-bold">Net Budget: </span>
            <span className="font-bold">
              {getCurrencySymbol(currency)}
              {formatNumberWithCommas(stageBudget)}
            </span>
            <span className="ml-2 text-gray-500">({formatPercent(stagePercentage)}% of available net budget)</span>
          </div>
          {fees.length > 0 && (
            <div>
              <span className="font-bold">Gross Budget: </span>
              <span className="font-bold">
                {getCurrencySymbol(currency)}
                {formatNumberWithCommas(calculateGrossFromNet(stageBudget, fees).toFixed(2))}
              </span>
              <span className="ml-2 font-bold">Fees: </span>
              <span className="font-bold">
                {getCurrencySymbol(currency)}
                {formatNumberWithCommas(totalFees.toFixed(2))}
              </span>
            </div>
          )}
          <div>
            <span className="font-bold">Remaining: </span>
            <span className={`font-bold ${Number(remainingBudget) < 1 ? "text-red-500" : "text-green-600"}`}>
              {getCurrencySymbol(currency)}
              {formatNumberWithCommas(remainingBudget)}
            </span>
          </div>
        </div>

        {channelRows.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold mb-0.5">Channel Allocation</div>
            <div className="flex flex-col gap-1">
              {channelRows.map((row, idx) => (
                <div
                  key={row.name + idx}
                  className="flex items-center gap-2 bg-white rounded border border-gray-200 px-2 py-1"
                >
                  <Image
                    src={row.icon || "/placeholder.svg"}
                    alt={row.name}
                    width={20}
                    height={20}
                    className="rounded"
                    style={{ minWidth: 20, minHeight: 20 }}
                  />
                  <span className="font-medium text-[#061237] w-32 truncate">{row.name}</span>
                  <span className="ml-auto font-bold">
                    {getCurrencySymbol(currency)}
                    {formatNumberWithCommas(row.budget)}
                  </span>
                  {/* PATCH: Add funnel stage name before "budget" instead of channel name */}
                  <span className="ml-2 text-xs text-gray-600">
                    {funnelStageLabel} {formatPercent(row.percent)}% of budget
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  // --- RECAP REWRITE ENDS HERE ---

  return (
    <div className="mt-12 flex items-start flex-col gap-8 w-full">
      {funnelStages.map((stageName, index) => {
        const stageData = campaignFormData?.channel_mix?.find((ch) => ch?.funnel_stage === stageName)
        const stageBudget = Number(stageData?.stage_budget?.fixed_value) || 0

        let totalBudget
        if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
          totalBudget =
            Number(campaignFormData?.campaign_budget?.amount) ||
            campaignFormData?.channel_mix?.reduce(
              (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
              0,
            ) ||
            0
        } else {
          totalBudget = netAmount || 0
        }

        const percentage = (() => {
          const storedPercentage = Number(stageData?.stage_budget?.percentage_value)
          if (storedPercentage && storedPercentage > 0) {
            return storedPercentage
          }

          // Calculate percentage based on budget type
          if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
            // For bottom-up, calculate against total of all stages
            const totalOfStages =
              campaignFormData?.channel_mix?.reduce(
                (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
                0,
              ) || 0
            if (campaignBudgetType === "gross" && fees.length > 0) {
              const grossTotal = calculateGrossFromNet(totalOfStages, fees)
              const grossStageBudget = calculateGrossFromNet(stageBudget, fees)
              return grossTotal ? (grossStageBudget / grossTotal) * 100 : 0
            } else {
              return totalOfStages ? (stageBudget / totalOfStages) * 100 : 0
            }
          } else {
            // Top-down logic
            if (campaignBudgetType === "gross" && fees.length > 0) {
              const grossStageBudget = calculateGrossFromNet(stageBudget, fees)
              return totalBudget ? (grossStageBudget / totalBudget) * 100 : 0
            } else {
              return totalBudget ? (stageBudget / totalBudget) * 100 : 0
            }
          }
        })()

        const stage = campaignFormData?.custom_funnels?.find((s) => s.name === stageName)
        if (!stage) return null

        // Get the funnel stage label (e.g. "Awareness") for this stageName
        const funnelStageLabel = stage?.name || stageName

        return (
          <div key={index} className="w-full">
            <div
              className="flex items-center justify-between px-6 py-3 w-full bg-[#FCFCFC] border border-gray-300 rounded-lg cursor-pointer"
              onClick={() => toggleItem(stage.name)}
            >
              <div className="flex items-center gap-3">
                {stage?.icon ? (
                  <Image src={stage.icon || "/placeholder.svg"} alt={`${stage.name} icon`} width={20} height={20} />
                ) : (
                  <span className="w-5 h-5" />
                )}
                <p className="text-md font-semibold text-[#061237]">{stage.name}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <p
                  className={`font-semibold text-base ${
                    stageStatus[stage.name] === "Completed"
                      ? "text-green-500 flex items-center gap-1.5"
                      : stageStatus[stage.name] === "In progress"
                        ? "text-[#3175FF]"
                        : "text-[#061237] opacity-50"
                  }`}
                >
                  {stageStatus[stage.name]}
                  {stageStatus[stage.name] === "Completed" && <FaCheckCircle />}
                </p>
              </div>

              <div>
                {openItems[stage.name] ? (
                  <Image src={up || "/placeholder.svg"} alt="collapse" />
                ) : (
                  <Image src={down2 || "/placeholder.svg"} alt="expand" />
                )}
              </div>
            </div>

            {!openItems[stage.name] && getStageRecap(stage.name)}

            {openItems[stage.name] && (
              <>
                <div className="pt-3 bg-[#FCFCFC] rounded-lg cursor-pointer border px-6 border-[rgba(6,18,55,0.1)]">
                  <div className="flex mt-4 flex-col items-start gap-4">
                    {fees.length > 0 && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 mb-1">Applied Fees:</p>
                        <div className="flex flex-wrap gap-1">
                          {fees.map((fee, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {fee.label}: {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                              {formatNumberWithCommas(fee.amount)}
                              {fee.isPercent && ` (${fee.percentValue}%)`}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Total Fees: {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                          {formatNumberWithCommas(
                            fees.reduce((total, fee) => total + Number(fee.amount || 0), 0).toFixed(2),
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex mb-4 justify-center gap-4">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-center font-bold text-sm">
                          {campaignBudgetType === "gross" ? "Gross Budget" : "Net Budget"}
                          {fees.length > 0 && campaignBudgetType === "gross" && (
                            <span className="text-xs text-gray-500 block font-normal">
                              (Fees will be deducted automatically)
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center justify-between px-3 w-[180px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                          <p className="font-bold">{getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}</p>
                          <input
                            type="text"
                            className="w-full px-2 focus:outline-none text-sm"
                            disabled={validatedStages[stageName]}
                            value={
                              campaignBudgetType === "gross" && fees.length > 0
                                ? formatNumberWithCommas(
                                    calculateGrossFromNet(
                                      campaignFormData?.channel_mix?.find(
                                        (ch: { funnel_stage: string }) => ch?.funnel_stage === stageName,
                                      )?.stage_budget?.fixed_value || 0,
                                      fees,
                                    ),
                                  )
                                : formatNumberWithCommas(
                                    campaignFormData?.channel_mix?.find(
                                      (ch: { funnel_stage: string }) => ch?.funnel_stage === stageName,
                                    )?.stage_budget?.fixed_value || "",
                                  )
                            }
                            onChange={(e) => handleStageBudgetUpdate(stageName, e.target.value, false)}
                          />
                          {campaignFormData?.campaign_budget?.currency}
                        </div>
                      </div>

                      <div className="flex items-start flex-col gap-2">
                        <h2 className="text-center font-bold text-sm">Percentage</h2>
                        <div className="flex items-center gap-2">
                          <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full focus:outline-none text-right text-sm"
                                disabled={validatedStages[stageName]}
                                value={formatPercent(percentage)}
                                onChange={(e) => handleStageBudgetUpdate(stageName, e.target.value, true)}
                              />
                              <span>%</span>
                            </div>
                          </div>
                          <p className="tracking-tight text-xs">of total budget</p>
                        </div>
                      </div>
                    </div>

                    <hr className="text-gray-200 w-full p-0.5" />

                    {/* Channel Dropdown */}
                    <div className="w-full">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-2 py-1 rounded bg-[#F4F6FA] border border-[#E5E7EB] hover:bg-[#e9ebf0] transition mb-2"
                        onClick={() => toggleChannel(stage.name)}
                        style={{ minWidth: 0 }}
                      >
                        <span className="font-semibold text-sm">Channels</span>
                        <span>
                          {openChannels[stage.name] ? (
                            <Image src={up || "/placeholder.svg"} alt="collapse" width={18} height={18} />
                          ) : (
                            <Image src={down2 || "/placeholder.svg"} alt="expand" width={18} height={18} />
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Only show platforms if channel dropdown is open */}
                    {openChannels[stage.name] &&
                      platforms[stage.name]?.map((platform, pIdx) => {
                        const stageObj = campaignFormData?.channel_mix?.find(
                          (stage) => stage.funnel_stage === stageName,
                        )
                        if (!stageObj) return null

                        const channelTypes = mediaTypes
                        let platformBudget = ""
                        let platformPercentage = 0

                        for (const channelType of channelTypes) {
                          const foundPlatform = stageObj[channelType]?.find((p) => p.platform_name === platform?.outlet)
                          if (foundPlatform) {
                            platformBudget = foundPlatform?.budget?.fixed_value || ""
                            // PATCH: recalculate channel percentage as a percentage of the *stage budget* (not total campaign budget) for all cases
                            const stageBudgetVal = Number(stageObj?.stage_budget?.fixed_value) || 0
                            platformPercentage =
                              stageBudgetVal > 0 ? ((Number(platformBudget) || 0) / stageBudgetVal) * 100 : 0
                            break
                          }
                        }

                        const budgetValue = platformBudget
                        const totalStageBudget = stageObj?.stage_budget?.fixed_value

                        return (
                          <div
                            key={`${stageName}${platform?.outlet}${pIdx}`}
                            className="w-full"
                            id={`${stageName}${platform?.outlet}${pIdx}`}
                          >
                            <div className="flex mb-4 items-end gap-2">
                              <div className="flex items-start flex-col gap-1">
                                {platform?.ad_sets?.length > 0 && (
                                  <div className="flex rounded-[50px] bg-[#00A36C1A] border border-[#00A36C1A] w-[70px] h-[22px] items-center gap-1">
                                    <span className="text-[#00A36C] pl-2 text-xs">
                                      {platform?.ad_sets?.length} ad sets
                                    </span>
                                  </div>
                                )}
                                <div className="flex gap-1 indent-[8px]">
                                  {campaignFormData?.campaign_budget?.level === "Adset level" &&
                                    platform?.ad_sets?.length > 0 && (
                                      <div className="l-shape-container-cb">
                                        <div className="l-vertical-cb"></div>
                                        <div className="l-horizontal-cb"></div>
                                        {platform?.ad_sets?.length > 1 && (
                                          <>
                                            <div
                                              className="l-vertical-cb-long"
                                              style={{
                                                height: `${calculateTotalLineHeight(platform?.ad_sets)}px`,
                                              }}
                                            ></div>
                                            <div
                                              className="l-horizontal-cb-long"
                                              style={{
                                                bottom: `-${calculateHorizontalLinePosition(platform?.ad_sets) + 21}px`,
                                              }}
                                            ></div>
                                          </>
                                        )}
                                      </div>
                                    )}
                                </div>
                                <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[180px] h-[40px] rounded-[8px] items-center gap-1">
                                  <div className="flex justify-between w-full px-3 items-center">
                                    <div className="flex items-center gap-1">
                                      <Image
                                        src={platform?.icon || "/placeholder.svg"}
                                        className="size-5"
                                        alt={platform?.outlet || "platform"}
                                      />
                                      <span className="text-sm">{platform?.outlet}</span>
                                    </div>
                                    {campaignFormData?.campaign_budget?.level === "Adset level" &&
                                      platform?.ad_sets?.length > 0 && (
                                        <Image src={down2 || "/placeholder.svg"} className="size-5" alt="arrow down" />
                                      )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start flex-col gap-1">
                                <h2 className="text-center font-bold text-xs">Budget</h2>
                                <div className="flex items-center justify-between px-3 w-[180px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                  <p className="font-bold text-sm">
                                    {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                                  </p>
                                  <input
                                    type="text"
                                    className="w-full px-2 focus:outline-none text-sm"
                                    value={formatNumberWithCommas(budgetValue)}
                                    disabled={validatedStages[stageName]}
                                    onChange={(e) =>
                                      handlePlatformBudgetUpdate(stageName, platform.outlet, e.target.value, false)
                                    }
                                  />
                                  <span className="text-sm">{campaignFormData?.campaign_budget?.currency}</span>
                                </div>
                              </div>

                              <div className="flex items-start flex-col gap-1">
                                <h2 className="text-center font-bold text-xs">Percentage</h2>
                                <div
                                  className="flex items-center gap-1 flex-wrap w-full"
                                  style={{
                                    minWidth: 0,
                                    width: "100%",
                                    maxWidth: "100%",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                  }}
                                >
                                  <div className="bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full focus:outline-none text-right text-sm"
                                        disabled={validatedStages[stageName]}
                                        value={formatPercent(platformPercentage)}
                                        onChange={(e) =>
                                          handlePlatformBudgetUpdate(stageName, platform.outlet, e.target.value, true)
                                        }
                                      />
                                      <span>%</span>
                                    </div>
                                  </div>
                                  <p className="whitespace-nowrap tracking-tight text-xs">
                                    {/* PATCH: Add funnel stage name before "budget" instead of channel name in channel view */}
                                    {funnelStageLabel} of total budget
                                  </p>
                                  {platform?.ad_sets?.length > 1 &&
                                    campaignFormData?.campaign_budget?.level === "Adset level" && (
                                      <div
                                        className="flex items-center gap-1 w-full md:w-auto"
                                        style={{
                                          flex: "1 1 0",
                                          minWidth: 0,
                                          overflow: "visible",
                                          maxWidth: "100%",
                                        }}
                                      >
                                        <label
                                          htmlFor={`${stage.name}-${platform?.outlet}`}
                                          className="relative inline-block h-5 w-10 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-blue-500 peer-checked:bg-blue-500"
                                        >
                                          <input
                                            type="checkbox"
                                            id={`${stage.name}-${platform?.outlet}`}
                                            disabled={validatedStages[stageName]}
                                            className="peer sr-only"
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                handleAutoSplitBudget(stage, platform?.channel, platform?.outlet)
                                              } else {
                                                handleResetBudget(stage, platform?.channel, platform?.outlet)
                                              }
                                            }}
                                          />
                                          <span className="absolute inset-y-0 left-0 w-5 h-5 rounded-full bg-white transition-transform duration-200 transform peer-checked:translate-x-5"></span>
                                        </label>
                                        <div
                                          className="text-[#061237] text-nowrap text-xs font-semibold tracking-tighter"
                                          style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "100%",
                                            minWidth: 0,
                                            flex: "1 1 0",
                                          }}
                                          title="Auto-split budget based on audience size"
                                        >
                                          Auto-split budget based on audience size
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="pb-4 space-y-3" id="setContainer">
                              {campaignFormData?.campaign_budget?.level === "Adset level" &&
                                platform?.ad_sets?.map((ad_set, adSetIdx) => {
                                  const getAdSetBudget = (adSet) => {
                                    return adSet?.budget?.fixed_value && platform.ad_sets?.length
                                      ? Number(adSet?.budget?.fixed_value).toFixed(2)
                                      : "0"
                                  }

                                  const adSetPercentage =
                                    (ad_set?.budget?.percentage_value || platform?.budget?.fixed_value) &&
                                    Number(getAdSetBudget(ad_set))
                                      ? (
                                          (Number(getAdSetBudget(ad_set)) / Number(platform?.budget?.fixed_value)) *
                                          100
                                        ).toFixed(1)
                                      : "0"

                                  const getAdSetExtraBudget = (adSet, extraIndex) => {
                                    return adSet?.extra_audiences?.[extraIndex]?.budget?.fixed_value
                                      ? Number(adSet?.extra_audiences[extraIndex]?.budget?.fixed_value).toFixed(2)
                                      : "0"
                                  }

                                  const getAdSetExtraBudgetPercentage = (adSet, extraIndex) => {
                                    const extraBudget = adSet?.extra_audiences?.[extraIndex]?.budget?.fixed_value || 0
                                    const platformBudget = platform?.budget?.fixed_value || 0
                                    if (Number(platformBudget) > 0) {
                                      return ((Number(extraBudget) / Number(platformBudget)) * 100).toFixed(1)
                                    }
                                    return "0"
                                  }

                                  return (
                                    <div className="ml-[16px]" key={adSetIdx}>
                                      {ad_set?.extra_audiences?.length > 0 && (
                                        <div className="flex gap-1 indent-[8px]">
                                          <div className="l-shape-container-cb">
                                            <div
                                              className="l-vertical-cb"
                                              style={{
                                                height: `${ad_set.extra_audiences.length * 110}px`,
                                                top: "51px",
                                                left: "-4px",
                                              }}
                                            ></div>
                                            <div
                                              className="l-horizontal-cb"
                                              style={{
                                                bottom: `-${ad_set.extra_audiences.length * 110 + 1}px`,
                                                left: "-4px",
                                                width: "20px",
                                              }}
                                            ></div>
                                          </div>
                                        </div>
                                      )}
                                      <div className="flex gap-2 items-end">
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">{ad_set?.name}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[140px] h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">{ad_set?.audience_type}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                          <div className="flex justify-between w-full px-3 items-center">
                                            <div className="flex items-center gap-1">
                                              <span className="text-xs">
                                                {ad_set?.size ? Number(ad_set?.size).toLocaleString() : ""}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-start flex-col gap-1">
                                          <h2 className="text-center font-bold text-xs">Budget</h2>
                                          <div className="flex items-center justify-between px-3 w-[140px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                            <p className="font-bold text-xs">
                                              {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                                            </p>
                                            <input
                                              type="text"
                                              className="w-full px-2 focus:outline-none text-xs"
                                              value={formatNumberWithCommas(getAdSetBudget(ad_set))}
                                              disabled={validatedStages[stageName]}
                                              onChange={(e) => {
                                                const inputValue = e.target.value.replace(/,/g, "")
                                                const newBudget = inputValue
                                                setCampaignFormData((prevData) => {
                                                  const updatedChannelMix = prevData.channel_mix.map((ch) => {
                                                    if (ch.funnel_stage === stageName) {
                                                      const updatedChannelType = channelTypes.find((type) =>
                                                        ch[type]?.some((p) => p.platform_name === platform.outlet),
                                                      )
                                                      if (updatedChannelType) {
                                                        return {
                                                          ...ch,
                                                          [updatedChannelType]: ch[updatedChannelType].map((p) => {
                                                            if (p.platform_name === platform.outlet) {
                                                              const updatedAdSets = p.ad_sets?.map(
                                                                (adSet, adSetIdx2) => {
                                                                  if (adSetIdx2 === adSetIdx) {
                                                                    // PATCH: Enforce sum of ad set budgets <= platform budget for both bottom-up and top-down
                                                                    let totalAdSetBudget = 0
                                                                    const tempAdSets = p.ad_sets?.map((a, idx) => {
                                                                      if (idx === adSetIdx2) {
                                                                        totalAdSetBudget += Number(newBudget) || 0
                                                                        return {
                                                                          ...a,
                                                                          budget: {
                                                                            fixed_value: newBudget,
                                                                            percentage_value: p.budget?.fixed_value
                                                                              ? (
                                                                                  (Number(newBudget) /
                                                                                    Number(p.budget.fixed_value)) *
                                                                                  100
                                                                                ).toFixed(2)
                                                                              : "0",
                                                                          },
                                                                        }
                                                                      } else {
                                                                        totalAdSetBudget +=
                                                                          Number(a.budget?.fixed_value) || 0
                                                                        return a
                                                                      }
                                                                    })
                                                                    if (
                                                                      totalAdSetBudget > Number(p.budget?.fixed_value)
                                                                    ) {
                                                                      toast(
                                                                        "The sum of all ad set budgets cannot exceed the platform budget.",
                                                                        {
                                                                          position: "bottom-right",
                                                                          type: "error",
                                                                          theme: "colored",
                                                                          toastId: "sum",
                                                                        },
                                                                      )
                                                                      return adSet
                                                                    }
                                                                    return tempAdSets[adSetIdx2]
                                                                  }
                                                                  return adSet
                                                                },
                                                              )
                                                              return {
                                                                ...p,
                                                                ad_sets: updatedAdSets,
                                                              }
                                                            }
                                                            return p
                                                          }),
                                                        }
                                                      }
                                                    }
                                                    return ch
                                                  })
                                                  return {
                                                    ...prevData,
                                                    channel_mix: updatedChannelMix,
                                                  }
                                                })
                                              }}
                                            />
                                            <span className="text-xs">
                                              {campaignFormData?.campaign_budget?.currency}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-start flex-col gap-1">
                                          <h2 className="text-center font-bold text-xs">Percentage</h2>
                                          <div className="flex items-center gap-1">
                                            <div className=" bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                              <div className="flex items-center gap-1">
                                                <p className="text-xs">{formatPercent(adSetPercentage)}</p>
                                                <span className="text-xs"> %</span>
                                              </div>
                                            </div>
                                            <p className="whitespace-nowrap tracking-tight text-xs">
                                              {/* PATCH: Add funnel stage name before "budget" instead of channel name for ad set */}
                                              {funnelStageLabel} budget
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {ad_set?.extra_audiences?.length > 0 &&
                                        ad_set?.extra_audiences?.map((addSet, extraIdx) => (
                                          <div key={extraIdx} className="flex gap-2 items-end ml-[12px] mt-[10px]">
                                            <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                              <div className="flex justify-between w-full px-3 items-center">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs">{addSet?.name}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-[140px] h-[40px] rounded-[8px] items-center gap-1">
                                              <div className="flex justify-between w-full px-3 items-center">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs">{addSet?.audience_type}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex bg-[#F9FAFB] border border-[#0000001A] text-[#061237] w-fit h-[40px] rounded-[8px] items-center gap-1">
                                              <div className="flex justify-between w-full px-3 items-center">
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs">
                                                    {addSet?.size ? Number(addSet?.size).toLocaleString() : ""}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-start flex-col gap-1">
                                              <h2 className="text-center font-bold text-xs">Budget</h2>
                                              <div className="flex items-center justify-between px-3 w-[140px] h-[40px] border border-[#D0D5DD] rounded-[8px] bg-[#FFFFFF]">
                                                <p className="font-bold text-xs">
                                                  {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                                                </p>
                                                <input
                                                  type="text"
                                                  className="w-full px-2 focus:outline-none text-xs"
                                                  disabled={validatedStages[stageName]}
                                                  value={formatNumberWithCommas(getAdSetExtraBudget(ad_set, extraIdx))}
                                                  onChange={(e) => {
                                                    const inputValue = e.target.value.replace(/,/g, "")
                                                    const newBudget = inputValue
                                                    setCampaignFormData((prevData) => {
                                                      const updatedChannelMix = prevData.channel_mix.map((ch) => {
                                                        if (ch.funnel_stage === stageName) {
                                                          const updatedChannelType = channelTypes.find((type) =>
                                                            ch[type]?.some((p) => p.platform_name === platform.outlet),
                                                          )
                                                          if (updatedChannelType) {
                                                            return {
                                                              ...ch,
                                                              [updatedChannelType]: ch[updatedChannelType].map((p) => {
                                                                if (p.platform_name === platform.outlet) {
                                                                  const updatedAdSets = p.ad_sets?.map(
                                                                    (adSet, adSetIdx2) => {
                                                                      if (adSetIdx2 === adSetIdx) {
                                                                        const updatedExtraAudiences =
                                                                          adSet.extra_audiences?.map((extra, exIdx) => {
                                                                            if (exIdx === extraIdx) {
                                                                              // PATCH: Enforce sum of ad set + extra budgets <= platform budget for both bottom-up and top-down
                                                                              let totalAdSetBudget = 0
                                                                              const tempExtraAudiences =
                                                                                adSet.extra_audiences?.map(
                                                                                  (ea, idx) => {
                                                                                    if (idx === exIdx) {
                                                                                      totalAdSetBudget +=
                                                                                        Number(newBudget) || 0
                                                                                      return {
                                                                                        ...ea,
                                                                                        budget: {
                                                                                          fixed_value: newBudget,
                                                                                          percentage_value: p.budget
                                                                                            ?.fixed_value
                                                                                            ? (
                                                                                                (Number(newBudget) /
                                                                                                  Number(
                                                                                                    p.budget
                                                                                                      .fixed_value,
                                                                                                  )) *
                                                                                                100
                                                                                              ).toFixed(2)
                                                                                            : "0",
                                                                                        },
                                                                                      }
                                                                                    } else {
                                                                                      totalAdSetBudget +=
                                                                                        Number(
                                                                                          ea.budget?.fixed_value,
                                                                                        ) || 0
                                                                                      return ea
                                                                                    }
                                                                                  },
                                                                                ) || []
                                                                              // Add ad set's own budget
                                                                              totalAdSetBudget +=
                                                                                Number(adSet.budget?.fixed_value) || 0
                                                                              if (
                                                                                totalAdSetBudget >
                                                                                Number(p.budget?.fixed_value)
                                                                              ) {
                                                                                toast(
                                                                                  "Total budget (ad sets + extras) cannot exceed platform budget",
                                                                                  {
                                                                                    toastId: "extraToast",
                                                                                    position: "bottom-right",
                                                                                    type: "error",
                                                                                    theme: "colored",
                                                                                  },
                                                                                )
                                                                                return extra
                                                                              }
                                                                              return tempExtraAudiences[exIdx]
                                                                            }
                                                                            return extra
                                                                          }) || []
                                                                        return {
                                                                          ...adSet,
                                                                          extra_audiences: updatedExtraAudiences,
                                                                        }
                                                                      }
                                                                      return adSet
                                                                    },
                                                                  )
                                                                  return {
                                                                    ...p,
                                                                    ad_sets: updatedAdSets,
                                                                  }
                                                                }
                                                                return p
                                                              }),
                                                            }
                                                          }
                                                        }
                                                        return ch
                                                      })
                                                      return {
                                                        ...prevData,
                                                        channel_mix: updatedChannelMix,
                                                      }
                                                    })
                                                  }}
                                                />
                                                <span className="text-xs">
                                                  {campaignFormData?.campaign_budget?.currency}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex items-start flex-col gap-1">
                                              <h2 className="text-center font-bold text-xs">Percentage</h2>
                                              <div className="flex items-center gap-1">
                                                <div className=" bg-[#FFFFFF] rounded-[8px] min-w-[54px] h-[40px] border border-[#D0D5DD] flex items-center px-2">
                                                  <div className="flex items-center gap-1">
                                                    <p className="text-xs">
                                                      {formatPercent(getAdSetExtraBudgetPercentage(ad_set, extraIdx))}
                                                    </p>
                                                    <span className="text-xs"> %</span>
                                                  </div>
                                                </div>
                                                <p className="whitespace-nowrap tracking-tight text-xs">
                                                  {/* PATCH: Add funnel stage name before "budget" instead of channel name for ad set extra audiences */}
                                                  {funnelStageLabel} budget
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )
                                })}
                            </div>
                            <hr className="text-gray-200 w-full p-0.5" />
                          </div>
                        )
                      })}
                  </div>

                  <div className="flex w-full my-4 justify-end items-center">
                    <Button
                      text={validatedStages[stage.name] ? "Edit" : "Validate"}
                      onClick={
                        validatedStages[stage.name]
                          ? () =>
                              setValidatedStages((prev) => ({
                                ...prev,
                                [stage.name]: false,
                              }))
                          : () => handleValidateClick(stage.name)
                      }
                      disabled={!isButtonEnabled(stage.name)}
                      variant="primary"
                      className="h-[40px] rounded-md px-4 py-1"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ConfiguredSetPage
