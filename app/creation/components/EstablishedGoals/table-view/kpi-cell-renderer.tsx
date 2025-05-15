"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import Image from "next/image";

export const KPICellRenderer = ({
  body,
  channel,
  calculatedValues,
  tableHeaders,
  bodyIndex,
  // goalLevel,
  stage,
  // index,
  // expandedRows,
  // toggleRow,
  handleEditInfo,
  adSetIndex,
  adSet,
  extraAdSetindex,
  nrAdCells,
  toggleNRAdCell,
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

  if (body === "channel") {
    return (
      <div className="flex gap-2">
        <div className="l-shape-container-ad">
          <div className="l-vertical-ad" style={{left: "80px", top:"-72px"}}></div>
          <div className="l-horizontal-ad" style={{left: "80px", bottom:"-5px"}}></div>
        </div>
      </div>
    );
  }
  if (body === "adsets") {
    return (
      <div className="flex gap-2 indent-[]">
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {adSetIndex + 1}.
        </span> */}
        <span>{adSet ? adSet?.name : "-"}</span>
      </div>
    );
  }
  if (body === "audience") {
    return (
      <div className="flex gap-2">
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {extraAdSetindex + 2}.
        </span> */}
        <span>{adSet ? adSet?.audience_type : "-"}</span>
      </div>
    );
  }
  if (body === "audience_size") {
    return (
      <div className="flex gap-2">
        <span>{adSet ? adSet?.size : "-"}</span>
      </div>
    );
  }

  // Handle calculated fields
  const calculatedFields = [
    "impressions",
    "reach",
    "video_views",
    "cpv",
    "cpc",
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

  // if (calculatedFields.includes(body)) {
  //   return getCalculatedValue(body);
  // }
  if (calculatedFields.includes(body)) {
    return "";
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
          )?.ad_sets[adSetIndex]?.extra_audiences[extraAdSetindex]?.budget
          ?.fixed_value || ""
      : campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.ad_sets[adSetIndex]?.extra_audiences[extraAdSetindex].kpi?.[
          body
        ] || "";

  // Format display value for percentage fields - keep the raw input value for UI
  let displayValue = kpiValue;
  // console.log({ kpi: body, value: kpiValue });
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

  // return (
  //   <input
  //     value={displayValue}
  //     onChange={(e) => {
  //       let newValue = e.target.value;

  //       // Allow only valid characters: numbers, '.', ',', ':', and '%'
  //       newValue = newValue.replace(/[^0-9.,:%]/g, "");

  //       // Handle percentage input
  //       if (isPercentType) {
  //         // Remove % if present
  //         newValue = newValue.replace(/%/g, "");
  //         newValue = (parseFloat(newValue) / 100).toString();
  //         // Store the raw percentage value (not converted to decimal)
  //         handleEditInfo(
  //           stage.name,
  //           channel?.channel_name,
  //           channel?.name,
  //           body,
  //           newValue,
  //           adSetIndex,
  //           extraAdSetindex
  //         );
  //         return;
  //       }

  //       // Handle non-percentage input normally
  //       handleEditInfo(
  //         stage.name,
  //         channel?.channel_name,
  //         channel?.name,
  //         body,
  //         newValue,
  //         adSetIndex,
  //         extraAdSetindex
  //       );
  //     }}
  //     className="cpm-bg border-none outline-none w-[100px] p-1"
  //     placeholder={body ? body?.toUpperCase() : "Insert value"}
  //   />
  // );
};
