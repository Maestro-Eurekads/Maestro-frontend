"use client"
import { useEffect, useState, useMemo } from "react"
import ConfiguredSetPage from "./ConfiguredSetPage"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import DoughnutChat from "../../../components/DoughnutChat"
import ChannelDistributionChatTwo from "../../../components/ChannelDistribution/ChannelDistributionChatTwo"
import CampaignPhases from "./CampaignPhases"
import { getFunnelColorFromCampaign } from "utils/funnelColorUtils"
import { useCampaigns } from "app/utils/CampaignsContext"
import { useComments } from "app/utils/CommentProvider"
import { getCurrencySymbol, mediaTypes, formatNumberWithCommas } from "components/data"
import PhasedistributionProgress from "../../../components/PhasedistributionProgress"

const ConfigureAdSetsAndBudget = ({ num, netAmount }) => {
  const { setIsDrawerOpen, setClose } = useComments()
  const [step, setStep] = useState(1)
  const [channelData, setChannelData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const { campaignFormData, setCampaignFormData } = useCampaigns()

  // Add selectedOption state for currency
  const [selectedOption, setSelectedOption] = useState({
    value: "EUR",
    label: "EUR",
  })

  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
  }, [setIsDrawerOpen, setClose])

  useEffect(() => {
    if (campaignFormData) {
      if (campaignFormData?.goal_level) {
        setIsModalOpen(false)
      } else {
        setIsModalOpen(true)
      }

      // Set currency from campaign data
      if (campaignFormData?.campaign_budget?.currency) {
        setSelectedOption({
          value: campaignFormData.campaign_budget.currency,
          label: campaignFormData.campaign_budget.currency,
        })
      }
    }
  }, [campaignFormData])

  const tailwindToHex = (tailwindClass: string): string => {
    const colorMap = {
      "bg-blue-500": "#3B82F6",
      "bg-green-500": "#10B981",
      "bg-orange-500 border border-orange-500": "#F97316",
      "bg-red-500 border border-red-500": "#EF4444",
      "bg-purple-500": "#8B5CF6",
      "bg-teal-500": "#14B8A6",
      "bg-pink-500 border border-pink-500": "#EC4899",
      "bg-indigo-500": "#6366F1",
    }
    return colorMap[tailwindClass] || "#6B7280"
  }

  function extractPlatforms(data) {
    const platforms = []
    if (!data?.channel_mix) return
    data.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage
      const stageBudget = Number.parseFloat(stage.stage_budget?.fixed_value) || 0
      if (stageBudget === 0) return
      mediaTypes.forEach((channelType) => {
        if (stage[channelType] && Array.isArray(stage[channelType])) {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name
            const platformBudget = Number.parseFloat(platform.budget?.fixed_value) || 0
            if (platformBudget === 0) return
            const percentage = stageBudget > 0 ? (platformBudget / stageBudget) * 100 : 0
            const existingPlatform = platforms.find((p) => p.platform_name === platformName)
            if (existingPlatform) {
              existingPlatform.platform_budget += platformBudget
              existingPlatform.stages_it_was_found.push({
                stage_name: stageName,
                percentage: percentage,
                budget: platformBudget,
              })
            } else {
              platforms.push({
                platform_name: platformName,
                platform_budget: platformBudget,
                stages_it_was_found: [
                  {
                    stage_name: stageName,
                    percentage: percentage,
                    budget: platformBudget,
                  },
                ],
              })
            }
          })
        }
      })
    })
    setChannelData(platforms)
  }

  const getFunnelColor = (funnelStage: string): string => {
    const funnel = campaignFormData?.custom_funnels?.find((f: any) => f.name === funnelStage)
    return funnel ? tailwindToHex(funnel.color) : "#6B7280"
  }

  useEffect(() => {
    if (campaignFormData) {
      extractPlatforms(campaignFormData)
    }
  }, [campaignFormData])

  const totalFeesAmount = useMemo(() => {
    const feesArr = campaignFormData?.campaign_budget?.budget_fees
    if (!Array.isArray(feesArr) || feesArr.length === 0) {
      return 0
    }
    const sum = feesArr.reduce((total, fee) => total + Number(fee.value || 0), 0)
    return isNaN(sum) ? 0 : sum
  }, [campaignFormData])

  const allocatedBudget = useMemo(() => {
    return (
      campaignFormData?.channel_mix?.reduce((acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0), 0) ||
      0
    )
  }, [campaignFormData?.channel_mix])

  // Calculate gross amount (same logic as FeeSelectionStep)
  const calculateGrossAmount = () => {
    if (!campaignFormData?.campaign_budget?.amount) return "0.00"
    const budgetAmount = Number.parseFloat(campaignFormData?.campaign_budget?.amount || "0")
    const subBudgetType = campaignFormData?.campaign_budget?.sub_budget_type

    if (subBudgetType === "gross") {
      // Gross budget: Gross is the input amount
      return budgetAmount.toFixed(2)
    } else if (subBudgetType === "net") {
      // Net budget: Gross = Net + Fees
      return (budgetAmount + totalFeesAmount).toFixed(2)
    }
    return "0.00"
  }

  // Calculate remaining budget (same logic as FeeSelectionStep)
  const calculateRemainingBudget = () => {
    const budgetAmount = Number.parseFloat(campaignFormData?.campaign_budget?.amount || "0")
    const subBudgetType = campaignFormData?.campaign_budget?.sub_budget_type
    let mediaBudget

    if (subBudgetType === "gross") {
      // Gross budget: Media budget = Gross - Fees
      mediaBudget = budgetAmount - totalFeesAmount
    } else if (subBudgetType === "net") {
      // Net budget: Media budget is the entered amount
      mediaBudget = budgetAmount
    } else {
      mediaBudget = 0
    }

    const subBudgets =
      campaignFormData?.channel_mix?.reduce((acc, stage) => {
        return acc + (Number(stage?.stage_budget?.fixed_value) || 0)
      }, 0) || 0

    const remainingBudget = mediaBudget - subBudgets
    return remainingBudget > 0 ? remainingBudget.toFixed(2) : "0.00"
  }

  // FIXED: Calculate total campaign budget correctly - this should be the media budget amount only
  const calculateTotalCampaignBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0
    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const budgetType = campaignFormData?.campaign_budget?.budget_type // "top_down" or "bottom_up"
    if (budgetType === "bottom_up") {
      // For bottom-up: Total campaign budget is the sum of all stage budgets (allocated media spend)
      return allocatedBudget
    } else {
      // For top-down: Total campaign budget is the entered amount (media budget)
      return budgetAmount
    }
  }

  const calculateNetAvailableBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0
    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const budgetType = campaignFormData?.campaign_budget?.budget_type
    const subBudgetType = campaignFormData?.campaign_budget?.sub_budget_type
    if (budgetType === "bottom_up") {
      // Net available is just the sum of stage budgets (the media spend)
      return allocatedBudget
    } else {
      // For top-down:
      // If gross, net available is gross amount minus fees
      // If net, net available is the entered amount (it's already net)
      if (subBudgetType === "gross") {
        return budgetAmount - totalFeesAmount
      } else {
        return budgetAmount
      }
    }
  }

  const remainingBudget = useMemo(() => {
    if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
      return 0
    }
    const netAvailable = calculateNetAvailableBudget()
    return Math.max(0, netAvailable - allocatedBudget)
  }, [
    allocatedBudget,
    campaignFormData?.campaign_budget?.budget_type,
    totalFeesAmount,
    campaignFormData?.campaign_budget,
  ])

  const totalCampaignBudget = calculateTotalCampaignBudget()

  const insideText = useMemo(() => {
    const currency = getCurrencySymbol(campaignFormData?.campaign_budget?.currency)
    return `${totalCampaignBudget.toLocaleString()} ${currency}`
  }, [totalCampaignBudget, campaignFormData?.campaign_budget?.currency])

  const campaignPhases = useMemo(() => {
    if (!campaignFormData?.channel_mix) return []
    const netAvailable = calculateNetAvailableBudget()
    if (netAvailable === 0) return []
    return campaignFormData.channel_mix
      .filter((c) => Number(c?.stage_budget?.fixed_value) > 0)
      .map((ch) => {
        const stageBudget = Number(ch?.stage_budget?.fixed_value) || 0
        const percentage = netAvailable > 0 ? (stageBudget / netAvailable) * 100 : 0
        return {
          name: ch?.funnel_stage,
          percentage: percentage.toFixed(1),
          budget: stageBudget,
          color: getFunnelColor(ch?.funnel_stage),
        }
      })
  }, [campaignFormData?.channel_mix, totalFeesAmount, campaignFormData?.campaign_budget])

  return (
    <div>
      <div className="flex justify-between items-baseline">
        <PageHeaderWrapper
          t4="Allocate your budget across channels and ad sets of each phase"
          span={num}
          t1={""}
          t2={""}
        />
      </div>

      {/* Budget Display - positioned after header, before ConfiguredSetPage */}
      {campaignFormData?.campaign_budget?.sub_budget_type && (
        <div className="text-lg min-h-[56px] bg-white shadow-md mt-8 rounded-md px-6 py-4 mb-2 border border-gray-100">
          <div className="flex flex-row items-center justify-between space-x-6 mx-auto max-w-[1200px]">
            <div className="flex-1 flex items-center">
              <p className="font-semibold text-[22px]">
                Total Budget: {getCurrencySymbol(selectedOption.value)}
                {formatNumberWithCommas(calculateGrossAmount())}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <p
                className={`font-[600] text-[22px] leading-[20px] ${Number(calculateRemainingBudget()) < 1 ? "text-red-500" : "text-[#00A36C]"
                  }`}
              >
                Remaining budget: {getCurrencySymbol(selectedOption.value)}
                {formatNumberWithCommas(calculateRemainingBudget())}
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfiguredSetPage netAmount={netAmount} />
    </div>
  )
}

// FIXED: Budget overview section with correct total campaign budget calculation
export const BudgetOverviewSection = () => {
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const [channelData, setChannelData] = useState(null)
  const { campaignFormData } = useCampaigns()

  const tailwindToHex = (tailwindClass: string): string => {
    const colorMap = {
      "bg-blue-500": "#3B82F6",
      "bg-green-500": "#10B981",
      "bg-orange-500 border border-orange-500": "#F97316",
      "bg-red-500 border border-red-500": "#EF4444",
      "bg-purple-500": "#8B5CF6",
      "bg-teal-500": "#14B8A6",
      "bg-pink-500 border border-pink-500": "#EC4899",
      "bg-indigo-500": "#6366F1",
    }
    return colorMap[tailwindClass] || "#6B7280"
  }

  function extractPlatforms(data) {
    const platforms = []
    if (!Array.isArray(data?.channel_mix)) return;

    data.channel_mix.forEach((stage) => {
      const stageName = stage?.funnel_stage
      const stageBudget = Number.parseFloat(stage?.stage_budget?.fixed_value)
      mediaTypes?.forEach((channelType) => {
        stage[channelType]?.forEach((platform) => {
          const platformName = platform?.platform_name
          const platformBudget = Number.parseFloat(platform?.budget?.fixed_value)
          const percentage = (platformBudget / stageBudget) * 100
          const existingPlatform = platforms?.find((p) => p?.platform_name === platformName)
          if (existingPlatform) {
            existingPlatform?.stages_it_was_found?.push({
              stage_name: stageName,
              percentage: percentage,
            })
          } else {
            platforms.push({
              platform_name: platformName,
              platform_budegt: platformBudget,
              stages_it_was_found: [
                {
                  stage_name: stageName,
                  percentage: percentage,
                },
              ],
            })
          }
        })
      })
    })
    setChannelData(platforms)
  }

  const getFunnelColor = (funnelStage: string): string => {
    const funnel = campaignFormData?.custom_funnels?.find((f: any) => f.name === funnelStage)
    return funnel ? tailwindToHex(funnel.color) : "#6B7280"
  }

  useEffect(() => {
    if (campaignFormData) {
      extractPlatforms(campaignFormData)
    }
  }, [campaignFormData])

  const totalFeesAmount = useMemo(() => {
    const feesArr = campaignFormData?.campaign_budget?.budget_fees
    if (!Array.isArray(feesArr) || feesArr.length === 0) {
      return 0
    }
    const sum = feesArr.reduce((total, fee) => total + Number(fee.value || 0), 0)
    return isNaN(sum) ? 0 : sum
  }, [campaignFormData])

  const allocatedBudget = useMemo(() => {
    return Array.isArray(campaignFormData?.channel_mix)
      ? campaignFormData.channel_mix.reduce((acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0), 0)
      : 0
  }, [campaignFormData?.channel_mix])

  // FIXED: Calculate total campaign budget correctly - this should be the media budget amount only
  const calculateTotalCampaignBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0
    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const budgetType = campaignFormData?.campaign_budget?.budget_type // "top_down" or "bottom_up"
    if (budgetType === "bottom_up") {
      // For bottom-up: Total campaign budget is the sum of all stage budgets (allocated media spend)
      return allocatedBudget
    } else {
      // For top-down: Total campaign budget is the entered amount (media budget)
      return budgetAmount
    }
  }

  const calculateNetAvailableBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0
    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const budgetType = campaignFormData?.campaign_budget?.budget_type
    const subBudgetType = campaignFormData?.campaign_budget?.sub_budget_type
    if (budgetType === "bottom_up") {
      // Net available is just the sum of stage budgets (the media spend)
      return allocatedBudget
    } else {
      // For top-down:
      // If gross, net available is gross amount minus fees
      // If net, net available is the entered amount (it's already net)
      if (subBudgetType === "gross") {
        return budgetAmount - totalFeesAmount
      } else {
        return budgetAmount
      }
    }
  }

  const remainingBudget = useMemo(() => {
    if (campaignFormData?.campaign_budget?.budget_type === "bottom_up") {
      return 0
    }
    const netAvailable = calculateNetAvailableBudget()
    return Math.max(0, netAvailable - allocatedBudget)
  }, [
    allocatedBudget,
    campaignFormData?.campaign_budget?.budget_type,
    totalFeesAmount,
    campaignFormData?.campaign_budget,
  ])

  const totalCampaignBudget = calculateTotalCampaignBudget()

  const insideText = useMemo(() => {
    const currency = getCurrencySymbol(campaignFormData?.campaign_budget?.currency)
    return `${totalCampaignBudget.toLocaleString()} ${currency}`
  }, [totalCampaignBudget, campaignFormData?.campaign_budget?.currency])

  const campaignPhases = useMemo(() => {
    if (!Array.isArray(campaignFormData?.channel_mix)) return []
    const netAvailable = calculateNetAvailableBudget()
    if (netAvailable === 0) return []
    return campaignFormData.channel_mix
      .filter((c) => Number(c?.stage_budget?.fixed_value) > 0)
      .map((ch) => {
        const stageBudget = Number(ch?.stage_budget?.fixed_value) || 0
        const percentage = netAvailable > 0 ? (stageBudget / netAvailable) * 100 : 0
        return {
          name: ch?.funnel_stage,
          percentage: percentage.toFixed(1),
          budget: stageBudget,
          color: getFunnelColor(ch?.funnel_stage),
        }
      })
  }, [campaignFormData?.channel_mix, totalFeesAmount, campaignFormData?.campaign_budget])

  return (
    <div>
      <div className="mt-4">
        <button
          onClick={() => setShowBudgetOverview(!showBudgetOverview)}
          className="flex items-center justify-center px-4 py-4 bg-blue-500 text-white font-medium text-sm rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          {showBudgetOverview ? "Hide Budget Overview" : "See Budget Overview"}
        </button>
      </div>
      {showBudgetOverview && (
        <div className="w-[100%] items-start p-[24px] gap-[10px] bg-white border border-[rgba(6,18,55,0.1)] rounded-[8px] box-border mt-[20px]">
          <div className="flex items-center gap-[30px] mb-4">
            <p>
              Total Campaign Budget: {totalCampaignBudget.toLocaleString()}
              {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
            </p>
            {totalFeesAmount > 0 && (
              <p className="text-red-600">
                Total Fees: {totalFeesAmount.toLocaleString()}
                {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
              </p>
            )}
            {totalFeesAmount > 0 && campaignFormData?.campaign_budget?.sub_budget_type === "gross" && (
              <p>
                Net Available Budget: {calculateNetAvailableBudget().toLocaleString()}
                {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
              </p>
            )}
            <p>
              Allocated Budget: {allocatedBudget.toLocaleString()}
              {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
            </p>
            {campaignFormData?.campaign_budget?.budget_type !== "bottom_up" && (
              <p className={`${remainingBudget > 0 ? "text-orange-600" : "text-green-600"}`}>
                Remaining Budget: {remainingBudget.toLocaleString()}
                {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
              </p>
            )}
          </div>
          <div className="allocate_budget_phase gap-[40px]">
            <div className="allocate_budget_phase_one">
              <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                Your budget by campaign phase
              </h3>
              <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
                Here is a breakdown of the budget allocated to each campaign phase.
              </p>
              <div className="flex items-center gap-5 mt-[16px]">
                <div>
                  <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                    {campaignFormData?.campaign_budget?.budget_type === "bottom_up"
                      ? "Total budget"
                      : "Allocated budget"}
                  </p>
                  <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                    {allocatedBudget?.toLocaleString()} {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                  </h3>
                </div>
                <div>
                  <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                    Campaign phases
                  </p>
                  <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                    {campaignPhases.length} phases
                  </h3>
                </div>
                {campaignFormData?.campaign_budget?.budget_type !== "bottom_up" && remainingBudget > 0 && (
                  <div>
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Unallocated
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-orange-600">
                      {remainingBudget?.toLocaleString()}{" "}
                      {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                    </h3>
                  </div>
                )}
              </div>
              <>
                <div className="campaign_phases_container mt-[24px] space-x-4">
                  <div className="campaign_phases_container_one">
                    <DoughnutChat insideText={insideText} />
                  </div>
                  <CampaignPhases
                    campaignPhases={campaignFormData?.channel_mix
                      ?.filter((c) => Number(c?.stage_budget?.percentage_value) > 0)
                      ?.map((ch) => ({
                        name: ch?.funnel_stage,
                        percentage: Number(
                          ch?.stage_budget?.percentage_value
                        )?.toFixed(0),
                        color: getFunnelColorFromCampaign(ch?.funnel_stage, { custom_funnels: campaignFormData?.custom_funnels }),
                      }))}
                  />
                </div>
                <PhasedistributionProgress insideText={insideText} />
              </>
            </div>
            <div className="allocate_budget_phase_two">
              <h3 className="font-semibold text-[22px] leading-[24px] flex items-center text-[#061237]">
                Channel distribution
              </h3>
              <p className="font-medium text-[15px] leading-[175%] text-[rgba(0,0,0,0.9)] order-1 self-stretch flex-none">
                Graph showing the total budget spent and its breakdown across the channels.
              </p>
              <div className="mt-[16px]">
                <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                  Channels
                </p>
                <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                  {channelData?.length || 0} channels
                </h3>
              </div>
              <ChannelDistributionChatTwo
                channelData={channelData}
                currency={getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigureAdSetsAndBudget
