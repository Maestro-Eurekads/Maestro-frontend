"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import Image from "next/image";

export const CellRenderer = ({
  body,
  channel,
  calculatedValues,
  tableHeaders,
  bodyIndex,
  goalLevel,
  stage,
  index,
  expandedRows,
  toggleRow,
  handleEditInfo,
}) => {
  const { campaignFormData } = useCampaigns();
  // Handle channel cell with icon and name
  if (body === "channel") {
    return (
      <span
        className="flex items-center gap-2 cursor-pointer"
        onClick={() =>
          goalLevel === "Adset level" &&
          channel?.ad_sets?.length > 0 &&
          toggleRow(`${stage.name}${index}`)
        }
        style={{
          color: channel?.color,
        }}
      >
        {goalLevel === "Adset level" && channel?.ad_sets?.length > 0 && (
          <span className="shrink-0">
            <svg
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
                stroke="#061237"
                strokeOpacity="0.8"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={expandedRows[index] ? "rotate(180 8.5 8)" : ""}
              />
            </svg>
          </span>
        )}
        <span className="relative w-[16px] h-[16px] shrink-0">
          <Image
            src={channel.icon || "/placeholder.svg"}
            fill
            alt={`${channel.name} Icon`}
          />
        </span>
        <span>{channel.name}</span>
      </span>
    );
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

  if (body === "engagements") {
    const value = calculatedValues.engagements;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if (body === "cpe") {
    const value = calculatedValues.cpe;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if(body === "app_open"){
    const value = calculatedValues.app_open;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if(body === "cost__app_open"){
    const value = calculatedValues.cost__app_open;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if(body === "conversion"){
    const value = calculatedValues.conversion;
    return isNaN(value) || !isFinite(value) ? "-" : value;
  }

  if(body === "cost__conversion"){
    const value = calculatedValues.cost__conversion;
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
          )?.kpi?.[body] || ""
      }
      onChange={(e) =>
        handleEditInfo(
          stage.name,
          channel?.channel_name,
          channel?.name,
          body,
          e.target.value,
          ""
        )
      }
      className="cpm-bg border-none outline-none w-[100px] p-1"
      placeholder={body ?body?.toUpperCase() : "Insert value"}
    />
  );
};
