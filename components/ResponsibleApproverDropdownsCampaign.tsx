import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { X } from "lucide-react"; // or use any x icon you prefer


type Option = {
	id: string;
	username: string;
};

type MultiSelectDropdownProps = {
	label: string;
	options: Option[];
	right: boolean;
	islabelone: string;
	islabeltwo: string;
	onSelect: (ids: string[]) => void;
};

const MultiSelectDropdown = ({
	label,
	options,
	right,
	islabelone,
	islabeltwo,
	onSelect,
}: MultiSelectDropdownProps) => {
	const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => setIsOpen((prev) => !prev);

	const handleSelect = (option: Option) => {
		if (!selectedOptions.some((o) => o?.id === option?.id)) {
			const updated = [...selectedOptions, option];
			setSelectedOptions(updated);
			onSelect(updated.map((o) => o?.id)); // <-- returns [7, 20, 40...]
		}
	};

	const handleRemove = (option: Option) => {
		const updated = selectedOptions?.filter((o) => o?.id !== option?.id);
		setSelectedOptions(updated);
		onSelect(updated.map((o) => o?.id));
	};


	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const availableOptions = options.filter(
		(opt) => !selectedOptions.some((sel) => sel?.id === opt?.id)
	);

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<label className="font-medium text-[15px] leading-5 text-gray-600">
				{islabelone || islabeltwo}
			</label>

			<div
				className="flex items-center px-2 py-1 w-full min-h-[40px] border border-[#EFEFEF] rounded-[10px] mt-[8px] cursor-pointer flex-wrap gap-2"
				onClick={toggleDropdown}
			>
				{right && <div className="view_content_table mr-2">JB</div>}
				{selectedOptions?.length === 0 ? (
					<span className="text-gray-600">{label}</span>
				) : (
					selectedOptions?.map((option) => (
						<span
							key={option?.id}
							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
						>
							{option?.username}
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
					<Image src={down} alt="down" />
				</span>
			</div>

			{isOpen && availableOptions?.length > 0 && (
				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10 w-full max-h-48 overflow-y-auto">
					{availableOptions?.map((option) => (
						<div
							key={option?.id}
							className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
							onClick={() => handleSelect(option)}
						>
							{option?.username}
						</div>
					))}
				</div>
			)}
		</div>
	);
};


type ResponsibleApproverDropdownsProps = {
	right: boolean;
	options: Option[];
	option: Option[];
	setInputs: React.Dispatch<
		React.SetStateAction<{
			responsiblePerson?: string[];
			approver?: string[];
		}>
	>;
};

const ResponsibleApproverDropdownsCampaign = ({
	right,
	setInputs,
	options,
	option,
}: ResponsibleApproverDropdownsProps) => {
	const handleSelect = (field: "responsiblePerson" | "approver", ids: string[]) => {
		setInputs((prevState) => ({
			...prevState,
			[field]: ids,
		}));
	};

	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			<MultiSelectDropdown
				label="Select Responsible"
				options={options}
				right={right}
				islabelone="Responsible"
				islabeltwo=""
				onSelect={(ids) => handleSelect("responsiblePerson", ids)}
			/>
			<MultiSelectDropdown
				label="Select Approver"
				options={option}
				right={right}
				islabelone=""
				islabeltwo="Approver"
				onSelect={(ids) => handleSelect("approver", ids)}
			/>
		</div>
	);
};

export default ResponsibleApproverDropdownsCampaign;
