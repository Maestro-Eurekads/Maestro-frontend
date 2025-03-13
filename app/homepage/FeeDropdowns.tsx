"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../../public/down.svg";
import Image from "next/image";

const CustomDropdown = ({
	label,
	options,
	islabelone,
	selectedOption,
	onSelect,
}: {
	label: string;
	options: string[];
	islabelone: string;
	selectedOption: string | null;
	onSelect: (option: string) => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleSelect = (option: string) => {
		onSelect(option);
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
				{islabelone}
			</label>

			{/* Dropdown Button */}
			<div
				className="flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] mt-[8px] cursor-pointer"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="down" />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
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

const FeeDropdowns = ({
	labelone,
	islabelone,
	inputs,
	setInputs,
}: {
	labelone: string;
	islabelone: string;
	inputs: {
		feeType: string;
	};
	setInputs: React.Dispatch<
		React.SetStateAction<{
			feeType: string;
			responsiblePerson: string;
			approver: string;
		}>
	>;
}) => {
	const handleSelect = (selectedOption: string) => {
		setInputs((prevState) => ({
			...prevState,
			feeType: selectedOption,
		}));
	};

	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			<CustomDropdown
				label={labelone}
				options={[
					"License Fee",
					"Broadcasting Fee",
					"Sponsorship Fee",
					"Advertising Fee",
					"Subscription Fee",
					"Distribution Fee",
				]}
				islabelone={islabelone}
				selectedOption={inputs.feeType}
				onSelect={handleSelect}
			/>
		</div>
	);
};

export default FeeDropdowns;
