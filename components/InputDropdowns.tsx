'use client';

import React, { useState, useRef, useEffect } from 'react';
import down from '../public/down.svg';
import Image from 'next/image';

const CustomInput = ({ label, options, right, islabelone, islabeltwo }) => {
	const [inputValue, setInputValue] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const toggleDropdown = () => setIsOpen(!isOpen);

	const handleSelect = (option) => {
		setInputValue(option);
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

	return (
		<div className="relative w-full" ref={dropdownRef}>
			<label className="font-medium text-[15px] leading-5 text-gray-600 ">
				{islabelone || islabeltwo}
			</label>
			<div className="relative w-full mt-[8px]">
				{right && <div className='view_content_table absolute left-3 top-1/2 transform -translate-y-1/2'>JB</div>}
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder={label}
					className="w-full h-[40px] px-4 py-2 border border-[#EFEFEF] rounded-[10px] cursor-pointer"
					onClick={toggleDropdown}
					readOnly
				/>
				<span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
					<Image src={down} alt='down' />
				</span>
			</div>

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

const InputDropdowns = ({ one, two, labelone, labeltwo, right, islabelone, islabeltwo }) => {
	return (
		<div className="flex items-center gap-4 mt-[20px] w-full">
			{one && <CustomInput label={labelone} options={["2022", "2023", "2024", "2025"]} right={right} islabelone={islabelone} islabeltwo={""} />}
			{two && <CustomInput label={labeltwo} options={["Q1", "Q2", "Q3", "Q4"]} right={right} islabelone={""} islabeltwo={islabeltwo} />}
		</div>
	);
};

export default InputDropdowns;
