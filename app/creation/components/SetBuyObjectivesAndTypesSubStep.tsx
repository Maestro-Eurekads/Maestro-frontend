"use client"

import { useCallback, useEffect, useState } from "react"
import PageHeaderWrapper from "../../../components/PageHeaderWapper"
import BuyingObjective from "./common/BuyingObjective"
import { useCampaigns } from "../../utils/CampaignsContext"
import { useComments } from "app/utils/CommentProvider"
import { getPlatformIcon } from "components/data"
import { OutletType } from "types/types"
import { FunnelStagesSection } from "./Mid-Recap/FunnelStage"
import { ChannelMixSection } from "./Mid-Recap/ChannelMixSection"
import { AdSetsSection } from "./Mid-Recap/AdSetSection"
// import { FormatSelectionsSection } from "./Mid-Recap/FormatSelection"
import { useEditing } from "app/utils/EditingContext"
import FormatSelectionsSection from "./Mid-Recap/FormatSelection"

const SetBuyObjectivesAndTypesSubStep = () => {
  const [platforms, setPlatforms] = useState<Record<string, OutletType[]>>({})
  const { campaignFormData } = useCampaigns()
  const { setIsDrawerOpen, setClose } = useComments()
  const {midcapEditing, setMidcapEditing} = useEditing()

  useEffect(() => {
    setIsDrawerOpen(false)
    setClose(false)
  }, [])

  const getPlatformsFromStage = useCallback(() => {
    const platformsByStage: Record<string, OutletType[]> = {}
    const channelMix = campaignFormData?.channel_mix || []

    channelMix &&
      channelMix?.length > 0 &&
      channelMix.forEach((stage: any) => {
        const {
          funnel_stage,
          search_engines,
          display_networks,
          social_media,
          streaming,
          mobile,
          ooh,
          broadcast,
          in_game,
          e_commerce,
          messaging,
          print,
        } = stage

        if (!platformsByStage[funnel_stage]) platformsByStage[funnel_stage] = []
        ;[
          search_engines,
          display_networks,
          social_media,
          streaming,
          mobile,
          ooh,
          broadcast,
          in_game,
          e_commerce,
          messaging,
          print,
        ].forEach((platformGroup) => {
          if (Array.isArray(platformGroup)) {
            platformGroup.forEach((platform: any) => {
              const icon = getPlatformIcon(platform?.platform_name)
              platformsByStage[funnel_stage].push({
                id: Math.floor(Math.random() * 1000000),
                outlet: platform.platform_name,
                icon,
                adSets: platform?.ad_sets,
                formats: platform?.format,
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

  return (
    <div>
      <PageHeaderWrapper
        t1="Nice ! Here's a recap of the buying objectives and types you have set for each platform."
        t2="If it's all good for you, click on Continue. If not, feel free to click on Edit for each funnel phase to adapt your choices as needed."
      />

      <div className="mt-12 flex items-start flex-col gap-12 w-full max-w-[950px]">
        <FunnelStagesSection stages={campaignFormData?.funnel_stages} />
        <ChannelMixSection stages={campaignFormData?.funnel_stages} platforms={platforms} />
        <AdSetsSection platforms={platforms} />
        <FormatSelectionsSection platforms={platforms} />
        <BuyingObjective />
      </div>
    </div>
  )
}

export default SetBuyObjectivesAndTypesSubStep
