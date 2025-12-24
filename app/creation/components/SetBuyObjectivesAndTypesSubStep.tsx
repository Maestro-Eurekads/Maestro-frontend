"use client"

import { useCallback, useEffect, useState } from "react"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import { useCampaigns } from "../../utils/CampaignsContext"
import { useComments } from "app/utils/CommentProvider"
import { getPlatformIcon } from "components/data"
import { OutletType } from "types/types"
import { FunnelStagesSection } from "./Mid-Recap/FunnelStage"
import { ChannelMixSection } from "./Mid-Recap/ChannelMixSection"
import { AdSetsSection } from "./Mid-Recap/AdSetSection"
import FormatSelectionsSection from "./Mid-Recap/FormatSelection"
import BuyingObjectivesSection from "./Mid-Recap/BuyingObjectivesSection"
import { useEditing } from "app/utils/EditingContext"
import { StaticImageData } from "next/image"

interface PlatformOutletType extends OutletType {
  adSets: any[];
  formats: any[];
  buy_type: string;
  objective_type: string;
}

const SetBuyObjectivesAndTypesSubStep = () => {
  const [platforms, setPlatforms] = useState<Record<string, PlatformOutletType[]>>({})
  const { campaignFormData } = useCampaigns()
  const { setIsDrawerOpen, setClose } = useComments()
  const { midcapEditing, setMidcapEditing } = useEditing()
  const [view, setView] = useState<"channel" | "adset">("channel");

  useEffect(() => {
    setView(campaignFormData?.goal_level === "Adset level" ? "adset" : "channel");
  }, [campaignFormData]);


  const handleToggleChange = (newView: "channel" | "adset") => {
    setView(newView);
  };

  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
    return () => {
      // Cleanup function if needed
    }
  }, [setIsDrawerOpen, setClose])

  const getPlatformsFromStage = useCallback(() => {
    if (!campaignFormData?.channel_mix) return {}

    const platformsByStage: Record<string, PlatformOutletType[]> = {}
    const channelMix = campaignFormData?.channel_mix

    channelMix && channelMix?.length > 0 && channelMix.forEach((stage: any) => {
      const { funnel_stage, ...platformGroups } = stage

      if (!platformsByStage[funnel_stage]) {
        platformsByStage[funnel_stage] = []
      }

      Object.values(platformGroups).forEach((platformGroup: any) => {
        if (Array.isArray(platformGroup)) {
          platformGroup.forEach((platform: any) => {
            if (!platform?.platform_name) return

            const icon = getPlatformIcon(platform.platform_name) || "/placeholder.svg"
            platformsByStage[funnel_stage].push({
              id: parseInt(Math.floor(Math.random() * 1000000).toString()),
              outlet: platform.platform_name,
              icon,
              adSets: platform?.ad_sets || [],
              formats: platform?.format || [],
              buy_type: platform?.buy_type || "",
              objective_type: platform?.objective_type || "",
            })
          })
        }
      })
    })

    return platformsByStage
  }, [campaignFormData])

  useEffect(() => {
    if (campaignFormData) {
      const data = getPlatformsFromStage()
      setPlatforms(data)
    }
  }, [campaignFormData, getPlatformsFromStage])

  if (!campaignFormData) {
    return <div>Loading campaign data...</div>
  }

  return (
    <div className="w-full">
      <PageHeaderWrapper
        t1="Nice! Here's a recap of the buying objectives and types you have set for each platform."
        t2="If it's all good for you, click on Continue. If not, feel free to click on Edit for each funnel phase to adapt your choices as needed."
      />

      <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px] mx-auto">
        <FunnelStagesSection stages={campaignFormData.funnel_stages} />
        <ChannelMixSection
          stages={campaignFormData.funnel_stages}
          platforms={platforms}
        />
        <AdSetsSection onToggleChange={handleToggleChange} view={view} platforms={platforms} />
        <FormatSelectionsSection platforms={platforms} />
        <BuyingObjectivesSection platforms={platforms} />
      </div>
    </div>
  )
}

export default SetBuyObjectivesAndTypesSubStep