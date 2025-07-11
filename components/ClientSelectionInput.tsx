"use client";
import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useActive } from "app/utils/ActiveContext";

const TextInput = ({
  label,
  formId,
}: {
  label: string;
  formId: string;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { setChange } = useActive()
  return (
    <div className="relative max-w-xs">
      {/* Input Field */}
      <input
        type="text"
        placeholder={label}
        className="dropdown_button_width px-4 py-2 h-[41px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] cursor-text"
        value={campaignFormData[formId] || ""}
        onChange={(e) => {
          setCampaignFormData((prev) => ({ ...prev, [formId]: e.target.value }));
          setChange(true)
        }}
      />
    </div>
  );
};

const ClientSelectionInput = ({
  label,
  formId,
}: {
  label: string;
  formId: string;
}) => {
  return (
    <div className="flex items-center gap-4 mt-2">
      <TextInput label={label} formId={formId} />
    </div>
  );
};

export default ClientSelectionInput;
