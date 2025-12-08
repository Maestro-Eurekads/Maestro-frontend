"use client"

import { useCampaigns } from "app/utils/CampaignsContext"
import { getCurrencySymbol } from "components/data"
import { Ban } from "lucide-react"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"

// Types for better readability and maintainability
type CellType = "percent" | "currency" | "seconds" | "number"

interface CellRendererProps {
  body: string
  channel: any
  calculatedValues: Record<string, any>
  tableHeaders: any[]
  bodyIndex: number
  goalLevel: string
  stage: { name: string }
  index: number
  expandedRows: Record<string, boolean>
  toggleRow: (id: string) => void
  handleEditInfo: (
    stageName: string,
    channelName: string,
    platformName: string,
    field: string,
    value: string,
    field2: string,
    value2: string,
  ) => void
  nrColumns: string[]
  nrCells: Record<string, Record<string, boolean>>
  toggleNRCell: (stageName: string, channelName: string, field: string) => void
  hasOfflineChannel: boolean
}

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
  hasOfflineChannel,
}: CellRendererProps) => {
  const { campaignFormData } = useCampaigns()

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
  ]

  // Calculated fields that use special rendering
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

  // State for input handling
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { setKpiChanged } = useCampaigns()

  // Cell type flags
  const isNR = nrCells[channel?.name]?.[body]
  const cellType = tableHeaders[bodyIndex]?.type as CellType
  const isPercentType = cellType === "percent"
  const isCurrencyType = cellType === "currency"
  const isSecondsType = cellType === "seconds"
  const isCPM = body === "cpm"
  const isFrequency = body === "frequency"
  const showInput = tableHeaders[bodyIndex]?.showInput

  // Helper functions
  const formatNumber = (num: number | string, field?: string): string => {
    if (isNaN(Number(num)) || num === null || num === undefined) return "-"
    return new Intl.NumberFormat("en-US").format(Number(num))
  }

  const getCalculatedValue = (key: string): string => {
    const value = calculatedValues[key]
    return isNaN(value) || !isFinite(value) ? "-" : (cellType !== "number") ? Number.parseFloat(value).toFixed(2) : Number.parseFloat(value).toFixed(0)
  }

  const getRawValue = (): string => {
    const rawValue =
      body === "budget_size"
        ? campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.budget?.fixed_value || ""
        : campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.kpi?.[body] || ""

    return rawValue.toString()
  }

  const formatValueByType = (value: any, type: CellType): string => {
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
    } else if (isFrequency) {
      // For Frequency, preserve decimal places (1 max)
      return formatNumber(Number.parseFloat(numericValue.toFixed(1)))
    } else {
      if (body !== "reach" && body !== "video_views" && body !== "impressions") {
        // For other fields, round to whole numbers
        return formatNumber(Math.floor(numericValue).toFixed(0))
      }
    }

    return formatNumber(Math.floor(numericValue))
  }

  // Validate input based on cell type
  const validateInput = (value: string): boolean => {
    // Always allow empty input
    if (value === "") return true

    // Remove formatting characters for validation
    const cleanValue = value.replace(/[,$%]/g, "").replace(/secs?/g, "")

    if (isFrequency) {
      // Frequency: Allow up to 1 decimal places
      const regex = /^[0-9]*\.?[0-9]{0,1}$/
      return regex.test(cleanValue)
    }

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
    if (isPercentType || isCurrencyType || isCPM || isFrequency) {
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
    setKpiChanged(true);
    if (value === "") {
      handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, "", "", "")
      return
    }

    // Format value based on cell type
    const formattedValue = formatValueForSave(value)

    // Validate it's a valid number
    if (formattedValue && !isNaN(Number(formattedValue))) {
      handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, formattedValue, "", "")
    } else if (formattedValue === "") {
      handleEditInfo(stage.name, channel?.channel_name, channel?.name, body, "", "", "")
    }
  }

  // Debounced validation and save function
  const debouncedSave = useCallback(
    debounce((value: string) => {
      validateAndSave(value)
      setIsTyping(false)
    }, 600),
    [stage.name, channel?.channel_name, channel?.name, body],
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

  // RENDER FUNCTIONS FOR DIFFERENT CELL TYPES

  // Channel cell rendering
  if (body === "channel") {
    return (
      <div className="flex items-center gap-5 w-fit max-w-[150px] pr-6">
        <span
          className={`flex items-center gap-2 cursor-pointer ${nrColumns?.includes(body) ? "text-gray-400" : ""}`}
          onClick={() =>
            goalLevel === "Adset level" && channel?.ad_sets?.length > 0 && toggleRow(`${stage.name}${index}`)
          }
          style={{ color: channel?.color }}
        >
          {goalLevel === "Adset level" && channel?.ad_sets?.length > 0 && (
            <span className="shrink-0">
              <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.38021 6.66667L8.71354 10L12.0469 6.66667 6.66667"
                  stroke="#061237"
                  strokeOpacity="0.8"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform={expandedRows[`${stage.name}${index}`] ? "rotate(180 8.5 8)" : ""}
                />
              </svg>
            </span>
          )}
          <span className="relative w-[16px] h-[16px] shrink-0">
            <Image src={channel.icon || "/placeholder.svg"} fill alt={`${channel.name} Icon`} />
          </span>
          <span>{channel.name}</span>
        </span>
      </div>
    )
  }

  // Skip rendering for certain conditions
  if (
    (goalLevel === "Channel level" && body === "audience_size") ||
    (goalLevel === "Adset level" && body === "audience_size") ||
    body === "audience" ||
    (body === "grp" && !hasOfflineChannel)
  ) {
    return ""
  }

  // Handle calculated fields
  if (calculatedFields.includes(body)) {
    return (
      <div
        className="flex justify- items-center gap-5 w-fit max-w-[150px] group"
        onClick={() => toggleNRCell(stage.name, channel?.name, body)}
      >
        {isNR ? (
          <p className="text-gray-300 font-semibold">NR</p>
        ) : (
          <p>
            {(() => {
              const value =
                campaignFormData?.goal_level === "Adset level" ? formatNumber(channel?.kpi?.[body]) : formatNumber(getCalculatedValue(body))
              return value && value !== "-"
                ? `${isCurrencyType
                  ? `${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}`
                  : isSecondsType
                    ? "secs"
                    : ""
                }${(body == "reach" || body == "video_views" || body == "impressions") ? value : value}`
                : "-"
            })()}
          </p>
        )}
        <Ban size={10} className="hidden group-hover:block shrink-0 cursor-pointer" />
      </div>
    )
  }

  // Handle input fields and static values
  if (!showInput) {
    const value = goalLevel === "Channel level" ? channel?.[body] : cellType === "number" ? channel?.kpi?.[body] ? formatNumber(channel?.kpi?.[body], body) : "" : (channel?.kpi?.[body])
    if (exemptFields.includes(body)) {
      return value === "Invalid date" ? "-" : value
    }
    return value === "Invalid date" ? (
      "-"
    ) : (
      <div className="flex justify-center items-center gap-5 w-fit">
        <p>{cellType === "number" ? value : formatNumber(Number.parseFloat(value)?.toFixed(2))}</p>
        <Ban size={10} className="hidden group-hover:block shrink-0 cursor-pointer" />
      </div>
    )
  }

  // Editable input cell
  return (
    <div className="flex items-center gap-2 group">
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
          disabled={isNR}
          className={`bg-slate-100 hover:bg-white border-none outline-none max-w-[90px] p-1 ${isNR ? "text-gray-400" : ""}`}
        // placeholder={body === "budget_size" ? "BUDGET" : body ? body?.toUpperCase() : "Insert value"}
        />
      )}
      <Ban
        size={10}
        className="hidden group-hover:block shrink-0 cursor-pointer"
        onClick={() => toggleNRCell(stage.name, channel?.name, body)}
      />
    </div>
  )
}
