"use client"

import { useEffect, useRef } from "react"
import { useCampaigns } from "app/utils/CampaignsContext"

export function useAggregatedMetrics() {
  const { campaignFormData, setCampaignFormData } = useCampaigns()

  // Define calculated fields that should be aggregated
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

  // Aggregate metrics from ad sets to their parent channel
  const aggregateMetrics = () => {
    if (!campaignFormData?.channel_mix) return

    const updatedData = { ...campaignFormData }
    let hasChanges = false

    // Process each funnel stage
    updatedData.channel_mix.forEach((stage) => {
      const stageName = stage.funnel_stage

      // Process each channel type (social_media, display_networks, etc.)
      ;[
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
        if (!stage[channelType]) return

        // Process each platform in the channel type
        stage[channelType].forEach((platform) => {
          const adSets = platform.ad_sets || []

          // Skip if no ad sets
          if (!adSets.length) return

          // For each calculated metric, aggregate values from ad sets
          calculatedFields.forEach((metric) => {
            // Skip aggregation if the platform doesn't have this metric
            if (!platform.kpi || platform.kpi[metric] === undefined) return

            // Initialize sums
            let adSetsSum = 0
            let hasValidAdSetValues = false

            // Sum up values from ad sets
            adSets.forEach((adSet) => {
              // Get the value from the ad set
              const adSetValue = Number(adSet.kpi?.[metric])
              if (!isNaN(adSetValue) && isFinite(adSetValue)) {
                adSetsSum += adSetValue
                hasValidAdSetValues = true
              }

              // Also include values from extra audiences
              const extraAudiences = adSet.extra_audiences || []
              extraAudiences.forEach((extraAudience) => {
                const extraValue = Number(extraAudience.kpi?.[metric])
                if (!isNaN(extraValue) && isFinite(extraValue)) {
                  adSetsSum += extraValue
                  hasValidAdSetValues = true
                }
              })
            })

            // Only update if we have valid values to add
            if (hasValidAdSetValues) {
              // Initialize KPI object if it doesn't exist
              platform.kpi = platform.kpi || {}

              // Only update if the value would change
              const currentValue = Number(platform.kpi[metric]) || 0
              if (Math.abs(currentValue - adSetsSum) > 0.001) {
                // Use small epsilon for floating point comparison
                platform.kpi[metric] = adSetsSum
                hasChanges = true
              }
            }
          })
        })
      })
    })

    // Only update state if there were actual changes
    if (hasChanges) {
      setCampaignFormData(updatedData)
    }
  }
  console.log("🚀 ~ aggregateMetrics:", aggregateMetrics)

  // Run aggregation when campaign data changes, but avoid infinite loops
  const dataSignatureRef = useRef<string | null>(null)

  useEffect(() => {
    if (campaignFormData) {
      // Use a ref to track if we've already processed this specific data
      const dataSignature = JSON.stringify(
        campaignFormData.channel_mix?.map((stage) =>
          Object.entries(stage)
            .filter(([key]) => key !== "kpi") // Exclude kpi to avoid loops
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        ),
      )

      // Only aggregate if the data (excluding kpi values) has changed
      if (dataSignatureRef.current !== dataSignature) {
        aggregateMetrics()
        dataSignatureRef.current = dataSignature
      }
    }
  }, [campaignFormData, setCampaignFormData])

  return { aggregateMetrics }
}
