"use client";

import { useEffect, useRef } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { kpis } from "components/data";

export function useAggregatedMetrics() {
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  // Define calculated fields that should be aggregated
  const calculatedFields = [...kpis];

  // Aggregate metrics from ad sets to their parent channel
  const aggregateMetrics = () => {
    if (!campaignFormData?.channel_mix) return;

    const updatedData = { ...campaignFormData };
    let hasChanges = false;

    // Process each funnel stage
    updatedData.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage;

      // Process each channel type (social_media, display_networks, etc.)
      [
        "social_media",
        "display_networks",
        "search_engines",
        "streaming",
        "ooh",
        "broadcast",
        "messaging",
        "print",
        "e_commerce",
        "in_game",
        "mobile",
      ].forEach((channelType) => {
        if (!stage[channelType] || !Array.isArray(stage[channelType])) return;

        stage[channelType].forEach((platform) => {
          const adSets = platform.ad_sets || [];

          // Skip if no ad sets
          if (!adSets.length) return;

          // Skip if this platform has manually calculated values
          if (platform.kpi && platform.kpi._calculated === true) return;

          // Initialize platform KPI if it doesn't exist
          platform.kpi = platform.kpi || {};

          // Aggregate budget values from ad sets
          let totalBudget = 0;
          let hasValidBudgetValues = false;

          // Sum up budget values from ad sets
          adSets.forEach((adSet) => {
            // Get the budget value from the ad set
            const adSetBudget = Number(adSet.budget?.fixed_value);
            if (!isNaN(adSetBudget) && isFinite(adSetBudget)) {
              totalBudget += adSetBudget;
              hasValidBudgetValues = true;
            }
          });

          // Update platform budget if we have valid values
          if (hasValidBudgetValues) {
            // Initialize budget object if it doesn't exist
            platform.budget = platform.budget || {};

            // Only update if the value would change
            const currentBudget = Number(platform.budget.fixed_value) || 0;
            if (Math.abs(currentBudget - totalBudget) > 0.001) {
              platform.budget.fixed_value = totalBudget.toString();
              platform.budget._aggregated = true;
              hasChanges = true;
            }
          }

          // For each calculated metric, aggregate values from ad sets
          calculatedFields.forEach((metric) => {
            // Initialize sums
            let adSetsSum = 0;
            let hasValidAdSetValues = false;

            // Sum up values from ad sets
            adSets.forEach((adSet) => {
              // Skip if adSet doesn't have kpi
              if (!adSet.kpi) return;

              // Get the value from the ad set
              const adSetValue = Number(adSet.kpi?.[metric]);
              if (!isNaN(adSetValue) && isFinite(adSetValue)) {
                adSetsSum += adSetValue;
                hasValidAdSetValues = true;
              }
            });

            // Only update if we have valid values to add
            if (hasValidAdSetValues) {
              // Only update if the value would change
              const currentValue = Number(platform.kpi[metric]) || 0;
              // if (Math.abs(currentValue - adSetsSum) > 0.001) {
              // Use small epsilon for floating point comparison
              platform.kpi[metric] = adSetsSum;

              // Mark this KPI object as having aggregated values
              platform.kpi._aggregated = true;
              hasChanges = true;
              // }
            }
          });
        });
      });
    });

    // Only update state if there were actual changes
    if (hasChanges) {
      setCampaignFormData(updatedData);
    }
  };

  // Run aggregation when campaign data changes, but avoid infinite loops
  const dataSignatureRef = useRef<string | null>(null);
  const isAggregatingRef = useRef(false);

  useEffect(() => {
    if (
      campaignFormData &&
      campaignFormData.channel_mix &&
      campaignFormData.channel_mix?.length > 0 &&
      !isAggregatingRef.current
    ) {
      // Set flag to prevent re-entry
      isAggregatingRef.current = true;

      try {
        // Create a signature of the data excluding KPI values to avoid loops
        const dataSignature = JSON.stringify(
          campaignFormData.channel_mix?.map((stage) =>
            Object.entries(stage)
              .filter(([key]) => key !== "kpi") // Exclude kpi to avoid loops
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          )
        );

        // Only aggregate if the data signature has changed
        if (dataSignatureRef.current !== dataSignature) {
          aggregateMetrics();
          dataSignatureRef.current = dataSignature;
        }
      } finally {
        // Clear flag when done
        isAggregatingRef.current = false;
      }
    }
  }, [campaignFormData, setCampaignFormData]);

  return { aggregateMetrics };
}
