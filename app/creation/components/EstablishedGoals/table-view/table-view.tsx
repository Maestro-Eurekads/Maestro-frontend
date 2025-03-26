"use client"

import { useState } from "react"
import { useCampaigns } from "app/utils/CampaignsContext"
import { funnelStages } from "components/data"
import { tableHeaders, tableBody } from "utils/tableHeaders"
import { FunnelStageTable } from "./funnel-stage-table"
import { extractPlatforms } from "./data-processor"

const TableView = () => {
  const [expandedRows, setExpandedRows] = useState({})
  const { campaignFormData, setCampaignFormData } = useCampaigns()

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handleEditInfo = (stageName, channelName, platformName, fieldName, value, adSetIndex) => {
    setCampaignFormData((prevData) => {
      const updatedData = { ...prevData }
      const channelMix = updatedData.channel_mix?.find((ch) => ch.funnel_stage === stageName)

      if (channelMix) {
        const platform = channelMix[channelName]?.find((platform) => platform.platform_name === platformName)

        if (platform) {
          if (adSetIndex !== "") {
            platform.ad_sets[adSetIndex][fieldName] = value
          } else {
            platform["kpi"] = platform["kpi"] || {}
            platform["kpi"][fieldName] = value
          }
        }
      }

      return updatedData
    })
  }

  // Process data once at the top level
  const processedData = extractPlatforms(campaignFormData)

  return (
    <div className="my-5 mx-[40px]">
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = funnelStages.find((s) => s.name === stageName)
        if (!stage) return null

        const stageData = processedData[stage?.name] || []

        return (
          <FunnelStageTable
            key={index}
            stage={stage}
            stageData={stageData}
            campaignObjectives={campaignFormData?.campaign_objectives}
            goalLevel={campaignFormData?.goal_level}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            handleEditInfo={handleEditInfo}
            tableHeaders={tableHeaders[campaignFormData?.campaign_objectives] || []}
            tableBody={tableBody[campaignFormData?.campaign_objectives] || []}
          />
        )
      })}
    </div>
  )
}

export default TableView

