"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface CampaignSelectionContextType {
	selectedCampaignId: string | null;
	setSelectedCampaignId: (id: string) => void;
}

// Create the context
const CampaignSelectionContext = createContext<CampaignSelectionContextType | undefined>(undefined);

// Context provider component
export const CampaignSelectionProvider = ({ children }: { children: ReactNode }) => {
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

	return (
		<CampaignSelectionContext.Provider value={{ selectedCampaignId, setSelectedCampaignId }}>
			{children}
		</CampaignSelectionContext.Provider>
	);
};

// Custom hook to use the context
export const useCampaignSelection = () => {
	const context = useContext(CampaignSelectionContext);
	if (!context) {
		throw new Error("useCampaignSelection must be used within a CampaignSelectionProvider");
	}
	return context;
};
