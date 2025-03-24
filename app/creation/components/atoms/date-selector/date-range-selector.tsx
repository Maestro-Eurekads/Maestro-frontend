import React, { useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useDateRange } from "../../../../../src/date-range-context";
import { useCampaigns } from "app/utils/CampaignsContext";
import { ca } from "date-fns/locale";

const DateRangeSelector = () => {
  const [isShowDateRange, setIsShowDateRange] = useState(false);
  const { range, setRange } = useDateRange();
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative">
        <div className="flex items-center gap-2 text-sm">
          <span
            className="border rounded-lg flex gap-2 p-2.5 items-center justify-center"
            onClick={() => setIsShowDateRange(!isShowDateRange)}
          >
            <MdArrowBackIos />
          </span>
          <div className="py-2.5 px-4 border rounded-lg text-gray-800">
            {campaignFormData?.campaign_timeline_start_date
              ? format(
                  new Date(campaignFormData?.campaign_timeline_start_date),
                  "dd MMM"
                )
              : "Select Date"}{" "}
            -{" "}
            {campaignFormData?.campaign_timeline_end_date
              ? format(
                  new Date(campaignFormData?.campaign_timeline_end_date),
                  "dd MMM"
                )
              : "Select Date"}
          </div>
          <span
            className="border rounded-lg flex gap-2 p-2.5 items-center justify-center"
            onClick={() => setIsShowDateRange(!isShowDateRange)}
          >
            <MdArrowForwardIos />
          </span>
        </div>
        {isShowDateRange && (
          <div className="absolute z-50 right-0">
            <DateRange
              editableDateInputs={true}
              onChange={(item) =>
                setCampaignFormData((prev) => ({
                  ...prev,
                  campaign_timeline_start_date: item?.selection?.startDate,
                  campaign_timeline_end_date: item?.selection?.endDate,
                }))
              }
              moveRangeOnFirstSelection={false}
              ranges={[
                {
                  startDate: campaignFormData?.campaign_timeline_start_date,
                  endDate: campaignFormData?.campaign_timeline_end_date,
                  key: "selection",
                },
              ]}
              rangeColors={["#3f51b5"]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;
