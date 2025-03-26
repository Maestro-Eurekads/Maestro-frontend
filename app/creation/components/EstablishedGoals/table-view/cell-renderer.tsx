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

  // Handle input fields and static values
  const showInput = tableHeaders[bodyIndex]?.showInput;

  if (!showInput) {
    return channel?.[body] === "Invalid date" ? "-" : channel?.[body];
  }

  return (
    <input
      value={
        channel?.[body] ||
        campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          [channel?.channelName]?.find(
            (c) => c?.platform_name === channel?.name
          )?.kpi?.[body] ||
        ""
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
      placeholder={body.toUpperCase()}
    />
  );
};
