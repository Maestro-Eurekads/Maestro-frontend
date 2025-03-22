"use client";
import React from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

const TextInput = ({
  label,
  isEditing,
  formId,
}: {
  label: string;
  isEditing: boolean;
  formId: string;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  return (
    <div className="relative max-w-xs">
      <input
        type="text"
        placeholder={label}
        className={`dropdown_button_width px-4 py-2 h-[45px] bg-white border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-100 placeholder-[#061237] ${isEditing ? "cursor-text" : "cursor-not-allowed"
          }`}
        disabled={!isEditing}
        value={campaignFormData[formId]}
        onChange={(e) =>
          setCampaignFormData((prev) => ({ ...prev, [formId]: e.target.value }))
        }
      />
    </div>
  );
};

const ClientSelectionInput = ({
  label,
  isEditing,
  formId,
}: {
  label: string;
  isEditing: boolean;
  formId: string;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <TextInput label={label} isEditing={isEditing} formId={formId} />
    </div>
  );
};

export default ClientSelectionInput;
