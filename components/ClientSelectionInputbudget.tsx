"use client";
import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

const TextInput = ({
  label,
  formId,
  currencySign,
  isSuffix = false, // New prop to determine if the sign is a suffix
}: {
  label: string;
  formId: string;
  currencySign: string;
  isSuffix?: boolean;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setCampaignFormData((prev) => ({ ...prev, [formId]: value }));
  };

  // Determine the display value based on whether the sign is a prefix or suffix
  const displayValue = isSuffix
    ? `${campaignFormData[formId] || ""}${currencySign ? " " + currencySign : ""}`
    : `${currencySign ? currencySign + " " : ""}${campaignFormData[formId] || ""}`;

  return (
    <div className="relative max-w-xs">
      {/* Input Field */}
      <input
        type="text"
        placeholder={label}
        className="dropdown_button_width px-4 py-2 h-[45px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] cursor-text"
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

const ClientSelectionInputbudget = ({
  label,
  formId,
  currencySign,
  isSuffix = false, // New prop passed from parent
}: {
  label: string;
  formId: string;
  currencySign: string;
  isSuffix?: boolean;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <TextInput label={label} formId={formId} currencySign={currencySign} isSuffix={isSuffix} />
    </div>
  );
};

export default ClientSelectionInputbudget;