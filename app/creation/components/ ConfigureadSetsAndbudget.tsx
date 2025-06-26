"use client"

import { useEffect, useState, useMemo } from "react"
import ConfiguredSetPage from "./ConfiguredSetPage"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import DoughnutChat from "../../../components/DoughnutChat"
import ChannelDistributionChatTwo from "../../../components/ChannelDistribution/ChannelDistributionChatTwo"
import CampaignPhases from "./CampaignPhases"
import { useCampaigns } from "app/utils/CampaignsContext"
import { useComments } from "app/utils/CommentProvider"
import { mediaTypes } from "components/data"
import PhasedistributionProgress from "../../../components/PhasedistributionProgress"

const ConfigureAdSetsAndBudget = ({ num, netAmount }) => {
  const { setIsDrawerOpen, setClose } = useComments()
  const [step, setStep] = useState(1)
  const [channelData, setChannelData] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showBudgetOverview, setShowBudgetOverview] = useState(false)
  const { campaignFormData, setCampaignFormData } = useCampaigns()

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
    }
  }, [campaignFormData])

  const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
      case "EUR":
        return "€"
      case "USD":
        return "$"
      case "GBP":
        return "£"
      case "NGN":
        return "₦"
      case "JPY":
        return "¥"
      case "CAD":
        return "$"
      default:
        return "€"
    }
  }

  // Map Tailwind bg- classes to hex colors for charts
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
    return colorMap[tailwindClass] || "#6B7280" // Default to gray if not found
  }

  function extractPlatforms(data) {
    const platforms = []
    if (!data?.channel_mix) return

    data.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage
      const stageBudget = Number.parseFloat(stage.stage_budget?.fixed_value) || 0

      if (stageBudget === 0) return // Skip stages with no budget

      mediaTypes.forEach((channelType) => {
        if (stage[channelType] && Array.isArray(stage[channelType])) {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name
            const platformBudget = Number.parseFloat(platform.budget?.fixed_value) || 0

            if (platformBudget === 0) return // Skip platforms with no budget

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

  // Get colors from custom_funnels
  const getFunnelColor = (funnelStage: string): string => {
    const funnel = campaignFormData?.custom_funnels?.find((f: any) => f.name === funnelStage)
    return funnel ? tailwindToHex(funnel.color) : "#6B7280" // Default gray if not found
  }

  // Always extract platforms when campaignFormData changes
  useEffect(() => {
    if (campaignFormData) {
      extractPlatforms(campaignFormData)
    }
  }, [campaignFormData])

  // Calculate total fees amount, defaulting to 0 if not present or invalid
  const totalFeesAmount = useMemo(() => {
    const feesArr = campaignFormData?.campaign_budget?.budget_fees
    if (!Array.isArray(feesArr) || feesArr.length === 0) {
      return 0
    }
    const sum = feesArr.reduce((total, fee) => total + Number(fee.value || 0), 0)
    return isNaN(sum) ? 0 : sum
  }, [campaignFormData])

  // Calculate allocated budget (sum of all stage budgets)
  const allocatedBudget = useMemo(() => {
    return (
      campaignFormData?.channel_mix?.reduce((acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0), 0) ||
      0
    )
  }, [campaignFormData?.channel_mix])

  // Calculate total budget based on budget type and fee structure
  const calculateTotalBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0

    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const totalFees = totalFeesAmount
    const budgetType = campaignFormData?.campaign_budget?.sub_budget_type // gross or net

    if (campaignFormData.campaign_budget.budget_type === "bottom_up") {
      const stageBudgetsSum =
        campaignFormData?.channel_mix?.reduce(
          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
          0,
        ) || 0
      return budgetType === "gross" ? stageBudgetsSum + totalFees : stageBudgetsSum
    } else {
      return budgetType === "gross" ? budgetAmount : budgetAmount
    }
  }

  // Calculate net available budget
  const calculateNetAvailableBudget = () => {
    if (!campaignFormData?.campaign_budget) return 0

    const budgetAmount = Number(campaignFormData?.campaign_budget?.amount) || 0
    const budgetType = campaignFormData?.campaign_budget?.sub_budget_type

    if (campaignFormData.campaign_budget.budget_type === "bottom_up") {
      return (
        campaignFormData?.channel_mix?.reduce(
          (acc, stage) => acc + (Number(stage?.stage_budget?.fixed_value) || 0),
          0,
        ) || 0
      )
    } else {
      return budgetType === "gross" ? Math.max(0, budgetAmount - totalFeesAmount) : budgetAmount
    }
  }

  // Calculate remaining budget
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

  const totalBudget = calculateTotalBudget()

  // Prepare funnel stages for DoughnutChat
  const funnelStages =
    campaignFormData?.channel_mix
      ?.filter((c) => Number(c?.stage_budget?.fixed_value) > 0)
      ?.map((ch) => ch?.funnel_stage) || []

  // Prepare custom funnels for DoughnutChat
  const customFunnels =
    campaignFormData?.custom_funnels?.map((f) => ({
      id: f.id || f.name,
      name: f.name,
      bg: tailwindToHex(f.color),
    })) || []

  // Prepare insideText for DoughnutChat
  const insideText = useMemo(() => {
    const currency = getCurrencySymbol(campaignFormData?.campaign_budget?.currency)
    return `${totalBudget.toLocaleString()} ${currency}`
  }, [totalBudget, campaignFormData?.campaign_budget?.currency])

  // Calculate campaign phases with accurate percentages
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

      <ConfiguredSetPage netAmount={netAmount} />

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
              Total Campaign Budget ({campaignFormData?.campaign_budget?.sub_budget_type === "gross" ? "Gross" : "Net"}):{" "}
              {totalBudget.toLocaleString()}
              {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
            </p>
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
            {totalFeesAmount > 0 && (
              <p className="text-red-600">
                Total Fees: {totalFeesAmount.toLocaleString()}
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
                    {campaignFormData?.campaign_budget?.budget_type === "bottom_up" ? "Total budget" : "Allocated budget"}
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
                      {remainingBudget?.toLocaleString()} {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
                    </h3>
                  </div>
                )}
              </div>
              <>
                <div className="campaign_phases_container mt-[24px] space-x-4">
                  <div className="campaign_phases_container_one">
                    <DoughnutChat insideText={insideText} />
                  </div>
                  <CampaignPhases campaignPhases={campaignPhases} />
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