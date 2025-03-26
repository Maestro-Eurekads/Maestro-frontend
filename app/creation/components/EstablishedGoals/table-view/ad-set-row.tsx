"use client"

export const AdSetRow = ({ adSet, adSetIndex, channel, stage, handleEditInfo }) => {
  return (
    <tr className="bg-white">
      <td className="py-6 px-6 border-none">
        <div className="flex gap-2">
          <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
            {adSetIndex + 1}.
          </span>
          <span>{adSet?.name ? adSet?.name : "-"}</span>
        </div>
      </td>
      <td className="!py-0 px-6 border-none">{adSet?.audience_type ? adSet?.audience_type : "-"}</td>
      <td className="!py-0 px-6 border-none">{channel.startDate ? channel.startDate : "-"}</td>
      <td className="!py-0 px-6 border-none">{channel.endDate ? channel.endDate : "-"}</td>
      <td className="!py-0 px-6 border-none">{adSet?.size ? adSet?.size : "-"}</td>
      <td className="!py-0 px-6 border-none">{adSet.budget ? adSet.budget : "-"}</td>
      <td className="!py-0 px-3 border-none">
        <input
          type="text"
          placeholder="CPM"
          className="cpm-bg border-none outline-none w-full p-1"
          value={adSet?.cpm || ""}
          onChange={(e) =>
            handleEditInfo(stage.name, channel?.channelName, channel?.name, "cpm", e.target.value, adSetIndex)
          }
        />
      </td>
      <td className="!py-0 px-6 border-none">{adSet.audience ? adSet.audience : "-"}</td>
      <td className="!py-0 px-6 border-none">
        <input
          type="text"
          placeholder="Frequency"
          className="cpm-bg border-none outline-none w-full p-1"
          value={adSet?.frequency || ""}
          onChange={(e) =>
            handleEditInfo(stage.name, channel?.channelName, channel?.name, "frequency", e.target.value, adSetIndex)
          }
        />
      </td>
      <td className="!py-0 px-6 border-none">{adSet.reach ? adSet.reach : "-"}</td>
    </tr>
  )
}

