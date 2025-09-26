"use client";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getCurrencySymbol } from "components/data";
import { Ban } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  hasOfflineChannel,
}) => {
  const { campaignFormData } = useCampaigns();
  type CellType = "percent" | "currency" | "seconds" | "number"

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

    // State for input handling
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

  const isNR = nrAdCells[`${channel?.name}-${adSetIndex}`]?.[body];
  const cellType = tableHeaders[bodyIndex]?.type as CellType
  const isPercentType = tableHeaders[bodyIndex]?.type === "percent";
  const isCurrencyType = tableHeaders[bodyIndex]?.type === "currency";
  const isSecondsType = tableHeaders[bodyIndex]?.type === "seconds";
  const isCPM = body === "cpm"
  const showInput = tableHeaders[bodyIndex]?.showInput

  // Handle channel cell with icon and name
  if (body === "channel") {
    return (
      <div className="flex gap-2 indent-[10px] w-fit max-w-[150px]">
        <div className="l-shape-container-cb">
          <div
            className="l-vertical-ad"
            style={{
              left: "30px",
              height: `${
                adSetIndex < 1
                  ? "50px"
                  : expandedAdsetKPI[`${stage.name}${adSetIndex - 1}`] &&
                    channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length >
                      0
                  ? `${
                      channel?.ad_sets[adSetIndex - 1]?.extra_audiences
                        ?.length > 1
                        ? 215
                        : 155 *
                          channel?.ad_sets[adSetIndex - 1]?.extra_audiences
                            ?.length
                    }px`
                  : "75px"
              }`,
              top: `${
                adSetIndex < 1
                  ? "-50px"
                  : expandedAdsetKPI[`${stage.name}${adSetIndex - 1}`] &&
                    channel?.ad_sets[adSetIndex - 1]?.extra_audiences?.length >
                      0
                  ? `-${
                      channel?.ad_sets[adSetIndex - 1]?.extra_audiences
                        ?.length > 1
                        ? 215
                        : 155 *
                          channel?.ad_sets[adSetIndex - 1]?.extra_audiences
                            ?.length
                    }px`
                  : "-75px"
              }`,
            }}
          ></div>
          <div className="l-horizontal-ad" style={{ left: "30px" }}></div>
        </div>
      </div>
    );
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
                  expandedAdsetKPI[`${stage?.name}${adSetIndex}`]
                    ? "rotate(180 8.5 8)"
                    : ""
                }
              />
            </svg>
          </span>
        )}
      </div>
    );
  }

  if (body === "audience") {
    return (
      <div className="flex gap-2 ">
        {/* <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
          {1}.
        </span> */}
        {!expandedAdsetKPI[`${stage.name}${adSetIndex}`] &&
        adSet?.extra_audiences?.length > 0
          ? ""
          : !adSet?.audience_type
          ? "-"
          : adSet?.audience_type}
      </div>
    );
  }

  if(body === 'start_date'){
    return <p>{channel['start_date']}</p>
  }
  if(body === 'end_date'){
    return <p>{channel['end_date']}</p>
  }

  // if (body === "audience_size" && channel?.ad_sets?.length === 1 && adSet?.extra_audience?.length === 0) {
  //   return !adSet?.size ? "-" : adSet?.size;
  // } else {
  //   ""
  // }

  // if (body === "budget_size") {
  //   return adSet?.budget?.fixed_value === null || adSet?.budget?.fixed_value === undefined ? "-" : adSet?.budget?.fixed_value;
  // }

  if (body === "grp" && !hasOfflineChannel) {
    return "";
  }

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

    const formatNumber = (num: number | string): string => {
      if (isNaN(Number(num)) || num === null || num === undefined) return "-"
      return new Intl.NumberFormat("en-US").format(Number(num))
    }
  
    const getCalculatedValue = (key: string): string => {
      const value = calculatedValues[key]
      return isNaN(value) || !isFinite(value) ? "-" : (cellType !== "number") ? Number.parseFloat(value).toFixed(2) : Number.parseFloat(value).toFixed(0)
    }
  
    const getRawValue = (): string => {
      const rawValue =
      body === "audience_size"
      ? campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.ad_sets[adSetIndex]?.size || ""
      : body === "budget_size"
      ? campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.ad_sets[adSetIndex]?.budget?.fixed_value || ""
      : campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          [channel?.channel_name]?.find(
            (c) => c?.platform_name === channel?.name
          )?.ad_sets[adSetIndex]?.kpi?.[body] || "";
  
      return rawValue.toString()
    }
  
    const formatValueByType = (value: any, type: any): string => {
      if (value === null || value === undefined || value === "" || isNaN(value)) return "-"
  
      const numValue = Number.parseFloat(value)
  
      switch (type) {
        case "percent":
          return `${numValue.toFixed(1)}%` // 1 decimal place for percent
        case "currency":
          return `${numValue.toFixed(2)}` // 2 decimal places for currency
        case "seconds":
          return `${numValue.toFixed(2)}s`
        case "number":
          return numValue.toFixed(0)
        default:
          return numValue.toFixed(0) // No decimal places for other types
      }
    }
  
    // Format display value with commas for better readability
    const formatDisplayValue = (value: string): string => {
      if (!value || isNaN(Number.parseFloat(value.toString().replace(/,/g, "")))) {
        return value
      }
  
      const numericValue = Number.parseFloat(value.toString().replace(/,/g, ""))
  
      if (isPercentType) {
        if (!value.toString().includes("%")) {
          if (numericValue < 1) {
            return `${formatNumber(Number.parseFloat((numericValue * 100).toFixed(1)))}%` // 1 decimal place
          } else {
            return `${formatNumber(Number.parseFloat(numericValue.toFixed(1)))}%` // 1 decimal place
          }
        }
      } else if (isCurrencyType) {
        if (!value.toString().includes(`${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}`)) {
          return `${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}${formatNumber(
            Number.parseFloat(numericValue.toFixed(2)), // 2 decimal places
          )}`
        }
      } else if (isSecondsType) {
        if (!value.toString().includes("secs")) {
          return `${formatNumber(numericValue.toFixed(1))}secs`
        }
      } else if (isCPM) {
        // For CPM, preserve decimal places (2 max)
        return formatNumber(Number.parseFloat(numericValue.toFixed(2)))
      } else {
        // For other fields, round to whole numbers
        if(body !== "reach"  && body !== "video_views") {
          // For other fields, round to whole numbers
          return formatNumber(Math.round(numericValue))
        }
        return formatNumber(Math.round(numericValue))

      }
  
      return value
    }
  
    // Validate input based on cell type
    const validateInput = (value: string): boolean => {
      // Always allow empty input
      if (value === "") return true
  
      // Remove formatting characters for validation
      const cleanValue = value.replace(/[,$%]/g, "").replace(/secs?/g, "")
  
      if (isPercentType || isCurrencyType || isCPM) {
        // For percent, currency, and CPM: allow decimal input with restrictions
        if (isPercentType) {
          // Percent: Allow up to 1 decimal place
          const regex = /^[0-9]*\.?[0-9]{0,1}$/
          return regex.test(cleanValue)
        } else {
          // Currency and CPM: Allow up to 2 decimal places
          const regex = /^[0-9]*\.?[0-9]{0,2}$/
          return regex.test(cleanValue)
        }
      } else {
        // For other types: only allow whole numbers
        const regex = /^[0-9]*$/
        return regex.test(cleanValue)
      }
    }
  
    // Debounce function
    const debounce = (func: Function, wait: number) => {
      let timeout: NodeJS.Timeout
      return function executedFunction(...args: any[]) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
  
    // Format value based on cell type before saving
    const formatValueForSave = (value: string): string => {
      if (value === "") return ""
  
      // Remove formatting characters
      let cleanValue = value.replace(/[,$%]/g, "").replace(/secs?/g, "")
  
      // Handle decimal format based on type
      if (isPercentType || isCurrencyType || isCPM) {
        const parts = cleanValue.split(".")
        if (parts.length > 2) {
          // More than one decimal point - keep only the first one
          cleanValue = parts[0] + "." + parts.slice(1).join("")
        }
  
        // Limit decimal places
        if (parts.length === 2) {
          const decimalPart = parts[1]
          if (isPercentType && decimalPart.length > 1) {
            // Limit percent to 1 decimal place
            cleanValue = parts[0] + "." + decimalPart.substring(0, 1)
          } else if ((isCurrencyType || isCPM) && decimalPart.length > 2) {
            // Limit currency and CPM to 2 decimal places
            cleanValue = parts[0] + "." + decimalPart.substring(0, 2)
          }
        }
      } else {
        // For other types, remove any decimal part
        cleanValue = cleanValue.split(".")[0]
      }
  
      return cleanValue
    }
  
    // Validation and save function
    const validateAndSave = (value: string) => {
      if (value === "") {
        handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, "",
          adSetIndex, "")
        return
      }
  
      // Format value based on cell type
      const formattedValue = formatValueForSave(value)
  
      // Validate it's a valid number
      if (formattedValue && !isNaN(Number(formattedValue))) {
        handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, formattedValue, adSetIndex, "")
      } else if (formattedValue === "") {
        handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, formattedValue, adSetIndex, "")
      }
    }
  
    // Debounced validation and save function
    const debouncedSave = useCallback(
      debounce((value: string) => {
        validateAndSave(value)
        setIsTyping(false)
      }, 600),
      [stage.name, channel?.channel_name, channel?.name, body, adSetIndex],
    )
  
    // Get the raw value from the form data
    const kpiValue = getRawValue()
    const displayValue = formatDisplayValue(kpiValue)
  
    // Initialize input value on mount and update when external data changes
    useEffect(() => {
      if (!isTyping && !isFocused) {
        setInputValue(kpiValue)
      }
    }, [kpiValue, isTyping, isFocused])

  if (calculatedFields.includes(body)) {
    return (
      <div
        className="flex justify-center items-center gap-5 w-fit max-w-[150px] group"
        onClick={() =>
          toggleNRAdCell(stage.name, `${channel?.name}-${adSetIndex}`, body)
        }
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
              return value && value !== "-"
                ? `${
                    isCurrencyType
                      ? `${getCurrencySymbol(
                          campaignFormData?.campaign_budget?.currency
                        )}`
                      : isSecondsType
                      ? "secs"
                      : ""
                  }${(body == "reach" ||  body !== "video_views" || body !== "impressions") ? value : formatNumber(Number(value))}`
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
  
  if (!showInput) {
    const value = channel?.[body];
    if (exemptFields.includes(body)) {
      return value === "Invalid date" ? "-" : value;
    }
    return value === "Invalid date"
      ? "-"
      : formatNumber(Number(Number.parseFloat(value)?.toFixed(2)));
  }


  return (
    <div className="flex  items-center gap-2 group">
      {isNR ? (
        <p className="text-gray-300 font-semibold">NR</p>
      ) : (
        <input
        value={isFocused || isTyping ? inputValue : displayValue}
          onChange={(e) => {
            const newValue = e.target.value

            // Validate input based on cell type
            if (validateInput(newValue)) {
              setInputValue(newValue)
              setIsTyping(true)
              debouncedSave(newValue)
            }
          }}
          onFocus={(e) => {
            setIsFocused(true)
            setIsTyping(true)
            // Set cursor to end of input
            setTimeout(() => {
              e.target.setSelectionRange(e.target.value.length, e.target.value.length)
            }, 0)
          }}
          onBlur={(e) => {
            // Immediate validation on blur
            validateAndSave(e.target.value)
            setIsTyping(false)
            setIsFocused(false)
          }}
          disabled={
            (body === "audience_size" &&
              (channel?.ad_sets?.length > 1 ||
                adSet?.extra_audiences?.length > 0)) || isNR 
          }
          className={`bg-slate-100 hover:bg-white border-none outline-none max-w-[90px] p-1 ${
            isNR ? "text-gray-400" : ""
          }`}
          // placeholder={
          //   body === "budget_size"
          //     ? "BUDGET"
          //     : body
          //     ? body?.toUpperCase()
          //     : "Insert value"
          // }
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
