import { calculateImpression, calculateReach } from "utils/formula"
import { CellRenderer } from "./cell-renderer"

export const ChannelRow = ({
  channel,
  index,
  stage,
  tableBody,
  tableHeaders,
  goalLevel,
  expandedRows,
  toggleRow,
  handleEditInfo,
}) => {
  // Pre-calculate derived values
  const calculatedValues = {
    impressions: calculateImpression(Number(channel["budget_size"]), Number(channel["cpm"])),
    reach: calculateReach(Number(channel["impressions"]), Number(channel["frequency"])),
  }

  return (
    <tr key={index} className="border-t bg-white hover:bg-gray-100">
      {tableBody?.map((body, bodyIndex) => (
        <td key={bodyIndex} className="py-6 px-6 text-[15px]">
          <CellRenderer
            body={body}
            channel={channel}
            calculatedValues={calculatedValues}
            tableHeaders={tableHeaders}
            bodyIndex={bodyIndex}
            goalLevel={goalLevel}
            stage={stage}
            index={index}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            handleEditInfo={handleEditInfo}
          />
        </td>
      ))}
    </tr>
  )
}

