"use client"

import { useCallback, useRef } from "react"
import { addDays, subDays, eachDayOfInterval, differenceInDays, isBefore, isAfter } from "date-fns"
import moment from "moment"

interface UseAutoExpandProps {
  campaignFormData: any
  setCampaignFormData: (data: any) => void
  onTimelineExpanded?: (newStartDate: Date, newEndDate: Date) => void
}

export const useAutoExpand = ({ campaignFormData, setCampaignFormData, onTimelineExpanded }: UseAutoExpandProps) => {
  const expandBuffer = useRef(7) // Days to expand beyond the resize point
  const minTimelineLength = useRef(30) // Minimum timeline length in days

  const expandTimeline = useCallback(
    (newPhaseStartDate: Date, newPhaseEndDate: Date, currentTimelineStart: Date, currentTimelineEnd: Date) => {
      let needsExpansion = false
      let expandedStartDate = new Date(currentTimelineStart)
      let expandedEndDate = new Date(currentTimelineEnd)

      // Check if we need to expand backwards (past)
      if (isBefore(newPhaseStartDate, currentTimelineStart)) {
        expandedStartDate = subDays(newPhaseStartDate, expandBuffer.current)
        needsExpansion = true
      }

      // Check if we need to expand forwards (future)
      if (isAfter(newPhaseEndDate, currentTimelineEnd)) {
        expandedEndDate = addDays(newPhaseEndDate, expandBuffer.current)
        needsExpansion = true
      }

      // Ensure minimum timeline length
      const timelineDays = differenceInDays(expandedEndDate, expandedStartDate)
      if (timelineDays < minTimelineLength.current) {
        const additionalDays = minTimelineLength.current - timelineDays
        expandedEndDate = addDays(expandedEndDate, Math.ceil(additionalDays / 2))
        expandedStartDate = subDays(expandedStartDate, Math.floor(additionalDays / 2))
        needsExpansion = true
      }

      if (needsExpansion) {
        // Update campaign timeline dates
        const updatedCampaignData = {
          ...campaignFormData,
          campaign_timeline_start_date: moment(expandedStartDate).format("YYYY-MM-DD"),
          campaign_timeline_end_date: moment(expandedEndDate).format("YYYY-MM-DD"),
        }

        setCampaignFormData(updatedCampaignData)
        onTimelineExpanded?.(expandedStartDate, expandedEndDate)

        return {
          expanded: true,
          newStartDate: expandedStartDate,
          newEndDate: expandedEndDate,
          newRange: eachDayOfInterval({ start: expandedStartDate, end: expandedEndDate }),
        }
      }

      return {
        expanded: false,
        newStartDate: currentTimelineStart,
        newEndDate: currentTimelineEnd,
        newRange: eachDayOfInterval({ start: currentTimelineStart, end: currentTimelineEnd }),
      }
    },
    [campaignFormData, setCampaignFormData, onTimelineExpanded],
  )

  const checkAndExpandTimeline = useCallback(
    (phaseStartDate: Date, phaseEndDate: Date) => {
      if (!campaignFormData?.campaign_timeline_start_date || !campaignFormData?.campaign_timeline_end_date) {
        return { expanded: false }
      }

      const currentTimelineStart = new Date(campaignFormData.campaign_timeline_start_date)
      const currentTimelineEnd = new Date(campaignFormData.campaign_timeline_end_date)

      return expandTimeline(phaseStartDate, phaseEndDate, currentTimelineStart, currentTimelineEnd)
    },
    [campaignFormData, expandTimeline],
  )

  return {
    checkAndExpandTimeline,
    setExpandBuffer: (days: number) => {
      expandBuffer.current = days
    },
    setMinTimelineLength: (days: number) => {
      minTimelineLength.current = days
    },
  }
}
