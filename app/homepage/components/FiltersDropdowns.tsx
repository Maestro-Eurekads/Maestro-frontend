"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import down from "../../../public/down.svg";
import Image from "next/image";
import { BiX } from "react-icons/bi";
import { useCampaigns } from "app/utils/CampaignsContext";
import { fetchFilteredCampaigns } from "app/utils/campaign-filter-utils";
import { toast, Toaster } from "react-hot-toast";
import { useAppDispatch } from "store/useStore";
import { getCreateClient } from "features/Client/clientSlice";
import { defaultFilters } from "components/data";
import { useSession } from "next-auth/react";
import { useUserPrivileges } from "utils/userPrivileges";
import TreeDropdownFilter from "components/TreeDropdownFilter";
import { convertToSingleNestedStructure } from "utils/convertToSingleNestedStructure";
import { cleanName, cleanNames } from "components/Options";

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
`;

type Props = {
  hideTitle?: boolean;
  router: any; // Replace 'any' with the appropriate type if known
};

const Dropdown = ({
  label,
  options,
  selectedFilters,
  handleSelect,
  isDisabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownContentRef = useRef(null);
  const triggerRef = useRef(null);
  const [parentWidth, setParentWidth] = useState("100%");
  const [triggerWidth, setTriggerWidth] = useState(72); // Default min width of 72px

  const toggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    } else {
      toast.error("Please select a year first");
    }
  };

  const handleOptionSelect = (option) => {
    handleSelect(label.toLowerCase(), option);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Measure trigger width on mount and when selectedFilters changes
  useEffect(() => {
    if (triggerRef.current) {
      const measuredTriggerWidth = triggerRef.current.offsetWidth;
      setTriggerWidth(measuredTriggerWidth);
    }
  }, [selectedFilters]);

  // Update parent width when dropdown opens/closes
  useEffect(() => {
    if (isOpen && dropdownContentRef.current) {
      const dropdownWidth = dropdownContentRef.current.scrollWidth || 0;
      setParentWidth(`${Math.max(dropdownWidth, triggerWidth)}px`);
    } else {
      setParentWidth("100%");
    }
  }, [isOpen, triggerWidth]);

  return (
    <div
      className="relative min-w-[72px]"
      style={{ width: parentWidth }}
      ref={dropdownRef}
    >
      <div
        ref={triggerRef}
        className={`relative w-full flex items-center gap-3 px-4 py-2 h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer ${
          isDisabled ? "opacity-60" : ""
        }`}
        onClick={toggleDropdown}
      >
        <span className="text-gray-600 capitalize truncate">
          {selectedFilters[label.toLowerCase()] || label.replace("_", " ")}
        </span>
        <span className="ml-auto text-gray-500 flex-shrink-0">
          <Image src={down} alt="dropdown" />
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10"
          ref={dropdownContentRef}
        >
          <div
            className={`max-h-[200px] overflow-y-auto ${
              label === "Select Plans" ? "scrollbar-thin" : ""
            }`}
          >
            {options?.length > 0 ? (
              options?.map((option) => (
                <div
                  key={option}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                  onClick={() => {
                    handleOptionSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {cleanNames(option)}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 whitespace-nowrap">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FiltersDropdowns = ({ hideTitle, router }: Props) => {
  const dispatch = useAppDispatch();
  const { isAdmin, isAgencyApprover, isFinancialApprover } =
    useUserPrivileges();
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const {
    filterOptions,
    selectedId,
    selectedFilters,
    setSelectedFilters,
    loading,
    setLoading,
    setClientCampaignData,
    allClients,
    jwt,
    agencyId,
  } = useCampaigns();
  const { data: session } = useSession();
  // @ts-ignore
  const userType = session?.user?.data?.user?.id || "";

  const [filters, setFilters]: any = useState(defaultFilters);


  const handleSelect = (label, value) => {
    if (!value || value === "") {
      if (label === "year") {
        dispatch(
          getCreateClient({ userId: !isAdmin ? userType : null, jwt, agencyId })
        );
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: "",
          quarter: "",
          month: "",
        }));
      } else {
        setSelectedFilters((prev) => ({
          ...prev,
          [label]: "",
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
      const f = [];
      Object.entries(filterOptions).forEach(([key, value]) => {
        f.push({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          options: value,
          isLevel: ["level_1"].includes(key),
        });
      });
      setFilters((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(f);
        if (prevStr === newStr) {
          return prev; 
        }
        return f;
      });   
    }
  }, [filterOptions]);

  useEffect(() => {
    const fetchData = async () => {
      const clientID =
        localStorage.getItem(userType.toString()) || allClients[0]?.id;

      if (!clientID || !jwt) return;

      setLoading(true);
      try {
        const res = await fetchFilteredCampaigns(clientID, selectedFilters, jwt);
        setClientCampaignData((prev) => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(res);
          if (prevStr === newStr) {
            return prev;
          }
          return res;
        });
      } catch (error) {
        console.error("Error fetching filtered campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters, allClients, userType, jwt, selectedId]);

  const isYearSelected = !!selectedFilters["year"];

  return (
    <div>
      <Toaster />
      {!hideTitle && (
        <h6 className="font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
          Filters
        </h6>
      )}
      <div className="flex items-center gap-4 mt-[5px] flex-wrap">
        {filters
          ?.filter(
            (l) => !["Channel", "Phase", "Level_1_name"].includes(l?.label)
          )
          .map(({ label, options, isLevel }) => {
            const lowerLabel = label.toLowerCase();
            const selected = isLevel
              ? selectedFilters[lowerLabel]?.name
              : selectedFilters[lowerLabel];

            const getDisplayLabel = () => {
              if (selected) return selected;
              if (label === "Level_1") {
                return (
                  filters.find((f) => f.label === "Level_1_name")?.options[0]
                    ?.title || label.replace("_", " ")
                );
              }

              return label.replace("_", "");
            };

            const displayLabel = getDisplayLabel();
            const nested = convertToSingleNestedStructure(options);

            return (
              <div key={label}>
                {isLevel ? (
                  <TreeDropdownFilter
                    label={label}
                    data={nested}
                    placeholder={displayLabel}
                    selectedFilters={selectedFilters}
                    handleSelect={handleSelect}
                    isDisabled={
                      (lowerLabel === "quarter" || lowerLabel === "month") &&
                      !isYearSelected
                    }
                  />
                ) : (
                  <Dropdown
                    label={cleanName(displayLabel)}
                    options={options?.map((opt) =>
                      opt?.label === "string" ? opt?.label : opt
                    )}
                    selectedFilters={selectedFilters}
                    handleSelect={(key, value) =>
                      handleSelect(lowerLabel, value)
                    }
                    isDisabled={
                      (lowerLabel === "quarter" || lowerLabel === "month") &&
                      !isYearSelected
                    }
                  />
                )}
                {selected && (
                  <div
                    className="mt-2 flex items-center justify-between px-2 gap-1 min-w-[72px] h-[32px] bg-[#E8F6FF] border border-[#3175FF1A] rounded-[10px]"
                    onClick={() => handleSelect(lowerLabel, "")}
                  >
                    <p className="h-[20px] text-[15px] leading-[20px] font-medium text-[#3175FF]">
                      {cleanName(selected)}
                    </p>
                    <BiX color="#3175FF" size={20} className="cursor-pointer" />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default FiltersDropdowns;
