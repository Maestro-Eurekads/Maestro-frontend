// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import down from "../public/down.svg";
// import Image from "next/image";

// const CustomDropdown = ({
// 	label,
// 	options,
// 	right,
// 	islabelone,
// 	islabeltwo,
// 	onSelect,
// }: {
// 	label: string;
// 	options: string[];
// 	right: boolean;
// 	islabelone: string;
// 	islabeltwo: string;
// 	onSelect: (value: string) => void;
// }) => {
// 	const [selectedOption, setSelectedOption] = useState<string | null>(null);
// 	const [isOpen, setIsOpen] = useState(false);
// 	const dropdownRef = useRef<HTMLDivElement>(null);

// 	const toggleDropdown = () => {
// 		setIsOpen(!isOpen);
// 	};

// 	const handleSelect = (option: string) => {
// 		setSelectedOption(option);
// 		onSelect(option);
// 		setIsOpen(false);
// 	};

// 	const handleClickOutside = (event: MouseEvent) => {
// 		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
// 			setIsOpen(false);
// 		}
// 	};

// 	useEffect(() => {
// 		document.addEventListener("mousedown", handleClickOutside);
// 		return () => document.removeEventListener("mousedown", handleClickOutside);
// 	}, []);

// 	return (
// 		<div className="relative w-full" ref={dropdownRef}>
// 			{/* Dropdown Label */}
// 			<label className="font-medium text-[15px] leading-5 text-gray-600">
// 				{islabelone || islabeltwo}
// 			</label>

// 			{/* Dropdown Button */}
// 			<div
// 				className="flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] mt-[8px] cursor-pointer"
// 				onClick={toggleDropdown}
// 			>
// 				{right && <div className="view_content_table mr-2">JB</div>}
// 				<span className="text-gray-600">{selectedOption || label}</span>
// 				<span className="ml-auto text-gray-500">
// 					<Image src={down} alt="down" />
// 				</span>
// 			</div>

// 			{/* Dropdown List */}
// 			{isOpen && (
// 				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10 w-full">
// 					{options.map((option) => (
// 						<div
// 							key={option}
// 							className="px-4 py-2 cursor-pointer hover:bg-gray-100"
// 							onClick={() => handleSelect(option)}
// 						>
// 							{option}
// 						</div>
// 					))}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// const ResponsibleApproverDropdowns = ({
// 	right,
// 	setInputs,
// }: {
// 	right: boolean;
// 	setInputs: React.Dispatch<React.SetStateAction<{ responsiblePerson?: string; approver?: string }>>;
// }) => {
// 	const handleSelect = (field: "responsiblePerson" | "approver", value: string) => {
// 		setInputs((prevState) => ({
// 			...prevState,
// 			[field]: value,
// 		}));
// 	};

// 	return (
// 		<div className="flex items-center gap-4 mt-[20px] w-full">
// 			<CustomDropdown
// 				label="Select Responsible"
// 				options={["Responsible Person 1", "Responsible Person 2", "Responsible Person 3"]}
// 				right={right}
// 				islabelone="Responsible"
// 				islabeltwo=""
// 				onSelect={(value) => handleSelect("responsiblePerson", value)}
// 			/>
// 			<CustomDropdown
// 				label="Select Approver"
// 				options={["Approver 1", "Approver 2", "Approver 3"]}
// 				right={right}
// 				islabelone=""
// 				islabeltwo="Approver"
// 				onSelect={(value) => handleSelect("approver", value)}
// 			/>
// 		</div>
// 	);
// };

// export default ResponsibleApproverDropdowns;
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { X } from "lucide-react"; // or use any x icon you prefer

const MultiSelectDropdown = ({
	label,
	options,
	right,
	islabelone,
	islabeltwo,
	onSelect,
}: {
	label: string;
	options: string[];
	right: boolean;
	islabelone: string;
	islabeltwo: string;
	onSelect: (values: string[]) => void;
}) => {
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => setIsOpen((prev) => !prev);

	const handleSelect = (option: string) => {
		if (!selectedOptions.includes(option)) {
			const updated = [...selectedOptions, option];
			setSelectedOptions(updated);
			onSelect(updated);
		}
	};

	const handleRemove = (option: string) => {
		const updated = selectedOptions.filter((item) => item !== option);
		setSelectedOptions(updated);
		onSelect(updated);
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

	const availableOptions = options.filter((opt) => !selectedOptions.includes(opt));

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
				{selectedOptions.length === 0 ? (
					<span className="text-gray-600">{label}</span>
				) : (
					selectedOptions.map((option) => (
						<span
							key={option}
							className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded-md text-gray-700"
						>
							{option}
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

			{isOpen && availableOptions.length > 0 && (
				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10 w-full max-h-48 overflow-y-auto">
					{availableOptions.map((option) => (
						<div
							key={option}
							className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
							onClick={() => handleSelect(option)}
						>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const ResponsibleApproverDropdowns = ({
	right,
	setInputs,
}: {
	right: boolean;
	setInputs: React.Dispatch<
		React.SetStateAction<{
			responsiblePerson?: string[];
			approver?: string[];
		}>
	>;
}) => {
	const handleSelect = (field: "responsiblePerson" | "approver", values: string[]) => {
		setInputs((prevState) => ({
			...prevState,
			[field]: values,
		}));
	};

	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			<MultiSelectDropdown
				label="Select Responsible"
				options={["Responsible Person 1", "Responsible Person 2", "Responsible Person 3"]}
				right={right}
				islabelone="Responsible"
				islabeltwo=""
				onSelect={(values) => handleSelect("responsiblePerson", values)}
			/>
			<MultiSelectDropdown
				label="Select Approver"
				options={["Approver 1", "Approver 2", "Approver 3"]}
				right={right}
				islabelone=""
				islabeltwo="Approver"
				onSelect={(values) => handleSelect("approver", values)}
			/>
		</div>
	);
};

export default ResponsibleApproverDropdowns;
