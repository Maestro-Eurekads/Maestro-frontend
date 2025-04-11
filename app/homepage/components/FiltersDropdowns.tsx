"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../../../public/down.svg";
import Image from "next/image";
import { BiX } from "react-icons/bi";
import { useCampaigns } from "app/utils/CampaignsContext";

type Props = {
  hideTitle?: boolean;
};

const Dropdown = ({ label, options, selectedFilters, handleSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionSelect = (option) => {
    handleSelect(label, option);
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <div
        className="flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-gray-600 capitalize">{selectedFilters[label] || label?.replace("_", " ")}</span>
        <span className="ml-auto text-gray-500">
          <Image src={down} alt="dropdown" />
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
  );
};

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
];

const FiltersDropdowns = ({ hideTitle }: Props) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const { filterOptions } = useCampaigns();
  const [filters, setFilters] = useState(defaulFilters);

  const handleSelect = (label, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  useEffect(() => {
    if (filterOptions) {
      let f = [];
      Object.entries(filterOptions).forEach(([key, value]) => {
        f.push({
          label: key,
          options: value,
        });
      });
      setFilters((f))
    }
  }, [filterOptions]);

  return (
    <div>
      {!hideTitle && (
        <h6 className="font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
          Filters
        </h6>
      )}
      <div className="flex items-center gap-4 mt-[5px] flex-wrap">
        {filters.map(({ label, options }) => (
          <div key={label}>
            <Dropdown
              label={label}
              options={options}
              selectedFilters={selectedFilters}
              handleSelect={handleSelect}
            />
            {selectedFilters[label] && (
              <div className="mt-2 flex items-center justify-between px-3 py-2 gap-1 min-w-[72px] h-[32px] bg-[#E8F6FF] border border-[#3175FF1A] rounded-[10px]">
                <p className="h-[20px] text-[15px] leading-[20px] font-medium text-[#3175FF]">
                  {selectedFilters[label]}
                </p>
                <BiX
                  color="#3175FF"
                  size={20}
                  className="cursor-pointer"
                  onClick={() => handleSelect(label, "")}
                />
              </div>
            )}
            {!selectedFilters[label] && <div className="h-[32px]"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FiltersDropdowns;
