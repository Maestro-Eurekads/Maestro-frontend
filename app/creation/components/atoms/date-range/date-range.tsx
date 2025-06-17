"use client"

import { useState } from "react"
import { addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval } from "date-fns"
import { useDateRange } from "../../../../../src/date-range-context"
import { useCampaigns } from "app/utils/CampaignsContext"

const Range = () => {
  const [selected, setSelected] = useState("") // No default selection initially
  const { setRange } = useDateRange()
  const { campaignFormData } = useCampaigns()
  const { campaign_timeline_start_date: startDate, campaign_timeline_end_date: endDate } = campaignFormData

  const options = ["Day", "Week", "Month", "Year"]

  // Set default range to 14 days on first render

  // Update range only when an option is selected
  const handleSelection = (option: string) => {
    setSelected(option)

    let newRange
    const today = new Date()

    switch (option) {
      case "Day":
        newRange = { startDate: startDate, endDate: startDate }
        break
      case "Week":
        newRange = { startDate: startDate, endDate: addDays(startDate, 6) }
        break
      case "Month":
        newRange = {
          startDate: startOfMonth(startDate),
          endDate: endOfMonth(endDate),
        }
        break
      case "Year":
        newRange = {
          startDate: startOfYear(startDate),
          endDate: endOfYear(endDate),
        }
        break
      default:
        return
    }

    const dateList = eachDayOfInterval({
      start: newRange.startDate,
      end: newRange.endDate,
    })

    setRange(dateList)
  }

  return (
    <div className="w-fit z-0">
      <div className="relative flex items-center justify-between w-[210px] h-[42px] bg-[#F7F7F7] border border-black/10 rounded-lg p-[0.5]">
        {/* Moving Slider Indicator */}
        <div
          className="absolute w-[64px] h-[38px] bg-white border border-black/10 rounded-lg transition-transform duration-300 z-0"
          style={{
            transform: `translateX(${selected ? options.indexOf(selected) * 71.5 : 0}px)`,
          }}
        ></div>

        {/* Buttons */}
        {options.map((option) => (
          <button
            key={option}
            className={`relative z-10 flex-1 text-sm font-medium transition-colors duration-300 ${
              selected === option ? "text-black" : "text-gray-500"
            }`}
            onClick={() => handleSelection(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Range
