import React, { useState } from "react";
import Image from "next/image";
import zoom from "../../../../public/tabler_zoom-filled.svg";
import credit from "../../../../public/mdi_credit-card.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import {
  funnels,
  funnelStages,
  getCurrencySymbol,
  getPlatformIcon,
  mediaTypes,
  platformStyles,
} from "components/data";
import moment from "moment";
import { tableBody, tableHeaders } from "utils/tableHeaders";
import { calculateImpression, calculateReach, Formulas } from "utils/formula";

const TableView = () => {
  const [expandedRows, setExpandedRows] = useState({});
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  function extractPlatforms(data) {
    const platforms = {};
    const headers = tableHeaders[campaignFormData?.campaign_objective] || []; // Get dynamic headers for this stage
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        platforms[stageName] = platforms[stageName] || [];
        mediaTypes.forEach(
          (channelType) => {
            stage[channelType].forEach((platform) => {
              const platformName = platform.platform_name;
              const existingPlatform = platforms[stageName].find(
                (p) => p.name === platformName
              );
              if (!existingPlatform) {
                const style =
                  platformStyles.find((style) => style.name === platformName) ||
                  platformStyles[
                  Math.floor(Math.random() * platformStyles.length)
                  ];
                // Dynamically map headers to values
                const rowData = headers
                  ?.filter((h: { showInput: boolean }) => h?.showInput)
                  .reduce(
                    (
                      acc: Record<string, any>,
                      header: { name: string; showInput: boolean }
                    ) => {
                      const key = header.name
                        .replace(/ /g, "_")
                        .replace(/\//g, "")
                        .replace(/-/g, "_")
                        .toLowerCase(); // Convert header to key format 
                      acc[key] =
                        platform?.["kpi"]?.[key] ||
                        (header.showInput ? "" : "-"); // Set default values
                      return acc;
                    },
                    {}
                  );
                platforms[stageName].push({
                  icon: getPlatformIcon(platformName),
                  name: platformName,
                  color: style?.color,
                  audience: platform.audience,
                  start_date: moment(platform.campaign_start_date).format(
                    "DD/MM/YYYY"
                  ),
                  end_date: moment(platform.campaign_end_date).format(
                    "DD/MM/YYYY"
                  ),
                  audience_size: platform.audienceSize,
                  budget_size:
                    Number(platform?.budget?.fixed_value) > 0
                      ? `${Number(platform?.budget?.fixed_value)}`
                      : 0,
                  impressions: platform.impressions,
                  reach: platform.reach,
                  ad_sets: platform?.ad_sets,
                  channel_name: channelType,
                  ...rowData,
                  // kpi: platform?.kpi,
                });
              }
            });
          }
        );
      });
    return platforms;
  }

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
          if (adSetIndex !== "") {
            platform.ad_sets[adSetIndex][fieldName] = value;
          } else {
            platform[fieldName] = value;
          }
        }
      }

      return updatedData;
    });
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  return (
    <div className="  my-5 mx-[40px]">
      {campaignFormData?.funnel_stages?.map((stageName, index) => {
        const stage = funnelStages.find((s) => s.name === stageName);
        if (!stage) return null;
        const chh = extractPlatforms(campaignFormData);

        return (
          <section className="mb-[30px]" key={index}>
            <h1 className="text-[#061237] text-[18px] font-[600] mb-5 flex gap-2">
              <Image src={stage?.icon} width={30} height={30} alt="" />
              {/* {stage?.icon} */}
              {stage?.name}
            </h1>
            <div className=" rounded-xl border border-[#E5E5E5]">
              <div className="rounded-xl overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="whitespace-nowrap">
                    <tr className="bg-[#F5F5F5]">
                      {/* <th className="py-4 px-6">Channel</th>
                      <th className="py-4 px-6">Audience</th>
                      <th className="py-4 px-6">Start Date</th>
                      <th className="py-4 px-6">End Date</th>
                      <th className="py-4 px-6">Audience Size</th>
                      <th className="py-4 px-6">Budget Size</th>
                      <th className="py-4 px-6">CPM</th>
                      <th className="py-4 px-6">Impression</th>
                      <th className="py-4 px-6">Frequency</th>
                      <th className="py-4 px-6">Reach</th> */}
                      {tableHeaders[campaignFormData?.campaign_objective]?.map(
                        (header, hIndex) => (
                          <th key={hIndex} className="py-4 px-6">
                            {header?.name}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="whitespace-nowrap">
                    {chh &&
                      chh[stage?.name].map((channel, index) => (
                        <React.Fragment key={index}>
                          {/* Parent Row */}
                          <tr
                            key={index}
                            className="border-t bg-white hover:bg-gray-100"
                          >
                            {tableBody[
                              campaignFormData?.campaign_objective
                            ]?.map((body, bodyIndex) => {
                              return (
                                <td
                                  key={bodyIndex}
                                  className="py-6 px-6 text-[15px]"
                                >
                                  {body === "channel" ? (
                                    <>
                                      <span
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() =>
                                          campaignFormData?.goal_level ===
                                          "Adset level" &&
                                          toggleRow(`${stage.name}${index}`)
                                        }
                                        style={{
                                          color: channel?.color,
                                        }}
                                      >
                                        {campaignFormData?.goal_level ===
                                          "Adset level" &&
                                          channel?.ad_sets?.length > 0 && (
                                            <span className="shrink-0">
                                              <svg
                                                width="17"
                                                height="16"
                                                viewBox="0 0 17 16"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path
                                                  d="M5.38021 6.66667L8.71354 10L12.0469 6.66667"
                                                  stroke="#061237"
                                                  strokeOpacity="0.8"
                                                  strokeWidth="1.33333"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  transform={
                                                    expandedRows[index]
                                                      ? "rotate(180 8.5 8)"
                                                      : ""
                                                  }
                                                />
                                              </svg>
                                            </span>
                                          )}
                                        <span className="relative w-[16px] h-[16px] shrink-0">
                                          <Image
                                            src={channel.icon}
                                            fill
                                            alt="Facebook Icon"
                                          />
                                        </span>
                                        <span>{channel.name}</span>
                                      </span>
                                    </>
                                  ) : body === "impressions" ? (
                                    <>
                                      {isNaN(
                                        calculateImpression(
                                          Number(channel["budget_size"]),
                                          Number(channel["cpm"])
                                        )
                                      ) ||
                                        !isFinite(
                                          calculateImpression(
                                            Number(channel["budget_size"]),
                                            Number(channel["cpm"])
                                          )
                                        )
                                        ? "-"
                                        : calculateImpression(
                                          Number(channel["budget_size"]),
                                          Number(channel["cpm"])
                                        )}
                                    </>
                                  ) : body === "reach" ? (
                                    <>
                                      {isNaN(
                                        calculateReach(
                                          Number(channel["impressions"]),
                                          Number(channel["frequency"])
                                        )
                                      ) ||
                                        !isFinite(
                                          calculateReach(
                                            Number(channel["impressions"]),
                                            Number(channel["frequency"])
                                          )
                                        )
                                        ? "-"
                                        : calculateReach(
                                          Number(channel["impressions"]),
                                          Number(channel["frequency"])
                                        )}
                                    </>
                                  ) : (
                                    <>
                                      {!tableHeaders[
                                        campaignFormData?.campaign_objective
                                      ][bodyIndex]?.showInput ? (
                                        channel?.[body] === "Invalid date" ? (
                                          "-"
                                        ) : (
                                          channel?.[body]
                                        )
                                      ) : (
                                        <input
                                          value={channel?.[body]}
                                          className="cpm-bg border-none outline-none w-[100px] p-1"
                                          placeholder={body.toUpperCase()}
                                        />
                                      )}
                                    </>
                                  )}
                                </td>
                              );
                            })}
                            {/* <td className="py-6 px-6">
                              {channel.ad_sets?.length > 0
                                ? channel?.ad_sets[0]?.audience_type
                                : "-"}
                            </td>
                            <td className="py-6 px-6">
                              {channel.startDate === "Invalid date"
                                ? "-"
                                : channel?.startDate}
                            </td>
                            <td className="py-6 px-6">
                              {channel.endDate === "Invalid date"
                                ? "-"
                                : channel?.endDate}
                            </td>
                            <td className="py-6 px-6">
                              {channel.ad_sets?.reduce(
                                (total, adSet) =>
                                  total + (Number(adSet.size) || 0),
                                0
                              )}
                            </td>
                            <td className="py-6 px-6">{channel.budgetSize}</td>
                            <td className="py-6 px-3">
                              <input
                                type="text"
                                placeholder="CPM"
                                className="cpm-bg border-none outline-none w-full p-1"
                                value={
                                  campaignFormData?.channel_mix
                                    ?.find(
                                      (ch) => ch?.funnel_stage === stage.name
                                    )
                                  [channel?.channelName]?.find(
                                    (c) => c?.platform_name === channel?.name
                                  )?.cpm || ""
                                }
                                onChange={(e) =>
                                  handleEditInfo(
                                    stage.name,
                                    channel?.channelName,
                                    channel?.name,
                                    "cpm",
                                    e.target.value,
                                    ""
                                  )
                                }
                              />
                            </td>
                            <td className="py-6 px-6">{channel.audience}</td>
                            <td className="py-6 px-6">
                              <input
                                type="text"
                                placeholder="Enter Frequency"
                                className="bg-transparent border-none outline-none w-full"
                                value={
                                  campaignFormData?.channel_mix
                                    ?.find(
                                      (ch) => ch?.funnel_stage === stage.name
                                    )
                                    [channel?.channelName]?.find(
                                      (c) => c?.platform_name === channel?.name
                                    )?.frequency || ""
                                }
                                onChange={(e) =>
                                  handleEditInfo(
                                    stage.name,
                                    channel?.channelName,
                                    channel?.name,
                                    "frequency",
                                    e.target.value,
                                    ""
                                  )
                                }
                              />
                            </td>
                            <td className="py-6 px-6">{channel.reach}</td> */}
                          </tr>

                          {/* Sub-table (Expanded Rows) */}
                          {expandedRows[`${stage.name}${index}`] && (
                            <>
                              {channel?.ad_sets?.map((awareness, Aindex) => (
                                <tr key={Aindex} className="bg-white">
                                  <td className="py-6 px-3 border-none">
                                    <div className="flex gap-2">
                                      <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
                                        {Aindex + 1}.
                                      </span>
                                      <span>
                                        {awareness?.name
                                          ? awareness?.name
                                          : "-"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness?.audience_type
                                      ? awareness?.audience_type
                                      : "-"}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {channel.startDate
                                      ? channel.startDate
                                      : "-"}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {channel.endDate ? channel.endDate : "-"}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness?.size ? awareness?.size : "-"}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness.budget ? awareness.budget : "-"}
                                  </td>
                                  <td className="!py-0 px-3 border-none">
                                    <input
                                      type="text"
                                      placeholder="CPM"
                                      className="cpm-bg border-none outline-none w-full p-1"
                                      value={
                                        campaignFormData?.channel_mix
                                          ?.find(
                                            (ch) =>
                                              ch?.funnel_stage === stage.name
                                          )
                                        [channel?.channelName]?.find(
                                          (c) =>
                                            c?.platform_name === channel?.name
                                        )?.ad_sets[Aindex]?.cpm || ""
                                      }
                                      onChange={(e) =>
                                        handleEditInfo(
                                          stage.name,
                                          channel?.channelName,
                                          channel?.name,
                                          "cpm",
                                          e.target.value,
                                          Aindex
                                        )
                                      }
                                    />
                                  </td>

                                  <>
                                    <td className="!py-0 px-6 border-none">
                                      {awareness.audience
                                        ? awareness.audience
                                        : "-"}
                                    </td>
                                    <td className="!py-0 px-6 border-none">
                                      <input
                                        type="text"
                                        placeholder="Frequency"
                                        className="cpm-bg border-none outline-none w-full p-1"
                                        value={
                                          campaignFormData?.channel_mix
                                            ?.find(
                                              (ch) =>
                                                ch?.funnel_stage === stage.name
                                            )
                                          [channel?.channelName]?.find(
                                            (c) =>
                                              c?.platform_name ===
                                              channel?.name
                                          )?.ad_sets[Aindex]?.frequency || ""
                                        }
                                        onChange={(e) =>
                                          handleEditInfo(
                                            stage.name,
                                            channel?.channelName,
                                            channel?.name,
                                            "frequency",
                                            e.target.value,
                                            Aindex
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="!py-0 px-6 border-none">
                                      {awareness.reach ? awareness.reach : "-"}
                                    </td>
                                  </>
                                </tr >
                              ))}
                            </>
                          )}
                        </React.Fragment >
                      ))}
                  </tbody >
                </table >
              </div >
            </div >
          </section >
        );
      })}
    </div >
  );
};

export default TableView;