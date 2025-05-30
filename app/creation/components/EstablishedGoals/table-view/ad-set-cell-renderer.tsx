"use client"
import { useCampaigns } from "app/utils/CampaignsContext"
import { getCurrencySymbol } from "components/data"
import { Ban } from "lucide-react"

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
  expandedAdsetKPI,
  toggleAdSetKPIShow,
}) => {
  const { campaignFormData } = useCampaigns()

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
  ]

  const isNR = nrAdCells[`${channel?.name}-${adSetIndex}`]?.[body]

  const isPercentType = tableHeaders[bodyIndex]?.type === "percent"
  const isCurrencyType = tableHeaders[bodyIndex]?.type === "currency"
  const isSecondsType = tableHeaders[bodyIndex]?.type === "seconds"

  // Helper function to safely get calculated values
  const getCalculatedValue = (key) => {
    const value = calculatedValues[key]

    return isNaN(value) || !isFinite(value) ? "-" : Number.parseFloat(value).toFixed(2)
  }

  // Helper function to format numbers with commas
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "-"
    return new Intl.NumberFormat("en-US").format(num)
  }

  // Handle channel cell with icon and name
  if (body === "channel") {
    return (
      <div className="flex gap-2 indent-[10px]">
        <div className="l-shape-container-cb">
          <div
            className="l-vertical-ad"
            style={{
              left: "30px",
              height: `${
                adSetIndex < 1
                  ? "50px"
                  : expandedAdsetKPI[`${stage.name}${adSetIndex - 1}`] &&
                      channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length > 0
                    ? `${
                        channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length > 1
                          ? 215
                          : 155 * channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length
                      }px`
                    : "75px"
              }`,
              top: `${
                adSetIndex < 1
                  ? "-50px"
                  : expandedAdsetKPI[`${stage.name}${adSetIndex - 1}`] &&
                      channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length > 0
                    ? `-${
                        channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length > 1
                          ? 215
                          : 155 * channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length
                      }px`
                    : "-75px"
              }`,
            }}
          ></div>
          <div className="l-horizontal-ad" style={{ left: "30px" }}></div>
        </div>
      </div>
    )
  }
  if (body === "adsets") {
    return (
      <div
        className="flex gap-2 cursor-pointer items-center"
        onClick={() => toggleAdSetKPIShow(`${stage?.name}${adSetIndex}`)}
      >
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {adSetIndex + 1}.
        </span>*/}
        <span>{adSet?.name ? `Adset ${adSetIndex + 1}` : "-"}</span>
        {adSet?.extra_audiences?.length > 0 && (
          <span className="shrink-0">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.38021 6.66667L8.71354 10L12.0469 6.66667 6.66667"
                stroke="#061237"
                strokeOpacity="0.8"
                strokeWidth="1.33333"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={expandedAdsetKPI[`${stage?.name}${adSetIndex}`] ? "rotate(180 8.5 8)" : ""}
              />
            </svg>
          </span>
        )}
      </div>
    )
  }

  if (body === "audience") {
    return (
      <div className="flex gap-2 ">
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {1}.
        </span> */}
        {!expandedAdsetKPI[`${stage.name}${adSetIndex}`] && adSet?.extra_audiences?.length > 0
          ? ""
          : !adSet?.audience_type
            ? "-"
            : adSet?.audience_type}
      </div>
    )
  }

  // if (body === "audience_size") {
  //   return !adSet?.size ? "-" : adSet?.size;
  // }

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
  ]

  if (calculatedFields.includes(body)) {
    return (
      <div
        className="flex justify-center items-center gap-5 w-fit group"
        onClick={() => toggleNRAdCell(stage.name, `${channel?.name}-${adSetIndex}`, body)}
      >
        {isNR ? (
          <p className="text-gray-300 font-semibold">NR</p>
        ) : (
          <p>
            {(() => {
              const value =
                campaignFormData?.goal_level === "Adset level" ? channel?.kpi?.[body] : getCalculatedValue(body)
              return value && value !== "-"
                ? `${isCurrencyType ? `${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}` : isSecondsType ? "secs" : ""}${formatNumber(
                    Number(value),
                  )}`
                : "-"
            })()}
          </p>
        )}
        <Ban size={10} className="hidden group-hover:block shrink-0 cursor-pointer" />
      </div>
    )
  }

  // Handle input fields and static values
  const showInput = tableHeaders[bodyIndex]?.showInput
  if (!showInput) {
    const value = channel?.[body]
    if (exemptFields.includes(body)) {
      return value === "Invalid date" ? "-" : value
    }
    return value === "Invalid date" ? "-" : formatNumber(Number(Number.parseFloat(value)?.toFixed(2)))
  }

  // Get the raw value from the form data
  const kpiValue =
    body === "audience_size"
      ? campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.ad_sets[adSetIndex]?.size || ""
      : body === "budget_size"
        ? campaignFormData?.channel_mix
            ?.find((ch) => ch?.funnel_stage === stage.name)
            ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.ad_sets[adSetIndex]?.budget
            ?.fixed_value || ""
        : campaignFormData?.channel_mix
            ?.find((ch) => ch?.funnel_stage === stage.name)
            [channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.ad_sets[adSetIndex]?.kpi?.[
            body
          ] || ""

  // Format display value with commas for better readability
  let displayValue = kpiValue
  if (displayValue && !isNaN(Number.parseFloat(displayValue.toString().replace(/,/g, "")))) {
    const numericValue = Number.parseFloat(displayValue.toString().replace(/,/g, ""))

    if (isPercentType) {
      // If it's a number (already converted to decimal), convert back to percentage for display
      if (!displayValue.toString().includes("%")) {
        // Check if it's likely a decimal value (less than 1)
        if (numericValue < 1) {
          displayValue = `${formatNumber(numericValue * 100)}%`
        } else {
          // It's already a percentage value (like 10, 20, etc.)
          displayValue = `${formatNumber(Number.parseFloat(numericValue.toFixed(1)))}%`;
        }
      }
    } else if (isCurrencyType) {
      // Format as currency with commas
      if (!displayValue.toString().includes(`${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}`)) {
        displayValue = `${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}${formatNumber(Number.parseFloat(numericValue.toFixed(2)))}`;
      }
    } else if (isSecondsType) {
      // Format as seconds with commas
      if (!displayValue.toString().includes("secs")) {
        displayValue = `${formatNumber(Number(numericValue.toFixed(1)))}secs`
      }
    } else {
      // Format as regular number with commas
      displayValue = formatNumber(Math.round(numericValue))
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
            let newValue = e.target.value

            if (isPercentType) {
              // Allow numbers, decimal point, commas, and %
              newValue = newValue.replace(/[^0-9.,%]/g, "")
              // Remove % and commas for storage
              const valueToStore = newValue.replace(/[%,]/g, "")
              handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, valueToStore, adSetIndex, "")
            } else if (isCurrencyType) {
              // Allow numbers, decimal point, commas, and $
              newValue = newValue.replace(/[^0-9.$,]/g, "")
              // Remove $ and commas for storage
              const valueToStore = newValue.replace(/[$,]/g, "")
              handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, valueToStore, adSetIndex, "")
            } else if (isSecondsType) {
              // Allow numbers, decimal point, commas, and s
              newValue = newValue.replace(/[^0-9.s,]/g, "")
              // Remove s and commas for storage
              const valueToStore = newValue.replace(/[s,]/g, "")
              handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, valueToStore, adSetIndex, "")
            } else {
              // For regular numbers, allow numbers, decimal point, and commas
              newValue = newValue.replace(/[^0-9.,]/g, "")
              // Remove commas for storage
              const valueToStore = newValue.replace(/,/g, "")
              handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, valueToStore, adSetIndex, "")
            }
          }}
          disabled={isNR}
          className={`cpm-bg border-none outline-none max-w-[90px] p-1 ${isNR ? "text-gray-400" : ""}`}
          placeholder={body === "budget_size" ? "BUDGET" : body ? body?.toUpperCase() : "Insert value"}
        />
      )}
      <Ban
        size={10}
        className="hidden group-hover:block shrink-0 cursor-pointer"
        onClick={() => toggleNRAdCell(stage.name, `${channel?.name}-${adSetIndex}`, body)}
      />
    </div>
  )
}
