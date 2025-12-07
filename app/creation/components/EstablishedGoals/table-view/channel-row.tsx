"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  calculateCTR,
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
import { CellRenderer } from "./cell-renderer";
import { useCampaigns } from "app/utils/CampaignsContext";

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
  hasOfflineChannel
}) => {
  const { campaignFormData } = useCampaigns();

  // Use a state to track if we've already processed this channel
  const [hasProcessed, setHasProcessed] = useState(false);

  // Use a ref to store the previous channel data for comparison
  const prevChannelDataRef = useRef(null);

  const chData = useCallback(() => {
    return campaignFormData?.channel_mix
      ?.find((ch) => ch?.funnel_stage === stage.name)
      ?.[channel?.channel_name]?.find((c) => c?.platform_name === channel?.name);
  }, [campaignFormData])();

  const obj = campaignFormData?.campaign_objectives;

  const formulas = {
    // cpm: [calculateImpression, "budget.fixed_value", "kpi.impressions"],
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
      calculateLinkClicks,
      ["kpi.conversion", "kpi.conversions", "kpi.purchases"],
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

  const adsetFormulas = {
    cpm: [calculateImpression, "budget.fixed_value", "kpi.impressions"],
    frequency: [calculateReach, "kpi.impressions", "kpi.reach"],
    ctr: [calculateCTR, "kpi.link_clicks", "kpi.impressions"],
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
          } else if (typeof value === "number") {
            // If it's a number greater than 1, assume it's in percentage format (e.g., 10 for 10%)
            value = value / 100
          }
          // If value is already a decimal (between 0 and 1), use it as is
        }
        return value
      }
    }
  }

  // Function to check if channel data has changed in a way that requires recalculation
  const hasRelevantChanges = (prevData, currentData) => {
    if (!prevData || !currentData) return true;

    // Check if budget has changed
    if (prevData.budget?.fixed_value !== currentData.budget?.fixed_value)
      return true;

    // Check if any KPI input values have changed
    const inputFields = [
      "cpm",
      "reach",
      "link_clicks",
      "impressions",
      "frequency",
      "vtr",
      "completion_rate",
      "ctr",
      "install_rate",
      "eng_rate",
      "open_rate",
      "cvr",
      "click_to_land_rate",
      "bounce_rate",
      "lead_rate",
      "off_funnel_rate",
      "clv_of_associated_product",
      "add_to_cart_rate",
      "payment_info_rate",
      "purchase_rate",
    ];

    for (const field of inputFields) {
      if (prevData.kpi?.[field] !== currentData.kpi?.[field]) return true;
    }

    return false;
  };

  // Memoize calculated values to prevent unnecessary recalculations
  const getCalculatedValues = () => {
    if (!chData) return {}
    // console.log((campaignFormData?.campaign_budget?.level === "Adset level" ? adsetFormulas :formulas))
    return Object.fromEntries(
      Object.entries((campaignFormData?.campaign_budget?.level === "Adset level" ? adsetFormulas : formulas))?.map(([key, [fn, ...args]]) => {
        return [
          key,
          typeof fn === "function"
            ? fn.apply(
              null,
              args.map((arg) =>
                Array.isArray(arg) ? Number(getNestedValue(chData, ...arg)) : Number(getNestedValue(chData, arg)),
              ),
            )
            : null,
        ]
      }),
    )
  }

  // Calculate values only when needed
  const calculatedValues = getCalculatedValues();
  // console.log("🚀 ~ calculatedValues:", calculatedValues)

  // Effect to handle calculations and updates
  useEffect(() => {
    // Skip if we don't have channel data
    if (!chData) return;
    if (campaignFormData?.campaign_budget?.level === "Adset level") {
      // debugger;
      // Check if we need to recalculate (data has changed)
      const needsRecalculation = hasRelevantChanges(
        prevChannelDataRef.current,
        chData
      );

      // Only process if we haven't processed this data yet or if relevant data has changed
      if (!hasProcessed || needsRecalculation) {
        // Store current channel data for future comparison
        prevChannelDataRef.current = JSON.parse(JSON.stringify(chData));

        // Calculate the channel's own metrics
        const updates = [];

        Object.entries(calculatedValues).forEach(([key, value]) => {
          if (!isNaN(value) && isFinite(value)) {
            updates.push([key, value]);
          }
        });

        // Only update if we have valid calculations
        if (updates.length > 0) {
          // Create a copy of the current KPI object or initialize a new one
          const updatedKpi = { ...(chData.kpi || {}) };

          // Apply all updates
          updates.forEach(([key, value]) => {
            updatedKpi[key] = value;
            // Mark this KPI object as manually calculated
            updatedKpi._calculated = true;

            // Update the form data with all changes at once
            handleEditInfo(
              stage.name,
              channel?.channel_name,
              channel?.name,
              key,
              updatedKpi[key],
              "",
              ""
            );

            // Mark as processed to prevent infinite loops
            setHasProcessed(true);
          });

        }
      }
    } else {
      // Calculate the channel's own metrics
      Object.entries(calculatedValues).forEach(([key, value]) => {
        if (!isNaN(value) && isFinite(value)) {
          handleEditInfo(
            stage.name,
            channel?.channel_name,
            channel?.name,
            key,
            value,
            "",
            ""
          );
        }
      });
    }
  }, [
    // Only include dependencies that should trigger recalculation
    chData?.kpi?.cost__lead,
    chData?.kpi?.cpcv,
    chData?.kpi?.cpe,
    chData?.kpi?.cpc,
    chData?.kpi?.cpv,
    chData?.kpi?.impressions,
    chData?.kpi?.ctr,
    chData?.kpi?.link_clicks,
    chData?.kpi?.reach,
    chData?.budget?.fixed_value,
    chData?.kpi?.cpm,
    chData?.kpi?.frequency,
    chData?.kpi?.vtr,
    chData?.kpi?.completion_rate,
    chData?.kpi?.ctr,
    chData?.kpi?.install_rate,
    chData?.kpi?.eng_rate,
    chData?.kpi?.open_rate,
    chData?.kpi?.cvr,
    chData?.kpi?.click_to_land_rate,
    chData?.kpi?.bounce_rate,
    chData?.kpi?.lead_rate,
    chData?.kpi?.off_funnel_rate,
    chData?.kpi?.clv_of_associated_product,
    chData?.kpi?.add_to_cart_rate,
    chData?.kpi?.payment_info_rate,
    chData?.kpi?.purchase_rate,
    // Include these dependencies but NOT campaignFormData
    stage.name,
    channel?.channel_name,
    channel?.name,
    // Include hasProcessed to ensure we only run once per state change
    hasProcessed,
    chData,
  ]);
  // Reset processed state when channel changes
  useEffect(() => {
    // This effect runs when the component mounts or when the channel changes
    return () => {
      // Reset processed state when component unmounts or channel changes
      setHasProcessed(false);
    };
  }, [channel?.name, stage.name]);

  return (
    <tr key={index} className="border-t bg-white hover:bg-gray-100">
      {tableBody?.map((body, bodyIndex) => (
        <td
          key={bodyIndex}
          className={`py-4 px-3 text-[15px] w-fit ${nrColumns?.includes(body) ? "text-gray-400" : ""
            }`}
        >
          <div className="flex items-center gap-2 w-fit">
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
              hasOfflineChannel={hasOfflineChannel}
            />
          </div>
        </td>
      ))}
    </tr>
  );
};
