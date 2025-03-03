"use client";
import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";


const Dropdown = ({ label, options }: { label: string; options: { value: string; label: string }[] }) => {
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
				className="flex items-center px-4 py-2 w-[327px] h-[45px] cursor-pointer bg-white max-w-xs border-2 border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="dropdown-icon" />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-1 z-10">
					{options.map((option) => (
						<div
							key={option.value}
							className="px-4 py-2 cursor-pointer hover:bg-gray-100"
							onClick={() => handleSelect(option.value)}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const ClientSelection = ({ options, label }) => {
	return (
		<div className="flex items-center gap-4 mt-[20px]">
			<Dropdown label={label} options={options} />
		</div>
	);
};

export default ClientSelection;
