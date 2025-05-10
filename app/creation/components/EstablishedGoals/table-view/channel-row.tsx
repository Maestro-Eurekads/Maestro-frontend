"use client"

import { useEffect } from "react"
import {
  calculateAdReturn,
  calculateBouncedVisits,
  calculateCompletedView,
  calculateConversion,
  calculateCostPerBounce,
  calculateCostPerLead,
  calculateCPC,
  calculateCPCV,
  calculateCPE,
  calculateCPL,
  calculateCPP,
  calculateCPV,
  calculateEngagements,
  calculateImpression,
  calculateLands,
  calculateLeadVisits,
  calculateLinkClicks,
  calculatePaymentInfo,
  calculatePurchases,
  calculateReach,
  calculateVideoViews,
} from "utils/formula"
import { CellRenderer } from "./cell-renderer"
import { useCampaigns } from "app/utils/CampaignsContext"

export const ChannelRow = ({
  channel,
  index,
  stage,
  tableBody,
  tableHeaders,
  goalLevel,
  expandedRows,
  toggleRow,
  handleEditInfo,
  expandedKPI,
  toggleKPIShow,
  nrColumns,
  nrCells,
  toggleNRCell,
}) => {
  const { campaignFormData } = useCampaigns()

  const chData = campaignFormData?.channel_mix
    ?.find((ch) => ch?.funnel_stage === stage.name)
    ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)

  const obj = campaignFormData?.campaign_objectives

  const formulas = {
    impressions: [calculateImpression, "budget.fixed_value", "kpi.cpm"],
    reach: [calculateReach, "kpi.impressions", "kpi.frequency"],
    video_views: [calculateVideoViews, "kpi.impressions", "kpi.vtr"],
    cpv: [calculateCPV, "budget.fixed_value", "kpi.video_views"],
    completed_view: [calculateCompletedView, "kpi.video_views", "kpi.completion_rate"],
    cpcv: [calculateCPCV, "budget.fixed_value", "kpi.completed_view"],
    link_clicks: [calculateLinkClicks, "kpi.impressions", "kpi.ctr"],
    cpc: [calculateCPC, "budget.fixed_value", "kpi.link_clicks"],
    installs: [calculateLands, "kpi.link_clicks", "kpi.install_rate"],
    cpi: [calculateCPL, "budget.fixed_value", "kpi.installs"],
    engagements: [calculateEngagements, "kpi.impressions", "kpi.eng_rate"],
    cpe: [calculateCPE, "budget.fixed_value", "kpi.engagements"],
    app_open: [calculateLands, "kpi.link_clicks", "kpi.open_rate"],
    cost__app_open: [calculateCPL, "budget.fixed_value", "kpi.app_open"],
    conversion: [calculateConversion, "kpi.app_open", "kpi.cvr"],
    cost__conversion: [calculateCPL, "budget.fixed_value", "kpi.conversion"],
    forms_open: [calculateLinkClicks, "kpi.impressions", "kpi.ctr"],
    cost__opened_form: [calculateCPC, "budget.fixed_value", "kpi.forms_open"],
    leads: [calculateLands, "kpi.forms_open", "kpi.cvr"],
    cost__lead: [calculateCPL, "budget.fixed_value", ["kpi.leads", "kpi.lead_visits"]],
    lands: [calculateLands, "kpi.link_clicks", "kpi.click_to_land_rate"],
    cpl: [calculateCPL, "budget.fixed_value", "kpi.lands"],
    bounced_visits: [calculateBouncedVisits, "kpi.lands", "kpi.bounce_rate"],
    costbounce: [calculateCostPerBounce, "budget.fixed_value", "kpi.bounced_visits"],
    lead_visits: [calculateLeadVisits, "kpi.lands", "kpi.lead_rate"],
    costlead: [calculateCPL, "budget.fixed_value", "kpi.lead_visits"],
    off_funnel_visits: [calculateLeadVisits, "kpi.lands", "kpi.off_funnel_rate"],
    cost__off_funnel: [calculateCPL, "budget.fixed_value", "kpi.off_funnel_visits"],
    conversions: [calculateConversion, "kpi.lead_visits", "kpi.cvr"],
    costconversion: [calculateCPL, "budget.fixed_value", "kpi.conversions"],
    generated_revenue: [
      calculateConversion,
      obj === "Purchase (Pro)" ? "kpi.add_to_carts" : "kpi.conversions",
      "kpi.clv_of_associated_product",
    ],
    return_on_ad_spent: [calculateAdReturn, "kpi.generated_revenue", "budget.fixed_value"],
    add_to_carts: [calculateLeadVisits, "kpi.lead_visits", "kpi.add_to_cart_rate"],
    cpatc: [calculateCostPerLead, "budget.fixed_value", "kpi.add_to_carts"],
    payment_infos: [calculatePaymentInfo, "kpi.add_to_carts", "kpi.payment_info_rate"],
    cppi: [calculateCostPerLead, "budget.fixed_value", "kpi.payment_infos"],
    purchases: [calculatePurchases, "kpi.payment_infos", "kpi.purchase_rate"],
    cpp: [calculateCPP, "budget.fixed_value", "kpi.purchases"],
  }

  // Helper function to check if a field is a percentage type
  const isPercentageField = (fieldName, headerGroup) => {
    // Extract the field name from the path (e.g., "kpi.ctr" -> "ctr")
    const field = fieldName.split(".").pop()

    // Find the corresponding header in tableHeaders
    if (Array.isArray(headerGroup)) {
      for (const header of headerGroup) {
        if (typeof header === "object" && header.name) {
          const headerKey = header.name.toLowerCase().replace(/ /g, "_").replace(/\//g, "").replace(/-/g, "_")
          if (headerKey === field && header.type === "percent") {
            return true
          }
        }
      }
    }
    return false
  }

  const getNestedValue = (obj, ...paths) => {
    for (const path of paths) {
      let value = path.split(".").reduce((acc, key) => acc?.[key], obj)
      if (value !== undefined) {
        // Check if this is a percentage field
        if (isPercentageField(path, tableHeaders)) {
          // Remove % if present
          if (typeof value === "string") {
            value = value.replace(/%/g, "")
          }

          // Convert to decimal for calculations
          if (!isNaN(Number.parseFloat(value))) {
            value = Number.parseFloat(value) / 100
          }
        }
        return value
      }
    }
    return undefined
  }

  const calculatedValues = Object.fromEntries(
    Object.entries(formulas).map(([key, [fn, ...args]]) => [
      key,
      typeof fn === "function"
        ? fn.apply(
            null,
            args.map((arg) =>
              Array.isArray(arg) ? Number(getNestedValue(chData, ...arg)) : Number(getNestedValue(chData, arg)),
            ),
          )
        : null,
    ]),
  )

  useEffect(() => {
    // First calculate the channel's own metrics
    Object.entries(calculatedValues).forEach(([key, value]) => {
      if (!isNaN(value) && isFinite(value)) {
        handleEditInfo(stage.name, channel?.channel_name, channel?.name, key, value, "", "")
      }
    })

    // Then aggregate values from ad sets
    if (channel?.ad_sets && channel.ad_sets.length > 0) {
      // Get all ad sets for this channel
      const adSets =
        campaignFormData?.channel_mix
          ?.find((ch) => ch?.funnel_stage === stage.name)
          ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)?.ad_sets || []

      // For each KPI metric, sum up values from ad sets
      Object.keys(formulas).forEach((key) => {
        let sum = 0
        let hasValidValues = false

        // Sum up values from ad sets
        adSets.forEach((adSet, adSetIndex) => {
          // Get the value from the ad set
          const adSetValue = adSet?.kpi?.[key]
          if (!isNaN(adSetValue) && isFinite(adSetValue)) {
            sum += Number(adSetValue)
            hasValidValues = true
          }

          // Also include values from extra audiences
          const extraAudiences = adSet?.extra_audiences || []
          extraAudiences.forEach((extraAudience, extraIndex) => {
            const extraValue = extraAudience?.kpi?.[key]
            if (!isNaN(extraValue) && isFinite(extraValue)) {
              sum += Number(extraValue)
              hasValidValues = true
            }
          })
        })

        // Update the channel's KPI with the aggregated value
        if (hasValidValues) {
          handleEditInfo(stage.name, channel?.channel_name, channel?.name, key, sum, "", "")
        }
      })
    }
  }, [
    chData?.kpi?.cpm,
    chData?.kpi?.frequency,
    chData?.kpi?.vtr,
    chData?.kpi?.completion_rate,
    chData?.kpi?.ctr,
    chData?.kpi?.install_rate,
    chData?.kpi?.eng_rate,
    chData?.kpi?.open_rate,
    chData?.kpi?.cvr,
    chData?.kpi?.lands,
    chData?.kpi?.click_to_land_rate,
    chData?.kpi?.bounced_visits,
    chData?.kpi?.bounce_rate,
    chData?.kpi?.lead_rate,
    chData?.kpi?.lead_visits,
    chData?.kpi?.off_funnel_rate,
    chData?.kpi?.clv_of_associated_product,
    chData?.kpi?.add_to_cart_rate,
    chData?.kpi?.add_to_carts,
    chData?.kpi?.payment_infos,
    chData?.kpi?.payment_info_rate,
    chData?.kpi?.cppi,
    chData?.kpi?.purchase_rate,
    // Add dependency on ad sets data
    JSON.stringify(channel?.ad_sets),
    campaignFormData?.channel_mix,
  ])

  return (
    <tr key={index} className="border-t bg-white hover:bg-gray-100">
      {tableBody?.map((body, bodyIndex) => (
        <td key={bodyIndex} className={`py-4 px-3 text-[15px] ${nrColumns?.includes(body) ? "text-gray-400" : ""}`}>
          <div className="flex items-center gap-2">
            <CellRenderer
              body={body}
              channel={channel}
              calculatedValues={calculatedValues}
              tableHeaders={tableHeaders}
              bodyIndex={bodyIndex}
              goalLevel={goalLevel}
              stage={stage}
              index={index}
              expandedRows={expandedRows}
              toggleRow={toggleRow}
              handleEditInfo={handleEditInfo}
              nrColumns={nrColumns}
              nrCells={nrCells}
              toggleNRCell={toggleNRCell}
            />
          </div>
        </td>
      ))}
      {/* {chData?.objective_type &&
        chData?.objective_type !== "Brand Awareness" && (
          <td className="py-6 px-6 text-[15px]">
            <span
              className="flex items-center gap-2 text-blue-500 cursor-pointer"
              onClick={() => toggleKPIShow(`${stage.name}${index}`)}
            >
              <p>
                {expandedKPI[`${stage.name}${index}`] ? "Hide" : "View"}{" "}
                Objective KPI
              </p>
              <ArrowRight size={14} />
            </span>
          </td>
        )} */}
    </tr>
  )
}
