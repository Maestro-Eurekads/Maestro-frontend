"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { Ban } from "lucide-react";
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
  nrAdCells,
  toggleNRAdCell,
}) => {
  const { campaignFormData } = useCampaigns();

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

  const isNR = nrAdCells[`${channel?.name}-${adSetIndex}`]?.[body];

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

  // Handle channel cell with icon and name
  if (body === "channel") {
    return (
      <div className="flex gap-2 indent-[10px]">
        <div className="l-shape-container">
          <div className="l-vertical"></div>
          <div className="l-horizontal"></div>
        </div>
      </div>
    );
  }
  if (body === "adsets") {
    return (
      <div className="flex gap-2 ">
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {adSetIndex + 1}.
        </span>*/}
        <span>{adSet?.name ? adSet?.name : "-"}</span> 
      </div>
    );
  }

  if (body === "audience") {
    return (
      <div className="flex gap-2 ">
        <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {1}.
        </span>
        {!adSet?.audience_type ? "-" : adSet?.audience_type}
      </div>
    );
  }

  if (body === "audience_size") {
    return !adSet?.size ? "-" : adSet?.size;
  }

  // if (body === "budget_size") {
  //   return adSet?.budget?.fixed_value === null || adSet?.budget?.fixed_value === undefined ? "-" : adSet?.budget?.fixed_value;
  // }

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
        onClick={() =>
          toggleNRAdCell(stage.name, `${channel?.name}-${adSetIndex}`, body)
        }
      >
        {isNR ? (
          <p className="text-gray-300 font-semibold">NR</p>
        ) : (
          <p>{getCalculatedValue(body)}</p>
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
      )?.ad_sets[adSetIndex]?.budget?.fixed_value || ""
  : 
    campaignFormData?.channel_mix
      ?.find((ch) => ch?.funnel_stage === stage.name)
      [channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)
      ?.ad_sets[adSetIndex]?.kpi?.[body] || "";

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
    <div className="flex  items-center gap-2 group">
      {isNR ? (
        <p className="text-gray-300 font-semibold">NR</p>
      ) : (
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
                adSetIndex,
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
              adSetIndex,
              ""
            );
          }}
          disabled={isNR}
          className={`cpm-bg border-none outline-none max-w-[90px] p-1 ${
            isNR ? "text-gray-400" : ""
          }`}
          placeholder={body ? body?.toUpperCase() : "Insert value"}
        />
      )}
      <Ban
        size={10}
        className="hidden group-hover:block shrink-0 cursor-pointer"
        onClick={() =>
          toggleNRAdCell(stage.name, `${channel?.name}-${adSetIndex}`, body)
        }
      />
    </div>
  );
};
