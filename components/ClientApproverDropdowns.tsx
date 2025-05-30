// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import down from "../public/down.svg";
// import Image from "next/image";
// import { X } from "lucide-react";
// import { useCampaigns } from "../app/utils/CampaignsContext";

// type DropdownOption = { label: string; value: string };

// const MultiSelectDropdown = ({
// 	label,
// 	options,
// 	value,
// 	onChange,
// }: {
// 	label: string;
// 	options: DropdownOption[];
// 	value: { value: string; id: string }[];
// 	onChange: (selected: { value: string; id: string }[]) => void;
// }) => {
// 	const { campaignFormData } = useCampaigns();
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const dropdownRef = useRef<HTMLDivElement>(null);

// 	const toggleDropdown = () => setIsOpen((prev) => !prev);

// 	const handleSelect = (option: DropdownOption) => {
// 		const alreadySelected = value?.some((o) => o.value === option.value);
// 		if (!alreadySelected) {
// 			onChange([
// 				...value,
// 				{ value: option?.value, id: campaignFormData?.campaign_id ?? "" },
// 			]);
// 		}
// 	};

// 	const handleRemove = (option: { value: string; id: string }) => {
// 		onChange(value?.filter((item) => item?.value !== option?.value));
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

// 	const selectedValues = value?.map((v) => v?.value);
// 	const filteredOptions = options?.filter(
// 		(opt) =>
// 			!selectedValues.includes(opt.value) &&
// 			opt?.label.toLowerCase().includes(searchTerm.toLowerCase())
// 	);

// 	return (
// 		<div className="relative w-full" ref={dropdownRef}>
// 			<div
// 				className="w-[327px] bg-white flex items-center px-2 py-1 min-h-[45px] border-2 border-[#EFEFEF] rounded-lg cursor-pointer flex-wrap gap-2"
// 				onClick={toggleDropdown}
// 			>
// 				{value?.length === 0 ? (
// 					<span className="text-gray-600">{label}</span>
// 				) : (
// 					value?.map((option) => (
// 						<span
// 							key={option?.value}
// 							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
// 						>
// 							{option?.value}
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
// 								key={option?.value}
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

// const ClientApproverDropdowns = ({
// 	options,
// 	option,
// 	value,
// 	onChange,
// }: {
// 	options: DropdownOption[];
// 	option: DropdownOption[];
// 	value: {
// 		internal_approver: { value: string; id: string }[];
// 		client_approver: { value: string; id: string }[];
// 	};
// 	onChange: (field: string, selected: { value: string; id: string }[]) => void;
// }) => {
// 	return (
// 		<div className="flex items-center gap-4 mt-5">
// 			<MultiSelectDropdown
// 				label="Internal Approver"
// 				options={options}
// 				value={value.internal_approver}
// 				onChange={(selected) => onChange("internal_approver", selected)}
// 			/>
// 			<MultiSelectDropdown
// 				label="Client Approver"
// 				options={option}
// 				value={value.client_approver}
// 				onChange={(selected) => onChange("client_approver", selected)}
// 			/>
// 		</div>
// 	);
// };

// export default ClientApproverDropdowns;


// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import down from "../public/down.svg";
// import Image from "next/image";
// import { X } from "lucide-react";
// import { useCampaigns } from "../app/utils/CampaignsContext";

// type DropdownOption = { label: string; value: string };

// const MultiSelectDropdown = ({
// 	label,
// 	options,
// 	value,
// 	onChange,
// }: {
// 	label: string;
// 	options: DropdownOption[];
// 	value: { value: string; id: string }[];
// 	onChange: (selected: { value: string; id: string }[]) => void;
// }) => {
// 	const { campaignFormData } = useCampaigns();
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState("");
// 	const dropdownRef = useRef<HTMLDivElement>(null);

// 	const toggleDropdown = () => setIsOpen((prev) => !prev);

// 	const handleSelect = (option: DropdownOption) => {
// 		const alreadySelected = value?.some((o) => o.value === option.value);
// 		if (!alreadySelected) {
// 			onChange([
// 				...value,
// 				{ value: option.value, id: campaignFormData?.campaign_id ?? "" },
// 			]);
// 		}
// 	};

// 	const handleRemove = (option: { value: string; id: string }) => {
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

// 	const selectedValues = value.map((v) => v.value);
// 	const filteredOptions = options.filter(
// 		(opt) =>
// 			!selectedValues.includes(opt.value) &&
// 			opt.label.toLowerCase().includes(searchTerm.toLowerCase())
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
// 					value.map((option) => (
// 						<span
// 							key={option.value}
// 							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
// 						>
// 							{option.value}
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

// 					{filteredOptions.length > 0 ? (
// 						filteredOptions.map((option) => (
// 							<div
// 								key={option.value}
// 								className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
// 								onClick={(e) => {
// 									e.stopPropagation();
// 									handleSelect(option);
// 								}}
// 							>
// 								{option.label}
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

// const ClientApproverDropdowns = ({
// 	options,
// 	option,
// 	value,
// 	onChange,
// }: {
// 	options: DropdownOption[];
// 	option: DropdownOption[];
// 	value: {
// 		internal_approver: { value: string; id: string }[];
// 		client_approver: { value: string; id: string }[];
// 	};
// 	onChange: (field: string, selected: { value: string; id: string }[]) => void;
// }) => {
// 	return (
// 		<div className="flex items-center gap-4 mt-5">
// 			<MultiSelectDropdown
// 				label="Internal Approver"
// 				options={options}
// 				value={value.internal_approver}
// 				onChange={(selected) => onChange("internal_approver", selected)}
// 			/>
// 			<MultiSelectDropdown
// 				label="Client Approver"
// 				options={option}
// 				value={value.client_approver}
// 				onChange={(selected) => onChange("client_approver", selected)}
// 			/>
// 		</div>
// 	);
// };

// export default ClientApproverDropdowns;

"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { X } from "lucide-react";
import { useCampaigns } from "../app/utils/CampaignsContext";

type DropdownOption = { label: string; value: string };
type SelectedItem = { value: string; id: string; clientId: string };



const MultiSelectDropdown = ({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: DropdownOption[];
	value: SelectedItem[];
	onChange: (selected: SelectedItem[]) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => setIsOpen((prev) => !prev);

	const handleSelect = (option: any) => {
		if (!value.includes(option?.value)) {
			onChange([...value, option?.value]);
		}
	};

	const handleRemove = (id: string) => {//@ts-ignore
		onChange(value.filter((v) => v !== id));
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
			setSearchTerm("");
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedValues = new Set(value);
	const filteredOptions = options.filter(
		(opt) =>//@ts-ignore
			!selectedValues.has(opt?.value) &&
			opt.label.toLowerCase().includes(searchTerm.toLowerCase())
	);
	//@ts-ignore
	const selectedOptions = options.filter((opt) => selectedValues.has(opt.value));

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<div
				className="w-[327px] bg-white flex items-center px-2 py-1 min-h-[45px] border-2 border-[#EFEFEF] rounded-lg cursor-pointer flex-wrap gap-2"
				onClick={toggleDropdown}
			>
				{value.length === 0 ? (
					<span className="text-gray-600">{label}</span>
				) : (
					selectedOptions.map((opt) => (
						<span
							key={opt.value}
							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
						>
							{opt.label}
							<button
								type="button"
								className="ml-1 hover:text-red-500"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove(opt.value);
								}}
							>
								<X size={14} />
							</button>
						</span>
					))
				)}
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="dropdown" />
				</span>
			</div>

			{isOpen && (
				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10 w-full max-h-60 overflow-y-auto">
					<div className="sticky top-0 bg-white p-2 border-b">
						<input
							type="text"
							placeholder="Search..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							onClick={(e) => e.stopPropagation()}
						/>
					</div>

					{filteredOptions.length > 0 ? (
						filteredOptions.map((option) => (
							<div
								key={option.value}
								className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
								onClick={(e) => {
									e.stopPropagation();
									handleSelect(option);
								}}
							>
								{option.label}
							</div>
						))
					) : (
						<div className="px-4 py-2 text-gray-500">No results found</div>
					)}
				</div>
			)}
		</div>
	);
};


const ClientApproverDropdowns = ({
	options,
	option,
	value,
	onChange,
}: {
	options: DropdownOption[];
	option: DropdownOption[];
	value: {
		internal_approver: string[];
		client_approver: string[];
	};
	onChange: (field: string, selected: string[]) => void;
}) => {
	return (
		<div className="flex items-center gap-4 mt-5">
			<MultiSelectDropdown
				label="Internal Approver"
				options={options}//@ts-ignore
				value={value.internal_approver}//@ts-ignore
				onChange={(selected) => onChange("internal_approver", selected)}
			/>
			<MultiSelectDropdown
				label="Client Approver"
				options={option}//@ts-ignore
				value={value.client_approver}//@ts-ignore
				onChange={(selected) => onChange("client_approver", selected)}
			/>
		</div>
	);
};


export default ClientApproverDropdowns;
