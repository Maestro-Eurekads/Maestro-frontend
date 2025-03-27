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
  const [additionalKPIs, setAdditionalKPIs] = useState([]);
  const [mergedTableBody, setMergedTableBody] = useState([]);

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

    additionalKPIs.forEach((kpi) => {
      tableHeaders[kpi]?.forEach((header) => {
        if (!existingHeaderNames.has(header.name)) {
          newHeaders.push(header);
          existingHeaderNames.add(header.name);

          const bodyField = header.name
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/\//g, "")
            .replace(/-/g, "_");
          if (!newBody.includes(bodyField)) {
            newBody.push(bodyField);
          }
        }
      });
    });

    setMergedTableHeaders(newHeaders);
    setMergedTableBody(newBody);
  }, [additionalKPIs, campaignFormData?.campaign_objectives]);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const mergeAdditionalKPIs = () => {
    // Create a set of existing header names to avoid duplicates
    const existingHeaderNames = new Set(
      mergedTableHeaders.map((header) => header.name)
    );

    // Create a new array with all existing headers
    const newHeaders = [...mergedTableHeaders];

    // Create a new array with all existing body fields
    const newBody = [...mergedTableBody];

    // Add headers and body fields from each selected KPI
    additionalKPIs.forEach((kpi) => {
      tableHeaders[kpi]?.forEach((header) => {
        if (!existingHeaderNames.has(header.name)) {
          // Add the header
          newHeaders.push(header);
          existingHeaderNames.add(header.name);

          // Add the corresponding body field
          const bodyField = header.name
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/\//g, "")
            .replace(/-/g, "_");

          if (!newBody.includes(bodyField)) {
            newBody.push(bodyField);
          }
        }
      });
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
    console.log("Calling function");
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
        Add More KPIs
      </div>
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = funnelStages.find((s) => s.name === stageName);
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
          />
        );
      })}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="w-[600px] bg-white rounded-[10px] shadow-lg p-4">
          <p className="text-[20px] font-medium mb-4">Select New KPIs</p>
          <p>Add more KPIs to your exisiting table</p>
          <div className="mt-4">
            {Object.keys(tableHeaders)
              .filter(
                (header) => header !== campaignFormData?.campaign_objectives
              )
              .map((header, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`kpi-${header}`}
                    className="mr-2"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAdditionalKPIs((prevData) => [...prevData, header]);
                      } else {
                        setAdditionalKPIs((prev) => {
                          const newArr = prev.filter((r) => r !== header);
                          return newArr;
                        });
                      }
                    }}
                  />
                  <label htmlFor={`kpi-${header}`} className="text-sm">
                    {header}
                  </label>
                </div>
              ))}
          </div>
          <div
            className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit ml-auto mt-4 flex justify-end font-medium cursor-pointer"
            onClick={mergeAdditionalKPIs}
          >
            Update Table
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableView;
