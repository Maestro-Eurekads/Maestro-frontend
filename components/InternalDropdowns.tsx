'use client';

import React, { useState, useRef, useEffect } from 'react';
import down from '../public/down.svg';
import Image from 'next/image';

const CustomInput = ({ options, selectedOption, setSelectedOption }) => {

	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleSelect = (option) => {
		setSelectedOption(option);
		setIsOpen(false);
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Determine the background color based on selection
	const getBackgroundColor = () => {
		if (selectedOption === "Add as Internal") return "text-green-700";
		if (selectedOption === "Add as Client") return "text-red-700";
		return "bg-white text-gray-900";
	};

	return (
		<div className="relative w-[170px]" ref={dropdownRef} onClick={toggleDropdown}>
			<div className="relative w-full mt-2">
				<input
					type="text"
					value={selectedOption || "Select option"}
					className={`w-full h-[40px] px-4 py-2 !border-none !outline-none rounded-md cursor-pointer font-semibold text-[15px] leading-[20px] text-[#00A36C] ${getBackgroundColor()}`}

					readOnly
				/>
				<span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
					<Image src={down} alt="down" />
				</span>
			</div>

			{isOpen && (
				<div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
					{options?.map((option) => (
						<div
							key={option}
							className={`px-4 py-2 cursor-pointer font-semibold text-[15px] hover:bg-gray-100 ${option === "Add as Internal" ? "text-green-500" : "text-red-500"}`}
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

const InternalDropdowns = ({ selectedOption, setSelectedOption }) => {
	return <CustomInput options={["Add as Internal", "Add as Client"]} selectedOption={selectedOption} setSelectedOption={setSelectedOption} />;
};

export default InternalDropdowns;
