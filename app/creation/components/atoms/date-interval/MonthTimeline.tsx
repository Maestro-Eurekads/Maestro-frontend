"use client";
import React, { useState, useEffect, useRef } from "react";
import { MdDragHandle } from "react-icons/md";
import reddelete from "../../../../../public/red-delete.svg";
import Image from "next/image";
import { useFunnelContext } from "../../../../utils/FunnelContextType";
import whiteplus from "../../../../../public/white-plus.svg";
import { useCampaigns } from "app/utils/CampaignsContext";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  isEqual,
  parseISO,
  format,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import moment from "moment";
import { getCurrencySymbol, renderUploadedFile } from "components/data";
import arrowUp from "../../../../../public/arrow-g-up.svg";
import arrowDown from "../../../../../public/arrow-g-down.svg";
import axios from "axios";
import { removeKeysRecursively } from "utils/removeID";
import Modal from "components/Modals/Modal";
import AdSetsFlow from "../../../components/common/AdSetsFlow";
import FormatSelection from "../../FormatSelection";
import { useDateRange } from "src/date-range-context";
import { useDateRange as DateRange } from "src/date-context";
import { FaSpinner } from "react-icons/fa";

interface Channel {
  name: string;
  channelName: string;
  icon: string;
  bg: string;
  color: string;
  ad_sets?: any[];
  format?: any[];
  start_date?: any;
  end_date?: any;
}

interface MonthTimelineProps {
  monthsCount: number;
  funnels: any[];
  range: Date[];
}

const MonthTimeline: React.FC<MonthTimelineProps> = ({ monthsCount, funnels, range }) => {
  const {
    campaignFormData,
    setCampaignFormData,
    setCopy,
    cId,
    campaignData,
    jwt,
  } = useCampaigns();
  const { funnelWidths } = useFunnelContext();
  const { range: rrange } = DateRange();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState(null);

  const [openCreatives, setOpenCreatives] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [openAdset, setOpenAdset] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [openView, setOpenView] = useState<"channel" | "adset">("channel");
  const [openItems, setOpenItems] = useState(null);

  // Calculate month width based on viewport
  const calculateMonthWidth = () => {
    const getViewportWidth = () => {
      return window.innerWidth || document.documentElement.clientWidth || 0;
    };
    const screenWidth = getViewportWidth();
    const contWidth = screenWidth - 367; // Adjust based on sidebar width
    const monthWidth = contWidth / monthsCount;
    return Math.max(monthWidth, 120); // Minimum 120px per month
  };

  const monthWidth = calculateMonthWidth();

  // Generate month headers
  const generateMonthHeaders = () => {
    if (!range || range.length === 0) return [];

    const uniqueMonths = new Set();
    range.forEach(date => {
      uniqueMonths.add(format(date, 'yyyy-MM'));
    });
    
    const monthDates = Array.from(uniqueMonths).map((monthStr: string) => {
      const [year, month] = monthStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }).sort((a, b) => a.getTime() - b.getTime());
    
    return monthDates;
  };

  const monthHeaders = generateMonthHeaders();

  // Create grid template columns
  const gridTemplateColumns = `repeat(${monthHeaders.length}, ${monthWidth}px)`;

  const toggleChannel = (id: string) => {
    setOpenItems((prev) => (prev === id ? null : id));
  };

  const handleDeleteChannel = async (indexToDelete: number) => {
    const updatedChannels = channels.filter(
      (_, index) => index !== indexToDelete
    );

    const updatedCampaignFormData = JSON.parse(
      JSON.stringify(campaignFormData)
    );

    await sendUpdatedDataToAPI(updatedCampaignFormData);

    setChannels(updatedChannels);
  };

  const sendUpdatedDataToAPI = async (updatedData: any) => {
    try {
      setDeleting(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        {
          data: {
            ...removeKeysRecursively(campaignData, [
              "id",
              "documentId",
              "createdAt",
              "publishedAt",
              "updatedAt",
              "_aggregated",
            ]),
            channel_mix: removeKeysRecursively(updatedData?.channel_mix, [
              "id",
              "isValidated",
              "validatedStages",
              "documentId",
              "_aggregated",
            ]),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setDeleting(false);
      setId(null);
    }
  };

  function replaceSpacesAndSpecialCharsWithUnderscore(str: string) {
    return str.replace(/[^\w_]/g, "_");
  }

  return (
    <div
      className="w-full relative pb-5"
      style={{
        display: "grid",
        gridTemplateColumns: gridTemplateColumns,
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: `${monthWidth}px 100%`,
      }}
    >
      {/* Month Headers */}
      <div
        className="sticky top-0 z-50 bg-white border-b mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          gridColumn: `1 / ${monthHeaders.length + 1}`,
        }}
      >
        {monthHeaders.map((monthDate, index) => (
          <div
            key={index}
            className="text-center text-sm font-medium py-2 border-r border-gray-200"
          >
            <p className="text-blue-500">{format(monthDate, "MMM")}</p>
            <p>{format(monthDate, "yyyy")}</p>
          </div>
        ))}
      </div>

      {/* Timeline Content */}
      <div
        className="relative"
        style={{
          gridColumn: `1 / ${monthHeaders.length + 1}`,
        }}
      >
        {/* Add channel button for small containers */}
        {monthWidth < 350 && (
          <button
            className="channel-btn-blue mt-[12px] mb-[12px] relative w-fit"
            onClick={() => {
              // Handle add channel
            }}
          >
            <Image src={whiteplus || "/placeholder.svg"} alt="whiteplus" />
            <p className="whitespace-nowrap">Add channel</p>
          </button>
        )}

        {/* Channel bars would go here - similar to ResizableChannels */}
        {/* This is a placeholder for the actual channel rendering logic */}
        <div className="mt-4">
          {channels.map((channel, index) => (
            <div
              key={channel.name}
              className="relative h-[46px] mb-2"
            >
              <div
                className="relative h-full flex justify-center items-center text-white py-[10px] px-4 gap-2 border shadow-md rounded-[10px]"
                style={{
                  backgroundColor: channel.bg,
                  color: channel.color,
                  borderColor: channel.color,
                  minWidth: `${monthWidth}px`,
                }}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={channel.icon || "/placeholder.svg"}
                    alt={channel.icon}
                    width={20}
                    height={20}
                  />
                  <span className="font-medium whitespace-nowrap">
                    {channel.name}
                  </span>
                </div>
                
                <button
                  className="delete-resizeableBar z-[20]"
                  onClick={() => {
                    if (openItems === `${channel?.name}${index}`) {
                      return;
                    }
                    handleDeleteChannel(index);
                    setId(index);
                  }}
                >
                  {deleting && id === index ? (
                    <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-red-600">
                      <FaSpinner className="animate-spin text-white" />
                    </div>
                  ) : (
                    <Image
                      src={reddelete || "/placeholder.svg"}
                      alt="reddelete"
                    />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={selectedChannel && openCreatives}
        onClose={() => setOpenCreatives(false)}
      >
        <div className="bg-white w-[900px] p-6 rounded-lg h-[600px] overflow-y-auto">
          <button
            className="flex justify-end w-fit ml-auto"
            onClick={() => setOpenCreatives(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
            >
              <path
                d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                stroke="#717680"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {openCreatives && (
            <FormatSelection
              stageName=""
              platformName={selectedChannel}
              view={openView}
            />
          )}
        </div>
      </Modal>

      {openAdset && (
        <Modal
          isOpen={selectedChannel && openAdset ? true : false}
          onClose={() => setOpenAdset(false)}
        >
          <div className="bg-white w-[950px] p-2 rounded-lg max-h-[600px] overflow-y-scroll">
            <button
              className="flex justify-end w-fit ml-auto"
              onClick={() => setOpenAdset(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
              >
                <path
                  d="M18.7266 6.5L6.72656 18.5M6.72656 6.5L18.7266 18.5"
                  stroke="#717680"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <AdSetsFlow stageName="" platformName={selectedChannel} />
            <div className="w-fit ml-auto">
              <button
                className="bg-blue-500 text-white rounded-md p-2 flex justify-center items-center"
                onClick={async () => {
                  await sendUpdatedDataToAPI(campaignFormData);
                  await setOpenAdset(false);
                }}
                disabled={deleting}
              >
                {deleting ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Confirm Changes"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MonthTimeline; 