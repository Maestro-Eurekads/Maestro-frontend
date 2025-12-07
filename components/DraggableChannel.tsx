"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { MdDragHandle, MdOutlineKeyboardArrowDown } from "react-icons/md";
import Image from "next/image";
import icroundadd from "../public/ic_round-add.svg";
import { useFunnelContext } from "../app/utils/FunnelContextType";
import { useCampaigns } from "app/utils/CampaignsContext";
import moment from "moment";
import { useDateRange as useDRange } from "src/date-context";
import { useDateRange } from "src/date-range-context";
import { getCurrencySymbol } from "./data";
import { addDays, format, subDays } from "date-fns";
import { pixelToDate } from "utils/pixelToDate";
interface DraggableChannelProps {
  id?: string;
  bg?: string;
  description?: string;
  setIsOpen?: (show: boolean) => void;
  openChannel?: boolean;
  setOpenChannel?: (open: boolean) => void;
  Icon?: any;
  dateList?: Date[];
  dragConstraints?: any;
  parentWidth?: number;
  setParentWidth?: (width: number) => void;
  parentLeft?: number;
  setParentLeft?: (left: number) => void;
  disableDrag?: boolean;
  budget?: number | string;
  setSelectedStage?: any;
  openItems?: any;
  setOpenItems?: any;
  endMonth?: any;
  color?: any;
  endDay?: any;
  endWeek?: any;
  dailyWidth?: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
  type: "resize" | "drag" | null;
}

const DraggableChannel: React.FC<DraggableChannelProps> = ({
  id,
  bg,
  description,
  setIsOpen,
  openChannel,
  setOpenChannel,
  Icon,
  dateList = [],
  dragConstraints,
  parentWidth,
  setParentWidth,
  parentLeft,
  setParentLeft,
  disableDrag = false,
  budget,
  setSelectedStage,
  openItems,
  setOpenItems,
  endMonth,
  color,
  endDay,
  endWeek,
  dailyWidth,
}) => {
  const { funnelWidths, setFunnelWidth } = useFunnelContext();
  const [position, setPosition] = useState(parentLeft || 0);
  const isResizing = useRef<{
    startX: number;
    startWidth: number;
    startPos: number;
    direction: "left" | "right";
  } | null>(null);
  const isDragging = useRef<{ startX: number; startPos: number } | null>(null);
  const dragStartDataRef = useRef<any>(null);

  const draftCampaignFormRef = useRef<any>(null);
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { range: viewType } = useDRange();
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
    type: null,
  });

  useEffect(() => {
    setPosition(parentLeft || 0);
  }, [parentLeft]);

  const snapToTimeline = (currentPosition: number) => {
    const unitWidth = dailyWidth || 50;
    const snapIndex = Math.round(currentPosition / unitWidth);
    return snapIndex * unitWidth;
  };

  const updateTooltipWithDates = (
    startPixel: number,
    endPixel: number,
    mouseX: number,
    mouseY: number,
    type: "resize" | "drag"
  ) => {
    if (!dateList.length) return;

    const gridContainer = document.querySelector(
      ".grid-container"
    ) as HTMLElement;
    if (!gridContainer) return;
    const containerRect = gridContainer.getBoundingClientRect();

    const startDateValue = pixelToDate({
      dateList,
      viewType,
      pixel: startPixel,
      containerWidth: containerRect.width,
      dailyWidth,
    });

    const endDateValue = pixelToDate({
      dateList,
      viewType,
      pixel: endPixel,
      containerWidth: containerRect.width,
      fieldName: "endDate",
      dailyWidth,
    });

    const formattedStartDate =
      viewType === "Year"
        ? startDateValue.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : startDateValue.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });

    const formattedEndDate =
      viewType === "Year"
        ? endDateValue.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : endDateValue.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });

    const container = document.querySelector(
      `.cont-${id?.replaceAll(" ", "_")}`
    ) as HTMLElement;
    if (!container) return;

    const contRect = container.getBoundingClientRect();
    const tooltipX = mouseX - contRect.left;
    const tooltipY = mouseY - contRect.top - 50;

    setTooltip({
      visible: true,
      x: tooltipX,
      y: tooltipY,
      content: `${description}: ${formattedStartDate} - ${formattedEndDate}`,
      type,
    });
  };

  const handleMouseDownResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (disableDrag || openItems) return;
    e.preventDefault();
    e.stopPropagation();

    const startPixel = position;
    const endPixel = startPixel + (parentWidth || 0);
    updateTooltipWithDates(
      startPixel,
      endPixel,
      e.clientX,
      e.clientY,
      "resize"
    );

    isResizing.current = {
      startX: e.clientX,
      startWidth: parentWidth || 0,
      startPos: position,
      direction,
    };
    document.addEventListener("mousemove", handleMouseMoveResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const { startX, startWidth, startPos, direction } = isResizing.current;

    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;

    const containerRect = gridContainer.getBoundingClientRect();
    let newWidth = startWidth;
    let newPos = startPos;

    const deltaX = e.clientX - startX;

    if (direction === "left") {
      newPos = Math.max(0, startPos + deltaX);
      newWidth = Math.max(50, startWidth - deltaX);
      newPos = snapToTimeline(newPos);
      newWidth = startWidth - (newPos - startPos);
    } else {
      const rightEdgePos = startPos + startWidth + deltaX;
      const snappedRightEdge = snapToTimeline(rightEdgePos);
      newWidth = Math.max(50, snappedRightEdge - startPos);
    }

    const newParentStartDate = pixelToDate({
      dateList,
      viewType,
      pixel: newPos,
      containerWidth: containerRect.width,
      dailyWidth,
    });
    const newParentEndDate = pixelToDate({
      dateList,
      viewType,
      pixel: newPos + newWidth,
      containerWidth: containerRect.width,
      fieldName: "endDate",
      dailyWidth,
    });

    const currentChannelMix = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === description
    );

    if (currentChannelMix) {
      const updatedChannelMix = JSON.parse(JSON.stringify(currentChannelMix));

      updatedChannelMix.funnel_stage_timeline_start_date =
        moment(newParentStartDate).format("YYYY-MM-DD");
      updatedChannelMix.funnel_stage_timeline_end_date =
        moment(newParentEndDate).format("YYYY-MM-DD");

      const mediaTypes = [
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
      ];

      const parentStart = moment(newParentStartDate);
      const parentEnd = moment(newParentEndDate);

      mediaTypes.forEach((mediaType) => {
        if (Array.isArray(updatedChannelMix[mediaType])) {
          updatedChannelMix[mediaType] = updatedChannelMix[mediaType].map(
            (platform: any) => {
              if (platform.campaign_start_date && platform.campaign_end_date) {
                let childStart = moment(platform.campaign_start_date);
                let childEnd = moment(platform.campaign_end_date);

                const originalChildStart = childStart.format("YYYY-MM-DD");
                const originalChildEnd = childEnd.format("YYYY-MM-DD");

                if (childStart.isBefore(parentStart)) {
                  childStart = parentStart.clone();
                }
                if (childEnd.isAfter(parentEnd)) {
                  childEnd = parentEnd.clone();
                }
                if (childEnd.isBefore(childStart)) {
                  childEnd = childStart.clone();
                }

                const newChildStart = childStart.format("YYYY-MM-DD");
                const newChildEnd = childEnd.format("YYYY-MM-DD");

                return {
                  ...platform,
                  campaign_start_date: newChildStart,
                  campaign_end_date: newChildEnd,
                };
              }
              return platform;
            }
          );
        }
      });

      const allStartDates = campaignFormData?.channel_mix
        ?.map(
          (ch) =>
            ch?.funnel_stage_timeline_start_date &&
            moment(ch.funnel_stage_timeline_start_date)
        )
        .filter((date) => date);

      const allEndDates = campaignFormData?.channel_mix
        ?.map(
          (ch) =>
            ch?.funnel_stage_timeline_end_date &&
            moment(ch.funnel_stage_timeline_end_date)
        )
        .filter((date) => date);

      const minStartDate = moment.min(allStartDates).format("YYYY-MM-DD");
      const maxEndDate = moment.max(allEndDates).format("YYYY-MM-DD");

      draftCampaignFormRef.current = {
        ...campaignFormData,
        channel_mix: campaignFormData?.channel_mix?.map((ch) =>
          ch.funnel_stage === description ? updatedChannelMix : ch
        ),
        ...(viewType === "Year" && {
          campaign_timeline_start_date: minStartDate,
          campaign_timeline_end_date: maxEndDate,
        }),
      };
      setCampaignFormData(draftCampaignFormRef.current);
    }

    setParentWidth(newWidth);
    setParentLeft(newPos);
    setPosition(newPos);

    updateTooltipWithDates(
      newPos,
      newPos + newWidth,
      e.clientX,
      e.clientY,
      "resize"
    );
  };

  const handleMouseDownDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableDrag) return;
    e.preventDefault();

    const currentMix = campaignFormData?.channel_mix?.find(
      (ch) => ch?.funnel_stage === description
    );
    if (currentMix) {
      dragStartDataRef.current = JSON.parse(JSON.stringify(currentMix));
    }
    const startPixel = position;
    const endPixel = position + parentWidth;
    updateTooltipWithDates(startPixel, endPixel, e.clientX, e.clientY, "drag");

    isDragging.current = { startX: e.clientX, startPos: position };
    document.addEventListener("mousemove", handleMouseMoveDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const { startX, startPos } = isDragging.current;
    const gridContainer = document.querySelector(".grid-container");
    if (!gridContainer) return;

    const containerWidth = gridContainer.scrollWidth;
    const minX = 0;
    const maxX = containerWidth - parentWidth;

    let newPosition = startPos + (e.clientX - startX);
    newPosition = Math.max(minX, Math.min(newPosition, maxX));
    newPosition = snapToTimeline(newPosition);

    const newStartDate = pixelToDate({
      dateList,
      viewType,
      pixel: newPosition,
      containerWidth,
      dailyWidth,
    });

    const newEndDate = pixelToDate({
      dateList,
      viewType,
      pixel: newPosition + parentWidth,
      containerWidth,
      fieldName: "endDate",
      dailyWidth,
    });

    if (dragStartDataRef.current) {
      const originalStartDate =
        dragStartDataRef.current.funnel_stage_timeline_start_date;
      const daysDelta = moment(newStartDate).diff(
        moment(originalStartDate),
        "days"
      );
      const updatedChannelMix = JSON.parse(
        JSON.stringify(dragStartDataRef.current)
      );

      updatedChannelMix.funnel_stage_timeline_start_date =
        moment(newStartDate).format("YYYY-MM-DD");
      updatedChannelMix.funnel_stage_timeline_end_date =
        moment(newEndDate).format("YYYY-MM-DD");

      const mediaTypes = [
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
      ];

      mediaTypes.forEach((mediaType) => {
        if (Array.isArray(updatedChannelMix[mediaType])) {
          updatedChannelMix[mediaType] = updatedChannelMix[mediaType].map(
            (platform: any) => {
              if (platform.campaign_start_date && platform.campaign_end_date) {
                return {
                  ...platform,
                  campaign_start_date: moment(platform.campaign_start_date)
                    .add(daysDelta, "days")
                    .format("YYYY-MM-DD"),
                  campaign_end_date: moment(platform.campaign_end_date)
                    .add(daysDelta, "days")
                    .format("YYYY-MM-DD"),
                };
              }
              return platform;
            }
          );
        }
      });

      const allStartDates = campaignFormData?.channel_mix
        ?.map(
          (ch) =>
            ch?.funnel_stage_timeline_start_date &&
            moment(ch.funnel_stage_timeline_start_date)
        )
        .filter((date) => date);

      const allEndDates = campaignFormData?.channel_mix
        ?.map(
          (ch) =>
            ch?.funnel_stage_timeline_end_date &&
            moment(ch.funnel_stage_timeline_end_date)
        )
        .filter((date) => date);

      const minStartDate = moment.min(allStartDates).format("YYYY-MM-DD");
      const maxEndDate = moment.max(allEndDates).format("YYYY-MM-DD");

      draftCampaignFormRef.current = {
        ...campaignFormData,
        channel_mix: campaignFormData?.channel_mix?.map((ch) =>
          ch.funnel_stage === description ? updatedChannelMix : ch
        ),
        ...(viewType === "Year" && {
          campaign_timeline_start_date: minStartDate,
          campaign_timeline_end_date: maxEndDate,
        }),
      };
      setCampaignFormData(draftCampaignFormRef.current);
    }
    setParentLeft(newPosition);
    setPosition(newPosition);
    updateTooltipWithDates(
      newPosition,
      newPosition + parentWidth,
      e.clientX,
      e.clientY,
      "drag"
    );
  };

  const handleMouseUp = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    if (draftCampaignFormRef.current) {
      setCampaignFormData(draftCampaignFormRef.current);
      draftCampaignFormRef.current = null;
    }
    dragStartDataRef.current = null;
    isResizing.current = null;
    isDragging.current = null;
    document.removeEventListener("mousemove", handleMouseMoveResize);
    document.removeEventListener("mousemove", handleMouseMoveDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  const stageBudget = campaignFormData?.channel_mix?.find(
    (fs) => fs?.funnel_stage === description
  )?.stage_budget;

  return (
    <div
      className={`relative px-[1px] w-full h-14 flex select-none rounded-[10px] cont-${id?.replaceAll(
        " ",
        "_"
      )}`}
      style={{
        transform: `translateX(${position + (viewType === "Month" ? 4 : 0)}px)`,
      }}
    >
      {tooltip.visible && (
        <div
          className={`${color} fixed top-0 z-50 text-white px-3 py-1.5 rounded-md text-sm shadow-lg whitespace-nowrap pointer-events-none`}
          style={{
            left: `${tooltip.x}px`,
            top: `0px`,
            transform: `translate(-${
              tooltip.x + 100 >= (parentWidth || 0) ? 100 : 0
            }%, -100%)`,
            border: `1px solid ${bg}`,
            color: "white",
          }}
        >
          {tooltip.content}
        </div>
      )}
      <div
        className={`relative ${color} h-full flex justify-between items-center text-white px-4 py-[10px] gap-2 border shadow-md min-w-[50px] ${
          disableDrag ? "cursor-default relative" : "cursor-pointer"
        } rounded-[10px] cont-${id?.replaceAll(" ", "_")}`}
        style={{
          width: disableDrag
            ? `${parentWidth + (viewType === "Month" ? 0 : 0)}px`
            : parentWidth,
          backgroundColor: color,
          transition: "transform 0.2s ease-out",
        }}
        // onClick={() => setOpenChannel?.(!openChannel)}
        onMouseDown={disableDrag || openItems ? undefined : handleMouseDownDrag}
      >
        {viewType === "Month" ? (
          <div
            className={`absolute left-0 w-5 h-1/2 bg-opacity-80 ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "left")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute left-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-l-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "left")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
        <div />
        <button
          className="flex items-center gap-3 w-fit"
          onClick={() => setOpenChannel?.(!openChannel)}
        >
          {Icon?.src ? (
            <Image
              src={Icon?.src || "/placeholder.svg"}
              alt=""
              width={20}
              height={20}
            />
          ) : (
            Icon
          )}
          <span className="font-medium">{description}</span>
          <MdOutlineKeyboardArrowDown />
        </button>
        {!disableDrag && parentWidth && parentWidth >= 350 ? (
          <button
            className="channel-btn mr-10"
            onClick={() => {
              setIsOpen?.(true);
              setSelectedStage(description);
            }}
          >
            <Image src={icroundadd || "/placeholder.svg"} alt="icroundadd" />
            <p className="whitespace-nowrap text-[11px]">Add channel</p>
          </button>
        ) : (
          <div />
        )}
        {disableDrag && stageBudget?.fixed_value > 0 && (
          <div className="bg-[#FFFFFF26] rounded-[5px] py-[10px] px-[12px] font-medium">
            {stageBudget?.fixed_value &&
              Number.parseInt(stageBudget?.fixed_value).toLocaleString()}{" "}
            {getCurrencySymbol(campaignFormData?.campaign_budget?.currency)}
          </div>
        )}
        {viewType === "Month" ? (
          <div
            className={`absolute right-0 w-5 h-1/2 bg-opacity-80 ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "right")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        ) : (
          <div
            className={`absolute right-0 w-5 h-full bg-opacity-80 bg-black ${
              disableDrag ? "cursor-default hidden" : "cursor-ew-resize"
            } rounded-r-lg text-white flex items-center justify-center`}
            onMouseDown={(e) =>
              disableDrag || openItems
                ? undefined
                : handleMouseDownResize(e, "right")
            }
          >
            <MdDragHandle className="rotate-90" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableChannel;
