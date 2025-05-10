"use client";
import React, { useRef, useEffect } from "react";
import { useCampaigns } from "../app/utils/CampaignsContext";

const TextInput = ({
  label,
  formId,
  currencySign,
  isSuffix = false,
  setHasChanges
}: {
  label: string;
  formId: string;
  currencySign: string;
  isSuffix?: boolean;
  setHasChanges: (hasChanged: boolean) => void;
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const inputRef = useRef<HTMLInputElement>(null); // Ref to access the input DOM element

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true);
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setCampaignFormData((prev) => ({ ...prev, [formId]: value }));

    // Move cursor to the position before the suffix
    if (isSuffix && inputRef.current) {
      const numericLength = value.length;
      setTimeout(() => {
        inputRef.current?.setSelectionRange(numericLength, numericLength);
      }, 0); // Use setTimeout to ensure cursor moves after value update
    }
  };

  // Determine the display value based on whether the sign is a prefix or suffix
  const displayValue = isSuffix
    ? `${campaignFormData[formId] || ""}${currencySign ? " " + currencySign : ""}`
    : `${currencySign ? currencySign + " " : ""}${campaignFormData[formId] || ""}`;

  // Ensure cursor is positioned correctly when component mounts or updates
  useEffect(() => {
    if (isSuffix && inputRef.current && campaignFormData[formId]) {
      const numericLength = campaignFormData[formId].length;
      inputRef.current.setSelectionRange(numericLength, numericLength);
    }
  }, [campaignFormData[formId], isSuffix]);

  return (
    <div className="relative max-w-xs">
      {/* Input Field */}
      <input
        ref={inputRef} // Attach ref to input
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
  isSuffix = false,
  setHasChanges
}: {
  setHasChanges: (hasChanged: boolean) => void;
  label: string;
  formId: string;
  currencySign: string;
  isSuffix?: boolean;
}) => {
  return (
    <div className="flex items-center gap-4 mt-[20px]">
      <TextInput
        setHasChanges={setHasChanges}
        label={label}
        formId={formId}
        currencySign={currencySign}
        isSuffix={isSuffix}
      />
    </div>
  );
};

export default ClientSelectionInputbudget;