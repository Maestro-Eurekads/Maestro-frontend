"use client";

import React from "react";
import {
  calculateCompletedView,
  calculateConversion,
  calculateCPC,
  calculateCPCV,
  calculateCPE,
  calculateCPL,
  calculateCPV,
  calculateEngagements,
  calculateImpression,
  calculateLands,
  calculateLinkClicks,
  calculateReach,
  calculateVideoViews,
} from "utils/formula";
import { CellRenderer } from "./cell-renderer";
import { useCampaigns } from "app/utils/CampaignsContext";

export const ChannelRow = ({
  channel,
  index,
  stage,
  tableBody,
  tableHeaders,
  goalLevel,
  expandedRows,
  toggleRow,
  handleEditInfo,
}) => {
  const { campaignFormData } = useCampaigns();

  const chData = campaignFormData?.channel_mix
    ?.find((ch) => ch?.funnel_stage === stage.name)
    [channel?.channel_name]?.find((c) => c?.platform_name === channel?.name);
  // Pre-calculate derived values
  const calculatedValues = {
    impressions: calculateImpression(
      Number(chData["budget"]?.["fixed_value"]),
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
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["video_views"])
    ),
    completed_view: calculateCompletedView(
      Number(chData["kpi"]?.["video_views"]),
      Number(chData["kpi"]?.["completion_rate"])
    ),
    cpcv: calculateCPCV(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["completed_view"])
    ),
    link_clicks: calculateLinkClicks(
      Number(chData["kpi"]?.["impressions"]),
      Number(chData["kpi"]?.["ctr"])
    ),
    cpc: calculateCPC(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["link_clicks"])
    ),
    installs: calculateLands(
      Number(chData["kpi"]?.["link_clicks"]),
      Number(chData["kpi"]?.["install_rate"])
    ),
    cpi: calculateCPL(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["installs"])
    ),
    engagements: calculateEngagements(
      Number(chData["kpi"]?.["impressions"]),
      Number(chData["kpi"]?.["eng_rate"])
    ),
    cpe: calculateCPE(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["engagements"])
    ),
    app_open: calculateLands(
      Number(chData["kpi"]?.["link_clicks"]),
      Number(chData["kpi"]?.["open_rate"])
    ),
    cost__app_open: calculateCPL(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["app_open"])
    ),
    conversion: calculateConversion(
      Number(chData["kpi"]?.["app_open"]),
      Number(chData["kpi"]?.["cvr"])
    ),
    cost__conversion: calculateCPL(
      Number(chData["budget"]?.["fixed_value"]),
      Number(chData["kpi"]?.["conversion"])
    ),
  };

  // Save calculated values to state when dependencies change
  React.useEffect(() => {
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
        ""
      );
    }

    if (!isNaN(calculatedValues.reach) && isFinite(calculatedValues.reach)) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "reach",
        calculatedValues.reach,
        ""
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
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cpv) &&
      isFinite(calculatedValues.cpv)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpv",
        calculatedValues.cpv,
        ""
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
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cpcv) &&
      isFinite(calculatedValues.cpcv)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpcv",
        calculatedValues.cpcv,
        ""
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
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cpc) &&
      isFinite(calculatedValues.cpc)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpc",
        calculatedValues.cpc,
        ""
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
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cpi) &&
      isFinite(calculatedValues.cpi)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpi",
        calculatedValues.cpi,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.engagements) &&
      isFinite(calculatedValues.engagements)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "engagements",
        calculatedValues.engagements,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cpe) &&
      isFinite(calculatedValues.cpe)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cpe",
        calculatedValues.cpe,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.app_open) &&
      isFinite(calculatedValues.app_open)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "app_open",
        calculatedValues.app_open,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cost__app_open) &&
      isFinite(calculatedValues.cost__app_open)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cost__app_open",
        calculatedValues.cost__app_open,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.conversion) &&
      isFinite(calculatedValues.conversion)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "conversion",
        calculatedValues.conversion,
        ""
      );
    }
    if (
      !isNaN(calculatedValues.cost__conversion) &&
      isFinite(calculatedValues.cost__conversion)
    ) {
      handleEditInfo(
        stage.name,
        channel?.channel_name,
        channel?.name,
        "cost__conversion",
        calculatedValues.cost__conversion,
        ""
      );
    }
  }, [
    chData?.kpi?.cpm,
    chData?.kpi?.frequency,
    chData?.kpi?.vtr,
    chData?.kpi?.completion_rate,
    chData?.kpi?.ctr,
    chData?.kpi?.install_rate,
    chData?.kpi?.eng_rate,
    chData?.kpi?.open_rate,
    chData?.kpi?.cvr,
    // We don't include impressions in the dependency array when calculating reach
    // to avoid circular dependencies
  ]);

  return (
    <tr key={index} className="border-t bg-white hover:bg-gray-100">
      {tableBody?.map((body, bodyIndex) => (
        <td key={bodyIndex} className="py-6 px-6 text-[15px]">
          <CellRenderer
            body={body}
            channel={channel}
            calculatedValues={calculatedValues}
            tableHeaders={tableHeaders}
            bodyIndex={bodyIndex}
            goalLevel={goalLevel}
            stage={stage}
            index={index}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            handleEditInfo={handleEditInfo}
          />
        </td>
      ))}
    </tr>
  );
};
