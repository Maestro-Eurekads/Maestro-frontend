"use client";

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
} from "utils/formula";
import { AdSetCellRenderer } from "./ad-set-cell-renderer";
import { useCampaigns } from "app/utils/CampaignsContext";
import { useEffect } from "react";

export const AdSetRow = ({
  adSet,
  adSetIndex,
  channel,
  stage,
  handleEditInfo,
  tableBody,
  tableHeaders,
  expandedAdsetKPI,
  toggleAdSetKPIShow,
  nrAdCells,
  toggleNRAdCell,
  hasOfflineChannel
}) => {
  const { campaignFormData } = useCampaigns();
  const chData = campaignFormData?.channel_mix
    ?.find((ch) => ch?.funnel_stage === stage.name)
    [channel?.channel_name]?.find((c) => c?.platform_name === channel?.name)
    ?.ad_sets[adSetIndex];
  const obj = campaignFormData?.campaign_objective;

  const formulas = {
    impressions: [calculateImpression, "budget.fixed_value", "kpi.cpm"],
    reach: [calculateReach, "kpi.impressions", "kpi.frequency"],
    video_views: [calculateVideoViews, "kpi.impressions", "kpi.vtr"],
    cpv: [calculateCPV, "budget.fixed_value", "kpi.video_views"],
    completed_view: [
      calculateCompletedView,
      "kpi.video_views",
      "kpi.completion_rate",
    ],
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
    cost__lead: [
      calculateCPL,
      "budget.fixed_value",
      ["kpi.leads", "kpi.lead_visits"],
    ],
    lands: [calculateLands, "kpi.link_clicks", "kpi.click_to_land_rate"],
    cpl: [calculateCPL, "budget.fixed_value", "kpi.lands"],
    bounced_visits: [calculateBouncedVisits, "kpi.lands", "kpi.bounce_rate"],
    costbounce: [
      calculateCostPerBounce,
      "budget.fixed_value",
      "kpi.bounced_visits",
    ],
    lead_visits: [calculateLeadVisits, "kpi.lands", "kpi.lead_rate"],
    costlead: [calculateCPL, "budget.fixed_value", "kpi.lead_visits"],
    off_funnel_visits: [
      calculateLeadVisits,
      "kpi.lands",
      "kpi.off_funnel_rate",
    ],
    cost__off_funnel: [
      calculateCPL,
      "budget.fixed_value",
      "kpi.off_funnel_visits",
    ],
    conversions: [calculateConversion, "kpi.lead_visits", "kpi.cvr"],
    costconversion: [calculateCPL, "budget.fixed_value", "kpi.conversions"],
    generated_revenue: [
      calculateConversion,
      "kpi.conversion",
      "kpi.clv_of_associated_product",
    ],
    return_on_ad_spent: [
      calculateAdReturn,
      "kpi.generated_revenue",
      "budget.fixed_value",
    ],
    add_to_carts: [
      calculateLeadVisits,
      "kpi.lead_visits",
      "kpi.add_to_cart_rate",
    ],
    cpatc: [calculateCostPerLead, "budget.fixed_value", "kpi.add_to_carts"],
    payment_infos: [
      calculatePaymentInfo,
      "kpi.add_to_carts",
      "kpi.payment_info_rate",
    ],
    cppi: [calculateCostPerLead, "budget.fixed_value", "kpi.payment_infos"],
    purchases: [calculatePurchases, "kpi.payment_infos", "kpi.purchase_rate"],
    cpp: [calculateCPP, "budget.fixed_value", "kpi.purchases"],
  };

  // Helper function to check if a field is a percentage type
  const isPercentageField = (fieldName, headerGroup) => {
    // Extract the field name from the path (e.g., "kpi.ctr" -> "ctr")
    const field = fieldName.split(".").pop()

    // Define known percentage fields
    const percentageFields = [
      "ctr",
      "vtr",
      "completion_rate",
      "install_rate",
      "eng_rate",
      "open_rate",
      "cvr",
      "click_to_land_rate",
      "bounce_rate",
      "lead_rate",
      "off_funnel_rate",
      "add_to_cart_rate",
      "payment_info_rate",
      "purchase_rate",
    ]

    // Check if field is in known percentage fields
    if (percentageFields.includes(field)) {
      return true
    }

    // Fallback to checking tableHeaders
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
          // Only convert if the value is a string with % or a number > 1
          if (typeof value === "string" && value.includes("%")) {
            value = value.replace(/%/g, "")
            if (!isNaN(Number.parseFloat(value))) {
              value = Number(Number.parseFloat(value).toFixed(2)) / 100
            }
          } else if (typeof value === "number" && value > 0) {
            // If it's a number greater than 1, assume it's in percentage format (e.g., 10 for 10%)
            value = value / 100
          }
          // If value is already a decimal (between 0 and 1), use it as is
        }
        return value
      }
    }
  }

  const getCalculatedValues = () => {
    if (!chData) return {}
  
    return Object.fromEntries(
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
  }

  const calculatedValues = getCalculatedValues();

  // Replace the useEffect in AdSetRow with this simplified version
  // since we're now handling aggregation in the TableView component
  useEffect(() => {
    // Calculate the ad set's own metrics
    Object.entries(calculatedValues).forEach(([key, value]) => {
      if (!isNaN(value) && isFinite(value)) {
        handleEditInfo(
          stage.name,
          channel?.channel_name,
          channel?.name,
          key,
          value,
          adSetIndex,
          ""
        );
      }
    });
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
  ]);
  return (
    <tr key={`${stage.name}${adSetIndex}`} className="bg-white">
      {tableBody?.map((body, bodyIndex) => (
        <td key={bodyIndex} className="py-3 px-3 border-none">
          <AdSetCellRenderer
            body={body}
            channel={channel}
            calculatedValues={calculatedValues}
            tableHeaders={tableHeaders}
            bodyIndex={bodyIndex}
            stage={stage}
            adSetIndex={adSetIndex}
            adSet={adSet}
            handleEditInfo={handleEditInfo}
            nrAdCells={nrAdCells}
            toggleNRAdCell={toggleNRAdCell}
            expandedAdsetKPI={expandedAdsetKPI}
            toggleAdSetKPIShow={toggleAdSetKPIShow}
            hasOfflineChannel={hasOfflineChannel}
          />
        </td>
      ))}
    </tr>
  );
};
