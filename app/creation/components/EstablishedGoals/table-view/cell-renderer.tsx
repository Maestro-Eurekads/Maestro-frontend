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

  // Fields to exempt from toFixed(2) logic
  const exemptFields = [
    "channel",
    "audience",
    "start_date",
    "end_date",
    "audience_size",
    "budget_size",
    "cpm",
    "impressions",
    "frequency",
    "reach",
  ];

  // Helper function to safely get calculated values
  const getCalculatedValue = (key) => {
    const value = calculatedValues[key];

    return isNaN(value) || !isFinite(value)
      ? "-"
      : parseFloat(value).toFixed(2);
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return "-";
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Channel cell rendering
  if (body === "channel") {
    return (
      <span
        className="flex items-center gap-2 cursor-pointer"
        onClick={() =>
          goalLevel === "Adset level" &&
          channel?.ad_sets?.length > 0 &&
          toggleRow(`${stage.name}${index}`)
        }
        style={{ color: channel?.color }}
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
                d="M5.38021 6.66667L8.71354 10L12.0469 6.66667 6.66667"
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
  const calculatedFields = [
    "impressions",
    "reach",
    "video_views",
    "cpv",
    "completed_view",
    "cpcv",
    "link_clicks",
    "cpc",
    "installs",
    "cpi",
    "engagements",
    "cpe",
    "app_open",
    "cost__app_open",
    "conversion",
    "cost__conversion",
    "forms_open",
    "cost__opened_form",
    "leads",
    "cost__lead",
    "lands",
    "cpl",
    "bounced_visits",
    "costbounce",
    "lead_visits",
    "costlead",
    "off_funnel_visits",
    "cost__off_funnel",
    "conversions",
    "costconversion",
    "generated_revenue",
    "return_on_ad_spent",
    "add_to_carts",
    "cpatc",
    "payment_infos",
    "cppi",
    "purchases",
    "cpp",
  ];

  if (calculatedFields.includes(body)) {
    return getCalculatedValue(body);
  }

  // Handle input fields and static values
  const showInput = tableHeaders[bodyIndex]?.showInput;
  if (!showInput) {
    const value = channel?.[body];
    if (exemptFields.includes(body)) {
      return value === "Invalid date" ? "-" : value;
    }
    return value === "Invalid date"
      ? "-"
      : formatNumber(parseFloat(value)?.toFixed(2));
  }

  const isPercentType = tableHeaders[bodyIndex]?.type === "percent";

  // Get the raw value from the form data
  const kpiValue =
    body === "budget_size"
      ? campaignFormData?.channel_mix
      ?.find((ch) => ch?.funnel_stage === stage.name)
      ?.[channel?.channel_name]?.find(
        (c) => c?.platform_name === channel?.name
      )?.budget?.fixed_value || ""
      : campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.kpi?.[body] || "";

  // Format display value for percentage fields - keep the raw input value for UI
  let displayValue = kpiValue;
  if (isPercentType && displayValue) {
    // If it's a number (already converted to decimal), convert back to percentage for display
    if (
      !isNaN(Number.parseFloat(displayValue)) &&
      !displayValue.toString().includes("%")
    ) {
      // Check if it's likely a decimal value (less than 1)
      if (Number.parseFloat(displayValue) < 1) {
        displayValue = `${(Number.parseFloat(displayValue) * 100).toFixed(2)}%`;
      } else {
        // It's already a percentage value (like 10, 20, etc.)
        displayValue = `${displayValue}%`;
      }
    } else if (!displayValue.toString().includes("%")) {
      // It's a string without % - add it
      displayValue = `${displayValue}%`;
    }
  }

  return (
    <input
      value={displayValue}
      onChange={(e) => {
        let newValue = e.target.value;

        // Allow only valid characters: numbers, '.', ',', ':', and '%'
        newValue = newValue.replace(/[^0-9.,:%]/g, "");

        // Handle percentage input
        if (isPercentType) {
          // Remove % if present
          newValue = newValue.replace(/%/g, "");

          // Store the raw percentage value (not converted to decimal)
          handleEditInfo(
            stage.name,
            channel?.channel_name,
            channel?.name,
            body,
            newValue,
            ""
          );
          return;
        }

        // Handle non-percentage input normally
        handleEditInfo(
          stage.name,
          channel?.channel_name,
          channel?.name,
          body,
          newValue,
          ""
        );
      }}
      className="cpm-bg border-none outline-none w-[100px] p-1"
      placeholder={body ? body?.toUpperCase() : "Insert value"}
    />
  );
};
