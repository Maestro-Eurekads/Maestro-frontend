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
  platformStyles,
} from "components/data";
import moment from "moment";

const TableView = ({ channels }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const { campaignFormData } = useCampaigns();

  const campaignData = {
    phases: {
      awareness: {
        channels: [
          {
            channel: "Broad",
            audience: "Men 25+ Int. Sport",
            startDate: "11/01/2025",
            endDate: "15/01/2025",
            audienceSize: 2500000,
            budget: 1800, // €1,800
            cpm: "CPM", // To be calculated or entered
            impressions: "-", // To be calculated
            frequency: "-", // "Enter frequency"
            reach: 500000,
            penetrationRate: 20.0, // 20.0%
          },
          {
            channel: "Lookalike",
            audience: "Broad",
            campaignName: "Spring sale Awareness",
            startDate: "-",
            endDate: "-",
            audienceSize: 50000,
            budget: 700, // €700
            cpm: "CPM", // "CPM" placeholder
            impressions: "-",
            frequency: 2,
            reach: "-",
            penetrationRate: "-",
          },
          {
            channel: "Facebook",
            audience: "Lookalike",
            campaignName: "Facebook Awareness",
            startDate: "-",
            endDate: "-",
            audienceSize: 235000,
            budget: 1100, // €1,100
            cpm: "CPM", // "CPM" placeholder
            impressions: 2000000,
            frequency: "-", // "Enter frequency"
            reach: 200000,
            penetrationRate: 16.7, // 16.7%
          },
          {
            channel: "Facebook",
            audience: "Lookalike Website Visitors 90D",
            startDate: "-",
            endDate: "-",
            audienceSize: 200000,
            budget: 900, // €900
            cpm: "CPM", // "CPM" placeholder
            impressions: "-",
            frequency: "-", // "Enter frequency"
            reach: 750000,
            penetrationRate: 25.4, // 25.4%
          },
          {
            channel: "Retargeting",
            audience: "Retargeting Active Buyers 30D",
            startDate: "-",
            endDate: "-",
            audienceSize: 300000,
            budget: 1200, // €1,200
            cpm: "CPM",
            impressions: "-",
            frequency: 5,
            reach: "-",
            penetrationRate: "-",
          },
          {
            channel: "Facebook",
            audience: "Lookalike Abandoned Carts 7D",
            startDate: "-",
            endDate: "-",
            audienceSize: 150000,
            budget: 500, // €500
            cpm: "CPM", // "CPM" placeholder
            impressions: 900000,
            frequency: "-", // "Enter frequency"
            reach: 369000,
            penetrationRate: 33.3, // 33.3%
          },
          {
            channel: "Instagram",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1200000,
            budget: 1500, // €1,500
            cpm: "CPM",
            impressions: 1250000,
            frequency: "-", // "Enter frequency"
            reach: 980000,
            penetrationRate: 50.3, // 50.3%
          },
          {
            channel: "Youtube",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 3000000,
            budget: 1200, // €1,200
            cpm: "CPM",
            impressions: 875000,
            frequency: "-",
            reach: "-",
            penetrationRate: "-",
          },
          {
            channel: "TheTradeDesk",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1500000,
            budget: 900, // €900
            cpm: "CPM",
            impressions: 1250000,
            frequency: "-",
            reach: "-",
            penetrationRate: "-",
          },
          {
            channel: "Quantcast",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 2000000,
            budget: 600, // €600
            cpm: "CPM",
            impressions: "-",
            frequency: "-",
            reach: "-",
            penetrationRate: "-",
          },
        ],
      },
      consideration: {
        channels: [
          {
            channel: "Facebook",
            audience: "Men 25+ Int. Sport",
            startDate: "11/01/2025",
            endDate: "15/01/2025",
            audienceSize: 2500000,
            budget: 2100, // €2,100
            cpm: "CPM", // "Enter CPM"
            impressions: 2000000,
            frequency: "-", // "Enter frequency"
            reach: 500000,
            penetrationRate: 20.0, // 20.0%
          },
          {
            channel: "Instagram",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1200000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 900000,
            frequency: "-", // "Enter frequency"
            reach: 200000,
            penetrationRate: 16.7, // 16.7%
          },
          {
            channel: "Youtube",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 3000000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 1250000,
            frequency: "-", // "Enter frequency"
            reach: 750000,
            penetrationRate: 25.4, // 25.4%
          },
          {
            channel: "TheTradeDesk",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1500000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 875000,
            frequency: "-", // "Enter frequency"
            reach: 369000,
            penetrationRate: 33.3, // 33.3%
          },
          {
            channel: "Quantcast",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 2000000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 1250000,
            frequency: "-", // "Enter frequency"
            reach: 980000,
            penetrationRate: 50.3, // 50.3%
          },
        ],
      },
      conversion: {
        channels: [
          {
            channel: "Facebook",
            audience: "Men 25+ Int. Sport",
            startDate: "11/01/2025",
            endDate: "15/01/2025",
            audienceSize: 2500000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 2000000,
            frequency: "-", // "Enter frequency"
            reach: 500000,
            penetrationRate: 20.0, // 20.0%
          },
          {
            channel: "Instagram",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1200000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 900000,
            frequency: "-", // "Enter frequency"
            reach: 200000,
            penetrationRate: 16.7, // 16.7%
          },
          {
            channel: "Youtube",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 3000000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 1250000,
            frequency: "-", // "Enter frequency"
            reach: 750000,
            penetrationRate: 25.4, // 25.4%
          },
          {
            channel: "TheTradeDesk",
            audience: "Lookalike Buyers 90D",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 1500000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 875000,
            frequency: "-", // "Enter frequency"
            reach: 369000,
            penetrationRate: 33.3, // 33.3%
          },
          {
            channel: "Quantcast",
            audience: "Men 25+ Int. Sport",
            startDate: "08/01/2025",
            endDate: "10/01/2025",
            audienceSize: 2000000,
            budget: "1,800 €", // "Enter budget"
            cpm: "CPM", // "Enter CPM"
            impressions: 1250000,
            frequency: "-", // "Enter frequency"
            reach: 980000,
            penetrationRate: 50.3, // 50.3%
          },
        ],
      },
    },
  };

  function extractPlatforms(data) {
    const platforms = {};
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        platforms[stageName] = platforms[stageName] || [];
        ["search_engines", "display_networks", "social_media"].forEach(
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
                platforms[stageName].push({
                  icon: getPlatformIcon(platformName),
                  name: platformName,
                  color: style?.color,
                  audience: platform.audience,
                  startDate: moment(platform.campaign_start_date).format(
                    "DD/MM/YYYY"
                  ),
                  endDate: moment(platform.campaign_end_date).format(
                    "DD/MM/YYYY"
                  ),
                  audienceSize: platform.audienceSize,
                  budgetSize:
                    Number(platform?.budget?.fixed_value) > 0
                      ? `${Number(
                          platform?.budget?.fixed_value
                        )} ${getCurrencySymbol(
                          campaignFormData?.campaign_budget?.currency
                        )}`
                      : 0,
                  impressions: platform.impressions,
                  reach: platform.reach,
                  ad_sets: platform?.ad_sets,
                });
              }
            });
          }
        );
      });
    return platforms;
  }

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
        console.log("🚀 ~ {campaignFormData?.funnel_stages?.map ~ chh:", chh);
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
                      <th className="py-4 px-6">Channel</th>
                      <th className="py-4 px-6">Audience</th>
                      <th className="py-4 px-6">Start Date</th>
                      <th className="py-4 px-6">End Date</th>
                      <th className="py-4 px-6">Audience Size</th>
                      <th className="py-4 px-6">Budget Size</th>
                      <th className="py-4 px-6">CPM</th>
                      {campaignFormData?.goal_level === "Adset level" && (
                        <>
                          <th className="py-4 px-6">Impression</th>
                          <th className="py-4 px-6">Frequency</th>
                          <th className="py-4 px-6">Reach</th>
                        </>
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
                            <td className="py-6 px-6 text-[15px]">
                              <span
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleRow(index)}
                                style={{
                                  color: channel?.color,
                                }}
                              >
                                {campaignFormData?.goal_level ===
                                  "Adset level" &&
                                  channel?.ad_sets?.length > 0 && (
                                    <span>
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
                                <span className="relative w-[16px] h-[16px]">
                                  <Image
                                    src={channel.icon}
                                    fill
                                    alt="Facebook Icon"
                                  />
                                </span>
                                <span>{channel.name}</span>
                              </span>
                            </td>
                            <td className="py-6 px-6">
                              {channel.audience ? channel.audience : "-"}
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
                              {channel.audienceSize
                                ? channel.audienceSize
                                : "-"}
                            </td>
                            <td className="py-6 px-6">{channel.budgetSize}</td>
                            <td className="py-6 px-6">
                              <input
                                type="text"
                                placeholder="CPM"
                                className="cpm-bg border-none outline-none w-full"
                              />
                            </td>
                            {campaignFormData?.goal_level === "Adset level" && (
                              <>
                                <td className="py-6 px-6">
                                  {channel.audience}
                                </td>
                                <td className="py-6 px-6">
                                  <input
                                    type="text"
                                    placeholder="Enter Frequency"
                                    className="bg-transparent border-none outline-none w-full"
                                  />
                                </td>
                                <td className="py-6 px-6">{channel.reach}</td>
                              </>
                            )}
                          </tr>

                          {/* Sub-table (Expanded Rows) */}
                          {expandedRows[index] && (
                            <>
                              {channel?.ad_sets?.map((awareness, index) => (
                                <tr key={index} className="bg-white">
                                  <td className="py-6 px-6 border-none">
                                    <div className="flex gap-2">
                                      <span className="font-semibold text-[14px] leading-[19px] text-[#0866ff] flex-none order-0 grow-0">
                                        {index + 1}.
                                      </span>
                                      <span>{awareness?.name}</span>
                                    </div>
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness?.audience_type}{" "}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {channel.startDate}{" "}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {channel.endDate}{" "}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness?.size}{" "}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    {awareness.budget}{" "}
                                  </td>
                                  <td className="!py-0 px-6 border-none">
                                    <div className="cpm_bg">
                                      {" "}
                                      {awareness.cpm}
                                    </div>{" "}
                                  </td>
                                  {/* <td className="!py-0 px-6 border-none">
                                      {awareness.audience}{" "}
                                    </td>
                                    <td className="!py-0 px-6 border-none">
                                      {awareness.frequency}{" "}
                                    </td>
                                    <td className="!py-0 px-6 border-none">
                                      {awareness.reach}
                                    </td> */}
                                </tr>
                              ))}
                            </>
                          )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default TableView;
