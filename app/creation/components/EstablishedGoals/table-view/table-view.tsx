"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useCampaigns } from "app/utils/CampaignsContext"
import { funnelStages } from "components/data"
import { tableHeaders, tableBody } from "utils/tableHeaders"
import { FunnelStageTable } from "./funnel-stage-table"
import { extractObjectives, extractPlatforms } from "./data-processor"
import Modal from "components/Modals/Modal"
import { useAggregatedMetrics } from "./aggregated-metrics-calculator"

const TableView = () => {
  const [expandedRows, setExpandedRows] = useState({})
  const { campaignFormData, setCampaignFormData } = useCampaigns()
  const [isOpen, setIsOpen] = useState(false)
  const [mergedTableHeaders, setMergedTableHeaders] = useState([])
  const [mergedTableBody, setMergedTableBody] = useState([])
  const [mergedTableHeadersByStage, setMergedTableHeadersByStage] = useState({})
  const [mergedTableBodyByStage, setMergedTableBodyByStage] = useState({})
  const [currentEditingStage, setCurrentEditingStage] = useState(null)
  const [nrColumnsByStage, setNrColumnsByStage] = useState({})

  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [expandedKPI, setExpandedKPI] = useState({})
  const [expandedAdsetKPI, setExpandedAdsetKPI] = useState({})

  const [nrCells, setNrCells] = useState({})
  const [nrAdCells, setNrAdCells] = useState({})

  const processedData = extractPlatforms(campaignFormData)
  console.log("🚀 ~ TableView ~ processedData:", processedData)

  // Define calculated fields - these are the only fields that should be aggregated
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

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const toggleKPIShow = (index) => {
    setExpandedKPI((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const toggleAdSetKPIShow = (index) => {
    setExpandedAdsetKPI((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const toggleNRCell = (stageName, rowId, metricKey) => {
    setNrCells((prev) => {
      const stage = prev[stageName] || {}
      const row = stage[rowId] || {}
      const updated = {
        ...prev,
        [stageName]: {
          ...stage,
          [rowId]: {
            ...row,
            [metricKey]: !row[metricKey],
          },
        },
      }
      return updated
    })
  }
  const toggleNRAdCell = (stageName, rowId, metricKey) => {
    setNrAdCells((prev) => {
      const stage = prev[stageName] || {}
      const row = stage[rowId] || {}
      const updated = {
        ...prev,
        [stageName]: {
          ...stage,
          [rowId]: {
            ...row,
            [metricKey]: !row[metricKey],
          },
        },
      }
      return updated
    })
  }

  // Add this function after the toggleNRAdCell function
  const { aggregateMetrics } = useAggregatedMetrics()

  const mergeAdditionalKPIs = () => {
    // Create a set of existing header names to avoid duplicates
    const existingHeaderNames = new Set(mergedTableHeaders.map((header) => header.name))

    // Create a new array with all existing headers
    const newHeaders = [...mergedTableHeaders]

    // Create a new array with all existing body fields
    const newBody = [...mergedTableBody]

    // Add headers and body fields from each selected metric
    selectedMetrics.forEach((metric) => {
      if (!existingHeaderNames.has(metric.name)) {
        // Add the header
        newHeaders.push(metric)
        existingHeaderNames.add(metric.name)

        // Add the corresponding body field
        const bodyField = metric.name.toLowerCase().replace(/ /g, "_").replace(/\//g, "").replace(/-/g, "_")

        if (!newBody.includes(bodyField)) {
          newBody.push(bodyField)
        }
      }
    })

    // Update the merged headers and body
    setMergedTableHeaders(newHeaders)
    setMergedTableBody(newBody)
    setIsOpen(false)
  }

  const toggleNRColumn = (stageName, columnName) => {
    const formattedCoulumnName = columnName.toLowerCase().replace(/ /g, "_").replace(/\//g, "").replace(/-/g, "_")
    setNrColumnsByStage((prev) => {
      const current = new Set(prev[stageName] || [])
      if (current.has(formattedCoulumnName)) {
        current.delete(formattedCoulumnName)
      } else {
        current.add(formattedCoulumnName)
      }
      return { ...prev, [stageName]: Array.from(current) }
    })
  }

  useEffect(() => {
    if (!campaignFormData) return

    const stageObjectives = extractObjectives(campaignFormData) // example: { Awareness: ["App Install", ...], ... }
    const headersByStage = {}
    const bodyByStage = {}

    for (const [stageName, objectives] of Object.entries(stageObjectives)) {
      const headersSet = new Map() // to deduplicate by name
      const bodyFieldsSet = new Set()

      const objectiveList = objectives.length > 0 ? objectives : ["Brand Awareness"]

      objectiveList.forEach((objective) => {
        const headers = tableHeaders[objective] || []
        const body = tableBody[objective] || []

        headers.forEach((h) => headersSet.set(h.name, h))
        body.forEach((b) => bodyFieldsSet.add(b))
      })

      // Add selected metrics only for the current editing stage when metrics are applied
      if (stageName === currentEditingStage) {
        selectedMetrics.forEach((metric) => {
          headersSet.set(metric.name, metric)
          const bodyField = metric.name.toLowerCase().replace(/ /g, "_").replace(/\//g, "").replace(/-/g, "_")
          bodyFieldsSet.add(bodyField)
        })
      }

      headersByStage[stageName] = Array.from(headersSet.values())
      bodyByStage[stageName] = Array.from(bodyFieldsSet)
    }

    setMergedTableHeadersByStage(headersByStage)
    setMergedTableBodyByStage(bodyByStage)
  }, [campaignFormData, selectedMetrics, currentEditingStage])

  // Use a ref to track if we've already aggregated the data
  const hasAggregatedRef = useRef(false)
  const previousDataSignatureRef = useRef("")

  // Add this useEffect with proper dependencies
  useEffect(() => {
    if (campaignFormData) {
      // Create a signature of the data excluding KPI values to avoid loops
      const dataSignature = JSON.stringify(
        campaignFormData.channel_mix?.map((stage) =>
          Object.entries(stage)
            .filter(([key]) => key !== "kpi") // Exclude kpi to avoid loops
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
        ),
      )

      // Only aggregate if the data signature has changed
      if (previousDataSignatureRef.current !== dataSignature) {
        console.log("here is it")
        aggregateMetrics()
        previousDataSignatureRef.current = dataSignature
        hasAggregatedRef.current = true
      }
    }
  }, [aggregateMetrics, campaignFormData])

  // Remove or comment out the other useEffect that resets hasAggregatedRef
  // useEffect(() => {
  //   hasAggregatedRef.current = false
  // }, [JSON.stringify(campaignFormData?.channel_mix)])

  const handleEditInfo = (stageName, channelName, platformName, fieldName, value, adSetIndex, extraAdSetindex) => {
    setCampaignFormData((prevData) => {
      const updatedData = { ...prevData }
      const channelMix = updatedData.channel_mix?.find((ch) => ch.funnel_stage === stageName)

      if (channelMix) {
        const platform = channelMix[channelName]?.find((platform) => platform.platform_name === platformName)

        if (platform) {
          // console.log("fieldName", fieldName)
          if (fieldName === "budget_size") {
            // debugger
            if (extraAdSetindex !== "") {
              // Ensure ad_sets exists
              if (!platform.ad_sets?.[adSetIndex]) return updatedData

              // Ensure extra_audiences is initialized
              platform.ad_sets[adSetIndex]["extra_audiences"] = platform.ad_sets[adSetIndex]["extra_audiences"] || []

              // Ensure specific extra audience object exists
              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] =
                platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] || {}

              // Ensure budget object exists
              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["budget"] =
                platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["budget"] || {}

              // Set value
              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["budget"]["fixed_value"] =
                value.toString()
            } else if (adSetIndex !== "") {
              // console.log("hgh")
              platform.ad_sets[adSetIndex]["budget"] = platform.ad_sets[adSetIndex]["budget"] || {}
              platform.ad_sets[adSetIndex]["budget"]["fixed_value"] = value.toString()
            } else {
              platform["budget"] = platform["budget"] || {}
              platform["budget"]["fixed_value"] = value.toString()
            }
          } else {
            if (extraAdSetindex !== "") {
              if (!platform.ad_sets?.[adSetIndex]) return updatedData

              platform.ad_sets[adSetIndex]["extra_audiences"] = platform.ad_sets[adSetIndex]["extra_audiences"] || []

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] =
                platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] || {}

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["kpi"] =
                platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["kpi"] || {}

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex]["kpi"][fieldName] = Number(value)
            } else if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["kpi"] = platform.ad_sets[adSetIndex]["kpi"] || {}
              platform.ad_sets[adSetIndex]["kpi"][fieldName] = Number(value)
            } else {
              platform["kpi"] = platform["kpi"] || {}
              platform["kpi"][fieldName] = Number(value)
            }
          }
        }
      }

      return updatedData
    })
  }

  // Process data once at the top level

  const allObjectives = useMemo(() => Object.keys(tableHeaders), [])

  const objectivesForStage = useMemo(() => {
    return currentEditingStage ? extractObjectives(campaignFormData)[currentEditingStage] || [] : []
  }, [campaignFormData, currentEditingStage])

  const existingHeaderNames = useMemo(() => {
    return currentEditingStage ? mergedTableHeadersByStage[currentEditingStage]?.map((h) => h.name) : []
  }, [mergedTableHeadersByStage, currentEditingStage])

  return (
    <div className="my-5 mx-[40px]">
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.custom_funnels?.find((s) => s.name === stageName)
        const funn = funnelStages?.find((f) => f.name === stageName)
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
            tableHeaders={mergedTableHeadersByStage[stage.name] || []}
            tableBody={mergedTableBodyByStage[stage.name] || []}
            expandedKPI={expandedKPI}
            toggleKPIShow={toggleKPIShow}
            expandedAdsetKPI={expandedAdsetKPI}
            toggleAdSetKPIShow={toggleAdSetKPIShow}
            nrColumns={nrColumnsByStage[stage.name]}
            toggleNRColumn={toggleNRColumn}
            setIsOpen={setIsOpen}
            setCurrentEditingStage={setCurrentEditingStage}
            nrCells={nrCells[stage.name] || {}}
            toggleNRCell={toggleNRCell}
            nrAdCells={nrAdCells[stage.name] || {}}
            toggleNRAdCell={toggleNRAdCell}
          />
        )
      })}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[700px] bg-white rounded-[10px] shadow-lg p-4">
          <p className="text-[20px] font-medium mb-4">Select Metrics for {currentEditingStage}</p>
          <p>Add specific metrics to this stage's table</p>

          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {(() => {
              // const allObjectives = Object.keys(tableHeaders)

              // const objectivesForStage = useMemo(() => {
              //   return extractObjectives(campaignFormData)[currentEditingStage] || []
              // }, [campaignFormData, currentEditingStage])

              // const existingHeaderNames = useMemo(() => {
              //   return new Set(mergedTableHeadersByStage[currentEditingStage]?.map((h) => h.name))
              // }, [mergedTableHeadersByStage, currentEditingStage])

              const filteredObjectives = allObjectives.filter(
                (objective) => !objectivesForStage.includes(objective) && objective !== "Brand Awareness",
              )

              const areAllSelected = (objective, availableMetrics) => {
                return availableMetrics.every((metric) => selectedMetrics.some((m) => m.name === metric.name))
              }

              return filteredObjectives.map((objective, index) => {
                const defaultHeaders = [
                  "Channel",
                  "AdSets",
                  "Audience",
                  "Start Date",
                  "End Date",
                  "Audience Size",
                  "Budget Size",
                  "CPM",
                  "Impressions",
                  "Frequency",
                  "Reach",
                ]
                const availableMetrics = tableHeaders[objective] || []
                const filterAvailableMetrics = availableMetrics
                  ?.filter(
                    (mm) =>
                      !defaultHeaders.includes(mm?.name) &&
                      !Object.entries(mergedTableHeadersByStage).some(([stage, headers]) => {
                        if (stage === currentEditingStage) return false // ignore current stage
                        return (headers as { name: string }[]).some((h) => h.name === mm?.name)
                      }),
                  )
                  .map((metric) => ({
                    ...metric,
                    obj: objective, // Add the new property 'obj' with the current objective
                  }))
                // console.log("here", JSON.stringify(filterAvailableMetrics))

                if (availableMetrics.length === 0) return null

                return (
                  <div key={index} className="mb-4">
                    <p className="font-medium text-[16px] mb-2">{objective}</p>

                    <div className="flex items-center mb-2 pl-4">
                      <input
                        type="checkbox"
                        id={`select-all-${objective}`}
                        className="mr-2"
                        checked={areAllSelected(objective, filterAvailableMetrics)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Safely add all
                            setSelectedMetrics((prev) => {
                              const existing = new Map(prev.map((m) => [m.name, m]))
                              filterAvailableMetrics.forEach((m) => existing.set(m.name, m))
                              return Array.from(existing.values())
                            })
                          } else {
                            // Remove all for this objective
                            setSelectedMetrics((prev) =>
                              prev.filter((m) => !filterAvailableMetrics.some((metric) => metric.name === m.name)),
                            )
                          }
                        }}
                      />
                      <label htmlFor={`select-all-${objective}`} className="text-sm font-medium">
                        Select All
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {filterAvailableMetrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`metric-${objective}-${metricIndex}`}
                            className="mr-2"
                            checked={selectedMetrics.some((m) => m.name === metric.name && m.obj === objective)}
                            onChange={(e) => {
                              console.log("fdfdfd", e.target.checked)
                              if (metric?.obj === objective && e.target.checked) {
                                setSelectedMetrics((prev) => {
                                  // Check if metric is already selected
                                  if (prev.some((m) => m.name === metric.name && m.obj === objective)) {
                                    return prev
                                  }
                                  return [...prev, { ...metric, obj: objective }]
                                })
                              } else {
                                setSelectedMetrics((prev) =>
                                  prev.filter((m) => metric.obj === objective && m.name !== metric.name),
                                )
                              }
                            }}
                          />
                          <label htmlFor={`metric-${objective}-${metricIndex}`} className="text-sm">
                            {metric.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            })()}
          </div>

          <div
            className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit ml-auto mt-4 flex justify-end font-medium cursor-pointer"
            onClick={() => {
              mergeAdditionalKPIs()
              setIsOpen(false)
            }}
          >
            {selectedMetrics?.length < 1 ? "Close" : "Update Table"}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TableView
