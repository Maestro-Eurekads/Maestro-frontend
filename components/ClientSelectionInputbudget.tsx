"use client";
import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

const TextInput = ({
  label,
  formId,
}: {
  label: string;
  formId: string;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setCampaignFormData((prev) => ({ ...prev, [formId]: value }));
  };

  return (
    <div className="relative max-w-xs">
      {/* Input Field */}
      <input
        type="text"
        placeholder={label}
        className="dropdown_button_width px-4 py-2 h-[45px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] cursor-text"
        value={campaignFormData[formId] || ""}
        onChange={handleChange}
      />
    </div>
  );
};

const ClientSelectionInputbudget = ({
  label,
  formId,
}: {
  label: string;
  formId: string;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <TextInput label={label} formId={formId} />
    </div>
  );
};

export default ClientSelectionInputbudget;
