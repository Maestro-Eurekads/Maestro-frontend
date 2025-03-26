import React from "react"
import Image from "next/image"
import { ChannelRow } from "./channel-row"
import { AdSetRow } from "./ad-set-row"

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
}) => {
  return (
    <section className="mb-[30px]">
      <h1 className="text-[#061237] text-[18px] font-[600] mb-5 flex gap-2">
        <Image src={stage?.icon || "/placeholder.svg"} width={30} height={30} alt="" />
        {stage?.name}
      </h1>
      <div className="rounded-xl border border-[#E5E5E5]">
        <div className="rounded-xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="whitespace-nowrap">
              <tr className="bg-[#F5F5F5]">
                {tableHeaders?.map((header, hIndex) => (
                  <th key={hIndex} className="py-4 px-6">
                    {header?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="whitespace-nowrap">
              {stageData.map((channel, index) => (
                <React.Fragment key={index}>
                  {/* Parent Row */}
                  <ChannelRow
                    channel={channel}
                    index={index}
                    stage={stage}
                    tableBody={tableBody}
                    tableHeaders={tableHeaders}
                    goalLevel={goalLevel}
                    expandedRows={expandedRows}
                    toggleRow={toggleRow}
                    handleEditInfo={handleEditInfo}
                  />

                  {/* Sub-table (Expanded Rows) */}
                  {expandedRows[`${stage.name}${index}`] &&
                    channel?.ad_sets?.map((adSet, adSetIndex) => (
                      <AdSetRow
                        key={adSetIndex}
                        adSet={adSet}
                        adSetIndex={adSetIndex}
                        channel={channel}
                        stage={stage}
                        handleEditInfo={handleEditInfo}
                      />
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

