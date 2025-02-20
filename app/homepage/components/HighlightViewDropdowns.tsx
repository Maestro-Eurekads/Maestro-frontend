"use client"
import React, { useState, useRef, useEffect } from "react";
import down from "../../../public/down.svg";
import Image from 'next/image'


const Dropdown = ({ label, options }: { label: string; options: string[] }) => {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => setIsOpen(!isOpen);

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
		<div className="relative" ref={dropdownRef}>
			{/* Dropdown Button */}
			<div
				className="flex items-center gap-3 px-4 py-2 whitespace-nowrap  h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt='nike' />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute w-[100%] bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
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

const HighlightViewDropdowns = () => {
	return (
		<div>
			<h6 className=" font-[600] text-[14px] leading-[19px] text-[rgba(6,18,55,0.8)]">
				Highlight view
			</h6>
			<div className="flex items-center gap-4 mt-[5px]">
				<Dropdown label="Channel" options={["Online", "Retail", "Wholesale", "Direct"]} />
				<Dropdown label="Phase" options={["Phase 1", "Phase 2", "Phase 3", "Phase 4"]} />
			</div>
		</div>

	);
};

export default HighlightViewDropdowns;
