import React from "react";
import Image from "next/image";
import { ChannelRow } from "./channel-row";
import { AdSetRow } from "./ad-set-row";
import { KPIRow } from "./kpi-row";

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
  // Fallback color if stage.color is undefined
  const stageColor = stage?.color || "#3175FF";

  return (
    <section className="mb-[30px]">
      <div className="flex items-center justify-between mb-5 w-full">
        <h1
          className="text-[18px] font-[600]"
          style={{ color: stageColor }}
        >
          {stage?.name}
        </h1>
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
                    }`}
                    onClick={() => toggleNRColumn(stage.name, header.name)}
                  >
                    {header?.name === "Audience" ? "" : header?.name === "Budget Size" ? "Budget": (goalLevel === "Channel level" &&header?.name === "Audience Size")? "" :header?.name}
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