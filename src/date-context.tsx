"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type DateRangeContextType = {
  range: string
  setRange: (range: string) => void
}

const DateRangeContext = createContext<DateRangeContextType>({
  range: "Week", // Default to Week view
  setRange: () => {},
})

export const DashboardDateRangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [range, setRange] = useState<string>("Week")

  return <DateRangeContext.Provider value={{ range, setRange }}>{children}</DateRangeContext.Provider>
}

export const useDateRange = () => useContext(DateRangeContext)
