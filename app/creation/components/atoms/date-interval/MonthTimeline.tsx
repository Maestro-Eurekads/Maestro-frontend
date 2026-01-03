import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { eachWeekOfInterval, endOfWeek, parseISO } from "date-fns";
import Image from "next/image";
import type React from "react";
import { useMemo, useState, useRef, useEffect } from "react";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";

interface MonthTimelineProps {
  weeksCount: number;
  funnels: any[];
  range: Date[];
  onTogglePlanSelection?: (id: number) => void;
}

const WEEK_WIDTH_PX = 100;



const MonthTimeline: React.FC<MonthTimelineProps> = ({
  weeksCount,
  funnels,
  range,
  onTogglePlanSelection,
}) => {
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

  const allWeeks = useMemo(() => {
    if (!range || range.length === 0) return [];
    const startDate = range[0];
    const endDate = range[range.length - 1];
    return eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    );
  }, [range]);

  const getWeekIndex = (date: Date | string) => {
    if (!date || allWeeks.length === 0) return 0;
    const targetDate = typeof date === "string" ? parseISO(date) : date;

    for (let i = 0; i < allWeeks.length; i++) {
      const weekStart = allWeeks[i];
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      if (targetDate >= weekStart && targetDate <= weekEnd) {
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
    <div
      className="w-full min-h-[494px] relative pb-5"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `${WEEK_WIDTH_PX}px 100%`,
      }}
    >
      {funnels?.map(
        (
          { id, isSelected, label, budget, stages, startDate, endDate, campaignData },
          index
        ) => {
          const startWeekIndex = getWeekIndex(startDate);
          const endWeekIndex = getWeekIndex(endDate);

          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${weeksCount}, ${WEEK_WIDTH_PX}px)`,
              }}
            >
              <div
                className={`flex flex-col min-h-14 bg-white mt-6 shadow-sm rounded-[10px] justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-[#3175FF]"
                    : "border border-[rgba(0,0,0,0.2)] opacity-50"
                }`}
                style={{
                  gridColumnStart: startWeekIndex,
                  gridColumnEnd: endWeekIndex + 1,
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
                      backgroundSize: `${WEEK_WIDTH_PX}px 100%`,
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
                        const stageStartWeek = getWeekIndex(stageStart);
                        const stageEndWeek = getWeekIndex(stageEnd);
                        const campaignSpan = endWeekIndex - startWeekIndex + 1;

                        return (
                          <div
                            key={name}
                            className="overflow-visible"
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${campaignSpan}, ${WEEK_WIDTH_PX}px)`,
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
                                  stageStartWeek - startWeekIndex + 1
                                ),
                                gridColumnEnd: Math.min(
                                  campaignSpan + 1,
                                  stageEndWeek - startWeekIndex + 2
                                ),
                              }}
                            >
                              <div className="flex items-center justify-center gap-2 flex-shrink-0 relative group" style={{ maxWidth: '60%', minWidth: '90px' }}>
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
                                      const platStartWeek =
                                        getWeekIndex(platformStart);
                                      const platEndWeek =
                                        getWeekIndex(platformEnd);

                                      return (
                                        <div
                                          key={platform_name}
                                          className="overflow-visible"
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${campaignSpan}, ${WEEK_WIDTH_PX}px)`,
                                          }}
                                        >
                                          <div
                                            className="py-1 text-xs font-[500] border my-5 w-full rounded-[10px] flex items-center gap-2 min-h-[40px] overflow-visible"
                                            style={{
                                              gridColumnStart: Math.max(
                                                1,
                                                platStartWeek -
                                                  startWeekIndex +
                                                  1
                                              ),
                                              gridColumnEnd: Math.min(
                                                campaignSpan + 1,
                                                platEndWeek - startWeekIndex + 2
                                              ),
                                              backgroundColor: bg,
                                            }}
                                          >
                                            <span className="flex items-center gap-2 flex-shrink-0 relative group" style={{ maxWidth: '60%', minWidth: '97px' }}>
                                              <Image
                                                src={icon}
                                                alt={platform_name}
                                                width={16}
                                                height={16}
                                                className="flex-shrink-0"
                                              />
                                              <span className="text-xs truncate peer" >{platform_name}</span>
                                              <div className="absolute left-1/2 -translate-x-1/2 -top-11 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out whitespace-nowrap z-50 pointer-events-none">
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
  );
};

export default MonthTimeline;
