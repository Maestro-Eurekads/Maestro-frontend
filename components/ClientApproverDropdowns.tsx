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
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, formId }) => {
	const { campaignFormData, setCampaignFormData } = useCampaigns();
	const { setChange } = useActive()
	// Your selectedItems (full objects) stored in form data at formId key
	const selectedItems: any[] = campaignFormData?.[formId] || [];

	// Extract selected IDs from selectedItems for Select value
	const selectedValues = selectedItems.map(item => item.id);

	// When user selects options, the newValues are the selected option values (ids)
	const handleChange = (newValues: (number | string)[]) => {
		setChange(true)
		// Map newValues (ids) back to full selected objects from options or previous selectedItems
		// We try to find matching full user object from selectedItems by id or create new minimal object
		const mappedSelectedItems = newValues.map(val => {
			// Try to find in selectedItems first (full object)
			const existingItem = selectedItems.find(item => item.id === val);
			if (existingItem) return existingItem;

			// If not found, create minimal object based on options (label) and ids
			const option = options.find(opt => opt.value === val);
			return {
				id: val,
				label: option?.label || String(val),
				value: val,
				// Add other props as needed, or keep minimal
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
				value={selectedValues}
				onChange={handleChange}
				optionFilterProp="label"
				size="large"
			>
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
};

const ClientApproverDropdowns: React.FC<ClientApproverDropdownsProps> = ({
	options,
	formId,
	label,
}) => {
	return (
		<div className="w-[327px] mt-2">
			<MultiSelectDropdown
				options={options}
				label={label}
				formId={formId}
			/>
		</div>
	);
};

export default ClientApproverDropdowns;
