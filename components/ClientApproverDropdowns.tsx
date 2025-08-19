"use client";

import React from "react";
import { Select } from "antd";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { useActive } from "app/utils/ActiveContext";

const { Option } = Select;

type DropdownOption = { label: string; value: string };

type MultiSelectDropdownProps = {
  label: string;
  options: DropdownOption[];
  formId: string;
  loading?: boolean;
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  formId,
  loading,
}) => {
  const { campaignFormData, setCampaignFormData } = useCampaigns();
  const { setChange } = useActive();
  // Your selectedItems (full objects) stored in form data at formId key
  const selectedItems: any[] = campaignFormData?.[formId] || [];

  // Extract selected IDs from selectedItems for Select value
  const selectedValues = selectedItems.map((item) => item.id);

  // When user selects options, the newValues are the selected option values (ids)
  const handleChange = (
    newValues: { value: string | number; label: string }[]
  ) => {
    setChange(true);
    const mappedSelectedItems = newValues.map((valObj) => {
      // Try to find in selectedItems first (full object)
      const existingItem = selectedItems.find(
        (item) => item.id === valObj.value
      );
      if (existingItem) return existingItem;
      // If not found, create minimal object based on options (label) and ids
      const option = options.find((opt) => opt.value === valObj.value);
      return {
        id: valObj.value,
        label: option?.label || valObj.label || String(valObj.value),
        value: valObj.value,
      };
    });
    setCampaignFormData((prev) => ({
      ...prev,
      [formId]: mappedSelectedItems,
    }));
  };

  return (
    <div className="w-full">
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder={`Select ${label}`}
        style={{ width: "100%" }}
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

type ClientApproverDropdownsProps = {
  options: DropdownOption[];
  label: string;
  formId: string;
  loading?: boolean;
};

const ClientApproverDropdowns: React.FC<ClientApproverDropdownsProps> = ({
  options,
  formId,
  label,
  loading,
}) => {
  return (
    <div className="w-[327px] mt-2">
      <MultiSelectDropdown
        options={options}
        label={label}
        formId={formId}
        loading={loading}
      />
    </div>
  );
};

export default ClientApproverDropdowns;
