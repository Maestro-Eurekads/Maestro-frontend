"use client";

import React from "react";
import { Select } from "antd";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useActive } from "app/utils/ActiveContext";

const { Option } = Select;

type DropdownOption = { label: string; value: number | string };

type InternalApproverDropdownsProps = {
  options: DropdownOption[];
  formId: string;
  label: string;
  loading?: boolean;
};

const InternalApproverDropdowns: React.FC<InternalApproverDropdownsProps> = ({
  options,
  formId,
  label,
  loading,
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { setChange } = useActive();
  const campaignId = campaignFormData?.campaign_id;
  const clientId = campaignFormData?.client_selection?.id;

  // Previously selected full objects
  const selectedItems: any[] = campaignFormData?.[formId] || [];

  // Extract values (ids) to show in Select
  const selectedValues = selectedItems.map((item) => item.id);

  // Handle selection change
  const handleChange = (
    newValues: { value: string | number; label: string }[]
  ) => {
    setChange(true);
    const mappedSelectedItems = newValues.map((valObj) => {
      // Try to reuse full object if previously selected
      const existingItem = selectedItems.find(
        (item) => item.id === valObj.value
      );
      if (existingItem) return existingItem;
      // Fallback: create new minimal object from options
      const option = options.find((opt) => opt.value === valObj.value);
      return {
        id: valObj.value,
        label: option?.label || valObj.label || String(valObj.value),
        value: valObj.value,
        campaignId,
        clientId,
      };
    });
    setCampaignFormData((prev) => ({
      ...prev,
      [formId]: mappedSelectedItems,
    }));
  };

  return (
    <div className="w-[327px] mt-2">
      <Select
        mode="multiple"
        allowClear
        showSearch
        style={{ width: "100%" }}
        placeholder={`Select ${label}`}
        value={selectedItems.map((item) => ({
          value: item.id,
          label: item.label,
        }))}
        onChange={handleChange}
        optionFilterProp="label"
        size="large"
        loading={loading}
        disabled={loading}
        labelInValue>
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value} label={opt.label}>
            {opt.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default InternalApproverDropdowns;
