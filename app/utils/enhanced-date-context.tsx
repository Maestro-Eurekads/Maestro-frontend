"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { eachDayOfInterval, parseISO } from "date-fns"

interface EnhancedDateContextType {
  range: Date[]
  expandedRange: Date[]
  isExpanded: boolean
  expandRange: (newStartDate: Date, newEndDate: Date) => void
  resetRange: () => void
  originalStartDate: Date | null
  originalEndDate: Date | null
}

const EnhancedDateContext = createContext<EnhancedDateContextType | undefined>(undefined)

export const EnhancedDateProvider: React.FC<{
  children: React.ReactNode
  campaignFormData: any
}> = ({ children, campaignFormData }) => {
  const [range, setRange] = useState<Date[]>([])
  const [expandedRange, setExpandedRange] = useState<Date[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [originalStartDate, setOriginalStartDate] = useState<Date | null>(null)
  const [originalEndDate, setOriginalEndDate] = useState<Date | null>(null)

  // Initialize range from campaign data
  useEffect(() => {
    if (campaignFormData?.campaign_timeline_start_date && campaignFormData?.campaign_timeline_end_date) {
      const startDate = parseISO(campaignFormData.campaign_timeline_start_date)
      const endDate = parseISO(campaignFormData.campaign_timeline_end_date)

      const newRange = eachDayOfInterval({ start: startDate, end: endDate })
      setRange(newRange)
      setExpandedRange(newRange)

      // Store original dates if not already set
      if (!originalStartDate) setOriginalStartDate(startDate)
      if (!originalEndDate) setOriginalEndDate(endDate)
    }
  }, [campaignFormData?.campaign_timeline_start_date, campaignFormData?.campaign_timeline_end_date])

  const expandRange = useCallback((newStartDate: Date, newEndDate: Date) => {
    const newExpandedRange = eachDayOfInterval({ start: newStartDate, end: newEndDate })
    setExpandedRange(newExpandedRange)
    setIsExpanded(true)
  }, [])

  const resetRange = useCallback(() => {
    setExpandedRange(range)
    setIsExpanded(false)
  }, [range])

  return (
    <EnhancedDateContext.Provider
      value={{
        range,
        expandedRange,
        isExpanded,
        expandRange,
        resetRange,
        originalStartDate,
        originalEndDate,
      }}
    >
      {children}
    </EnhancedDateContext.Provider>
  )
}

export const useEnhancedDateRange = () => {
  const context = useContext(EnhancedDateContext)
  if (!context) {
    throw new Error("useEnhancedDateRange must be used within EnhancedDateProvider")
  }
  return context
}
