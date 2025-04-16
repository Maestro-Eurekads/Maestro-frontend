"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../../../public/down.svg";
import Image from "next/image";

// Type definition including plan name properly
type CampaignOption = {
	id: string;
	documentId: string;
	client_name: string;
	media_plan_details?: {
		plan_name?: string;
	};
};

// Custom Dropdown Component
const ClientsCampaignDropdown = ({
	options,
	setSelected,
	selected,
}: {
	options: CampaignOption[];
	setSelected: (value: string) => void;
	selected: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option: CampaignOption) => {
		setSelected(option.documentId);
		localStorage.setItem("selectedClient", option.documentId);
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

	const selectedOption = options.find((opt) => opt.documentId === selected);

	return (
		<div className="relative w-full min-w-[150px]" ref={dropdownRef}>
			<div
				className="flex items-center px-4 py-2 w-full h-[40px] bg-[#F7F7F7] border border-[#EFEFEF] rounded-[10px] cursor-pointer"
				onClick={toggleDropdown}
			>
				<span className="text-gray-600">
					{selectedOption?.media_plan_details?.plan_name || "Select Plan"}
				</span>
				<span className="ml-auto text-gray-500">
					<Image src={down} alt="down" />
				</span>
			</div>

			{isOpen && (
				<div className="absolute w-full bg-[#F7F7F7] border border-[#EFEFEF] rounded-md shadow-lg mt-2 max-h-[400px] overflow-y-auto z-40">
					{options.map((option) => (
						<div
							key={option.documentId}
							className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selected === option.id ? "bg-gray-300 font-bold" : ""
								}`}
							onClick={() => handleSelect(option)}
						>
							{option.media_plan_details?.plan_name || "Unnamed Plan"}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// Wrapper Component
const Dropdowns = ({
	campaigns,
	setSelected,
	selected,
}: {
	campaigns: CampaignOption[];
	setSelected: (value: string) => void;
	selected: string;
}) => {
	return (
		<div className="flex items-center gap-4 w-full">
			<ClientsCampaignDropdown
				selected={selected}
				setSelected={setSelected}
				options={campaigns}
			/>
		</div>
	);
};

// Final Component
export default function YourComponent({
	loadingClients,
	campaigns,
	setSelected,
	selected,
}: {
	loadingClients: boolean;
	campaigns: CampaignOption[];
	setSelected: (value: string) => void;
	selected: string;
}) {
	useEffect(() => {
		const storedClientId = localStorage.getItem("selectedClient");

		const isValidClient = campaigns?.some((client) => client.documentId === storedClientId);

		if (storedClientId && isValidClient) {
			setSelected(storedClientId);
		} else if (!selected && campaigns?.length > 0) {
			setSelected(campaigns[0].documentId);
			localStorage.setItem("selectedClient", campaigns[0].documentId);
		}
	}, [campaigns, selected, setSelected]);

	return (
		<Dropdowns
			campaigns={campaigns || []}
			setSelected={setSelected}
			selected={selected}
		/>
	);
}
