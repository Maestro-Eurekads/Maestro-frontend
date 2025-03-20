"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { BiLoader } from "react-icons/bi";

const Dropdown = ({
  label,
  options,
  isEditing,
  formId,
}: {
  label: string;
  options: { id?: string; value: string; label: string }[];
  isEditing: boolean;
  formId: string;
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { campaignFormData, setCampaignFormData, loadingClients } =
    useCampaigns();

  const toggleDropdown = () => {
    if (isEditing) setIsOpen(!isOpen);
  };

  const handleSelect = (id, value: string) => {
    setCampaignFormData((prev) => ({
      ...prev,
      [formId]: {
        id,
        value,
      },
    }));
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
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
        className={`dropdown_button_width flex items-center px-4 py-2 h-[45px] bg-white max-w-xs border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 
          ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}
        onClick={toggleDropdown}
      >
        <span className="text-[#061237]">
          {campaignFormData[formId]?.value || label}
        </span>
        <span className="ml-auto text-[#061237]">
          <Image src={down} alt="dropdown-icon" />
        </span>
      </div>

      {/* Dropdown List */}
      {loadingClients && label === "Select Client" && (
        <div className="flex items-center gap-2">
          <BiLoader className="animate-spin" />
          <p>Loading clients...</p>
        </div>
      )}
      {isEditing &&
        isOpen &&
        ((label === "Business level 1" ||
          label === "Business level 2" ||
          label === "Business level 3")
          ? campaignFormData["client_selection"]?.value
          : true) && (
          <div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-1 z-10 max-h-[300px] overflow-y-auto">
            {options?.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  handleSelect(option?.id || option?.value, option?.value)
                }
              >
                {option?.label}
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

const ClientSelection = ({
  options,
  label,
  isEditing,
  formId,
}: {
  options: { value: string; label: string }[];
  label: string;
  isEditing: boolean;
  formId?: string;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <Dropdown
        label={label}
        options={options}
        isEditing={isEditing}
        formId={formId}
      />
    </div>
  );
};

export default ClientSelection;
