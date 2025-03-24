"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../public/down.svg";
import Image from "next/image";

// Custom Dropdown Component
const AllClientsCampaignDropdown = ({
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

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleSelect = (option: { id: string; client_name: string }) => {
		setSelected(option.id);
		localStorage.setItem("selectedClient", option.id);
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
					{selected
						? options?.find((opt) => opt.id === selected)?.client_name || "Unnamed Client"
						: "Select Client"}
				</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="down" />
				</span>
			</div>

			{/* Dropdown List */}
			{isOpen && options?.length > 0 && (
				<div className="absolute w-full bg-[#F7F7F7] border border-[#EFEFEF] rounded-md shadow-lg mt-2 max-h-[400px] overflow-y-scroll z-40">
					{options.map((option) => (
						<div
							key={option.id}
							className={`px-4 py-2 cursor-pointer hover:bg-gray-100 
								${selected === option.id ? "bg-gray-300 font-bold" : ""}`}
							onClick={() => handleSelect(option)}
						>
							{option.client_name || "Unnamed Client"}
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
			<AllClientsCampaignDropdown selected={selected} setSelected={setSelected} options={allClients} />
		</div>
	);
};

// **Main Component**
export default function YourComponent({
	loadingClients,
	clientCampaignData,
	setSelected,
	selected,
}: {
	loadingClients: boolean;
	clientCampaignData: { id: number; documentId?: string; client_name?: string }[];
	setSelected: (value: string) => void;
	selected: string;
}) {
	// Map data to fit the dropdown format
	const allClients = clientCampaignData?.map((client) => ({
		id: client?.id?.toString(),
		client_name: client?.client?.client_name, // Ensure name is always available
	}));



	// Load the previously selected client from localStorage
	useEffect(() => {
		const storedClientId = localStorage.getItem("selectedClient");
		const isValidClient = allClients?.some((client) => client?.id === storedClientId);

		if (storedClientId && isValidClient) {
			setSelected(storedClientId);
		} else if (!selected && allClients?.length > 0) {
			setSelected(allClients[0].id);
			localStorage.setItem("selectedClient", allClients[0].id);
		}
	}, [allClients, selected, setSelected]);

	return (
		<>
			{loadingClients ? (
				<p>Loading Clients...</p>
			) : (
				<Dropdowns allClients={allClients} setSelected={setSelected} selected={selected} />
			)}
		</>
	);
}
