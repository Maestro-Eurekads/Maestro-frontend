"use client";

import {
  calculateCompletedView,
  calculateCPC,
  calculateCPCV,
  calculateCPL,
  calculateCPV,
  calculateImpression,
  calculateLands,
  calculateLinkClicks,
  calculateReach,
  calculateVideoViews,
} from "utils/formula";
import { AdSetCellRenderer } from "./ad-set-cell-renderer";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useEffect } from "react";

export const AdSetRow = ({
  adSet,
  adSetIndex,
  channel,
  stage,
  handleEditInfo,
  tableBody,
  tableHeaders,
}) => {
  const { campaignFormData } = useCampaigns();
  const chData = campaignFormData?.channel_mix
    ?.find((ch) => ch?.funnel_stage === stage.name)
    [channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)
    ?.ad_sets[adSetIndex];
  const calculatedValues = {
    impressions: calculateImpression(
      Number(channel["budget_size"]),
      Number(chData["kpi"]?.["cpm"])
    ),
    reach: calculateReach(
      Number(chData["kpi"]?.["impressions"]),
      Number(chData["kpi"]?.["frequency"])
    ),
    video_views: calculateVideoViews(
      Number(chData["kpi"]?.["impressions"]),
      Number(chData["kpi"]?.["vtr"])
    ),
    cpv: calculateCPV(
      Number(channel["budget_size"]),
      Number(chData["kpi"]?.["video_views"])
    ),
    completed_view: calculateCompletedView(
      Number(chData["kpi"]?.["video_views"]),
      Number(chData["kpi"]?.["completion_rate"])
    ),
    cpcv: calculateCPCV(
      Number(channel["budget_size"]),
      Number(chData["kpi"]?.["completed_view"])
    ),
    link_clicks: calculateLinkClicks(
      Number(chData["kpi"]?.["impressions"]),
      Number(chData["kpi"]?.["ctr"])
    ),
    cpc: calculateCPC(
      Number(channel["budget_size"]),
      Number(chData["kpi"]?.["link_clicks"])
    ),
    installs: calculateLands(
      Number(chData["kpi"]?.["link_clicks"]),
      Number(chData["kpi"]?.["install_rate"])
    ),
    cpi: calculateCPL(
      Number(channel["budget_size"]),
      Number(chData["kpi"]?.["installs"])
    ),
  };

  useEffect(() => {
    // Only save valid calculated values
    if (
      !isNaN(calculatedValues.impressions) &&
      isFinite(calculatedValues.impressions)
    ) {
      console.log("calling here");
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "impressions",
        calculatedValues.impressions,
        adSetIndex
      );
    }

    if (!isNaN(calculatedValues.reach) && isFinite(calculatedValues.reach)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "reach",
        calculatedValues.reach,
        adSetIndex
      );
    }
    if (
      !isNaN(calculatedValues.video_views) &&
      isFinite(calculatedValues.video_views)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "video_views",
        calculatedValues.video_views,
        adSetIndex
      );
    }
    if (!isNaN(calculatedValues.cpv) && isFinite(calculatedValues.cpv)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpv",
        calculatedValues.cpv,
        adSetIndex
      );
    }
    if (
      !isNaN(calculatedValues.completed_view) &&
      isFinite(calculatedValues.completed_view)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "completed_view",
        calculatedValues.completed_view,
        adSetIndex
      );
    }
    if (!isNaN(calculatedValues.cpcv) && isFinite(calculatedValues.cpcv)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpcv",
        calculatedValues.cpcv,
        adSetIndex
      );
    }
    if (
      !isNaN(calculatedValues.link_clicks) &&
      isFinite(calculatedValues.link_clicks)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "link_clicks",
        calculatedValues.link_clicks,
        adSetIndex
      );
    }
    if (!isNaN(calculatedValues.cpc) && isFinite(calculatedValues.cpc)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpc",
        calculatedValues.cpc,
        adSetIndex
      );
    }
    if (
      !isNaN(calculatedValues.installs) &&
      isFinite(calculatedValues.installs)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "installs",
        calculatedValues.installs,
        adSetIndex
      );
    }
    if (!isNaN(calculatedValues.cpi) && isFinite(calculatedValues.cpi)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpi",
        calculatedValues.cpi,
        adSetIndex
      );
    }
  }, [
    chData?.kpi?.cpm,
    chData?.kpi?.frequency,
    chData?.kpi?.vtr,
    chData?.kpi?.completion_rate,
    chData?.kpi?.ctr,
    chData?.kpi?.install_rate,
    // We don't include impressions in the dependency array when calculating reach
    // to avoid circular dependencies
  ]);
  return (
    <tr key={`${stage.name}${adSetIndex}`} className="bg-white">
      {tableBody?.map((body, bodyIndex) => (
        <td key={bodyIndex} className="py-6 px-6 border-none">
          <AdSetCellRenderer
            body={body}
            channel={channel}
            calculatedValues={calculatedValues}
            tableHeaders={tableHeaders}
            bodyIndex={bodyIndex}
            stage={stage}
            adSetIndex={adSetIndex}
            adSet={adSet}
            handleEditInfo={handleEditInfo}
          />
        </td>
      ))}
    </tr>
  );
};
