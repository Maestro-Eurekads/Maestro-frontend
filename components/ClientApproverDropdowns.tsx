


"use client";

import React from "react";
import { Select } from "antd";
import { useCampaigns } from "../app/utils/CampaignsContext";

const { Option } = Select;

type DropdownOption = { label: string; value: string };
type SelectedItem = { value: string; id: string; clientId: string; label: string };

type MultiSelectDropdownProps = {
	label: string;
	options: DropdownOption[];
	value: SelectedItem[];
	onChange: (selected: SelectedItem[]) => void;
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, value, onChange }) => {
	const { campaignFormData } = useCampaigns();
	const campaignId = campaignFormData?.campaign_id;
	const clientId = campaignFormData?.client_selection?.id;

	const selectedValues = value.map((item) => item.value);

	const handleChange = (newValues: string[]) => {
		const mapped = newValues.map((val) => {
			const found = options.find((opt) => opt.value === val);
			return {
				value: val,
				label: found?.label || val,
				id: campaignId,
				clientId,
			};
		});
		onChange(mapped);
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
	value: {
		client_approver: SelectedItem[];
	};
	onChange: (field: string, selected: SelectedItem[]) => void;
};

const ClientApproverDropdowns: React.FC<ClientApproverDropdownsProps> = ({
	options,
	value,
	onChange,
}) => {
	return (
		<div className="w-[327px] mt-2">
			<MultiSelectDropdown
				label="Client Approver"
				options={options}
				value={value.client_approver}
				onChange={(selected) => onChange("client_approver", selected)}
			/>
		</div>
	);
};

export default ClientApproverDropdowns;
