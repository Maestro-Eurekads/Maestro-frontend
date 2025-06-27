
// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import down from "../public/down.svg";
// import Image from "next/image";
// import { X } from "lucide-react";
// import { useCampaigns } from "../app/utils/CampaignsContext";

// type DropdownOption = { label: string; value: string };
// type SelectedItem = { value: string; id: string; clientId: string; label: string };

// const MultiSelectDropdown = ({
// 	label,
// 	options,
// 	value,
// 	onChange,
// }: {
// 	label: string;
// 	options: DropdownOption[];
// 	value: SelectedItem[];
// 	onChange: (selected: SelectedItem[]) => void;
// }) => {
// 	const { campaignFormData } = useCampaigns();
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const dropdownRef = useRef<HTMLDivElement>(null);
// 	const campaignId = campaignFormData?.campaign_id;

// 	const toggleDropdown = () => setIsOpen((prev) => !prev);

// 	const handleSelect = (option: DropdownOption) => {
// 		const alreadySelected = value?.some((o) => o.value === String(option.value));
// 		const campaignId = campaignFormData?.campaign_id;
// 		const clientId = campaignFormData?.client_selection?.id;

// 		if (!alreadySelected && clientId) {
// 			const newItem: SelectedItem = {
// 				value: String(option.value),
// 				id: campaignId ?? clientId,
// 				clientId: clientId,
// 				label: option.label,
// 			};
// 			onChange([...value, newItem]);
// 		}
// 	};




// 	// Update selected items with `commentId` once it's available
// 	useEffect(() => {
// 		if (campaignId && campaignFormData?.client_selection?.id) {
// 			const updated = value.map((item) => ({
// 				...item,
// 				id: campaignId, // Replace id with campaignId
// 				clientId: campaignFormData?.client_selection.id,
// 			}));
// 			onChange(updated);
// 		}
// 	}, [campaignId]);




// 	const handleRemove = (option: SelectedItem) => {
// 		onChange(value.filter((item) => item.value !== option.value));
// 	};

// 	const handleClickOutside = (event: MouseEvent) => {
// 		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// 			setIsOpen(false);
// 			setSearchTerm("");
// 		}
// 	};

// 	useEffect(() => {
// 		document.addEventListener("mousedown", handleClickOutside);
// 		return () => document.removeEventListener("mousedown", handleClickOutside);
// 	}, []);

// 	const selectedValues = value?.map((v) => v.value);
// 	const filteredOptions = options?.filter(
// 		(opt) =>
// 			!selectedValues.includes(opt.value) &&
// 			opt?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
// 	);

// 	return (
// 		<div className="relative w-full" ref={dropdownRef}>
// 			<div
// 				className="w-[327px] bg-white flex items-center px-2 py-1 min-h-[45px] border-2 border-[#EFEFEF] rounded-lg cursor-pointer flex-wrap gap-2"
// 				onClick={toggleDropdown}
// 			>
// 				{value.length === 0 ? (
// 					<span className="text-gray-600">{label}</span>
// 				) : (
// 					value?.map((option) => (
// 						<span
// 							key={option?.value}
// 							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
// 						>
// 							{option?.label}
// 							<button
// 								type="button"
// 								className="ml-1 hover:text-red-500"
// 								onClick={(e) => {
// 									e.stopPropagation();
// 									handleRemove(option);
// 								}}
// 							>
// 								<X size={14} />
// 							</button>
// 						</span>
// 					))
// 				)}

// 				<span className="ml-auto text-gray-500">
// 					<Image src={down} alt="dropdown" />
// 				</span>
// 			</div>

// 			{isOpen && (
// 				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10 w-full max-h-60 overflow-y-auto">
// 					<div className="sticky top-0 bg-white p-2 border-b">
// 						<input
// 							type="text"
// 							placeholder="Search..."
// 							value={searchTerm}
// 							onChange={(e) => setSearchTerm(e.target.value)}
// 							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// 							onClick={(e) => e.stopPropagation()}
// 						/>
// 					</div>

// 					{filteredOptions?.length > 0 ? (
// 						filteredOptions?.map((option) => (
// 							<div
// 								key={option.label}
// 								className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
// 								onClick={(e) => {
// 									e.stopPropagation();
// 									handleSelect(option);
// 								}}
// 							>
// 								{option?.label}
// 							</div>
// 						))
// 					) : (
// 						<div className="px-4 py-2 text-gray-500">No results found</div>
// 					)}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

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
// 	return (
// 		<div className="flex items-center gap-4 mt-2">
// 			<MultiSelectDropdown
// 				label="Internal Approver"
// 				options={options}
// 				value={value.internal_approver}
// 				onChange={(selected) => onChange("internal_approver", selected)}
// 			/>
// 		</div>
// 	);
// };

// export default InternalApproverDropdowns;


"use client";

import React from "react";
import { Select } from "antd";
import { useCampaigns } from "../app/utils/CampaignsContext";

type DropdownOption = { label: string; value: string };
type SelectedItem = { value: string; id: string; clientId: string; label: string };

const InternalApproverDropdowns = ({
	options,
	value,
	onChange,
}: {
	options: DropdownOption[];
	value: {
		internal_approver: SelectedItem[];
	};
	onChange: (field: string, selected: SelectedItem[]) => void;
}) => {
	const { campaignFormData } = useCampaigns();
	const campaignId = campaignFormData?.campaign_id;
	const clientId = campaignFormData?.client_selection?.id;

	const selectedValues = value.internal_approver.map((v) => v.value);

	const handleChange = (vals: string[]) => {
		const mapped = vals.map((val) => {
			const found = options.find((opt) => opt.value === val);
			return {
				value: val,
				label: found?.label || val,
				id: campaignId,
				clientId,
			};
		});
		onChange("internal_approver", mapped);
	};

	return (
		<div className="w-[327px] mt-2">
			<Select
				mode="multiple"
				style={{ width: "100%" }}
				placeholder="Select internal approvers"
				value={selectedValues}
				options={options}
				onChange={handleChange}
				allowClear
				showSearch
				optionFilterProp="label"
				size="large"
			/>
		</div>
	);
};

export default InternalApproverDropdowns;

