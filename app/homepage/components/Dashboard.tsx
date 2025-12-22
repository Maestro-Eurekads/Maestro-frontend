"use client";

import { useMemo, useState, useEffect } from "react";
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
  const { range, setRange } = useDateRange();
  const stringifiedClientCampaignData = JSON.stringify(clientCampaignData);

  const visibleCampaigns = useMemo(() => {
    return (
      clientCampaignData?.filter(
        (c) => c?.campaign_timeline_start_date && c?.campaign_timeline_end_date
      ) || []
    );
  }, [stringifiedClientCampaignData]);

  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (visibleCampaigns.length) {
      const allIds = new Set<number>();
      visibleCampaigns.forEach((c) => allIds.add(c.id));
      setSelectedPlanIds(allIds);
    }
  }, [stringifiedClientCampaignData]);

  const togglePlanSelection = (id: number) => {
    setSelectedPlanIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPlanIds(new Set(visibleCampaigns.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedPlanIds(new Set());
  };

  const allSelected =
    visibleCampaigns.length > 0 &&
    selectedPlanIds.size === visibleCampaigns.length;

  const { earliestStartDate, latestEndDate } = useMemo(() => {
    const startDates = clientCampaignData
      ?.filter((c) => c?.campaign_timeline_start_date)
      ?.map((ch) => parseISO(ch.campaign_timeline_start_date));
    const endDates = clientCampaignData
      ?.filter((c) => c?.campaign_timeline_end_date)
      ?.map((ch) => parseISO(ch.campaign_timeline_end_date));
    return {
      earliestStartDate: min(startDates),
      latestEndDate: max(endDates),
    };
  }, [stringifiedClientCampaignData]);

  const dayDifference = useMemo(
    () => differenceInCalendarDays(latestEndDate, earliestStartDate),
    [latestEndDate, earliestStartDate]
  );
  const weekDifference = useMemo(
    () => differenceInCalendarWeeks(latestEndDate, earliestStartDate),
    [latestEndDate, earliestStartDate]
  );
  const monthDifference = useMemo(
    () => differenceInCalendarMonths(latestEndDate, earliestStartDate),
    [latestEndDate, earliestStartDate]
  );
  const yearDifference = useMemo(
    () => differenceInCalendarYears(latestEndDate, earliestStartDate),
    [latestEndDate, earliestStartDate]
  );

  useEffect(() => {
    if (!earliestStartDate || !latestEndDate) return;
    const viewPortWidth = window.innerWidth;
    if (dayDifference <= 10) {
    } else if (dayDifference <= 22) {
      setRange("Week");
    } else if (
      dayDifference <= 80 &&
      viewPortWidth > ((dayDifference / 7) * 100)
    ) {
      setRange("Month");
    } else {
      setRange("Year");
    }
  }, [earliestStartDate, latestEndDate, dayDifference]);

  const funnelsData = visibleCampaigns?.map((ch) => {
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

    const startMonth = differenceInCalendarMonths(start, earliestStartDate) + 1;
    const endMonth = differenceInCalendarMonths(end, earliestStartDate) + 1;

    return {
      id: ch.id,
      isSelected: selectedPlanIds.has(ch.id),
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
        const startDay = differenceInCalendarDays(start, earliestStartDate) + 1;
        const endDay = differenceInCalendarDays(end, earliestStartDate) + 1;

        const startWeek =
          differenceInCalendarWeeks(start, earliestStartDate) + 1;
        const endWeek = differenceInCalendarWeeks(end, earliestStartDate) + 1;

        const startMonth =
          differenceInCalendarMonths(start, earliestStartDate) + 1;
        const endMonth = differenceInCalendarMonths(end, earliestStartDate) + 1;
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
    const selectedCampaigns = visibleCampaigns.filter((c) =>
      selectedPlanIds.has(c.id)
    );

    if (!selectedCampaigns?.length) {
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

    selectedCampaigns.forEach((campaign) => {
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
      selectedCampaigns.find((c) => c?.custom_funnels?.length)
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
  }, [clientCampaignData, selectedPlanIds]);

  const selectedCount = selectedPlanIds.size;
  const totalCount = visibleCampaigns.length;

  return (
    <div className="mt-[24px] ">
      <div className="flex items-center gap-3 px-[72px] flex-wrap ">
        <FiltersDropdowns router={undefined} />
      </div>
      <div className="flex justify-end gap-5 items-center mb-4 px-4 md:px-10 xl:px-20">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedCount} of {totalCount} media plans selected
          </span>
          <div
            onClick={allSelected ? deselectAll : selectAll}
            className="px-3 cursor-pointer py-2.5 w-28 text-center text-sm font-medium rounded-lg bg-[#3175FF] text-white"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </div>
        </div>
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
        onTogglePlanSelection={togglePlanSelection}
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
