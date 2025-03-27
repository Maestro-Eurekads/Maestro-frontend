"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import Image from "next/image";

export const AdSetCellRenderer = ({
  body,
  channel,
  calculatedValues,
  tableHeaders,
  bodyIndex,
  stage,
  adSetIndex,
  adSet,
  handleEditInfo,
}) => {
  const { campaignFormData } = useCampaigns();
  // Handle channel cell with icon and name
  if (body === "channel") {
    return (
      <div className="flex gap-2">
        <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {adSetIndex + 1}.
        </span>
        <span>{adSet?.name ? adSet?.name : "-"}</span>
      </div>
    );
  }

  if (body === "audience") {
    return !adSet?.audience_type ? "-" : adSet?.audience_type;
  }

  if (body === "audience_size") {
    return !adSet?.size ? "-" : adSet?.size;
  }

  // Handle calculated fields
  if (body === "impressions") {
    const value = calculatedValues.impressions;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "reach") {
    const value = calculatedValues.reach;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "video_views") {
    const value = calculatedValues.video_views;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "cpv") {
    const value = calculatedValues.cpv;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "completed_view") {
    const value = calculatedValues.completed_view;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "cpcv") {
    const value = calculatedValues.cpcv;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "link_clicks") {
    const value = calculatedValues.link_clicks;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "cpc") {
    const value = calculatedValues.cpc;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "installs") {
    const value = calculatedValues.installs;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "cpi") {
    const value = calculatedValues.cpi;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  // Handle input fields and static values
  const showInput = tableHeaders[bodyIndex]?.showInput;

  if (!showInput) {
    return channel?.[body] === "Invalid date" ? "-" : channel?.[body];
  }

  return (
    <input
      value={
        campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          [channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.ad_sets[adSetIndex]?.kpi?.[body] || ""
      }
      onChange={(e) =>
        handleEditInfo(
          stage.name,
          channel?.channel_name,
          channel?.name,
          body,
          e.target.value,
          adSetIndex
        )
      }
      className="cpm-bg border-none outline-none w-[100px] p-1"
      placeholder={body ? body?.toUpperCase() : "Insert value"}
    />
  );
};
