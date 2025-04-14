"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../../../public/down.svg";
import Image from "next/image";
import { BiX } from "react-icons/bi";
import { useCampaigns } from "app/utils/CampaignsContext";

const Dropdown = ({ label, options, selectedFilters, setSelectedFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelectedFilters((prev) => ({ ...prev, [label]: option }));
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedFilters((prev) => ({ ...prev, [label]: "" }));
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
        className="flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer w-[200px]"
        onClick={toggleDropdown}
      >
        <span className="text-gray-600 capitalize">
          {selectedFilters[label]?.replace("_", " ") ||
            label?.replace("_", " ")}
        </span>
        <span className="ml-auto text-gray-500">
          <Image src={down} alt="dropdown" />
        </span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute w-[100%] bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
          {options?.map((option) => (
            <div
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 capitalize"
              onClick={() => handleSelect(option)}
            >
              {option?.replace("_", " ")}
            </div>
          ))}
        </div>
      )}

      {/* Selected Value */}
      <div
        className={`mt-2 flex items-center justify-between px-3 py-2 gap-1 min-w-[72px] h-[32px] bg-[#E8F6FF] border border-[#3175FF1A] rounded-[10px] ${
          selectedFilters[label] ? "block" : "hidden"
        }`}
      >
        <p className="h-[20px] text-[15px] leading-[20px] font-medium text-[#3175FF] capitalize">
          {selectedFilters[label]?.replace("_", " ")}
        </p>
        <BiX
          color="#3175FF"
          size={20}
          className="cursor-pointer"
          onClick={handleClear}
        />
      </div>
      {!selectedFilters[label] && <div className="h-[32px]"></div>}
    </div>
  );
};

const HighlightViewDropdowns = () => {
  const { selectedFilters, setSelectedFilters, filterOptions } = useCampaigns();

  return (
    <div>
      <h6 className="font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
        Highlight view
      </h6>
      <div className="flex items-center gap-4 mt-[5px]">
        <Dropdown
          label="channel"
          options={filterOptions["channel"]}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
        <Dropdown
          label="phase"
          options={filterOptions["phase"]}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      </div>
    </div>
  );
};

export default HighlightViewDropdowns;
