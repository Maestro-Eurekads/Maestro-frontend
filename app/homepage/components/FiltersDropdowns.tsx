"use client"
import { useState, useRef, useEffect } from "react"
import down from "../../../public/down.svg"
import Image from "next/image"
import { BiX } from "react-icons/bi"
import { useCampaigns } from "app/utils/CampaignsContext"
import { fetchFilteredCampaigns } from "app/utils/campaign-filter-utils"
import { toast, Toaster } from "react-hot-toast" // Make sure you have this package installed

type Props = {
  hideTitle?: boolean
}

const Dropdown = ({ label, options, selectedFilters, handleSelect, isDisabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen)
    } else {
      // Show toast notification if dropdown is disabled
      toast.error("Please select a year first")
    }
  }

  const handleOptionSelect = (option) => {
    handleSelect(label, option)
    setIsOpen(false)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        className={`flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer ${isDisabled ? "opacity-60" : ""
          }`}
        onClick={toggleDropdown}
      >
        <span className="text-gray-600 capitalize">{selectedFilters[label] || label?.replace("_", " ")}</span>
        <span className="ml-auto text-gray-500">
          <Image src={down || "/placeholder.svg"} alt="dropdown" />
        </span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const defaulFilters = [
  { label: "Year", options: ["2022", "2023", "2024", "2025"] },
  { label: "Quarter", options: ["Q1", "Q2", "Q3", "Q4"] },
  {
    label: "Month",
    options: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  {
    label: "Category",
    options: ["Electronics", "Fashion", "Home", "Sports"],
  },
  { label: "Product", options: ["Laptop", "T-Shirt", "Sofa", "Bicycle"] },
  {
    label: "Select Plans",
    options: ["Plan A", "Plan B", "Plan C", "Plan D"],
  },
  { label: "Made By", options: ["User 1", "User 2", "User 3", "User 4"] },
  {
    label: "Approved By",
    options: ["Manager 1", "Manager 2", "Manager 3", "Manager 4"],
  },
]

const FiltersDropdowns = ({ hideTitle }: Props) => {
  const { filterOptions, selectedFilters, setSelectedFilters, loading, setLoading, setClientCampaignData, allClients } =
    useCampaigns()
  const [filters, setFilters] = useState(defaulFilters)

  const handleSelect = (label, value) => {
    // If clearing a filter
    if (value === "") {
      // If clearing the year, also clear quarter and month
      if (label === "Year") {
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: value,
          quarter: "",
          month: "",
        }))
      } else {
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: value,
        }))
      }
    } else {
      // Normal filter selection
      setSelectedFilters((prev) => ({
        ...prev,
        [label]: value,
      }))
    }
  }

  useEffect(() => {
    if (filterOptions) {
      const f = []
      Object.entries(filterOptions).forEach(([key, value]) => {
        f.push({
          label: key,
          options: value,
        })
      })
      setFilters(f)
    }
  }, [filterOptions])

  useEffect(() => {
    if (Object.values(selectedFilters).some((val) => val !== null)) {
      // If we have server-side filters, fetch from API
      const fetchData = async () => {
        const clientID = localStorage.getItem("selectedClient") || allClients[0]?.id
        setLoading(true)
        const data = await fetchFilteredCampaigns(clientID, selectedFilters)
          .then((res) => {
            setClientCampaignData(res)
          })
          .finally(() => {
            setLoading(false)
          })

      }
      fetchData()
    }
  }, [selectedFilters])

  // Check if quarter and month dropdowns should be disabled
  const isYearSelected = !!selectedFilters["year"]

  return (
    <div>
      <Toaster />
      {!hideTitle && <h6 className="font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">Filters</h6>}
      <div className="flex items-center gap-4 mt-[5px] flex-wrap">
        {filters
          ?.filter((l) => l?.label !== "channel" && l?.label !== "phase")
          .map(({ label, options }) => (
            <div key={label}>
              <Dropdown
                label={label}
                options={options}
                selectedFilters={selectedFilters}
                handleSelect={handleSelect}
                isDisabled={(label === "quarter" || label === "month") && !isYearSelected}
              />
              {selectedFilters[label] && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 gap-1 min-w-[72px] h-[32px] bg-[#E8F6FF] border border-[#3175FF1A] rounded-[10px]">
                  <p className="h-[20px] text-[15px] leading-[20px] font-medium text-[#3175FF]">
                    {selectedFilters[label]}
                  </p>
                  <BiX color="#3175FF" size={20} className="cursor-pointer" onClick={() => handleSelect(label, "")} />
                </div>
              )}
              {!selectedFilters[label] && <div className="h-[32px]"></div>}
            </div>
          ))}
      </div>
    </div>
  )
}

export default FiltersDropdowns
