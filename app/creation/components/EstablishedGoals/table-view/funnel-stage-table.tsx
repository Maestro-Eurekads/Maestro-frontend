import React from "react";
import Image from "next/image";
import { ChannelRow } from "./channel-row";
import { AdSetRow } from "./ad-set-row";
import { KPIRow } from "./kpi-row";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getCurrencySymbol } from "components/data";

export const FunnelStageTable = ({
  stage,
  stageData,
  campaignObjectives,
  goalLevel,
  expandedRows,
  toggleRow,
  handleEditInfo,
  tableHeaders,
  tableBody,
  expandedKPI,
  toggleKPIShow,
  expandedAdsetKPI,
  toggleAdSetKPIShow,
  nrColumns,
  toggleNRColumn,
  setIsOpen,
  setCurrentEditingStage,
  nrCells,
  toggleNRCell,
  nrAdCells,
  toggleNRAdCell,
}) => {
  const {campaignFormData} = useCampaigns()
  // Fallback color if stage.color is undefined
  const changeColorText = stage?.color?.replace("bg", "text")
  // console.log("🚀 ~ changeColorText:", changeColorText)
  const stageColor = changeColorText || "#3175FF";
  const channels = stageData?.map((channel) => channel?.channel_name) || [];
  const stageBudget = campaignFormData?.channel_mix?.find((f)=>f?.funnel_stage === stage.name)?.stage_budget
  const offlineChannels = ["ooh", "print", "broadcast"];
  const hasOfflineChannel = channels.some((channel) =>
    offlineChannels.includes(channel?.toLowerCase())
  );
  // Function to check if the channel is offline

  return (
    <section className="mb-[30px]">
      <div className="flex items-center justify-between mb-5 w-full">
        <div>
          <h1 className={`text-[18px] font-[600] ${stageColor}`} >
            {stage?.name}
          </h1>
          <p>Phase Budget: {`${getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}${Number(stageBudget?.fixed_value || 0).toLocaleString() || 0}`}</p>
        </div>
        <div
          className="p-3 bg-[#3175FF] rounded-[10px] text-white w-fit font-medium cursor-pointer"
          onClick={() => {
            setIsOpen(true);
            setCurrentEditingStage(stage?.name);
          }}
        >
          Edit KPIs
        </div>
      </div>
      <div className="rounded-xl border border-[#E5E5E5]">
        <div className="rounded-xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="whitespace-nowrap">
              <tr className="bg-[#F5F5F5]">
                {tableHeaders?.map((header, hIndex) => (
                  <th
                    key={hIndex}
                    className={`py-4 px-3 cursor-pointer ${
                      nrColumns?.includes(
                        header.name
                          .toLowerCase()
                          .replace(/ /g, "_")
                          .replace(/\//g, "")
                          .replace(/-/g, "_")
                      )
                        ? "text-gray-400"
                        : ""
                    } w-[150px]`}
                    // onClick={() => toggleNRColumn(stage.name, header.name)}
                  >
                    {header?.name === "Audience"
                      ? ""
                      : header?.name === "Budget Size"
                      ? "Budget"
                      : goalLevel === "Channel level" &&
                        header?.name === "Audience Size"
                      ? ""
                      : header?.name === "GRP"
                      ? hasOfflineChannel
                        ? header?.name
                        : ""
                      : header?.name}
                    {nrColumns?.includes(
                      header.name
                        .toLowerCase()
                        .replace(/ /g, "_")
                        .replace(/\//g, "")
                        .replace(/-/g, "_")
                    )
                      ? "(NR)"
                      : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {stageData.map((channel, index) => (
                <React.Fragment key={index}>
                  {/* Parent Row */}
                  <ChannelRow
                    key={index}
                    channel={channel}
                    index={index}
                    stage={stage}
                    tableBody={tableBody}
                    tableHeaders={tableHeaders}
                    goalLevel={goalLevel}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    handleEditInfo={handleEditInfo}
                    expandedKPI={expandedKPI}
                    toggleKPIShow={toggleKPIShow}
                    nrColumns={nrColumns}
                    nrCells={nrCells}
                    toggleNRCell={toggleNRCell}
                    hasOfflineChannel={hasOfflineChannel}
                  />

                  {/* Sub-table (Expanded Rows) */}
                  {expandedRows[`${stage.name}${index}`] &&
                    channel?.ad_sets?.map((adSet, adSetIndex) => (
                      <>
                        <AdSetRow
                          key={adSetIndex}
                          adSet={adSet}
                          adSetIndex={adSetIndex}
                          channel={channel}
                          stage={stage}
                          tableBody={tableBody}
                          tableHeaders={tableHeaders}
                          handleEditInfo={handleEditInfo}
                          expandedAdsetKPI={expandedAdsetKPI}
                          toggleAdSetKPIShow={toggleAdSetKPIShow}
                          nrAdCells={nrAdCells}
                          toggleNRAdCell={toggleNRAdCell}
                          hasOfflineChannel={hasOfflineChannel}
                        />
                        {expandedAdsetKPI[`${stage.name}${adSetIndex}`] &&
                          adSet?.extra_audiences?.map((adSet, exIndex) => (
                            <KPIRow
                              key={`${adSetIndex}-${exIndex}`}
                              adSet={adSet}
                              adSetIndex={adSetIndex}
                              extraAdSetindex={exIndex}
                              channel={channel}
                              stage={stage}
                              tableBody={tableBody}
                              tableHeaders={tableHeaders}
                              handleEditInfo={handleEditInfo}
                              expandedAdsetKPI={expandedAdsetKPI}
                              toggleAdSetKPIShow={toggleAdSetKPIShow}
                              nrAdCells={nrAdCells}
                              toggleNRAdCell={toggleNRAdCell}
                            />
                          ))}
                      </>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
