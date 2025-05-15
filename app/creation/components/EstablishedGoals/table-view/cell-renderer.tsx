"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getCurrencySymbol } from "components/data";
import { Ban } from "lucide-react";
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
  nrColumns,
  nrCells,
  toggleNRCell,
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
    "adsets",
  ];

  const isNR = nrCells[channel?.name]?.[body];

  const formatValueByType = (value, type) => {
    if (value === null || value === undefined || value === "" || isNaN(value))
      return "-";

    const numValue = Number.parseFloat(value);

    switch (type) {
      case "percent":
        return `${numValue.toFixed(2)}%`;
      case "currency":
        return `${numValue.toFixed(2)}`;
      case "seconds":
        return `${numValue.toFixed(2)}s`;
      case "number":
      default:
        return numValue.toFixed(2);
    }
  };
  const isPercentType = tableHeaders[bodyIndex]?.type === "percent";
  const isCurrencyType = tableHeaders[bodyIndex]?.type === "currency";
  const isSecondsType = tableHeaders[bodyIndex]?.type === "seconds";
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
    return num?.toLocaleString();
  };

  // Channel cell rendering
  if (body === "channel") {
    return (
      <div className="flex items-center gap-5 w-fit pr-6">
        <span
          className={`flex items-center gap-2 cursor-pointer ${
            nrColumns?.includes(body) ? "text-gray-400" : ""
          }`}
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
                  transform={
                    expandedRows[`${stage.name}${index}`]
                      ? "rotate(180 8.5 8)"
                      : ""
                  }
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
        {/* <Ban
          size={10}
          className="hidden group-hover:block shrink-0 cursor-pointer"
        /> */}
      </div>
    );
  }

  if (body === "audience") {
    return "";
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
    return (
      <div
        className="flex justify-center items-center gap-5 w-fit group"
        onClick={() => toggleNRCell(stage.name, channel?.name, body)}
      >
        {isNR ? (
          <p className="text-gray-300 font-semibold">NR</p>
        ) : (
          <p>
            {(() => {
              const value =
                campaignFormData?.goal_level === "Adset level"
                  ? channel?.kpi?.[body]
                  : getCalculatedValue(body);
              // console.log("sdd", {body, value})
              return value && value !== "-"
                ? `${isCurrencyType ? `${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}` : isSecondsType ? "secs" : ""}${formatNumber(
                    Number(value)
                  )}`
                : "-";
            })()}
          </p>
        )}
        <Ban
          size={10}
          className="hidden group-hover:block shrink-0 cursor-pointer"
        />
      </div>
    );
  }

  // Handle input fields and static values
  const showInput = tableHeaders[bodyIndex]?.showInput;
  if (!showInput) {
    const value = channel?.[body];
    if (exemptFields.includes(body)) {
      return value === "Invalid date" ? "-" : value;
    }
    return value === "Invalid date" ? (
      "-"
    ) : (
      <div className="flex justify-center items-center gap-5 w-fit">
        <p>{formatNumber(parseFloat(value)?.toFixed(2))}</p>
        <Ban
          size={10}
          className="hidden group-hover:block shrink-0 cursor-pointer"
        />
      </div>
    );
  }

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
  // if (isPercentType && displayValue) {
  //   // If it's a number (already converted to decimal), convert back to percentage for display
  //   if (
  //     !isNaN(Number.parseFloat(displayValue)) &&
  //     !displayValue.toString().includes("%")
  //   ) {
  //     // Check if it's likely a decimal value (less than 1)
  //     if (Number.parseFloat(displayValue) < 1) {
  //       displayValue = `${(Number.parseFloat(displayValue) * 100).toFixed(2)}%`;
  //     } else {
  //       // It's already a percentage value (like 10, 20, etc.)
  //       displayValue = `${displayValue}%`;
  //     }
  //   } else if (!displayValue.toString().includes("%")) {
  //     // It's a string without % - add it
  //     displayValue = `${displayValue}%`;
  //   }
  // }
  if (displayValue && !isNaN(Number.parseFloat(displayValue))) {
    if (isPercentType) {
      // If it's a number (already converted to decimal), convert back to percentage for display
      if (!displayValue.toString().includes("%")) {
        // Check if it's likely a decimal value (less than 1)
        if (Number.parseFloat(displayValue) < 1) {
          displayValue = `${(Number.parseFloat(displayValue) * 100).toFixed(
            1
          )}%`;
        } else {
          // It's already a percentage value (like 10, 20, etc.)
          displayValue = `${Number.parseFloat(displayValue).toFixed(1)}%`;
        }
      }
    } else if (isCurrencyType) {
      // Format as currency
      if (!displayValue.toString().includes(`${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}`)) {
        displayValue = `${Number.parseFloat(displayValue).toFixed(2)}`;
      }
    } else if (isSecondsType) {
      // Format as seconds
      if (!displayValue.toString().includes("secs")) {
        displayValue = `${Number.parseFloat(displayValue).toFixed(0)}secs`;
      }
    } else {
      // Format as regular number
      displayValue = Number.parseFloat(displayValue).toFixed(0);
    }
  }

  return (
    <div className="flex  items-center gap-2 group">
      {isNR ? (
        <p className="text-gray-300 font-semibold">NR</p>
      ) : (
        <input
          value={displayValue}
          onChange={(e) => {
            let newValue = e.target.value;

            // Allow appropriate characters based on input type
            if (isPercentType) {
              // Allow numbers, decimal point, and %
              newValue = newValue.replace(/[^0-9.%]/g, "");
              // Remove % if present for storage
              const valueToStore = newValue.replace(/%/g, "");
              handleEditInfo(
                stage.name,
                channel?.channel_name,
                channel?.name,
                body,
                valueToStore,
                "",
                ""
              );
            } else if (isCurrencyType) {
              // Allow numbers, decimal point, and $
              newValue = newValue.replace(/[^0-9.$]/g, "");
              // Remove $ if present for storage
              const valueToStore = newValue.replace(/\$/g, "");
              handleEditInfo(
                stage.name,
                channel?.channel_name,
                channel?.name,
                body,
                valueToStore,
                "",
                ""
              );
            } else if (isSecondsType) {
              // Allow numbers, decimal point, and s
              newValue = newValue.replace(/[^0-9.s]/g, "");
              // Remove s if present for storage
              const valueToStore = newValue.replace(/s/g, "");
              handleEditInfo(
                stage.name,
                channel?.channel_name,
                channel?.name,
                body,
                valueToStore,
                "",
                ""
              );
            } else {
              // For regular numbers, allow only numbers and decimal point
              newValue = newValue.replace(/[^0-9.]/g, "");
              handleEditInfo(
                stage.name,
                channel?.channel_name,
                channel?.name,
                body,
                newValue,
                "",
                ""
              );
            }
          }}
          disabled={isNR || goalLevel === "Adset level"}
          className={`cpm-bg border-none outline-none max-w-[90px] p-1 ${
            isNR ? "text-gray-400" : ""
          }`}
          placeholder={body ? body?.toUpperCase() : "Insert value"}
        />
      )}
      <Ban
        size={10}
        className="hidden group-hover:block shrink-0 cursor-pointer"
        onClick={() => toggleNRCell(stage.name, channel?.name, body)}
      />
    </div>
  );
};
