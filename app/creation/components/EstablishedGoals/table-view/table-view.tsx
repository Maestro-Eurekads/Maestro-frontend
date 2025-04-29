"use client";

import { useEffect, useState } from "react";
import { useCampaigns } from "app/utils/CampaignsContext";
import { funnelStages } from "components/data";
import { tableHeaders, tableBody } from "utils/tableHeaders";
import { FunnelStageTable } from "./funnel-stage-table";
import { extractPlatforms } from "./data-processor";
import Modal from "components/Modals/Modal";

const TableView = () => {
  const [expandedRows, setExpandedRows] = useState({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const [isOpen, setIsOpen] = useState(false);
  const [mergedTableHeaders, setMergedTableHeaders] = useState([]);
  const [mergedTableBody, setMergedTableBody] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [expandedKPI, setExpandedKPI] = useState({});
  const [expandedAdsetKPI, setExpandedAdsetKPI] = useState({});

  // Initialize merged headers and body when campaign objectives change
  useEffect(() => {
    const existingHeaderNames = new Set(
      tableHeaders[campaignFormData?.campaign_objectives]?.map(
        (header) => header.name
      ) || []
    );
    const newHeaders = [
      ...(tableHeaders[campaignFormData?.campaign_objectives] || []),
    ];
    const newBody = [
      ...(tableBody[campaignFormData?.campaign_objectives] || []),
    ];

    selectedMetrics.forEach((metric) => {
      if (!existingHeaderNames.has(metric.name)) {
        newHeaders.push(metric);
        existingHeaderNames.add(metric.name);

        const bodyField = metric.name
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/\//g, "")
          .replace(/-/g, "_");
        if (!newBody.includes(bodyField)) {
          newBody.push(bodyField);
        }
      }
    });

    setMergedTableHeaders(newHeaders);
    setMergedTableBody(newBody);
  }, [selectedMetrics, campaignFormData?.campaign_objectives]);

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
  }

  const toggleAdSetKPIShow = (index) => {
    setExpandedAdsetKPI((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  const mergeAdditionalKPIs = () => {
    // Create a set of existing header names to avoid duplicates
    const existingHeaderNames = new Set(
      mergedTableHeaders.map((header) => header.name)
    );

    // Create a new array with all existing headers
    const newHeaders = [...mergedTableHeaders];

    // Create a new array with all existing body fields
    const newBody = [...mergedTableBody];

    // Add headers and body fields from each selected metric
    selectedMetrics.forEach((metric) => {
      if (!existingHeaderNames.has(metric.name)) {
        // Add the header
        newHeaders.push(metric);
        existingHeaderNames.add(metric.name);

        // Add the corresponding body field
        const bodyField = metric.name
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/\//g, "")
          .replace(/-/g, "_");

        if (!newBody.includes(bodyField)) {
          newBody.push(bodyField);
        }
      }
    });

    // Update the merged headers and body
    setMergedTableHeaders(newHeaders);
    setMergedTableBody(newBody);
    setIsOpen(false);
  };

  const handleEditInfo = (
    stageName,
    channelName,
    platformName,
    fieldName,
    value,
    adSetIndex
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
            if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["budget"] =
                platform.ad_sets[adSetIndex]["budget"] || {};
              platform.ad_sets[adSetIndex]["budget"]["fixed_value"] =
              value.toString();
            } else {
              platform["budget"] = platform["budget"] || {};
              platform["budget"]["fixed_value"] = value.toString();
            }
          } else {
            if (adSetIndex !== "") {
              platform.ad_sets[adSetIndex]["kpi"] =
                platform.ad_sets[adSetIndex]["kpi"] || {};
              platform.ad_sets[adSetIndex]["kpi"][fieldName] = Number(value);
            } else {
              platform["kpi"] = platform["kpi"] || {};
              platform["kpi"][fieldName] = Number(value);
            }
          }
        }
      }

      return updatedData;
    });
  };

  // Process data once at the top level
  const processedData = extractPlatforms(campaignFormData);

  return (
    <div className="my-5 mx-[40px]">
      <div
        className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit ml-auto mb-5 flex justify-end font-medium cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Edit KPIs
      </div>
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
            goalLevel={campaignFormData?.goal_level}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            handleEditInfo={handleEditInfo}
            tableHeaders={mergedTableHeaders}
            tableBody={mergedTableBody}
            expandedKPI={expandedKPI}
            toggleKPIShow={toggleKPIShow}
            expandedAdsetKPI={expandedAdsetKPI}
            toggleAdSetKPIShow={toggleAdSetKPIShow}
          />
        );
      })}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[700px] bg-white rounded-[10px] shadow-lg p-4">
          <p className="text-[20px] font-medium mb-4">Select Metrics</p>
          <p>Add specific metrics to your existing table</p>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            {Object.keys(tableHeaders)
              .filter(
                (header) =>
                  header !== campaignFormData?.campaign_objective &&
                  header !== "Brand Awareness"
              )
              .map((kpiCategory, index) => (
                <div key={index} className="mb-4">
                  <p className="font-medium text-[16px] mb-2">{kpiCategory}</p>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {tableHeaders[kpiCategory]
                      .filter(
                        (header) =>
                          // Filter out headers that are already in the current campaign objective
                          !tableHeaders[
                            campaignFormData?.campaign_objectives
                          ]?.some(
                            (existingHeader) =>
                              existingHeader.name === header.name
                          )
                      )
                      .map((metric, metricIndex) => (
                        <div
                          key={metricIndex}
                          className="flex items-center mb-2"
                        >
                          <input
                            type="checkbox"
                            id={`metric-${kpiCategory}-${metricIndex}`}
                            className="mr-2"
                            checked={selectedMetrics.some(
                              (m) => m.name === metric.name
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMetrics((prev) => [...prev, metric]);
                              } else {
                                setSelectedMetrics((prev) =>
                                  prev.filter((m) => m.name !== metric.name)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`metric-${kpiCategory}-${metricIndex}`}
                            className="text-sm"
                          >
                            {metric.name}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
          <div
            className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit ml-auto mt-4 flex justify-end font-medium cursor-pointer"
            onClick={mergeAdditionalKPIs}
          >
            {selectedMetrics?.length < 1 ? "Close" : "Update Table"}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableView;
