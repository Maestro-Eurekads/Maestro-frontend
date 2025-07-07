"use client"

import { useState } from "react"
import FiltersDropdowns from "./FiltersDropdowns"
import DoughnutChat from "../../../components/DoughnutChat"
import CampaignPhases from "../../creation/components/CampaignPhases"
import { useCampaigns } from "../../utils/CampaignsContext"
import TableLoader from "../../creation/components/TableLoader"
import { processCampaignData } from "components/processCampaignData"
import ChannelDistributionChatTwo from "components/ChannelDistribution/ChannelDistributionChatTwo"
import { getCurrencySymbol, mediaTypes, platformIcons } from "components/data"
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
  max,
  min,
  parseISO,
} from "date-fns"
import { useDateRange } from "src/date-context"
import Range from "app/creation/components/atoms/date-range/dashboard-date-range"
import TimelineContainer from "app/creation/components/atoms/date-interval/TimelineContainer"
import DashboradDoughnutChat from "components/DashboradDoughnutChat"

const Dashboard = () => {
  const [channels, setChannels] = useState<IChannel[]>([])
  const { campaignFormData, clientCampaignData, loading } = useCampaigns()
  const { range } = useDateRange()

  // Types for platforms and channels
  type IPlatform = {
    name: string
    icon: any
    style?: string
    mediaOptions?: any[]
    isExpanded?: boolean
  }
  type IChannel = {
    title: string
    platforms: IPlatform[]
    style?: string
  }

  const startDates = clientCampaignData
    ?.filter((c) => c?.campaign_timeline_start_date)
    ?.map((ch) => ch?.campaign_timeline_start_date !== null && parseISO(ch?.campaign_timeline_start_date))
  const endDates = clientCampaignData
    ?.filter((c) => c?.campaign_timeline_end_date)
    ?.map((ch) => ch?.campaign_timeline_end_date !== null && parseISO(ch?.campaign_timeline_end_date))

  // Find the earliest startDate and latest endDate
  const earliestStartDate = min(startDates)
  const latestEndDate = max(endDates)
  // Calculate the week difference
  const dayDifference = differenceInCalendarDays(latestEndDate, earliestStartDate)
  const weekDifference = differenceInCalendarWeeks(latestEndDate, earliestStartDate)
  // const monthDifference = differenceInCalendarMonths(latestEndDate, earliestStartDate)
  const daysDiff = differenceInDays(latestEndDate, earliestStartDate);
  const monthDifference = daysDiff / 30.44;

  const funnelsData = clientCampaignData?.map((ch) => {
    const start = ch?.campaign_timeline_start_date ? parseISO(ch.campaign_timeline_start_date) : null
    const end = ch?.campaign_timeline_end_date ? parseISO(ch.campaign_timeline_end_date) : null

    // Calculate positions for different time ranges
    const startDay = differenceInCalendarDays(start, earliestStartDate) + 1
    const endDay = differenceInCalendarDays(end, earliestStartDate) + 1

    const startWeek = differenceInCalendarWeeks(start, earliestStartDate) + 1
    const endWeek = differenceInCalendarWeeks(end, earliestStartDate) + 1

    const startMonth = differenceInCalendarMonths(start, earliestStartDate) + 1
    const endMonth = differenceInCalendarMonths(end, earliestStartDate) + 1

    const funnels = ch?.funnel_stages
    return {
      startDay,
      endDay,
      startWeek,
      endWeek,
      startMonth,
      endMonth,
      label: ch?.media_plan_details?.plan_name,
      stages: ch?.channel_mix?.map((d) => ({
        name: d?.funnel_stage,
        budget: `${ch?.campaign_budget?.amount} ${getCurrencySymbol(ch?.campaign_budget?.currency)}`
      })),
      budget: `${ch?.campaign_budget?.amount} ${getCurrencySymbol(ch?.campaign_budget?.currency)}`,
    }
  })

  const processedCampaigns = processCampaignData(clientCampaignData, platformIcons)

  function extractPlatforms(data) {
    const platforms = []
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage
        const stageBudget = Number.parseFloat(stage.stage_budget?.fixed_value)
        mediaTypes.forEach((channelType) => {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name
            const platformBudget = Number.parseFloat(platform.budget?.fixed_value || 0)
            const percentage = (platformBudget / stageBudget) * 100 || 0
            const existingPlatform = platforms.find((p) => p.platform_name === platformName)
            if (existingPlatform) {
              existingPlatform.stages_it_was_found.push({
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
    return platforms
  }

  // Helper to get funnel color by stage name
  function getFunnelColor(stage: string) {
    if (stage === "Awareness") return "#3175FF"
    if (stage === "Consideration") return "#00A36C"
    if (stage === "Conversion") return "#FF9037"
    return "#F05406"
  }

  // Helper to get funnel stages for DoughnutChat
  function getActiveFunnels(campaign) {
    // If you want to support custom funnels, you can add logic here
    // For now, use channel_mix as the source of funnel stages
    return campaign?.channel_mix?.map((ch) => ({
      id: ch?.funnel_stage,
      name: ch?.funnel_stage,
      bg: getFunnelColor(ch?.funnel_stage),
    })) || []
  }

  // Helper to get data values for DoughnutChat
  function getStagePercentages(campaign) {
    return campaign?.channel_mix?.map((ch) =>
      Number(ch?.stage_budget?.percentage_value || 0)
    ) || []
  }
  // const dataValues = funnelStages.length > 0
  //   ? campaignFormData?.channel_mix?.map((st: any) => st?.stage_budget?.percentage_value || 0)
  //   : [100];

  return (
    <div className="mt-[24px] ">
      <div className="flex items-center gap-3 px-[72px] flex-wrap ">
        <FiltersDropdowns router={undefined} />
      </div>
      <div className="flex justify-end mb-4 mr-8">
        <Range />
      </div>
      <div className=" mt-[20px] w-full">{loading ? <TableLoader isLoading={loading} /> : ""}</div>
      <TimelineContainer
        range={range}
        dayDifference={dayDifference}
        weekDifference={weekDifference}
        monthDifference={Math.round(monthDifference)}
        funnelsData={funnelsData}
      />
      {processedCampaigns?.map((campaign, index) => {
        const channelD = extractPlatforms(campaign)

        // Prepare insideText for DoughnutChat
        const insideText = `${campaign?.campaign_budget?.amount || 0} ${campaign?.campaign_budget?.currency ? getCurrencySymbol(campaign?.campaign_budget?.currency) : ""}`
        // Prepare activeFunnels for DoughnutChat
        const activeFunnels = getActiveFunnels(campaign)

        // Prepare data values for DoughnutChat
        const dataValues = getStagePercentages(campaign)
        console.log("dataValues---:", campaign)
        console.log("campaignFormData---:", campaignFormData)
        // console.log("clientCampaignData---:", clientCampaignData)
        return (
          // <div key={index}
          //   className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 mt-[100px] w-full px-6 md:px-20 xl:px-40"
          // >
          //   <div className="box-border flex flex-row items-start p-6 gap-[72px]   h-[500px] bg-[#F9FAFB] rounded-lg">
          //     <div className="flex flex-col">
          //       <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
          //         Your budget by phase for {campaign?.media_plan_details?.plan_name}
          //       </h3>
          //       <div className="flex items-center gap-5">
          //         <div className="mt-[16px]">
          //           <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
          //             Total budget
          //           </p>

          //           <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
          //             {campaign?.campaign_budget?.amount} {campaign?.campaign_budget?.currency}
          //           </h3>
          //         </div>
          //         <div className="mt-[16px]">
          //           <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
          //             Campaign phases
          //           </p>

          //           <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
          //             {campaign?.channel_mix?.length} phases
          //           </h3>
          //         </div>
          //       </div>

          //       <div className="flex items-center gap-6 mt-[24px] w-full">
          //         {/* Doughnut Chat */}
          //         <DashboradDoughnutChat
          //           campaign={campaign}
          //           // data={campaign?.channel_mix?.map((ch) =>
          //           //   Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
          //           // )}
          //           // color={campaign?.channel_mix?.map((ch) =>
          //           //   ch?.funnel_stage === "Awareness"
          //           //     ? "#3175FF"
          //           //     : ch?.funnel_stage === "Consideration"
          //           //       ? "#00A36C"
          //           //       : ch?.funnel_stage === "Conversion"
          //           //         ? "#FF9037"
          //           //         : "#F05406",
          //           // )}
          //           insideText={`${campaign?.campaign_budget?.amount || 0} ${campaign?.campaign_budget?.currency ? getCurrencySymbol(campaign?.campaign_budget?.currency) : ""
          //             }`}
          //         // insideText={`${parseInt(campaignFormData?.campaign_budget?.amount && campaignFormData?.campaign_budget?.amount).toLocaleString() ?? 0} ${getCurrencySymbol(campaignFormData?.campaign_budget?.currency ?? '')}`}
          //         />
          //         {/* Campaign Phases */}
          //         <CampaignPhases
          //           campaignPhases={campaign?.channel_mix?.map((ch) => ({
          //             name: ch?.funnel_stage,
          //             percentage: Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
          //             color: getFunnelColor(ch?.funnel_stage),
          //           }))}
          //         />
          //       </div>
          //     </div>
          //   </div>

          //   <div className="flex flex-col w-[100%]  ">
          //     <div
          //       key={index}
          //       className="box-border flex flex-col items-start p-6 gap-[5px]  min-h-[545px] bg-[#F9FAFB] rounded-lg w-full"
          //     >
          //       <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
          //         Your budget by channel
          //       </h3>
          //       <div className="mt-[16px]">
          //         <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
          //           Channels
          //         </p>
          //         <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
          //           {channelD?.length} channels
          //         </h3>
          //       </div>
          //       <ChannelDistributionChatTwo
          //         channelData={channelD}
          //         currency={getCurrencySymbol(campaign?.campaign_budget?.currency)}
          //       />
          //     </div>
          //   </div>
          // </div>
          <div
            key={index}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-12 mt-[60px] w-full px-4 md:px-10 xl:px-20"
          >
            {/* Left Card: Budget by Phase */}
            <div className="bg-[#F9FAFB] rounded-lg p-6 flex flex-col gap-6">
              <h3 className="font-semibold text-[18px] leading-[24px] text-[#061237]">
                Your budget by phase for {campaign?.media_plan_details?.plan_name}
              </h3>

              <div className="flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="font-medium text-[15px] text-[rgba(6,18,55,0.8)]">Total budget</p>
                  <h3 className="font-semibold text-[20px] text-[#061237]">
                    {campaign?.campaign_budget?.amount} {campaign?.campaign_budget?.currency}
                  </h3>
                </div>
                <div>
                  <p className="font-medium text-[15px] text-[rgba(6,18,55,0.8)]">Campaign phases</p>
                  <h3 className="font-semibold text-[20px] text-[#061237]">
                    {campaign?.channel_mix?.length} phases
                  </h3>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-center gap-6 w-full mt-2">
                {/* Doughnut Chart */}
                <DashboradDoughnutChat
                  campaign={campaign}
                  insideText={insideText}
                  dataValues={dataValues}
                />
                {/* Campaign Phases */}
                <CampaignPhases
                  campaignPhases={campaign?.channel_mix?.map((ch) => ({
                    name: ch?.funnel_stage,
                    percentage: Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
                    color: getFunnelColor(ch?.funnel_stage),
                  }))}
                />
              </div>
            </div>

            {/* Right Card: Budget by Channel */}
            <div className="bg-[#F9FAFB] rounded-lg p-6 flex flex-col gap-4 min-h-[545px]">
              <h3 className="font-semibold text-[18px] text-[#061237]">
                Your budget by channel
              </h3>

              <div>
                <p className="font-medium text-[15px] text-[rgba(6,18,55,0.8)]">Channels</p>
                <h3 className="font-semibold text-[20px] text-[#061237]">
                  {channelD?.length} channels
                </h3>
              </div>

              <ChannelDistributionChatTwo
                channelData={channelD}
                currency={getCurrencySymbol(campaign?.campaign_budget?.currency)}
              />
            </div>
          </div>

        )
      })}
    </div>
  )
}

export default Dashboard
