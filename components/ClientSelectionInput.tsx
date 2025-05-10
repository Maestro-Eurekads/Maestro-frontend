"use client";
import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

const TextInput = ({
  label,
  formId,
  setHasChanges
}: {
  label: string;
  formId: string;
  setHasChanges: (hasChanged: boolean) => void;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  return (
    <div className="relative max-w-xs">
      {/* Input Field */}
      <input
        type="text"
        placeholder={label}
        className="dropdown_button_width px-4 py-2 h-[45px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] cursor-text"
        value={campaignFormData[formId] || ""}
        onChange={(e) => {
          setCampaignFormData((prev) => ({ ...prev, [formId]: e.target.value }));
          setHasChanges(true); // Trigger change tracking
        }}
      />
    </div>
  );
};

const ClientSelectionInput = ({
  label,
  formId,
  setHasChanges
}: {
  label: string;
  formId: string;
  setHasChanges: (hasChanged: boolean) => void;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <TextInput label={label} formId={formId} setHasChanges={setHasChanges} />
    </div>
  );
};

export default ClientSelectionInput;
