"use client"
import React, { useState, useRef, useEffect } from "react";
import down from "../../public/down.svg";
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
				className="flex items-center px-4 py-2 w-[127px] h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">{selectedOption || label}</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt='nike' />
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

const Dropdowns = () => {
	return (
		<div className="flex  items-center gap-4 mt-[20px] ">
			<Dropdown label="Year" options={["2022", "2023", "2024", "2025"]} />
			<Dropdown label="Quarter" options={["Q1", "Q2", "Q3", "Q4"]} />
			<Dropdown label="Category" options={["Electronics", "Fashion", "Home", "Sports"]} />
			<Dropdown label="Product" options={["Laptop", "T-Shirt", "Sofa", "Bicycle"]} />
		</div>
	);
};

export default Dropdowns;
