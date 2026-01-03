import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { eachMonthOfInterval, format, parseISO, startOfMonth } from "date-fns";
import Image from "next/image";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";

const COLUMN_WIDTH = 80;

interface YearTimelineProps {
  range: Date[];
  funnels: any[];
  onTogglePlanSelection?: (id: number) => void;
}




function YearTimeline({
  range,
  funnels,
  onTogglePlanSelection,
}: YearTimelineProps) {
  const [expanded, setExpanded] = useState({});
  const [openSections, setOpenSections] = useState({});
  const { clientCampaignData } = useCampaigns();

  const toggleShow = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleOpen = (index, section) => {
    setOpenSections((prev) => ({
      ...prev,
      [`${index}-${section}`]: !prev[`${index}-${section}`],
    }));
  };

  const allMonths = useMemo(() => {
    if (!range || range.length === 0) return [];
    return eachMonthOfInterval({
      start: startOfMonth(range[0]),
      end: range[range.length - 1],
    });
  }, [range]);

  const totalMonths = allMonths.length;

  const getMonthIndex = (date: Date | string) => {
    if (!date || allMonths.length === 0) return 1;
    const targetDate = typeof date === "string" ? parseISO(date) : date;
    const targetYearMonth = format(targetDate, "yyyy-MM");

    for (let i = 0; i < allMonths.length; i++) {
      if (format(allMonths[i], "yyyy-MM") === targetYearMonth) {
        return i + 1;
      }
    }
    return 1;
  };

  function extractPlatforms(data) {
    const platforms = [];
    data?.channel_mix?.length > 0 &&
      data.channel_mix.forEach((stage) => {
        const stageName = stage.funnel_stage;
        mediaTypes.forEach((channelType) => {
          stage[channelType]?.forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
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
              startDate: platform.campaign_start_date,
              endDate: platform.campaign_end_date,
            });
          });
        });
      });
    return platforms;
  }

  return (
    <div>
      <div
        className="w-full min-h-[400px] relative pb-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: `${COLUMN_WIDTH}px 100%`,
        }}
      >
        {funnels?.map(
          (
            { id, isSelected, label, budget, stages, startDate, endDate, campaignData },
            index
          ) => {
            const startMonthIndex = getMonthIndex(startDate);
            const endMonthIndex = getMonthIndex(endDate);

            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${totalMonths}, ${COLUMN_WIDTH}px)`,
                }}
              >
                <div
                  className={`flex flex-col min-h-14 bg-white mt-6 shadow-sm rounded-[10px] justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-[#3175FF]"
                      : "border border-[rgba(0,0,0,0.2)] opacity-50"
                  }`}
                  style={{
                    gridColumnStart: startMonthIndex,
                    gridColumnEnd: endMonthIndex + 1,
                  }}
                >
                  <div
                    className={`flex items-center gap-2 p-2 relative overflow-visible ${
                      expanded[index]
                        ? "border-b border-b-[rgba(0,0,0,0.1)] h-14"
                        : "p-2"
                    }`}
                    style={{
                      background: "linear-gradient(90deg,rgba(50,98,255,.92) 0,rgba(14,156,255,.92) 25%,rgba(0,180,255,.92) 50%,rgba(42,229,225,.92) 75%,rgba(62,253,212,.92) 100%),url(../bg-footer.png) center/cover no-repeat",
                      borderRadius: expanded[index] ? "10px 10px 0 0" : "10px 10px 10px 10px",
                      paddingLeft: '2rem'
                    }}
                  >
                    <button
                      className="absolute left-1 flex items-center justify-center bg-blue-50 rounded-full w-5 h-5 p-0.5 flex-shrink-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleShow(index);
                      }}
                    >
                      {expanded[index] ? (
                        <FiChevronUp size={14} />
                      ) : (
                        <FiChevronDown size={14} />
                      )}
                    </button>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => onTogglePlanSelection?.(id)}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-shrink-0 relative group min-w-0" style={{ maxWidth: '100%' }}>
                          <h3 className="text-[#061237] font-semibold text-sm truncate">
                            {label}
                          </h3>
                          {isSelected && (
                            <span className="flex items-center justify-center w-4 h-4 bg-[#3175FF] rounded-[5px] flex-shrink-0">
                              <FiCheck size={10} className="text-white" />
                            </span>
                          )}
                          <div className="absolute left-1/2 -translate-x-1/2 -top-11 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap z-50 pointer-events-none">
                            {label}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                        <div className="relative group min-w-0" style={{ maxWidth: '100%' }}>
                          <p className="text-[#061237] font-medium text-sm truncate">
                            {budget?.startsWith("null") ||
                            budget?.startsWith("undefined")
                              ? 0
                              : `${Number(
                                  budget.replace(/[^\d.-]/g, "")
                                ).toLocaleString()} ${budget
                                  .replace(/[\d\s.,-]/g, "")
                                  .trim()}`}
                          </p>
                          <div className="absolute left-1/2 -translate-x-1/2 -top-11 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap z-50 pointer-events-none">
                            {budget?.startsWith("null") ||
                            budget?.startsWith("undefined")
                              ? 0
                              : `${Number(
                                  budget.replace(/[^\d.-]/g, "")
                                ).toLocaleString()} ${budget
                                  .replace(/[\d\s.,-]/g, "")
                                  .trim()}`}
                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expanded[index] && (
                    <div
                      className="py-2 overflow-visible"
                      style={{
                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                        backgroundSize: `${COLUMN_WIDTH}px 100%`,
                      }}
                    >
                      {stages?.map(
                        (
                          {
                            name,
                            startDate: stageStart,
                            endDate: stageEnd,
                            budget: stageBudget,
                          },
                          zIndex
                        ) => {
                          const channels = extractPlatforms(
                            campaignData || clientCampaignData[index]
                          );
                          // Calculate phase budget by summing all platform budgets in this phase
                          const phaseBudget = channels
                            ?.filter((ch) => ch?.stageName === name)
                            ?.reduce((sum, platform) => sum + (platform.amount || 0), 0) || 0;
                          const stageStartMonth = getMonthIndex(stageStart);
                          const stageEndMonth = getMonthIndex(stageEnd);
                          const campaignSpan =
                            endMonthIndex - startMonthIndex + 1;

                          return (
                            <div
                              key={name}
                              className="overflow-visible"
                              style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${campaignSpan}, ${COLUMN_WIDTH}px)`,
                              }}
                            >
                              <div
                                onClick={() => toggleOpen(index, name)}
                                className={`mt-5 w-full flex items-center rounded-[10px] min-h-[52px] text-xs font-[500] p-2 overflow-visible ${
                                  name === "Awareness"
                                    ? "bg-[#3175FF]"
                                    : name === "Consideration"
                                    ? "bg-[#34A853]"
                                    : name === "Conversion"
                                    ? "bg-[#ff9037]"
                                    : "bg-[#F05406]"
                                } text-white`}
                                style={{
                                  gridColumnStart: Math.max(
                                    1,
                                    stageStartMonth - startMonthIndex + 1
                                  ),
                                  gridColumnEnd: Math.min(
                                    campaignSpan + 1,
                                    stageEndMonth - startMonthIndex + 2
                                  ),
                                }}
                              >
                                <div className="flex items-center justify-center gap-2 flex-shrink-0 relative group" style={{ maxWidth: '60%', minWidth: '70px' }}>
                                  <span className="text-xs truncate peer" >{name}</span>
                                  <span className="flex-shrink-0">
                                    <FiChevronDown size={15} />
                                  </span>
                                  <div className="absolute left-1/2 -translate-x-1/2 -top-11 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap z-50 pointer-events-none">
                                    {name}
                                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                  </div>
                                </div>
                                <button className="flex-shrink-0 px-2 py-1 text-[10px] font-[500] bg-black/25 rounded-[5px] whitespace-nowrap ml-2">
                                  {phaseBudget > 0
                                    ? `${phaseBudget.toLocaleString()} ${budget && !budget.startsWith("null") && !budget.startsWith("undefined") ? budget.replace(/[\d\s.,-]/g, "").trim() : ''}`
                                    : 0}
                                </button>
                              </div>

                              {openSections[`${index}-${name}`] && (
                                <div
                                  style={{
                                    gridColumnStart: 1,
                                    gridColumnEnd: campaignSpan + 1,
                                  }}
                                >
                                  {channels
                                    ?.filter((ch) => ch?.stageName === name)
                                    ?.map(
                                      ({
                                        platform_name,
                                        icon,
                                        amount,
                                        bg,
                                        startDate: platformStart,
                                        endDate: platformEnd,
                                      }) => {
                                        const platStartMonth =
                                          getMonthIndex(platformStart);
                                        const platEndMonth =
                                          getMonthIndex(platformEnd);

                                        return (
                                          <div
                                            key={platform_name}
                                            className="overflow-visible"
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: `repeat(${campaignSpan}, ${COLUMN_WIDTH}px)`,
                                            }}
                                          >
                                            <div
                                              className="py-1 text-xs font-[500] border my-5 w-full rounded-[10px] flex items-center gap-2 min-h-[40px] overflow-visible"
                                              style={{
                                                gridColumnStart: Math.max(
                                                  1,
                                                  platStartMonth -
                                                    startMonthIndex +
                                                    1
                                                ),
                                                gridColumnEnd: Math.min(
                                                  campaignSpan + 1,
                                                  platEndMonth -
                                                    startMonthIndex +
                                                    2
                                                ),
                                                backgroundColor: bg,
                                              }}
                                            >
                                              <span className="flex items-center gap-2 flex-shrink-0 relative group" style={{ maxWidth: '60%', minWidth: '75px' }}>
                                                <Image
                                                  src={icon}
                                                  alt={platform_name}
                                                  width={16}
                                                  height={16}
                                                  className="flex-shrink-0"
                                                />
                                                <span className="text-xs truncate peer" >{platform_name}</span>
]                                                <div className="absolute left-1/2 -translate-x-1/2 -top-11 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap z-50 pointer-events-none">
                                                  {platform_name}
                                                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                                </div>
                                              </span>
                                              <div className="flex-shrink-0 bg-[#0866FF33]/5 py-1 px-2 text-[10px] rounded-[5px] whitespace-nowrap">
                                                {amount}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default YearTimeline;
