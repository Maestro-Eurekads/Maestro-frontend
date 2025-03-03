"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";

const CustomDropdown = ({
	label,
	options,
	right,
	islabelone,
	islabeltwo,
}: {
	label: string;
	options: string[];
	right: boolean;
	islabelone: string;
	islabeltwo: string;
}) => {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {

		setIsOpen(!isOpen);
	};

	const handleSelect = (option: string) => {
		setSelectedOption(option);
		setIsOpen(false);
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

	return (
		<div className="relative w-full" ref={dropdownRef}>
			{/* Dropdown Label */}
			<label className="font-medium text-[15px] leading-5 text-gray-600 ">
				{islabelone || islabeltwo}
			</label>

			{/* Dropdown Button */}
			<div
				className={`flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] mt-[8px] $  "cursor-pointer"`}
				onClick={toggleDropdown}
			>
				{right && <div className="view_content_table mr-2">JB</div>}
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="down" />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
					{options.map((option) => (
						<div
							key={option}
							className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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

const ResponsibleApproverDropdowns = ({ right }: { right: boolean }) => {
	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			<CustomDropdown
				label="Select Responsible"
				options={["Responsible Person 1", "Responsible Person 2", "Responsible Person 3"]}
				right={right}
				islabelone="Responsible"
				islabeltwo=""

			/>
			<CustomDropdown
				label="Select Approver"
				options={["Approver 1", "Approver 2", "Approver 3"]}
				right={right}
				islabelone=""
				islabeltwo="Approver"

			/>
		</div>
	);
};

export default ResponsibleApproverDropdowns;
