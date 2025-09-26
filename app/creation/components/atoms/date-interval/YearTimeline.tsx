import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import {
  differenceInMonths,
  eachMonthOfInterval,
  endOfYear,
  format,
  startOfYear,
} from "date-fns";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
import { isHexColor } from "utils/funnelColorUtils";

function YearTimeline({ range, funnels }) {
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

  const calculateGridColumns = (start: Date, end: Date, headerMonths: string[]) => {
    // Build month keys like yyyy-MM covering the full header range
    const startKey = `${new Date(start).getFullYear()}-${String(new Date(start).getMonth() + 1).padStart(2, "0")}`;
    const endKey = `${new Date(end).getFullYear()}-${String(new Date(end).getMonth() + 1).padStart(2, "0")}`;

    const startIndex = headerMonths.indexOf(startKey);
    const endIndex = headerMonths.indexOf(endKey);

    const gridStartColumn = (startIndex >= 0 ? startIndex : 0) + 1;
    const gridEndColumn = (endIndex >= 0 ? endIndex : 0) + 2; // inclusive

    return { gridStartColumn, gridEndColumn, totalMonths: headerMonths.length };
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
              });
            }
          });
        });
      });
    return platforms;
  }
  const calcDailyWidth = () => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth;
    let dailyWidth: number;
    const monthWidth = contWidth / 12;
    dailyWidth = Math.max(monthWidth, 200); // Increased minimum width to 180px per month
    return Math.round(dailyWidth);
  };

  const buildHeaderMonthKeys = useCallback(() => {
    const startDate = startOfYear(range[0]);
    const endDate = endOfYear(range[range.length - 1]);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map((month) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`);
  }, [range]);

  const generateGridColumns = useCallback(() => {
    const dailyWidth = calcDailyWidth();
    const headerMonthKeys = buildHeaderMonthKeys();
    return `repeat(${headerMonthKeys.length}, ${dailyWidth}px)`;
  }, [buildHeaderMonthKeys]);

  const generateYearMonths = useCallback(() => {
    if (!range || range.length === 0) return [];

    const startDate = startOfYear(range[0]);
    const endDate = endOfYear(range[range.length - 1]);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.map((month) => format(month, "MMMM yyyy"));
  }, [range]);

  const getGridColumnEnd = () => {
    const startDate = startOfYear(range[0]);
    const endDate = endOfYear(range[range.length - 1]);
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    return months.length; // 12 months
  };

  return (
    <div className="h-full">
      <div
        className="sticky top-0 z-10 bg-transparent border-b mb-0 border-l"
        style={{
          display: "grid",
          gridTemplateColumns: generateGridColumns(),
          gap: "0px",
        }}>
        {generateYearMonths().map((monthLabel, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium py-2 border-r border-gray-200">
            <p className="text-blue-500">{monthLabel?.split(" ")[0]}</p>
            <p>{monthLabel?.split(" ")[1]}</p>
          </div>
        ))}
      </div>
      <div
        className="w-full min-h-[519px] relative pb-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: `calc(${calcDailyWidth()}px) 100%`,
        }}>
        {funnels?.map(
          (
            { label, budget, stages, endMonth, startMonth, startDate, endDate },
            index
          ) => {
            // Use the original working grid calculation
            const headerMonthKeys = buildHeaderMonthKeys();
            const { gridStartColumn, gridEndColumn } = calculateGridColumns(
              startDate,
              endDate,
              headerMonthKeys
            );

            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: generateGridColumns(),
                }}>
                <div
                  className="flex flex-col bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px] overflow-hidden min-w-0"
                  style={{
                    gridColumnStart: gridStartColumn,
                    gridColumnEnd: gridEndColumn,
                    maxHeight: expanded[index] ? "500px" : "auto",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0, // allow card to shrink to column width
                  }}>
                  <div
                    onClick={() => toggleShow(index)}
                    className={`cursor-pointer ${
                      expanded[index]
                        ? "border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] flex items-center justify-between gap-2 p-4 bg-[#F9FAFB]"
                        : "flex items-center justify-between gap-2 p-4"
                    }`}>
                    {/* text container */}
                    <div className="flex-1 min-w-0" title={label}>
                      <h3
                        className="text-[#061237] font-semibold text-[16px] leading-5 overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={label}>
                        {label}
                      </h3>
                      <p
                        className="text-[#061237] font-medium text-[14px] truncate"
                        title={budget}>
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

                    {/* chevron */}
                    <button
                      onClick={() => toggleShow(index)}
                      className="flex-shrink-0 text-[#061237] hover:text-[#0d1b47] transition-colors">
                      {expanded[index] ? (
                        <FiChevronUp size={20} />
                      ) : (
                        <FiChevronDown size={20} />
                      )}
                    </button>
                  </div>

                  {/* Expanded section */}
                  {expanded[index] && (
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-w-0">
                      {stages?.map((section, zIndex) => {
                        const channels = extractPlatforms(
                          clientCampaignData[index]
                        );
                        const getColorStyle = (color: string) => {
                          if (isHexColor(color)) {
                            return { className: "", style: { backgroundColor: color } };
                          }
                          // If it's not a hex color, assume it's a Tailwind class
                          return { className: color, style: {} };
                        };
                        const { className, style } = getColorStyle(section.color);
                        return (
                          <div key={section?.name} className="space-y-2">
                            <div
                              onClick={() => toggleOpen(index, section?.name)}
                              className={`w-full flex items-center justify-between rounded-[8px] text-[13px] font-[500] p-2 cursor-pointer hover:shadow-sm transition-shadow min-w-0 ${
                               className
                              } text-white`} style={{...style}}>
                              <div
                                className="flex items-center gap-1 min-w-0 flex-1"
                                title={section?.name}>
                                <span
                                  className="font-semibold text-sm overflow-hidden min-w-0"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                  title={section?.name}>
                                  {section?.name}
                                </span>
                                <span
                                  className={`transition-transform duration-200 flex-shrink-0 ${
                                    openSections[`${index}-${section?.name}`]
                                      ? "rotate-180"
                                      : ""
                                  }`}>
                                  <FiChevronDown size={12} />
                                </span>
                              </div>
                              <div className="text-xs opacity-90 flex-shrink-0 ml-2">
                                {section?.budget?.startsWith("null") ||
                                section?.budget?.startsWith("undefined")
                                  ? 0
                                  : `${Number(
                                      section?.budget.replace(/[^\d.-]/g, "")
                                    ).toLocaleString()} ${section?.budget
                                      .replace(/[\d\s.,-]/g, "")
                                      .trim()}`}
                              </div>
                            </div>

                            {openSections[`${index}-${section?.name}`] && (
                              <div className="mt-2 space-y-1 pl-2">
                                {channels
                                  ?.filter(
                                    (ch) => ch?.stageName === section?.name
                                  )
                                  ?.map(
                                    ({ platform_name, icon, amount, bg }) => (
                                      <div
                                        key={platform_name}
                                        className="hover:scale-[1.02] transition-transform duration-200">
                                        <div
                                          className={`py-1.5 px-2 text-[12px] font-[500] border w-full rounded-[6px] flex items-center justify-between shadow-sm min-w-0`}
                                          style={{
                                            backgroundColor: bg || "#f8f9fa",
                                          }}>
                                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                            <Image
                                              src={icon}
                                              alt={platform_name}
                                              width={14}
                                              height={14}
                                              className="rounded-sm flex-shrink-0"
                                            />
                                            <span
                                              className="font-medium text-gray-700 text-xs overflow-hidden min-w-0"
                                              style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                              }}
                                              title={platform_name}>
                                              {platform_name}
                                            </span>
                                          </div>
                                          <div className="text-xs font-semibold text-gray-600 flex-shrink-0 ml-1">
                                            {amount?.toLocaleString() || "0"}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
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
          }
        )}
      </div>
    </div>
  );
}

export default YearTimeline;
