"use client";

import { useMemo } from "react";
import FiltersDropdowns from "./FiltersDropdowns";
import { useCampaigns } from "../../utils/CampaignsContext";
import TableLoader from "../../creation/components/TableLoader";
import { getCurrencySymbol, mediaTypes } from "components/data";
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  max,
  min,
  parseISO,
} from "date-fns";
import { useDateRange } from "src/date-context";
import Range from "app/creation/components/atoms/date-range/dashboard-date-range";
import TimelineContainer from "app/creation/components/atoms/date-interval/TimelineContainer";
import BudgetOverviewCard, {
  CampaignPhase,
} from "../../creation/components/BudgetOverviewCard";

const Dashboard = () => {
  const { clientCampaignData, loading } = useCampaigns();
  const { range } = useDateRange();

  const startDates = clientCampaignData
    ?.filter((c) => c?.campaign_timeline_start_date)
    ?.map(
      (ch) =>
        ch?.campaign_timeline_start_date !== null &&
        parseISO(ch?.campaign_timeline_start_date)
    );
  const endDates = clientCampaignData
    ?.filter((c) => c?.campaign_timeline_end_date)
    ?.map(
      (ch) =>
        ch?.campaign_timeline_end_date !== null &&
        parseISO(ch?.campaign_timeline_end_date)
    );

  const earliestStartDate = min(startDates);
  const latestEndDate = max(endDates);

  const dayDifference = differenceInCalendarDays(
    latestEndDate,
    earliestStartDate
  );

  const weekDifference = differenceInCalendarWeeks(
    latestEndDate,
    earliestStartDate
  );
  const monthDifference = differenceInCalendarMonths(
    latestEndDate,
    earliestStartDate
  );
  const yearDifference = differenceInCalendarYears(
    latestEndDate,
    earliestStartDate
  );

  const funnelsData = clientCampaignData
    ?.filter(
      (cc) => cc?.campaign_timeline_start_date && cc?.campaign_timeline_end_date
    )
    ?.map((ch) => {
      const start = ch?.campaign_timeline_start_date
        ? parseISO(ch.campaign_timeline_start_date)
        : null;
      const end = ch?.campaign_timeline_end_date
        ? parseISO(ch.campaign_timeline_end_date)
        : null;

      const startDay = differenceInCalendarDays(start, earliestStartDate) + 1;
      const endDay = differenceInCalendarDays(end, earliestStartDate) + 1;

      const startWeek = differenceInCalendarWeeks(start, earliestStartDate) + 1;
      const endWeek = differenceInCalendarWeeks(end, earliestStartDate) + 1;

      const startMonth =
        differenceInCalendarMonths(start, earliestStartDate) + 1;
      const endMonth = differenceInCalendarMonths(end, earliestStartDate) + 1;

      return {
        startDay,
        endDay,
        startWeek,
        endWeek,
        startMonth,
        endMonth,
        startDate: ch?.campaign_timeline_start_date,
        endDate: ch?.campaign_timeline_end_date,
        label: ch?.media_plan_details?.plan_name,
        campaignData: ch,
        stages: ch?.channel_mix?.map((d) => {
          const start = d?.funnel_stage_timeline_start_date
            ? parseISO(d.funnel_stage_timeline_start_date)
            : null;
          const end = d?.funnel_stage_timeline_end_date
            ? parseISO(d.funnel_stage_timeline_end_date)
            : null;
          const startDay =
            differenceInCalendarDays(start, earliestStartDate) + 1;
          const endDay = differenceInCalendarDays(end, earliestStartDate) + 1;

          const startWeek =
            differenceInCalendarWeeks(start, earliestStartDate) + 1;
          const endWeek = differenceInCalendarWeeks(end, earliestStartDate) + 1;

          const startMonth =
            differenceInCalendarMonths(start, earliestStartDate) + 1;
          const endMonth =
            differenceInCalendarMonths(end, earliestStartDate) + 1;
          return {
            startDate: start,
            endDate: end,
            name: d?.funnel_stage,
            budget: `${ch?.campaign_budget?.amount} ${getCurrencySymbol(
              ch?.campaign_budget?.currency
            )}`,
            startDay,
            endDay,
            startWeek,
            endWeek,
            startMonth,
            endMonth,
          };
        }),
        budget: `${ch?.campaign_budget?.amount} ${getCurrencySymbol(
          ch?.campaign_budget?.currency
        )}`,
      };
    });
  // Helper to get funnel color by stage name
  function getFunnelColor(stage: string) {
    if (stage === "Awareness") return "#3175FF";
    if (stage === "Consideration") return "#00A36C";
    if (stage === "Conversion") return "#FF9037";
    return "#F05406";
  }

  // Channel colors for pie chart
  const CHANNEL_COLORS = [
    "#3175FF",
    "#00A36C",
    "#FF6B6B",
    "#FFB347",
    "#9B59B6",
    "#1ABC9C",
    "#E74C3C",
    "#F39C12",
    "#3498DB",
    "#2ECC71",
    "#E91E63",
    "#00BCD4",
    "#FF5722",
    "#607D8B",
    "#795548",
  ];

  const aggregatedBudgetData = useMemo(() => {
    if (!clientCampaignData || clientCampaignData.length === 0) {
      return {
        totalBudget: 0,
        primaryCurrency: "",
        campaignPhases: [],
        phasesCount: 0,
        channelPhases: [],
        channelsCount: 0,
        customFunnels: [],
      };
    }

    let totalBudget = 0;
    let primaryCurrency = "";
    const phaseBudgetMap = new Map<
      string,
      { totalBudget: number; color: string }
    >();
    const channelBudgetMap = new Map<string, number>();
    const uniquePhases = new Set<string>();

    // First, collect all unique stages from all campaigns
    const allStagesSet = new Set<string>();
    clientCampaignData.forEach((campaign) => {
      campaign?.funnel_stages?.forEach((stage) => allStagesSet.add(stage));
      campaign?.channel_mix?.forEach((ch) => {
        if (ch?.funnel_stage) allStagesSet.add(ch.funnel_stage);
      });
    });

    // Initialize all stages with 0 budget
    allStagesSet.forEach((stageName) => {
      if (!phaseBudgetMap.has(stageName)) {
        phaseBudgetMap.set(stageName, {
          totalBudget: 0,
          color: getFunnelColor(stageName),
        });
        uniquePhases.add(stageName);
      }
    });

    clientCampaignData.forEach((campaign) => {
      // Sum budgets
      const budgetAmount = parseFloat(campaign?.campaign_budget?.amount || 0);
      if (budgetAmount > 0) {
        totalBudget += budgetAmount;
        if (!primaryCurrency && campaign?.campaign_budget?.currency) {
          primaryCurrency = campaign?.campaign_budget?.currency;
        }
      }

      // Aggregate phases by summing platform budgets within each stage
      campaign?.channel_mix?.forEach((ch) => {
        const stageName = ch?.funnel_stage;
        if (stageName) {
          uniquePhases.add(stageName);

          // Calculate stage budget by summing all platform budgets in this stage
          let stageBudget = 0;

          // Sum budgets from all platform types in this stage
          mediaTypes.forEach((channelType) => {
            ch[channelType]?.forEach((platform) => {
              const platformBudget = parseFloat(
                platform?.budget?.fixed_value ||
                  (platform?.budget?.percentage_value && budgetAmount > 0
                    ? (parseFloat(platform.budget.percentage_value) / 100) *
                      budgetAmount
                    : 0) ||
                  0
              );
              stageBudget += platformBudget;

              // Aggregate by actual platform name (e.g., Facebook, Twitter)
              const platformName = platform?.platform_name;
              if (platformName && platformBudget > 0) {
                const existingBudget = channelBudgetMap.get(platformName) || 0;
                channelBudgetMap.set(
                  platformName,
                  existingBudget + platformBudget
                );
              }
            });
          });

          const existing = phaseBudgetMap.get(stageName);
          if (existing) {
            existing.totalBudget += stageBudget;
          } else {
            phaseBudgetMap.set(stageName, {
              totalBudget: stageBudget,
              color: getFunnelColor(stageName),
            });
          }
        }
      });
    });

    // Convert phase map to array and calculate percentages based on total budget
    const phasesWithPercentages = Array.from(phaseBudgetMap.entries())
      .map(([name, data]) => {
        const rawPercentage =
          totalBudget > 0 ? (data.totalBudget / totalBudget) * 100 : 0;
        return {
          name,
          percentage: rawPercentage,
          color: data.color,
          totalBudget: data.totalBudget,
        };
      })
      .sort((a, b) => b.totalBudget - a.totalBudget);

    // Round percentages and adjust the largest one to ensure sum is 100%
    const roundedPhases = phasesWithPercentages.map((phase) => ({
      ...phase,
      percentage: Math.round(phase.percentage).toString(),
    }));

    const sumOfRounded = roundedPhases.reduce(
      (sum, p) => sum + parseFloat(p.percentage),
      0
    );
    const difference = 100 - sumOfRounded;

    if (difference !== 0 && roundedPhases.length > 0) {
      const currentPercentage = parseFloat(roundedPhases[0].percentage);
      roundedPhases[0].percentage = (currentPercentage + difference).toString();
    }

    const aggregatedPhases: CampaignPhase[] = roundedPhases.map(
      ({ totalBudget, ...phase }) => phase
    );

    const totalChannelBudget = Array.from(channelBudgetMap.values()).reduce(
      (sum, budget) => sum + budget,
      0
    );

    const channelsWithPercentages = Array.from(channelBudgetMap.entries())
      .map(([name, budget], index) => {
        const rawPercentage =
          totalChannelBudget > 0 ? (budget / totalChannelBudget) * 100 : 0;
        return {
          name,
          percentage: rawPercentage,
          color: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
          budget,
        };
      })
      .sort((a, b) => b.budget - a.budget);

    const roundedChannels = channelsWithPercentages.map((ch) => ({
      ...ch,
      percentage: Math.round(ch.percentage).toString(),
    }));

    const channelSumRounded = roundedChannels.reduce(
      (sum, p) => sum + parseFloat(p.percentage),
      0
    );
    const channelDiff = 100 - channelSumRounded;
    if (channelDiff !== 0 && roundedChannels.length > 0) {
      const curr = parseFloat(roundedChannels[0].percentage);
      roundedChannels[0].percentage = (curr + channelDiff).toString();
    }

    const channelPhases: CampaignPhase[] = roundedChannels.map(
      ({ budget, ...ch }) => ch
    );

    // Collect custom_funnels from all campaigns (use first campaign's as primary)
    const customFunnels =
      clientCampaignData.find((c) => c?.custom_funnels?.length > 0)
        ?.custom_funnels || [];

    return {
      totalBudget,
      primaryCurrency,
      campaignPhases: aggregatedPhases,
      phasesCount: uniquePhases.size,
      channelPhases,
      channelsCount: channelBudgetMap.size,
      customFunnels,
    };
  }, [clientCampaignData]);

  return (
    <div className="mt-[24px] ">
      <div className="flex items-center gap-3 px-[72px] flex-wrap ">
        <FiltersDropdowns router={undefined} />
      </div>
      <div className="flex justify-end mb-4 mr-8">
        <Range />
      </div>
      <div className=" mt-[20px] w-full">
        {loading ? <TableLoader isLoading={loading} /> : ""}
      </div>
      <TimelineContainer
        range={range}
        dayDifference={dayDifference}
        weekDifference={weekDifference}
        monthDifference={Math.round(monthDifference)}
        yearDifference={yearDifference}
        funnelsData={funnelsData}
        startDate={earliestStartDate}
        endDate={latestEndDate}
      />

      {/* Commented out individual campaign cards - now using aggregated overview */}
      {/* {processedCampaigns?.map((campaign, index) => {
        const channelD = extractPlatforms(campaign)

        // Prepare insideText for DoughnutChat
        const insideText = `${campaign?.campaign_budget?.amount || 0} ${campaign?.campaign_budget?.currency ? getCurrencySymbol(campaign?.campaign_budget?.currency) : ""}`
        // Prepare activeFunnels for DoughnutChat
        const activeFunnels = getActiveFunnels(campaign)

        // Prepare data values for DoughnutChat
        const dataValues = getStagePercentages(campaign)
        // console.log("dataValues---:", campaign)
        // console.log("campaignFormData---:", campaignFormData)
        // console.log("clientCampaignData---:", clientCampaignData)
        return (
          <div
            key={index}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-12 mt-[60px] w-full px-4 md:px-10 xl:px-20"
          >
            {/* Left Card: Budget by Phase */}
      {/* <div className="bg-[#F9FAFB] rounded-lg p-6 flex flex-col gap-6">
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
      {/* <DashboradDoughnutChat
                  campaign={campaign}
                  insideText={insideText}
                  dataValues={dataValues}
                />
                {/* Campaign Phases */}
      {/* <CampaignPhases
                  campaignPhases={campaign?.channel_mix?.map((ch) => ({
                    name: ch?.funnel_stage,
                    percentage: Number(ch?.stage_budget?.percentage_value || 0)?.toFixed(0),
                    color: getFunnelColor(ch?.funnel_stage),
                  }))}
                />
              </div>
            </div>

            {/* Right Card: Budget by Channel */}
      {/* <div className="bg-[#F9FAFB] rounded-lg p-6 flex flex-col gap-4 min-h-[545px]">
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

      {/* Aggregated Budget Overview Card */}
      {aggregatedBudgetData.totalBudget > 0 && (
        <div className="w-full px-4 md:px-10 xl:px-20 mt-[60px]">
          <BudgetOverviewCard
            totalBudget={aggregatedBudgetData.totalBudget}
            currency={aggregatedBudgetData.primaryCurrency}
            campaignPhases={aggregatedBudgetData.campaignPhases}
            phasesCount={aggregatedBudgetData.phasesCount}
            channelPhases={aggregatedBudgetData.channelPhases}
            channelsCount={aggregatedBudgetData.channelsCount}
            customFunnels={aggregatedBudgetData.customFunnels}
            budgetByPhaseTitle="Your budget by campaign phase (All Campaigns)"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
