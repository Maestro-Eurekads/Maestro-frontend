"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { funnelStages } from "components/data";
import { tableHeaders, tableBody } from "utils/tableHeaders";
import { FunnelStageTable } from "./funnel-stage-table";
import { extractPlatforms } from "./data-processor";
import Modal from "components/Modals/Modal";
import { useAggregatedMetrics } from "./aggregated-metrics-calculator";
import { useActive } from "app/utils/ActiveContext";

const TableView = () => {
  const { setChange } = useActive();
  const [expandedRows, setExpandedRows] = useState({});
  const { campaignFormData, setCampaignFormData, updateCampaign } =
    useCampaigns();
  const [isOpen, setIsOpen] = useState(false);
  const [mergedTableHeadersByStage, setMergedTableHeadersByStage] = useState(
    {}
  );
  const [mergedTableBodyByStage, setMergedTableBodyByStage] = useState({});
  const [currentEditingStage, setCurrentEditingStage] = useState(null);
  const [nrColumnsByStage, setNrColumnsByStage] = useState({});

  const [selectedMetrics, setSelectedMetrics] = useState([]);
  // //console.log("🚀 ~ TableView:", campaignFormData?.table_headers)
  const [expandedKPI, setExpandedKPI] = useState({});
  const [expandedAdsetKPI, setExpandedAdsetKPI] = useState({});

  // Function to immediately update context state with selected metrics
  const updateContextWithMetrics = (newSelectedMetrics) => {
    if (!currentEditingStage) return;

    setCampaignFormData((prev) => ({
      ...prev,
      selected_metrics: {
        ...prev.selected_metrics,
        [currentEditingStage]: newSelectedMetrics,
      },
    }));
  };

  // Function to immediately update context state with table headers
  const updateContextWithTableHeaders = (newTableHeaders) => {
    if (!currentEditingStage) return;

    setCampaignFormData((prev) => ({
      ...prev,
      table_headers: {
        ...prev.table_headers,
        [currentEditingStage]: newTableHeaders,
      },
    }));
  };

  const [nrCells, setNrCells] = useState({});
  const [nrAdCells, setNrAdCells] = useState({});

  const processedData = extractPlatforms(campaignFormData);

  // const [selectedMetricsLoaded, setSelectedMetricsLoaded] = useState(false)

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleKPIShow = (index) => {
    setExpandedKPI((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleAdSetKPIShow = (index) => {
    setExpandedAdsetKPI((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleNRCell = (stageName, rowId, metricKey) => {
    setNrCells((prev) => {
      const stage = prev[stageName] || {};
      const row = stage[rowId] || {};
      const updated = {
        ...prev,
        [stageName]: {
          ...stage,
          [rowId]: {
            ...row,
            [metricKey]: !row[metricKey],
          },
        },
      };
      return updated;
    });
  };
  const toggleNRAdCell = (stageName, rowId, metricKey) => {
    setNrAdCells((prev) => {
      const stage = prev[stageName] || {};
      const row = stage[rowId] || {};
      const updated = {
        ...prev,
        [stageName]: {
          ...stage,
          [rowId]: {
            ...row,
            [metricKey]: !row[metricKey],
          },
        },
      };
      return updated;
    });
  };

  // Add this function after the toggleNRAdCell function
  const { aggregateMetrics } = useAggregatedMetrics();

  const mergeAdditionalKPIs = () => {
    if (!currentEditingStage) return;

    // Update the merged headers and body for this stage
    setMergedTableHeadersByStage((prev) => {
      const currentHeaders = [...(prev[currentEditingStage] || [])];

      // Keep default headers that shouldn't be removed
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
        "GRP",
      ];

      // Filter out headers that are not default and not in selectedMetrics
      const filteredHeaders = currentHeaders.filter((header) => {
        return (
          defaultHeaders.includes(header.name) ||
          selectedMetrics.some((m) => m.name === header.name)
        );
      });

      // Add any new selected metrics that aren't already in the headers
      selectedMetrics.forEach((metric) => {
        if (!filteredHeaders.some((h) => h.name === metric.name)) {
          filteredHeaders.push(metric);
        }
      });

      // //console.log("filteredHeaders", filteredHeaders)

      return {
        ...prev,
        [currentEditingStage]: filteredHeaders,
      };
    });

    // Update the body fields to match the headers
    setMergedTableBodyByStage((prev) => {
      const newBody = [];

      // Get the updated headers
      const updatedHeaders =
        mergedTableHeadersByStage[currentEditingStage] || [];

      // Add body fields for each header
      updatedHeaders.forEach((header) => {
        const bodyField = header.name
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/\//g, "")
          .replace(/-/g, "_");
        if (!newBody.includes(bodyField)) {
          newBody.push(bodyField);
        }
      });

      // Add body fields for each selected metric
      selectedMetrics.forEach((metric) => {
        if (!metric || !metric.name) return;
        const bodyField = headerToBodyField(metric.name);
        if (bodyField && !newBody.includes(bodyField)) {
          newBody.push(bodyField);
        }
      });

      return {
        ...prev,
        [currentEditingStage]: newBody,
      };
    });

    setIsOpen(false);
    setCampaignFormData((prev) => {
      const updatedData = {
        ...prev,
        table_headers: {
          ...prev.table_headers,
          [currentEditingStage]: Array.from(
            new Set([
              ...(prev.table_headers?.[currentEditingStage] || []),
              ...selectedMetrics.map((m) => m.obj),
            ])
          ),
        },
        selected_metrics: {
          ...prev.selected_metrics,
          [currentEditingStage]: selectedMetrics,
        },
      };
      updateCampaign({
        table_headers: updatedData.table_headers,
        selected_metrics: updatedData.selected_metrics,
      });
      return updatedData;
    });
  };

  const toggleNRColumn = (stageName, columnName) => {
    const formattedCoulumnName = columnName
      .toLowerCase()
      .replace(/ /g, "_")
      .replace(/\//g, "")
      .replace(/-/g, "_");
    setNrColumnsByStage((prev) => {
      const current = new Set(prev[stageName] || []);
      if (current.has(formattedCoulumnName)) {
        current.delete(formattedCoulumnName);
      } else {
        current.add(formattedCoulumnName);
      }
      return { ...prev, [stageName]: Array.from(current) };
    });
  };

  const initializedRef = useRef(false);

  // Helper function to convert header name to body field name
  const headerToBodyField = (headerName) => {
    if (!headerName) return "";
    return headerName
      ?.toLowerCase()
      ?.replace(/ /g, "_")
      ?.replace(/\//g, "")
      ?.replace(/-/g, "_");
  };

  useEffect(() => {
    if (!campaignFormData) return;

    const headersByStage = {};
    const bodyByStage = {};

    const defaultHeaders = tableHeaders["Brand Awareness"];

    for (const stageName of Object.keys(
      campaignFormData?.selected_metrics || {}
    )) {
      const headersSet = new Map(); // to deduplicate by name
      const bodyFieldsSet = new Set();

      // Add default headers
      defaultHeaders.forEach((header) => {
        headersSet.set(header?.name, { ...header });
        const bodyField = headerToBodyField(header?.name);
        if (bodyField) bodyFieldsSet.add(bodyField);
      });

      // Get selected metrics for this stage
      const selectedMetricsForStage =
        campaignFormData?.selected_metrics?.[stageName] || [];

      selectedMetricsForStage.forEach((metric) => {
        if (!metric || !metric.name) return;
        headersSet.set(metric.name, { ...metric });

        // Add corresponding body field
        const bodyField = headerToBodyField(metric.name);
        if (bodyField) bodyFieldsSet.add(bodyField);
      });

      headersByStage[stageName] = Array.from(headersSet.values());
      bodyByStage[stageName] = Array.from(bodyFieldsSet);
    }

    setMergedTableHeadersByStage(headersByStage);
    setMergedTableBodyByStage(bodyByStage);
  }, [campaignFormData]);

  // Initialize selectedMetrics with metrics that are already in the table
  useEffect(() => {
    if (currentEditingStage && isOpen && !initializedRef.current) {
      initializedRef.current = true;

      // Load selectedMetrics from backend for this stage
      const backendSelectedMetrics =
        campaignFormData?.selected_metrics?.[currentEditingStage] || [];

      // If we have a campaign objective in context, also include its metrics
      const currentObjective = campaignFormData?.campaign_objective;
      let contextBasedMetrics = [];

      if (currentObjective && tableHeaders[currentObjective]) {
        const defaultHeaders = [
          "Channel", "AdSets", "Audience", "Start Date", "End Date",
          "Audience Size", "Budget Size", "CPM", "Impressions",
          "Frequency", "Reach", "GRP"
        ];

        const availableMetrics = tableHeaders[currentObjective] || [];
        contextBasedMetrics = availableMetrics
          ?.filter((mm) => !defaultHeaders.includes(mm?.name))
          .map((metric) => ({
            ...metric,
            obj: currentObjective,
          }));
      }

      // Combine backend metrics with context-based metrics, avoiding duplicates
      const combinedMetrics = [...backendSelectedMetrics];
      contextBasedMetrics.forEach((contextMetric) => {
        const exists = combinedMetrics.some(
          (existing) => existing.name === contextMetric.name && existing.obj === contextMetric.obj
        );
        if (!exists) {
          combinedMetrics.push(contextMetric);
        }
      });

      // If we have a current objective and no backend metrics for this stage,
      // automatically select the context-based metrics
      if (currentObjective && backendSelectedMetrics.length === 0 && contextBasedMetrics.length > 0) {
        setSelectedMetrics(contextBasedMetrics);
        // Immediately update context state
        updateContextWithMetrics(contextBasedMetrics);
        // Also update table headers
        updateContextWithTableHeaders([currentObjective]);
      } else {
        setSelectedMetrics(combinedMetrics);
        // Immediately update context state
        updateContextWithMetrics(combinedMetrics);
        // Also update table headers
        const objectives = [...new Set(combinedMetrics.map(m => m.obj))];
        updateContextWithTableHeaders(objectives);
      }
    }
  }, [currentEditingStage, isOpen, campaignFormData?.campaign_objective]);

  // Reset initialization flag when modal closes or stage changes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure state updates are complete
      setTimeout(() => {
        initializedRef.current = false;
      }, 100);
    }
  }, [isOpen, currentEditingStage]);

  // Reset initialization when campaign objective changes
  useEffect(() => {
    initializedRef.current = false;
  }, [campaignFormData?.campaign_objective]);

  // Use a ref to track if we've already aggregated the data
  const hasAggregatedRef = useRef(false);
  const previousDataSignatureRef = useRef("");

  // Add this useEffect with proper dependencies
  useEffect(() => {
    if (
      campaignFormData &&
      campaignFormData.channel_mix &&
      campaignFormData.channel_mix.length > 0
    ) {
      // Create a signature of the data excluding KPI values to avoid loops
      const dataSignature = JSON.stringify(
        campaignFormData.channel_mix?.map((stage) =>
          Object.entries(stage)
            .filter(([key]) => key !== "kpi") // Exclude kpi to avoid loops
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
        )
      );

      // Only aggregate if the data signature has changed
      if (previousDataSignatureRef.current !== dataSignature) {
        aggregateMetrics();
        previousDataSignatureRef.current = dataSignature;
        hasAggregatedRef.current = true;
      }
    }
  }, [aggregateMetrics, campaignFormData]);

  // Remove or comment out the other useEffect that resets hasAggregatedRef
  // useEffect(() => {
  //   hasAggregatedRef.current = false
  // }, [JSON.stringify(campaignFormData?.channel_mix)])

  const handleEditInfo = (
    stageName,
    channelName,
    platformName,
    fieldName,
    value,
    adSetIndex,
    extraAdSetindex
  ) => {
    setCampaignFormData((prevData) => {
      const updatedData = { ...prevData };
      const channelMix = updatedData.channel_mix?.find(
        (ch) => ch.funnel_stage === stageName
      );

      if (channelMix) {
        const platform = channelMix[channelName]?.find(
          (platform) => platform.platform_name === platformName
        );

        if (platform) {
          if (fieldName === "budget_size") {
            if (extraAdSetindex !== "") {
              if (!platform.ad_sets?.[adSetIndex]) return updatedData;

              platform.ad_sets[adSetIndex]["extra_audiences"] =
                platform.ad_sets[adSetIndex]["extra_audiences"] || [];

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] =
                platform.ad_sets[adSetIndex]["extra_audiences"][
                extraAdSetindex
                ] || {};

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex][
                "budget"
              ] =
                platform.ad_sets[adSetIndex]["extra_audiences"][
                extraAdSetindex
                ]["budget"] || {};

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex][
                "budget"
              ]["fixed_value"] = value.toString();
            } else if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["budget"] =
                platform.ad_sets[adSetIndex]["budget"] || {};
              platform.ad_sets[adSetIndex]["budget"]["fixed_value"] =
                value.toString();
            } else {
              platform["budget"] = platform["budget"] || {};
              platform["budget"]["fixed_value"] = value.toString();
            }
          } else if (fieldName === "audience_size") {
            // //console.log("here", { adSetIndex })
            if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["size"] =
                platform.ad_sets[adSetIndex]["size"] || "";
              platform.ad_sets[adSetIndex]["size"] = value.toString();
            }
          } else {
            if (extraAdSetindex !== "") {
              if (!platform.ad_sets?.[adSetIndex]) return updatedData;

              platform.ad_sets[adSetIndex]["extra_audiences"] =
                platform.ad_sets[adSetIndex]["extra_audiences"] || [];

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex] =
                platform.ad_sets[adSetIndex]["extra_audiences"][
                extraAdSetindex
                ] || {};

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex][
                "kpi"
              ] =
                platform.ad_sets[adSetIndex]["extra_audiences"][
                extraAdSetindex
                ]["kpi"] || {};

              platform.ad_sets[adSetIndex]["extra_audiences"][extraAdSetindex][
                "kpi"
              ][fieldName] = Number(value);
            } else if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["kpi"] =
                platform.ad_sets[adSetIndex]["kpi"] || {};
              platform.ad_sets[adSetIndex]["kpi"][fieldName] = Number(value);
            } else {
              if (campaignFormData?.goal_level !== "Adset level") {
                platform["kpi"] = platform["kpi"] || {};
                platform["kpi"][fieldName] = Number(value);
              }
            }
          }
        }
      }

      return updatedData;
    });
  };

  // Process data once at the top level

  // const allObjectives = useMemo(() => Object.keys(tableHeaders), []);

  const objectivesForStage = useMemo(() => {
    return currentEditingStage
      ? campaignFormData?.table_headers?.[currentEditingStage] || []
      : [];
  }, [campaignFormData, currentEditingStage]);

  const existingHeaderNames = useMemo(() => {
    if (
      !currentEditingStage ||
      !mergedTableHeadersByStage ||
      !mergedTableHeadersByStage[currentEditingStage]
    ) {
      return [];
    }
    return mergedTableHeadersByStage[currentEditingStage]
      .map((h) => h?.name)
      .filter(Boolean);
  }, [mergedTableHeadersByStage, currentEditingStage]);

  return (
    <div className="my-5 mx-[40px]">
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = campaignFormData?.custom_funnels?.find(
          (s) => s.name === stageName
        );
        const funn = funnelStages?.find((f) => f.name === stageName);
        if (!stage) return null;

        const stageData = processedData[stage?.name] || [];
        return (
          <FunnelStageTable
            key={index}
            stage={stage}
            stageData={stageData}
            campaignObjectives={campaignFormData?.campaign_objectives}
            goalLevel={campaignFormData?.campaign_budget?.level}
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
        );
      })}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[700px] bg-white rounded-[10px] shadow-lg p-4">
          <p className="text-[20px] font-medium mb-4">
            Select Metrics for {currentEditingStage}
          </p>
          <p>Add specific metrics to this stage's table</p>

          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {(() => {
              const allObjectives = Object.keys(tableHeaders);
              const currentObjective = campaignFormData?.campaign_objective;

              // Prioritize the current campaign objective first, then show others
              const sortedObjectives = allObjectives.sort((a, b) => {
                if (a === currentObjective) return -1;
                if (b === currentObjective) return 1;
                return 0;
              });

              const filteredObjectives = sortedObjectives.filter((objective) => {
                // Always show the current campaign objective
                if (objective === currentObjective) return true;

                // Always show categories that have selected metrics
                const hasSelectedMetrics = selectedMetrics.some(
                  (m) => m.obj === objective
                );

                // Show if not Brand Awareness, or has selected metrics
                return objective !== "Brand Awareness" || hasSelectedMetrics;
              });

              const areAllSelected = (objective, availableMetrics) => {
                return availableMetrics.every((metric) =>
                  selectedMetrics.some(
                    (m) => m.name === metric.name && m.obj === objective
                  )
                );
              };

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
                  "GRP",
                ];
                const availableMetrics = tableHeaders[objective] || [];

                // Show all metrics, but filter out default headers
                const filterAvailableMetrics = availableMetrics
                  ?.filter((mm) => !defaultHeaders.includes(mm?.name))
                  .map((metric) => ({
                    ...metric,
                    obj: objective, // Add the new property 'obj' with the current objective
                  }));

                if (filterAvailableMetrics.length === 0) return null;

                return (
                  <div key={index} className="mb-4">
                    <p className={`font-medium text-[16px] mb-2 ${objective === currentObjective
                      ? "text-[#3175FF] font-semibold"
                      : ""
                      }`}>
                      {objective}
                      {objective === currentObjective && (
                        <span className="ml-2 text-xs bg-[#3175FF] text-white px-2 py-1 rounded">
                          Current Objective
                        </span>
                      )}
                    </p>

                    <div className="flex items-center mb-2 pl-4">
                      <input
                        type="checkbox"
                        id={`select-all-${objective}`}
                        className="mr-2"
                        checked={areAllSelected(
                          objective,
                          filterAvailableMetrics
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Add all metrics for this objective
                            setSelectedMetrics((prev) => {
                              // Filter out any existing metrics for this objective
                              const filtered = prev.filter(
                                (m) => m.obj !== objective
                              );
                              // Add all metrics for this objective
                              const newMetrics = [...filtered, ...filterAvailableMetrics];
                              // Immediately update context state
                              updateContextWithMetrics(newMetrics);
                              // Also update table headers
                              updateContextWithTableHeaders([objective]);
                              return newMetrics;
                            });
                          } else {
                            // Remove all metrics for this objective
                            setSelectedMetrics((prev) => {
                              const newMetrics = prev.filter((m) => m.obj !== objective);
                              // Immediately update context state
                              updateContextWithMetrics(newMetrics);
                              // Also update table headers (remove objective if no metrics left)
                              const remainingObjectives = [...new Set(newMetrics.map(m => m.obj))];
                              updateContextWithTableHeaders(remainingObjectives);
                              return newMetrics;
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`select-all-${objective}`}
                        className="text-sm font-medium">
                        Select All
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {filterAvailableMetrics.map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={`metric-${objective}-${metricIndex}`}
                            className="mr-2"
                            checked={selectedMetrics.some(
                              (m) =>
                                m &&
                                m.name === metric.name &&
                                m.obj === objective
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // Add only this specific metric
                                setSelectedMetrics((prev) => {
                                  // Check if this metric already exists with a different objective
                                  const existingMetricIndex = prev.findIndex(
                                    (m) => m.name === metric.name
                                  );

                                  let newMetrics;
                                  // If it exists with a different objective, replace it
                                  if (existingMetricIndex >= 0) {
                                    newMetrics = [...prev];
                                    newMetrics[existingMetricIndex] = {
                                      ...metric,
                                      obj: objective,
                                    };
                                  } else {
                                    // Otherwise, just add the new metric
                                    newMetrics = [
                                      ...prev,
                                      { ...metric, obj: objective },
                                    ];
                                  }
                                  // Immediately update context state
                                  updateContextWithMetrics(newMetrics);
                                  // Also update table headers
                                  const objectives = [...new Set(newMetrics.map(m => m.obj))];
                                  updateContextWithTableHeaders(objectives);
                                  return newMetrics;
                                });
                              } else {
                                // Remove only this specific metric
                                setSelectedMetrics((prev) => {
                                  const newMetrics = prev.filter(
                                    (m) =>
                                      !(
                                        m.name === metric.name &&
                                        m.obj === objective
                                      )
                                  );
                                  // Immediately update context state
                                  updateContextWithMetrics(newMetrics);
                                  // Also update table headers
                                  const objectives = [...new Set(newMetrics.map(m => m.obj))];
                                  updateContextWithTableHeaders(objectives);
                                  return newMetrics;
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`metric-${objective}-${metricIndex}`}
                            className="text-sm flex items-center">
                            <span>{metric.name}</span>
                            {existingHeaderNames.includes(metric.name) && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                exists on table
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <div
            className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit ml-auto mt-4 flex justify-end font-medium cursor-pointer"
            onClick={() => {
              mergeAdditionalKPIs();
              setIsOpen(false);
            }}>
            {selectedMetrics?.length < 1 ? "Close" : "Update Table"}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableView;
