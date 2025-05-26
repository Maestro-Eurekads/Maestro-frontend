

"use client";

import React, { useState, useRef, useEffect, useRef as useRefHook } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { X } from "lucide-react";
import { useCampaigns } from "../app/utils/CampaignsContext";

type DropdownOption = { label: string; value: string };





const MultiSelectDropdown = ({
	label,
	options,
	islabelone,
	islabeltwo,
	formId,
	value,
	onChange,
}: {
	label: string;
	options: DropdownOption[];
	islabelone: string;
	islabeltwo: string;
	formId: string;
	value: DropdownOption[];
	onChange: (options: DropdownOption[]) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Filter out invalid options
	const validOptions = options?.filter(
		(opt) => opt?.value != null && opt?.label != null
	);

	// Filter out invalid values
	const validValue = value?.filter(
		(opt) => opt?.value != null && opt?.label != null
	);

	const toggleDropdown = () => setIsOpen((prev) => !prev);

	const handleSelect = (option: DropdownOption) => {
		if (!validValue?.some((o) => o?.value === option?.value)) {
			const updated = [...validValue, { label: option?.label, value: option?.value }];
			onChange(updated);
		}
	};

	const handleRemove = (option: DropdownOption) => {
		const updated = validValue.filter((item) => item?.value !== option?.value);
		onChange(updated);
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

	const availableOptions = validOptions.filter(
		(opt) =>
			!validValue?.some((sel) => sel?.value === opt?.value) &&
			opt?.label?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="relative w-full" ref={dropdownRef}>
			{/* <label className="font-medium text-[15px] leading-5 text-gray-600">
				{islabelone || islabeltwo || label}
			</label> */}

			<div
				className="w-[327px] bg-[#fff] flex items-center px-2 py-1 min-h-[45px] border-2 border-[#EFEFEF] rounded-lg cursor-pointer flex-wrap gap-2"
				onClick={toggleDropdown}
			>
				{validValue?.length === 0 ? (
					<span className="text-gray-600">{label}</span>
				) : (
					validValue?.map((option) => (
						<span
							key={option?.value}
							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
						>
							{option?.label}
							<button
								type="button"
								className="ml-1 hover:text-red-500"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove(option);
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

					{availableOptions?.length > 0 ? (
						availableOptions?.map((option) => (
							<div
								key={option?.value}
								className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
								onClick={() => handleSelect(option)}
							>
								{option?.label}
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
// ClientApproverDropdowns Component (unchanged)
const ClientApproverDropdowns = ({
	options,
	option,
	value,
	onChange,
}: {
	options: DropdownOption[];
	option: DropdownOption[];
	value: {
		approver: DropdownOption[];
		client_approver: DropdownOption[];
	};
	onChange: (field: string, selected: DropdownOption[]) => void;
}) => {
	return (
		<div className="flex items-center   gap-4   mt-5">

			<MultiSelectDropdown
				label="Internal Approver"
				options={options}
				islabelone=""
				islabeltwo=""
				formId="approver"
				value={value.approver}
				onChange={(selected) => onChange("approver", selected)}
			/>
			<MultiSelectDropdown
				label="Client Approver"
				options={option}
				islabelone=""
				islabeltwo=""
				formId="client_approver"
				value={value.client_approver}
				onChange={(selected) => onChange("client_approver", selected)}
			/>
		</div>
	);
};

export default ClientApproverDropdowns;