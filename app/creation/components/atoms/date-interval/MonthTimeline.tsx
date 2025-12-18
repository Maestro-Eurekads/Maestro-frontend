import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { eachWeekOfInterval, endOfWeek, parseISO } from "date-fns";
import Image from "next/image";
import type React from "react";
import { useMemo, useState } from "react";
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
        const stageBudget = parseFloat(stage.stage_budget?.fixed_value);
        mediaTypes.forEach((channelType) => {
          stage[channelType]?.forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
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
                startDate: platform.campaign_start_date,
                endDate: platform.campaign_end_date,
              });
            }
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
          { id, isSelected, label, budget, stages, startDate, endDate },
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
                    ? "border-2 border-[#3175FF] ring-2 ring-[#3175FF]/20"
                    : "border border-[rgba(0,0,0,0.2)] opacity-50"
                }`}
                style={{
                  gridColumnStart: startWeekIndex,
                  gridColumnEnd: endWeekIndex + 1,
                }}
              >
                <div
                  className={`flex items-center gap-3 ${
                    expanded[index]
                      ? "border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] p-4 h-14 bg-[#F9FAFB]"
                      : "p-2"
                  }`}
                >
                  <button
                    className="flex items-center justify-center bg-blue-50 rounded-full min-w-8 min-h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShow(index);
                    }}
                  >
                    {expanded[index] ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </button>
                  <div
                    className="flex-1"
                    onClick={() => onTogglePlanSelection?.(id)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#061237] font-semibold text-sm">
                        {label}
                      </h3>
                      {isSelected && (
                        <span className="flex items-center justify-center w-4 h-4 bg-[#3175FF] rounded-[5px]">
                          <FiCheck size={10} className="text-white" />
                        </span>
                      )}
                    </div>
                    <p className="text-[#061237] font-medium text-sm">
                      {budget?.startsWith("null") ||
                      budget?.startsWith("undefined")
                        ? 0
                        : `${Number(
                            budget.replace(/[^\d.-]/g, "")
                          ).toLocaleString()} ${budget
                            .replace(/[\d\s.,-]/g, "")
                            .trim()}`}
                    </p>
                  </div>
                </div>

                {expanded[index] && (
                  <div
                    className="py-2"
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
                          clientCampaignData[index]
                        );
                        const stageStartWeek = getWeekIndex(stageStart);
                        const stageEndWeek = getWeekIndex(stageEnd);
                        const campaignSpan = endWeekIndex - startWeekIndex + 1;

                        return (
                          <div
                            key={name}
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${campaignSpan}, ${WEEK_WIDTH_PX}px)`,
                            }}
                          >
                            <div
                              onClick={() => toggleOpen(index, name)}
                              className={`mt-5 w-full flex items-center rounded-[10px] h-12.5 text-xs font-[500] p-2 text-center ${
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
                              <div className="flex items-center justify-center gap-3 flex-1">
                                <span>{name}</span>
                                <span>
                                  <FiChevronDown size={15} />
                                </span>
                              </div>
                              <button className="justify-self-end px-3 py-2 text-sm font-[500] bg-white/25 rounded-[5px]">
                                {stageBudget?.startsWith("null") ||
                                stageBudget?.startsWith("undefined")
                                  ? 0
                                  : `${Number(
                                      stageBudget.replace(/[^\d.-]/g, "")
                                    ).toLocaleString()} ${stageBudget
                                      .replace(/[\d\s.,-]/g, "")
                                      .trim()}`}
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
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${campaignSpan}, ${WEEK_WIDTH_PX}px)`,
                                          }}
                                        >
                                          <div
                                            className="py-1 text-xs font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between"
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
