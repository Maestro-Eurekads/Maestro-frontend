"use client"
import { useState, useRef, useEffect, useMemo } from "react"
import down from "../../../public/down.svg"
import Image from "next/image"
import { BiX } from "react-icons/bi"
import { useCampaigns } from "app/utils/CampaignsContext"
import { fetchFilteredCampaigns } from "app/utils/campaign-filter-utils"
import { toast, Toaster } from "react-hot-toast"
import { useAppDispatch } from "store/useStore"
import { getCreateClient } from "features/Client/clientSlice"
import { defaultFilters } from "components/data"
import { fetchFilteredCampaignsSub } from "app/utils/campaign-filter-utils-sub"
import { useSession } from "next-auth/react"
import { FilterState } from "app/utils/useCampaignFilters"
import { useUserPrivileges } from "utils/userPrivileges"

// Scrollbar CSS
const scrollbarStyles = `
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`

type Props = {
  hideTitle?: boolean,
  router: any // Replace 'any' with the appropriate type if known
}

const Dropdown = ({ label, options, selectedFilters, handleSelect, isDisabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen)
    } else {
      toast.error("Please select a year first")
    }
  }

  const handleOptionSelect = (option) => {
    handleSelect(label.toLowerCase(), option)
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
      <div
        className={`flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer ${isDisabled ? "opacity-60" : ""
          }`}
        onClick={toggleDropdown}
      >
        <span className="text-gray-600 capitalize">
          {selectedFilters[label.toLowerCase()] || label.replace("_", " ")}
        </span>
        <span className="ml-auto text-gray-500">
          <Image src={down || "/placeholder.svg"} alt="dropdown" />
        </span>
      </div>

      {isOpen && (
        <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
          <div className={`max-h-[200px] overflow-y-auto ${label === "Select Plans" ? "scrollbar-thin" : ""}`}>
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
        </div>
      )}
    </div>
  )
}




const FiltersDropdowns = ({ hideTitle, router }: Props) => {
  const dispatch = useAppDispatch();
  const { isAdmin, isAgencyApprover, isFinancialApprover } =
    useUserPrivileges();
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = scrollbarStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const {
    filterOptions,
    selectedFilters,
    setSelectedFilters,
    loading,
    setLoading,
    setClientCampaignData,
    allClients,
  } = useCampaigns()
  const { data: session } = useSession();
  // @ts-ignore 
  const userType = session?.user?.data?.user?.id || "";


  const [filters, setFilters] = useState(defaultFilters)
  const allFiltersEmpty = useMemo(
    () => Object.values(selectedFilters).every((val) => !val),
    [selectedFilters]
  );

  const handleSelect = (label, value) => {
    if (value === "") {
      if (label === "year") {
        router.refresh();
        dispatch(getCreateClient(!isAdmin ? userType : null));
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: value,
          quarter: "",
          month: "",
        }));
      } else {
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: value,
        }));
      }
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        [label]: value,
      }));
    }
  };


  useEffect(() => {
    if (filterOptions) {
      const f = []
      Object.entries(filterOptions).forEach(([key, value]) => {
        f.push({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          options: value,
        })
      })
      setFilters(f)
    }
  }, [filterOptions])








  useEffect(() => {
    const allEmpty = Object.values(selectedFilters).every((val) => !val)

    const fetchData = async () => {
      const clientID = localStorage.getItem(userType.toString()) || allClients[0]?.id
      setLoading(true)
      console.log('clientID-clientID', clientID)

      try {
        const res = allEmpty //@ts-ignore
          ? await fetchFilteredCampaigns(clientID, {}) // Fetch all data
          : await fetchFilteredCampaigns(clientID, selectedFilters) // Fetch filtered

        setClientCampaignData(res)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedFilters])


  const isYearSelected = !!selectedFilters["year"]





  return (
    <div>
      <Toaster />
      {!hideTitle && (
        <h6 className="font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">Filters</h6>
      )}

      <div className="flex items-center gap-4 mt-[5px] flex-wrap">
        {filters
          ?.filter(
            (l) =>
              !["channel", "phase", "Level_1_name", "Level_2_name", "Level_3_name"].includes(l?.label)
          )
          .map(({ label, options }) => {
            const lowerLabel = label.toLowerCase();

            const selected = selectedFilters[lowerLabel];

            // If selected, show it. Otherwise fallback to dynamic name from *_name
            const getDisplayLabel = () => {
              if (selected) return selected;

              if (label === "Level_1") {
                return filters.find(f => f.label === "Level_1_name")?.options || label;
              }
              if (label === "Level_2") {
                return filters.find(f => f.label === "Level_2_name")?.options || label;
              }
              if (label === "Level_3") {
                return filters.find(f => f.label === "Level_3_name")?.options || label;
              }

              return label;
            };

            const displayLabel = getDisplayLabel();

            return (
              <div key={label}>
                <Dropdown
                  label={displayLabel}
                  options={options}
                  selectedFilters={selectedFilters}
                  handleSelect={(key, value) => handleSelect(lowerLabel, value)}
                  isDisabled={
                    (lowerLabel === "quarter" || lowerLabel === "month") && !isYearSelected
                  }
                />

                {selected ? (
                  <div className="mt-2 flex items-center justify-between px-3 py-2 gap-1 min-w-[72px] h-[32px] bg-[#E8F6FF] border border-[#3175FF1A] rounded-[10px]">
                    <p className="h-[20px] text-[15px] leading-[20px] font-medium text-[#3175FF]">
                      {selected}
                    </p>
                    <BiX
                      color="#3175FF"
                      size={20}
                      className="cursor-pointer"
                      onClick={() => handleSelect(lowerLabel, "")}
                    />
                  </div>
                ) : (
                  <div className="h-[32px]"></div>
                )}
              </div>
            );
          })}
      </div>

    </div>
  )
}

export default FiltersDropdowns
