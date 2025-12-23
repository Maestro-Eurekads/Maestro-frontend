"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";

const WeekTimeline = ({ weeksCount, funnels }) => {
  // Manage state separately for each funnel
  const [expanded, setExpanded] = useState({});
  const [openSections, setOpenSections] = useState({});
  const { campaignFormData, clientCampaignData } = useCampaigns();

  // Function to toggle campaign dropdown
  const toggleShow = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Function to toggle Awareness/Consideration/Conversion dropdowns
  const toggleOpen = (index, section) => {
    setOpenSections((prev) => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`],
    }));
  };

  function extractPlatforms(data) {
    const platforms = [];
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
        mediaTypes.forEach(
          (channelType) => {
            stage[channelType].forEach((platform) => {
              const platformName = platform.platform_name;
              const platformBudget = parseFloat(
                platform.budget?.fixed_value || 0
              );
              const percentage = (platformBudget / stageBudget) * 100 || 0;
              const existingPlatform = platforms.find(
                (p) => p.platform_name === platformName
              );
              if (!existingPlatform) {
                const style =
                  platformStyles.find((style) => style.name === platformName) ||
                  platformStyles[
                  Math.floor(Math.random() * platformStyles.length)
                  ];
                platforms.push({
                  platform_name: platformName,
                  amount: platformBudget,
                  stageName,
                  icon: getPlatformIcon(platformName),
                  bg: style?.bg,
                });
              }
            });
          }
        );
      });
    return platforms;
  }

  return (
    <div
      className="w-full min-h-[494px] relative pb-5"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(50px) 100%`,
      }}
    >
      {/* Loop through funnels */}
      {funnels.map(({ startDay, endDay, label, budget, stages }, index) => {
        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${weeksCount}, 50px)`,
            }}
          >
            <div
              className="flex flex-col min-h-14 bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px] justify-between"
              style={{
                gridColumnStart: startDay,
                gridColumnEnd: endDay + 1,
              }}
            >
              <div
                className={`${
                  expanded[index]
                    ? "border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] flex justify-between items-center p-4 h-14"
                    : "flex justify-between items-center p-2"
                }`}
                style={{
                  background: "linear-gradient(90deg,rgba(50,98,255,.92) 0,rgba(14,156,255,.92) 25%,rgba(0,180,255,.92) 50%,rgba(42,229,225,.92) 75%,rgba(62,253,212,.92) 100%),url(../bg-footer.png) center/cover no-repeat",
                  borderRadius: expanded[index] ? "10px 10px 0 0" : "10px 10px 0 0"
                }}
              >
                <div>
                  <h3 className="text-[#061237] font-semibold text-sm">
                    {label}
                  </h3>
                  <p className="text-[#061237] font-medium text-sm">
                    {/* 250,000 € */}
                    {budget?.startsWith("null") || budget?.startsWith("undefined")
                      ? 0
                      : `${Number(budget.replace(/[^\d.-]/g, "")).toLocaleString()} ${budget.replace(/[\d\s.,-]/g, "").trim()}`}
                  </p>
                </div>
                <button onClick={() => toggleShow(index)}>
                  {expanded[index] ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </button>
              </div>

              {/* Expanded section */}
              {expanded[index] && (
                <div
                  className="py-2"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: `calc(50px) 100%`,
                  }}
                >
                  {stages?.map((section, zIndex) => {

                    const channels = extractPlatforms(
                      clientCampaignData[index]
                    );

                    return (
                      <div
                        key={section?.name}
                      // style={{
                      // 	display: 'grid',
                      // 	gridTemplateColumns: `repeat(${(endDay + 1) - startDay}, 1fr)`
                      // }}
                      >
                        <div
                          onClick={() => toggleOpen(index, section?.name)}
                          className={`mt-5 w-full flex items-center rounded-[10px] h-[52px] text-xs font-[500] p-2 text-center ${
                            section?.name === "Awareness"
                              ? "bg-[#3175FF]"
                              : section?.name === "Consideration"
                              ? "bg-[#34A853]"
                              : section?.name === "Conversion"
                              ? "bg-[#ff9037]"
                              : "bg-[#F05406]"
                          } text-white`}
                          style={{
                            gridColumnStart: startDay,
                            gridColumnEnd: endDay + 1 - startDay + 1,
                          }}
                        >
                          <div className="flex items-center justify-center gap-3 flex-1">
                            <span>{section?.name}</span>
                            <span>
                              <FiChevronDown size={15} />
                            </span>
                          </div>
                          <button className="justify-self-end px-3 py-2 text-sm font-[500] bg-white/25 rounded-[5px]">
                            {section?.budget?.startsWith("null") || section?.budget?.startsWith("undefined")
                              ? 0
                              : `${Number(section?.budget.replace(/[^\d.-]/g, "")).toLocaleString()} ${section?.budget.replace(/[\d\s.,-]/g, "").trim()}`}

                          </button>
                        </div>

                        {openSections[`${index}-${section?.name}`] && (
                          <div
                            style={{
                              gridColumnStart: 1,
                              gridColumnEnd: endDay + 1 - startDay + 1,
                            }}
                          >
                            {channels
                              ?.filter((ch) => ch?.stageName === section?.name)
                              ?.map(({ platform_name, icon, amount, bg }) => (
                                <div
                                  key={platform_name}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${endDay + 1 - startDay + 1 - 2
                                      }, 1fr)`,
                                  }}
                                >
                                  <div
                                    className="py-1 text-xs font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between"
                                    style={{
                                      gridColumnStart: 1,
                                      gridColumnEnd:
                                        endDay + 1 - startDay + 1 - 1 + 1 - 1,
                                      backgroundColor: bg,
                                    }}
                                  >
                                    <div />
                                    <span className="flex items-center gap-3">
                                      <Image
                                        src={icon}
                                        alt={platform_name}
                                        width={20}
                                      />
                                      <span>{platform_name}</span>
                                    </span>
                                    <button className="bg-[#0866FF33]/5 py-2 px-[10px] rounded-[5px] mr-3">
                                      {amount}
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekTimeline;
