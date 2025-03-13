"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from 'next/image'

const CustomDropdown = ({ label, options, right, islabelone, islabeltwo, }: { label: string; options: string[]; right: string; islabelone: string, islabeltwo: string, }) => {
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
			{/* Dropdown Button */}
			<label className="font-medium text-[15px] leading-5 text-gray-600 ">{islabelone || islabeltwo}</label>
			<div
				className={`flex items-center px-4 py-2 w-full h-[40px] border border-[#EFEFEF] rounded-[10px] mt-[8px]  'cursor-pointer'`}
				onClick={toggleDropdown}
			>
				{right && <div className='view_content_table mr-2'>JB</div>}
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt='down' />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute w-[127px] bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
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

const Dropdowns = ({ one, two, labelone, labeltwo, right, islabelone, islabeltwo, }: { one: boolean; two: boolean; labelone: string; labeltwo: string; right: string; islabelone: string; islabeltwo: string; }) => {
	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			{one && <CustomDropdown label={labelone} options={["2022", "2023", "2024", "2025"]} right={right} islabelone={islabelone} islabeltwo={""} />}
			{two && <CustomDropdown label={labeltwo} options={["Q1", "Q2", "Q3", "Q4"]} right={right} islabelone={""} islabeltwo={islabeltwo} />}
		</div>
	);
};

export default Dropdowns;
