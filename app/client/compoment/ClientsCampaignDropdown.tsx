"use client";

import React, { useState, useRef, useEffect } from "react";
import down from "../../../public/down.svg";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCampaigns } from "../../utils/CampaignsContext";
import { useActive } from "../../utils/ActiveContext";

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
	const { data: session } = useSession();
	// @ts-ignore 
	const userType = session?.user?.data?.user?.id || "";
	const { setCampaignFormData, setCampaignData } = useCampaigns();
	const { setActive, setSubStep } = useActive();

	// Function to clear all campaign-related data when switching plans
	const clearCampaignData = () => {
		if (typeof window === "undefined") return;
		try {
			// Clear sessionStorage for channel state
			const keysToRemove: string[] = [];
			for (let i = 0; i < sessionStorage.length; i++) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith("channelLevelAudienceState_")) {
					keysToRemove.push(key);
				}
			}
			keysToRemove.forEach((key) => sessionStorage.removeItem(key));

			// Clear window channel state
			if ((window as any).channelLevelAudienceState) {
				Object.keys((window as any).channelLevelAudienceState).forEach((stageName) => {
					delete (window as any).channelLevelAudienceState[stageName];
				});
			}

			// Clear all localStorage items related to campaign creation
			const localStorageKeysToRemove = [
				"campaignFormData",
				"filteredClient",
				"selectedOptions",
				"funnelStageStatuses",
				"seenFunnelStages",
				"formatSelectionOpenTabs",
				"step1_validated",
				"active",
				"change",
				"comments",
				"subStep",
				"verifybeforeMove"
			];

			// Remove campaign-specific localStorage items
			localStorageKeysToRemove.forEach(key => {
				localStorage.removeItem(key);
			});

			// Remove quantities-related localStorage items (format selection)
			Object.keys(localStorage).forEach(key => {
				if (key.startsWith("quantities_")) {
					localStorage.removeItem(key);
				}
			});

			// Remove modal dismissal keys
			Object.keys(localStorage).forEach(key => {
				if (key.includes("modal_dismissed") || key.includes("goalLevelModalDismissed")) {
					localStorage.removeItem(key);
				}
			});

			// Remove format error trigger keys
			Object.keys(localStorage).forEach(key => {
				if (key.startsWith("triggerFormatError_")) {
					localStorage.removeItem(key);
				}
			});

			// Remove channel mix related localStorage items
			Object.keys(localStorage).forEach(key => {
				if (key.includes("openItems") ||
					key.includes("selected") ||
					key.includes("stageStatuses") ||
					key.includes("showMoreMap") ||
					key.includes("openChannelTypes")) {
					localStorage.removeItem(key);
				}
			});

			// Reset campaign context state
			setCampaignFormData({});
			setCampaignData(null);
			setActive(0);
			setSubStep(0);

			console.log("Cleared all campaign data when switching plans");
		} catch (error) {
			console.error("Error clearing campaign data:", error);
		}
	};

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option: CampaignOption) => {
		// Only clear data if selecting a different plan
		if (selected !== option.documentId) {
			clearCampaignData();
		}
		setSelected(option.documentId);
		localStorage.setItem(userType.toString(), option.documentId);
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
		<div className="relative w-full min-w-[180px]" ref={dropdownRef}>
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

	const { data: session } = useSession();
	// @ts-ignore 
	const userType = session?.user?.data?.user?.id || "";
	useEffect(() => {
		const storedClientId = localStorage.getItem(userType.toString());

		const isValidClient = campaigns?.some((client) => client.documentId === storedClientId);

		if (storedClientId && isValidClient) {
			setSelected(storedClientId);
		} else if (!selected && campaigns?.length > 0) {
			setSelected(campaigns[0].documentId);
			localStorage.setItem(userType.toString(), campaigns[0].documentId);
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
