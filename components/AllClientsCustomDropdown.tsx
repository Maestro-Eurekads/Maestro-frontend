"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";

// Custom Dropdown Component
const AllClientsCustomDropdown = ({
	options,
	setSelected,
	selected,
}: {
	options: { id: string; client_name: string }[];
	setSelected: (value: string) => void;
	selected: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { data: session } = useSession();
	// @ts-ignore 
	const userType = session?.user?.data?.user?.id || "";
	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleSelect = (option: { id: string; client_name: string }) => {
		setSelected(option?.id);
		localStorage.setItem(userType.toString(), option?.id);  // Persist selection
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
		<div className="relative w-full min-w-[150px]" ref={dropdownRef}>
			{/* Dropdown Button */}
			<div
				className="flex items-center px-4 py-2 w-full h-[40px] bg-[#F7F7F7] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">
					{selected ? options?.find((opt) => opt?.id === selected)?.client_name : "Select Client"}
				</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="down" />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && (
				<div className="absolute w-full bg-[#F7F7F7] border border-[#EFEFEF] rounded-md shadow-lg mt-2 max-h-[400px] overflow-y-auto z-40">
					{options?.map((option) => (
						<div
							key={option.id}
							className={`px-4 py-2 cursor-pointer hover:bg-gray-100 
								${selected === option?.id ? "bg-gray-300 font-bold" : ""}`} // Highlight selected item
							onClick={() => handleSelect(option)}
						>
							{option?.client_name}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// Wrapper Component for Dropdown
const Dropdowns = ({
	allClients,
	setSelected,
	selected,
}: {
	allClients: { id: string; client_name: string }[];
	setSelected: (value: string) => void;
	selected: string;
}) => {
	return (
		<div className="flex items-center gap-4 w-full">
			<AllClientsCustomDropdown
				selected={selected}
				setSelected={setSelected}
				options={allClients}
			/>
		</div>
	);
};

// **Usage in Your Component**
export default function YourComponent({
	loadingClients,
	allClients,
	setSelected,
	selected,
}: {
	loadingClients: boolean;
	allClients: { id: string; client_name: string }[];
	setSelected: (value: string) => void;
	selected: string;
}) {
	// Load the previously selected client from localStorage
	// useEffect(() => {
	// 	const storedClientId = localStorage.getItem(userType.toString());

	// 	// Check if the stored ID exists in the current options
	// 	const isValidClient = allClients?.some((client) => client?.id === storedClientId);

	// 	if (storedClientId && isValidClient) {
	// 		setSelected(storedClientId);
	// 	} else if (!selected && allClients?.length > 0) {
	// 		// If no valid stored selection, default to the first client
	// 		setSelected(allClients[0].id);
	// 		localStorage.setItem(userType, allClients[0]?.id); // Persist initial selection
	// 	}
	// }, [allClients, selected, setSelected]);

	return (
		<>

			<Dropdowns
				allClients={allClients?.filter((c) => c?.client_name) || []}
				setSelected={setSelected}
				selected={selected}
			/>
		</>
	);
}
