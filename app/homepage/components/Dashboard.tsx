"use client"

import { useEffect, useState } from "react"
import FiltersDropdowns from "./FiltersDropdowns"
import HighlightViewDropdowns from "./HighlightViewDropdowns"
import DoughnutChat from "../../../components/DoughnutChat"
import WeekInterval from "../../creation/components/atoms/date-interval/WeekInterval"
import WeekTimeline from "../../creation/components/atoms/date-interval/WeekTimeline"
import CampaignPhases from "../../creation/components/CampaignPhases"
import { useCampaigns } from "../../utils/CampaignsContext"
import { parseApiDate } from "../../../components/Options"
import TableLoader from "../../creation/components/TableLoader"
// import { useDateRange } from "../../../src/date-range-context"
import { processCampaignData } from "components/processCampaignData"
import ChannelDistributionChatTwo from "components/ChannelDistribution/ChannelDistributionChatTwo"
import { getCurrencySymbol, getPlatformIcon, platformIcons } from "components/data"
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  max,
  min,
  parseISO,
} from "date-fns"
import DayInterval from "../../creation/components/atoms/date-interval/DayInterval"
import DayTimeline from "../../creation/components/atoms/date-interval/DayTimeline"
import MonthInterval from "../../creation/components/atoms/date-interval/MonthInterval"
import MonthTimeline from "../../creation/components/atoms/date-interval/MonthTimeline"
import { useDateRange } from "src/date-context"
import Range from "app/creation/components/atoms/date-range/dashboard-date-range"
import TimelineContainer from "app/creation/components/atoms/date-interval/TimelineContainer"

const Dashboard = () => {
  const [selected, setSelected] = useState([])
  const weeksCount = 14 // Dynamic count
  const [channels, setChannels] = useState<IChannel[]>([])
  const { updateCampaign, campaignData, getActiveCampaign, campaignFormData } = useCampaigns()
  const { range } = useDateRange()
  const { clientCampaignData, loading } = useCampaigns()
  const [channelData, setChannelData] = useState(null)
  // const [show, setShow] = useState(false);
  // const [open, setOpen] = useState(false);
  // const funnelsData = [
  // 	{ startWeek: 3, endWeek: 10, label: "Campaign 1" },
  // 	{ startWeek: 4, endWeek: 7, label: "Campaign 2" },
  // 	// { startWeek: 4, endWeek: 7, label: "Campaign 2" },
  // ];

  const currencySymbols: Record<string, string> = {
    "Euro (EUR)": "€",
    "US Dollar (USD)": "$",
    "British Pound (GBP)": "£",
    "Nigerian Naira (NGN)": "₦",
    "Japanese Yen (JPY)": "¥",
    "Canadian Dollar (CAD)": "C$",
  }

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

  const mapCampaignsToFunnels = (campaigns: any[]) => {
    useEffect(() => {
      if (clientCampaignData?.channel_mix) {
        const newChannels = clientCampaignData?.funnel_stages
          .flatMap((stageName) => {
            const stage = clientCampaignData?.channel_mix.find((chan) => chan.funnel_stage === stageName)
            if (!stage) return null

            return [
              {
                title: "Social media",
                platforms: stage?.social_media?.map((platform) => ({
                  name: platform?.platform_name,
                  icon: getPlatformIcon(platform?.platform_name),
                })),
                style: "max-w-[150px] w-full h-[52px]",
              },
              {
                title: "Display Networks",
                platforms: stage?.display_networks?.map((platform) => ({
                  name: platform?.platform_name,
                  icon: getPlatformIcon(platform?.platform_name),
                })),
                style: "max-w-[200px] w-full",
              },
              {
                title: "Search Engines",
                platforms: stage.search_engines?.map((platform) => ({
                  name: platform?.platform_name,
                  icon: getPlatformIcon(platform?.platform_name),
                })),
                style: "max-w-[180px] w-full",
              },
            ]
          })
          .filter(Boolean) // Flatten array and remove null values

        // **Fix: Prevent re-render loop**
        if (JSON.stringify(channels) !== JSON.stringify(newChannels)) {
          setChannels(newChannels)
        }
      }
    }, [campaignFormData])

    return campaigns?.map((campaign, index) => {
      const fromDate = parseApiDate(campaign?.campaign_timeline_start_date)
      const toDate = parseApiDate(campaign?.campaign_timeline_end_date)

      const budgetDetails = campaign?.budget_details
      const currencySymbol = currencySymbols[budgetDetails?.currency] || ""
      const budgetValue = budgetDetails?.value ? `${budgetDetails.value} ${currencySymbol}` : "N/A"

      return {
        startWeek: fromDate?.day ?? 0, // Default to 0 if null
        endWeek: toDate?.day ?? 0,
        label: `Campaign ${index + 1}`,
        budget: budgetValue,
      }
    })
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
  console.log("🚀 ~ Dashboard ~ dayDifference:", dayDifference)

  const weekDifference = differenceInCalendarWeeks(latestEndDate, earliestStartDate)

  const monthDifference = differenceInCalendarMonths(latestEndDate, earliestStartDate)

  const funnelsData = clientCampaignData?.map((ch) => {
    const start = ch?.campaign_timeline_start_date ? parseISO(ch.campaign_timeline_start_date) : null
    const end = ch?.campaign_timeline_end_date ? parseISO(ch.campaign_timeline_end_date) : null

    // Calculate positions for different time ranges
    const startDay = differenceInCalendarDays(start, earliestStartDate) + 1
    const endDay = differenceInCalendarDays(end, earliestStartDate) + 1

    console.log("🚀 ~ Dashboard ~ funnelDtaa:", ch?.media_plan_details?.plan_name, startDay, endDay)

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
        budget: d?.stage_budget?.fixed_value,
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
        ;["search_engines", "display_networks", "social_media"].forEach((channelType) => {
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

  return (
    <div className="mt-[24px] ">
      <div className="flex items-center gap-3 px-[72px] flex-wrap ">
        <FiltersDropdowns />
        <div className="w-[24px] h-0 border border-[rgba(0,0,0,0.1)] rotate-90 self-center " />
        <HighlightViewDropdowns />
      </div>
      <div className=" mt-[20px] w-full">{loading ? <TableLoader isLoading={loading} /> : ""}</div>
      <div className="flex justify-end mb-4 mr-8">
        <Range />
      </div>
      {/* <div className="box-border w-full min-h-[519px] bg-white border-b-2">
        {range === "Day" ? (
          <>
            <DayInterval daysCount={dayDifference} />
            <DayTimeline daysCount={dayDifference} funnels={funnelsData} />
          </>
        ) : range === "Month" ? (
          <>
            <MonthInterval monthsCount={monthDifference} />
            <MonthTimeline monthsCount={monthDifference} funnels={funnelsData} />
          </>
        ) : (
          <>
            <WeekInterval weeksCount={weekDifference} />
            <WeekTimeline weeksCount={weekDifference} funnels={funnelsData} />
          </>
        )}
      </div> */}
       <TimelineContainer
        range={range}
        dayDifference={dayDifference}
        weekDifference={weekDifference}
        monthDifference={monthDifference}
        funnelsData={funnelsData}
      />
      {processedCampaigns?.map((campaign, index) => {
        const channelD = extractPlatforms(campaign)

        return (
          <div key={index} className="flex justify-center gap-[48px] mt-[100px]">
            <div className="box-border flex flex-row items-start p-6 gap-[72px] w-[493px] h-[403px] bg-[#F9FAFB] rounded-lg">
              <div className="flex flex-col">
                <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                  Your budget by phase for {campaign?.media_plan_details?.plan_name}
                </h3>
                <div className="flex items-center gap-5">
                  <div className="mt-[16px]">
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Total budget
                    </p>

                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                      {campaign?.campaign_budget?.amount} {campaign?.campaign_budget?.currency}
                    </h3>
                  </div>
                  <div className="mt-[16px]">
                    <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                      Campaign phases
                    </p>

                    <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                      {campaign?.channel_mix?.length} phases
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-[24px] w-full">
                  {/* Doughnut Chat */}
                  <DoughnutChat
                    data={campaign?.channel_mix?.map((ch) =>
                      Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
                    )}
                    color={campaign?.channel_mix?.map((ch) =>
                      ch?.funnel_stage === "Awareness"
                        ? "#3175FF"
                        : ch?.funnel_stage === "Consideration"
                          ? "#00A36C"
                          : ch?.funnel_stage === "Conversion"
                            ? "#FF9037"
                            : "#F05406",
                    )}
                    insideText={`${campaign?.campaign_budget?.amount || 0} ${
                      campaign?.campaign_budget?.currency ? getCurrencySymbol(campaign?.campaign_budget?.currency) : ""
                    }`}
                  />
                  {/* Campaign Phases */}
                  <CampaignPhases
                    campaignPhases={campaign?.channel_mix?.map((ch) => ({
                      name: ch?.funnel_stage,
                      percentage: Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
                      color:
                        ch?.funnel_stage === "Awareness"
                          ? "#3175FF"
                          : ch?.funnel_stage === "Consideration"
                            ? "#00A36C"
                            : ch?.funnel_stage === "Conversion"
                              ? "#FF9037"
                              : "#F05406",
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div
                key={index}
                className="box-border flex flex-col items-start p-6 gap-[5px] w-[493px] min-h-[545px] bg-[#F9FAFB] rounded-lg"
              >
                <h3 className="font-semibold text-[18px] leading-[24px] flex items-center text-[#061237]">
                  Your budget by channel
                </h3>
                <div className="mt-[16px]">
                  <p className="font-medium text-[15px] leading-[20px] flex items-center text-[rgba(6,18,55,0.8)]">
                    Channels
                  </p>
                  <h3 className="font-semibold text-[20px] leading-[27px] flex items-center text-[#061237]">
                    {channelD?.length} channels
                  </h3>
                </div>

                <ChannelDistributionChatTwo
                  channelData={channelD}
                  currency={getCurrencySymbol(campaign?.campaign_budget?.currency)}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Dashboard
