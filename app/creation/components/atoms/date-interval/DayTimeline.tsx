import { useCampaigns } from "app/utils/CampaignsContext";
import { getPlatformIcon, mediaTypes, platformStyles } from "components/data";
import { isEqual, parseISO } from "date-fns";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { BsFillMegaphoneFill } from "react-icons/bs";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { TbCreditCardFilled, TbZoomFilled } from "react-icons/tb";

interface DayTimelineProps {
  daysCount: number;
  funnels: any[];
  range?: any;
}

const DayTimeline: React.FC<DayTimelineProps> = ({
  daysCount,
  funnels,
  range,
}) => {
  const dayWidth = 80; // Fixed width for each day in pixels
  const [expanded, setExpanded] = useState({});
  const { campaignFormData, clientCampaignData } = useCampaigns();
  const [openSections, setOpenSections] = useState({});

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
        [
          "social_media",
          "display_networks",
          "search_engines",
          "streaming",
          "ooh",
          "broadcast",
          "messaging",
          "print",
          "e_commerce",
          "in_game",
          "mobile",
        ].forEach((channelType) => {
          stage[channelType].forEach((platform) => {
            const platformName = platform.platform_name;
            const platformBudget = parseFloat(
              platform.budget?.fixed_value || 0
            );
            const percentage = (platformBudget / stageBudget) * 100 || 0;
            const existingPlatform = platforms.find(
              (p) => p.platform_name === platformName && p.stageName === stageName
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

  const calculateGridColumns = (start: any, end: any) => {
    const formattedStart = parseISO(start);
    const formattedEnd = parseISO(end);
    // console.log({ start, end });

    const startDateIndex = formattedStart
      ? range?.findIndex((date) => isEqual(date, formattedStart)) + 1
      : 0;
    const endDateIndex = formattedEnd
      ? range?.findIndex((date) => isEqual(date, formattedEnd)) + 1
      : 0;
    // console.log({ startDateIndex, endDateIndex });
    return { startDateIndex, endDateIndex };
  };

  return (
    <div
      className="w-full min-h-[519px] pb-10"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `calc(50px) 100%`,
      }}
    >
      {funnels?.map(({ startDay, endDay, label, budget, stages }, index) => {
        console.log({ endDay, startDay, label });
        return (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${daysCount}, 50px)`,
            }}
          >
            <div
              className="flex flex-col min-h-[69px] bg-white border border-[rgba(0,0,0,0.1)] mt-6 shadow-sm rounded-[10px]  justify-between"
              style={{
                gridColumnStart: startDay,
                gridColumnEnd: endDay + 1,
              }}
            >
              <div
                onClick={() => toggleShow(index)}
                className={`cursor-pointer ${
                  expanded[index]
                    ? 'border-b border-b-[rgba(0,0,0,0.1)] !rounded-t-[10px] flex justify-between items-center p-4    h-[77px] bg-[#F9FAFB]  "'
                    : "flex justify-between items-center p-4"
                } `}
              >
                <>
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
                </>
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
                  {stages?.map(
                    (
                      {
                        name,
                        startDay: start,
                        endDay: end,
                        startWeek,
                        endWeek,
                        startMonth,
                        endMonth,
                        budget,
                      },
                      zIndex
                    ) => {
                      // console.log({ start, end });
                      const findInd = clientCampaignData.findIndex(
                        (item) => item.media_plan_details?.plan_name === label
                      );
                      const channels = extractPlatforms(
                        clientCampaignData[findInd]
                      );

                      return (
                        <div
                          key={name}
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${daysCount}, 50px)`,
                          }}
                          onClick={() => toggleOpen(index, name)}
                        >
                          <div
                            className={`mt-5 w-full flex items-center rounded-[10px] text-[17px] font-[500] p-3 text-center ${end - start < 5 ? "flex-col" : "flex-row"} ${
                              name === "Awareness"
                                ? "bg-[#3175FF]"
                                : name === "Consideration"
                                ? "bg-[#34A853]"
                                : name === "Conversion"
                                ? "bg-[#ff9037]"
                                : "bg-[#F05406]"
                            } text-white`}
                            style={{
                              gridColumnStart: start
                                ? start - startDay === 0
                                  ? 1
                                  : start - startDay + 1
                                : 1,
                              gridColumnEnd: end + 1 - startDay + 1,
                            }}
                          >
                            <div className="flex items-center justify-center gap-3 flex-1">
                              <span
                                style={{
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {name}
                              </span>
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
                                gridColumnStart: start
                                  ? start - startDay === 0
                                    ? 1
                                    : start - startDay + 1
                                  : 1,
                                gridColumnEnd: end + 1 - startDay + 1,
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
                                    const { startDateIndex, endDateIndex } =
                                      calculateGridColumns(startDate, endDate);
                                    console.log(
                                      {
                                        startDateIndex,
                                        endDateIndex,
                                        startDate,
                                        endDate,
                                        startDay,
                                        endDay,
                                      },
                                      "info",
                                      platform_name
                                    );
                                    return (
                                      <div
                                        key={platform_name}
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: `repeat(${daysCount}, 50px)`,
                                        }}
                                      >
                                        <div
                                          className={`py-1 text-[15px] font-[500] border my-5 w-full rounded-[10px] flex items-center justify-between ${
                                            endDateIndex - startDateIndex < 5
                                              ? "flex-col"
                                              : "flex-row"
                                          } `}
                                          style={{
                                            // display: "grid",
                                            gridColumnStart:
                                              startDateIndex - start + 1,
                                            gridColumnEnd:
                                              endDateIndex - start + 1 + 1,
                                            backgroundColor: bg,
                                          }}
                                        >
                                          <div />
                                          <span
                                            className={`flex items-center gap-3 pl-0  ${
                                              endDateIndex - startDateIndex < 5
                                                ? "flex-col"
                                                : "flex-row ml-4"
                                            }`}
                                          >
                                            <Image
                                              src={icon}
                                              alt={platform_name}
                                              width={20}
                                              className={`${
                                                endDateIndex - startDateIndex <
                                                5
                                                  ? "hidden"
                                                  : "block"
                                              }`}
                                            />
                                            <span
                                              className="text-wrap"
                                              style={{
                                                overflowWrap: "anywhere",
                                              }}
                                            >
                                              {platform_name}
                                            </span>
                                          </span>
                                          <button
                                            className={`bg-[#0866FF33]/5  rounded-[5px] max-w-max ${
                                              endDateIndex - startDateIndex < 5
                                                ? ""
                                                : "mr-3 py-2 px-[10px]"
                                            }`}
                                          >
                                            {Number(amount).toLocaleString()}{" "}
                                            {`${budget
                                              .replace(/[\d\s.,-]/g, "")
                                              .trim()}`}
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
      })}
    </div>
  );
};

export default DayTimeline;
