// components/Dropdown.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import down from "../../../public/down.svg";
import { toast } from "react-hot-toast";

const Dropdown = ({ label, options, selectedFilters, handleSelect, isDisabled = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const toggleDropdown = () => {
		if (!isDisabled) {
			setIsOpen(!isOpen);
		} else {
			toast.error("Please select a year first");
		}
	};

	const handleOptionSelect = (option) => {
		handleSelect(label.toLowerCase(), option);
		setIsOpen(false);
	};

	const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<div
				className={`flex items-center gap-3 px-4 py-2 whitespace-nowrap h-[40px] border border-[#EFEFEF] rounded-[10px] cursor-pointer ${isDisabled ? "opacity-60" : ""
					}`}
				onClick={toggleDropdown}
			>
				<span className="text-gray-600 capitalize">
					{selectedFilters[label.toLowerCase()] || label.replace("_", " ")}
				</span>
				<span className="ml-auto text-gray-500">
					<Image src={down || "/placeholder.svg"} alt="dropdown" />
				</span>
			</div>
			{isOpen && (
				<div className="absolute w-full bg-white border border-[#EFEFEF] rounded-md shadow-lg mt-2 z-10">
					<div className={`max-h-[200px] overflow-y-auto scrollbar-thin`}>
						{options.map((option) => (
							<div
								key={option.label || option}
								className="px-4 py-2 cursor-pointer hover:bg-gray-100"
								onClick={() => handleOptionSelect(option.label || option)}
							>
								{option.label || option}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Dropdown;