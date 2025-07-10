


// "use client";

// import React from "react";
// import { Select } from "antd";
// import { useCampaigns } from "../app/utils/CampaignsContext";

// type DropdownOption = { label: string; value: string };
// type SelectedItem = { value: string; id: string; clientId: string; label: string };

// const InternalApproverDropdowns = ({
// 	options,
// 	value,
// 	onChange,
// }: {
// 	options: DropdownOption[];
// 	value: {
// 		internal_approver: SelectedItem[];
// 	};
// 	onChange: (field: string, selected: SelectedItem[]) => void;
// }) => {
// 	const { campaignFormData } = useCampaigns();
// 	const campaignId = campaignFormData?.campaign_id;
// 	const clientId = campaignFormData?.client_selection?.id;

// 	const selectedValues = value.internal_approver.map((v) => v.value);

// 	const handleChange = (vals: string[]) => {
// 		const mapped = vals.map((val) => {
// 			const found = options.find((opt) => opt.value === val);
// 			return {
// 				value: val,
// 				label: found?.label || val,
// 				id: campaignId,
// 				clientId,
// 			};
// 		});
// 		onChange("internal_approver", mapped);
// 	};

// 	return (
// 		<div className="w-[327px] mt-2">
// 			<Select
// 				mode="multiple"
// 				style={{ width: "100%" }}
// 				placeholder="Select internal approvers"
// 				value={selectedValues}
// 				options={options}
// 				onChange={handleChange}
// 				allowClear
// 				showSearch
// 				optionFilterProp="label"
// 				size="large"
// 			/>
// 		</div>
// 	);
// };

// export default InternalApproverDropdowns;

"use client";

import React from "react";
import { Select } from "antd";
import { useCampaigns } from "../app/utils/CampaignsContext";

const { Option } = Select;

type DropdownOption = { label: string; value: number | string };

type InternalApproverDropdownsProps = {
	options: DropdownOption[];
	formId: string;
	label: string;
};

const InternalApproverDropdowns: React.FC<InternalApproverDropdownsProps> = ({
	options,
	formId,
	label,
}) => {
	const { campaignFormData, setCampaignFormData } = useCampaigns();
	const campaignId = campaignFormData?.campaign_id;
	const clientId = campaignFormData?.client_selection?.id;

	// Previously selected full objects
	const selectedItems: any[] = campaignFormData?.[formId] || [];

	// Extract values (ids) to show in Select
	const selectedValues = selectedItems.map((item) => item.id);

	// Handle selection change
	const handleChange = (newValues: (number | string)[]) => {
		const mappedSelectedItems = newValues.map((val) => {
			// Try to reuse full object if previously selected
			const existingItem = selectedItems.find((item) => item.id === val);
			if (existingItem) return existingItem;

			// Fallback: create new minimal object from options
			const option = options.find((opt) => opt.value === val);
			return {
				id: val,
				label: option?.label || String(val),
				value: val,
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

export default InternalApproverDropdowns;
