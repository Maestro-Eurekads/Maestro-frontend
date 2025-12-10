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
import React, { useCallback, useMemo, useState } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";
const COLUMN_WIDTH = 80;

function YearTimeline({ range, funnels }) {
  const [expanded, setExpanded] = useState({});
  const [openSections, setOpenSections] = useState({});
  const { clientCampaignData } = useCampaigns();
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

  const calculateGridColumns = (start: Date, end: Date) => {
    const formattedStart = new Date(start);
    const formattedEnd = new Date(end);
    const startOfTimeline = startOfYear(formattedStart);
    const endOfTimeline = endOfYear(formattedEnd);

    const totalMonths = differenceInMonths(endOfTimeline, startOfTimeline) + 1;

    const startMonthIndex = formattedStart.getMonth(); // 0-based index for the start month
    const endMonthIndex = formattedEnd.getMonth(); // 0-based index for the end month

    const gridStartColumn = startMonthIndex + 1; // Convert to 1-based index
    const gridEndColumn = endMonthIndex + 2; // Convert to 1-based index (inclusive)

    return { gridStartColumn, gridEndColumn, totalMonths };
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
        });
      });
    return platforms;
  }

  const generateYearMonthsCount = useMemo(() => {
    if (!range || range.length === 0) return [];

    const startDate = startOfYear(range[0]); // Force start to Jan 1
    const endDate = endOfYear(range[range.length - 1]); // Force end to Dec 31

    return eachMonthOfInterval({ start: startDate, end: endDate }).length;
  }, [range]);

  return (
    <div>
      <div
        className="w-full min-h-auto relative pb-5"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: `${COLUMN_WIDTH}px 100%`,
        }}
      >
        {funnels?.map(
          (
            { label, budget, stages, endMonth, startMonth, startDate, endDate },
            index
          ) => {
            const { gridStartColumn, gridEndColumn } = calculateGridColumns(
              startDate,
              endDate
            );
            return (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${generateYearMonthsCount}, ${COLUMN_WIDTH}px)`,
                }}
              >
                <div
                  className="flex flex-col min-h-[69px] bg-transparent border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px]  justify-between"
                  style={{
                    gridColumnStart: gridStartColumn,
                    gridColumnEnd: gridEndColumn,
                  }}
                >
                  <div
                    className={`${
                      expanded[index]
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
                    <div className="py-4">
                      {stages?.map((section, zIndex) => {
                        const channels = extractPlatforms(
                          clientCampaignData[index]
                        );

                        return (
                          <div
                            key={section?.name}
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${
                                endMonth + 1 - startMonth
                              }, ${COLUMN_WIDTH})`,
                            }}
                          >
                            <div
                              onClick={() => toggleOpen(index, section?.name)}
                              className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${
                                section?.name === "Awareness"
                                  ? "bg-[#3175FF]"
                                  : section?.name === "Consideration"
                                  ? "bg-[#34A853]"
                                  : section?.name === "Conversion"
                                  ? "bg-[#ff9037]"
                                  : "bg-[#F05406]"
                              } text-white`}
                              style={{
                                gridColumnStart: startMonth,
                                gridColumnEnd: endMonth,
                              }}
                            >
                              <div className="flex items-center justify-center gap-3 flex-1">
                                <span>{section?.name}</span>
                                <span>
                                  <FiChevronDown size={15} />
                                </span>
                              </div>
                              <button className="justify-self-end py-[10px] text-[16px] font-[500] bg-white/25 rounded-[5px]">
                                {section?.budget?.startsWith("null") ||
                                section?.budget?.startsWith("undefined")
                                  ? 0
                                  : `${Number(
                                      section?.budget.replace(/[^\d.-]/g, "")
                                    ).toLocaleString()} ${section?.budget
                                      .replace(/[\d\s.,-]/g, "")
                                      .trim()}`}
                              </button>
                            </div>

                            {openSections[`${index}-${section?.name}`] && (
                              <div
                                style={{
                                  gridColumnStart: 1,
                                  gridColumnEnd: endMonth + 1 - startMonth + 1,
                                }}
                              >
                                {channels
                                  ?.filter(
                                    (ch) => ch?.stageName === section?.name
                                  )
                                  ?.map(
                                    ({ platform_name, icon, amount, bg }) => (
                                      <div
                                        key={platform_name}
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: `repeat(${
                                            endMonth + 1 - startMonth + 1 - 2
                                          }, ${COLUMN_WIDTH})`,
                                        }}
                                      >
                                        <div
                                          className={`py-1 text-[15px] font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between`}
                                          style={{
                                            gridColumnStart: 1,
                                            gridColumnEnd:
                                              endMonth +
                                              1 -
                                              startMonth +
                                              1 -
                                              1 +
                                              1 -
                                              1,
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
