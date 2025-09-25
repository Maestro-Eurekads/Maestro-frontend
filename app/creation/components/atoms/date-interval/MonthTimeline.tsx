import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { differenceInMonths, endOfYear, startOfYear } from "date-fns";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";

interface MonthTimelineProps {
  monthsCount: number;
  funnels: any[];
  range;
}

const MonthTimeline: React.FC<MonthTimelineProps> = ({
  monthsCount,
  funnels,
  range,
}) => {


  const [expanded, setExpanded] = useState({});
  const [openSections, setOpenSections] = useState({});
  const { campaignFormData, clientCampaignData } = useCampaigns();
  const monthWidth = 120; // Fixed width for each month in pixels
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
        mediaTypes.forEach((channelType) => {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
            const percentage = (platformBudget / stageBudget) * 100 || 0;
            const existingPlatform = platforms.find(
              (p) => p.platform_name === platformName && p.stageName === stageName
            )
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

  const calculateGridColumns = (start: Date, end: Date) => {
    const monthKeys = Array.from(
      new Set(range.map((date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }))
    );

    const startKey = (() => {
      const d = new Date(start);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();
    const endKey = (() => {
      const d = new Date(end);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    })();

    const startIndex = monthKeys.indexOf(startKey);
    const endIndex = monthKeys.indexOf(endKey);

    return { startIndex, endIndex, totalMonths: monthKeys.length };
  };

  // Helpers for day offsets within month columns (each month = 250px)
  const getMonthKey = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const buildMonthKeys = () =>
    Array.from(
      new Set(
        range.map((date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })
      )
    );

  const daysInMonth = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const computeMonthSpanWidthPx = (
    start: Date | string,
    end: Date | string
  ) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const monthKeys = buildMonthKeys();

    const startKey = getMonthKey(startDate);
    const endKey = getMonthKey(endDate);
    const startIndex = monthKeys.indexOf(startKey);
    const endIndex = monthKeys.indexOf(endKey);

    if (startIndex < 0 || endIndex < 0) return { leftPx: 0, widthPx: 0 };

    const monthWidthPx = 250;

    const startMonthDays = daysInMonth(startDate);
    const endMonthDays = daysInMonth(endDate);
    const perDayStart = monthWidthPx / startMonthDays;
    const perDayEnd = monthWidthPx / endMonthDays;

    const startDayOfMonth = startDate.getDate();
    const endDayOfMonth = endDate.getDate();

    const leftPx = (startDayOfMonth - 1) * perDayStart;

    if (startKey === endKey) {
      const widthPx = Math.max(0, endDayOfMonth - startDayOfMonth + 1) * perDayStart;
      return { leftPx, widthPx };
    }

    const daysRemainingStartMonth = startMonthDays - startDayOfMonth + 1;
    const startPartPx = daysRemainingStartMonth * perDayStart;

    const fullMonthsBetween = Math.max(0, endIndex - startIndex - 1);
    const middlePx = fullMonthsBetween * monthWidthPx;

    const endPartPx = endDayOfMonth * perDayEnd;

    return { leftPx, widthPx: startPartPx + middlePx + endPartPx };
  };

  return (
    <div
      className="w-full min-h-[494px] relative pb-5"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(250px) 100%`,
      }}
    >
      {funnels?.map(
        (
          { startWeek, endWeek, label, budget, stages, endMonth, startMonth, startDate, endDate },
          index
        ) => {
          const { leftPx: campaignLeftPx, widthPx: campaignWidthPx } =
            startDate && endDate
              ? computeMonthSpanWidthPx(startDate, endDate)
              : { leftPx: 0, widthPx: 0 };
          return (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${monthsCount}, 250px)`,
              }}
            >
              <div
                className="flex flex-col min-h-[69px] bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px]  justify-between"
                style={{
                  gridColumnStart: startMonth,
                  gridColumnEnd: endMonth + 1,
                  marginLeft: `${campaignLeftPx}px`,
                  width: campaignWidthPx ? `${campaignWidthPx}px` : undefined,
                }}
              >
                <div
                  onClick={() => toggleShow(index)}
                  className={`cursor-pointer ${expanded[index]
                      ? 'border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] flex justify-between items-center p-4    h-[77px] bg-[#F9FAFB]  "'
                      : "flex justify-between items-center p-4"
                    } `}
                >
                  <div>
                    <h3 className="text-[#061237] font-semibold text-[16px] leading-[22px]  ">
                      {label}
                    </h3>
                    <p className="text-[#061237] font-medium text-[14px]">
                      {/* 250,000 € */}
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
                      backgroundSize: `calc(250px) 100%`,
                    }}
                  >
                    {stages?.map(
                      (
                        {
                          name,
                          startDay,
                          endDay,
                          startWeek,
                          endWeek,
                          startMonth: start,
                          endMonth: end,
                          budget,
                          color,
                          startDate: stageStartDate,
                          endDate: stageEndDate,
                        },
                        zIndex
                      ) => {
                        const channels = extractPlatforms(
                          clientCampaignData[index]
                        );
                        const { leftPx, widthPx } =
                          stageStartDate && stageEndDate
                            ? computeMonthSpanWidthPx(
                              stageStartDate,
                              stageEndDate
                            )
                            : { leftPx: 0, widthPx: 0 };

                        return (
                          <div
                            key={name}
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${monthsCount}, 250px)`,
                            }}
                          >
                            <div
                              onClick={() => toggleOpen(index, name)}
                              className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${color
                                } text-white`}
                              style={{
                                gridColumnStart: start,
                                gridColumnEnd: end + 1,
                                marginLeft: `${leftPx}px`,
                                width: widthPx ? `${widthPx}px` : undefined,
                              }}
                            >
                              <div className="flex items-center justify-center gap-3 flex-1">
                                {/* <span>
                                {name === "Awareness" ? (
                                  <BsFillMegaphoneFill />
                                ) : name === "Consideration" ? (
                                  <TbZoomFilled />
                                ) : (
                                  <TbCreditCardFilled />
                                )}
                              </span> */}
                                <span>{name}</span>
                                <span>
                                  <FiChevronDown size={15} />
                                </span>
                              </div>
                              <button className="justify-self-end px-3 py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
                                {budget?.startsWith("null") ||
                                  budget?.startsWith("undefined")
                                  ? 0
                                  : `${Number(
                                    budget.replace(/[^\d.-]/g, "")
                                  ).toLocaleString()} ${budget
                                    .replace(/[\d\s.,-]/g, "")
                                    .trim()}`}
                              </button>
                            </div>

                            {openSections[`${index}-${name}`] && (
                              <div
                                style={{
                                  gridColumnStart: startMonth,
                                  gridColumnEnd: endMonth + 1,
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
                                      startDate,
                                      endDate,
                                    }) => {
                                      const { startIndex, endIndex, totalMonths } = calculateGridColumns(
                                        startDate,
                                        endDate
                                      );

                                      return (
                                        <div
                                          key={platform_name}
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${monthsCount || totalMonths}, 250px)`,
                                          }}
                                        >
                                          <div
                                            className={`py-1 text-[15px] font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between`}
                                            style={{
                                              gridColumnStart: (startIndex ?? -1) >= 0 ? startIndex + 1 : 1,
                                              gridColumnEnd: (endIndex ?? -1) >= 0 ? endIndex + 2 : 2,
                                              backgroundColor: bg,
                                            }}
                                          >
                                            <div />
                                            <span className="flex items-center gap-3 pl-3 ml-14">
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
