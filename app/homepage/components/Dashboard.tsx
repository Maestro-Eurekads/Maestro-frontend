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
  ];
  const toPercentages = (
    budgetMap: Map<string, { budget: number; color: string }>,
    total: number
  ): CampaignPhase[] => {
    const items = Array.from(budgetMap.entries())
      .map(([name, { budget, color }]) => ({
        name,
        percentage: total > 0 ? Math.round((budget / total) * 100) : 0,
        color,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Adjust first item to ensure sum = 100%
    const sum = items.reduce((s, i) => s + i.percentage, 0);
    if (items.length > 0 && sum !== 100) {
      items[0].percentage += 100 - sum;
    }

    return items.map((i) => ({ ...i, percentage: i.percentage.toString() }));
  };

  const aggregatedBudgetData = useMemo(() => {
    if (!clientCampaignData?.length) {
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

    const phaseBudgets = new Map<string, { budget: number; color: string }>();
    const channelBudgets = new Map<string, { budget: number; color: string }>();
    let totalBudget = 0;
    let primaryCurrency = "";
    let colorIndex = 0;

    clientCampaignData.forEach((campaign) => {
      totalBudget += parseFloat(campaign?.campaign_budget?.amount || 0);
      if (!primaryCurrency) {
        primaryCurrency = campaign?.campaign_budget?.currency || "";
      }

      campaign?.channel_mix?.forEach((stage) => {
        const phaseName = stage?.funnel_stage;
        if (!phaseName) return;

        mediaTypes.forEach((type) => {
          stage[type]?.forEach((platform) => {
            const budget = parseFloat(platform?.budget?.fixed_value || 0);
            if (budget <= 0) return;

            // Aggregate by phase
            const existing = phaseBudgets.get(phaseName);
            phaseBudgets.set(phaseName, {
              budget: (existing?.budget || 0) + budget,
              color: existing?.color || getFunnelColor(phaseName),
            });

            // Aggregate by platform
            const platformName = platform?.platform_name;
            if (platformName) {
              const existingChannel = channelBudgets.get(platformName);
              if (!existingChannel) {
                channelBudgets.set(platformName, {
                  budget,
                  color: CHANNEL_COLORS[colorIndex++ % CHANNEL_COLORS.length],
                });
              } else {
                existingChannel.budget += budget;
              }
            }
          });
        });
      });
    });

    const customFunnels =
      clientCampaignData.find((c) => c?.custom_funnels?.length)
        ?.custom_funnels || [];

    return {
      totalBudget,
      primaryCurrency,
      campaignPhases: toPercentages(phaseBudgets, totalBudget),
      phasesCount: phaseBudgets.size,
      channelPhases: toPercentages(channelBudgets, totalBudget),
      channelsCount: channelBudgets.size,
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
