"use client";
import React, { createContext, useContext, useState } from "react";

interface ChannelMixContextType {
	selectedChannels: { [stage: string]: { [category: string]: string[] } };
	setSelectedChannel: (stage: string, category: string, platform: string) => void;
	validatedStages: { [stage: string]: boolean };
	setStageValidation: (stage: string, isValid: boolean) => void;
}

const ChannelMixContext = createContext<ChannelMixContextType | undefined>(undefined);

export const ChannelMixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [selectedChannels, setSelectedChannels] = useState<{ [stage: string]: { [category: string]: string[] } }>({});
	const [validatedStages, setValidatedStages] = useState<{ [stage: string]: boolean }>({});

	const setSelectedChannel = (stage: string, category: string, platform: string) => {
		setSelectedChannels((prev) => {
			const stageSelection = prev[stage] || {};
			const categorySelection = stageSelection[category] || [];
			const isAlreadySelected = categorySelection.includes(platform);

			const newCategorySelection = isAlreadySelected
				? categorySelection.filter((p) => p !== platform)
				: [...categorySelection, platform];

			return {
				...prev,
				[stage]: {
					...stageSelection,
					[category]: newCategorySelection
				}
			};
		});
	};

	const setStageValidation = (stage: string, isValid: boolean) => {
		setValidatedStages((prev) => ({
			...prev,
			[stage]: isValid
		}));
	};

	return (
		<ChannelMixContext.Provider value={{ 
			selectedChannels, 
			setSelectedChannel,
			validatedStages,
			setStageValidation 
		}}>
			{children}
		</ChannelMixContext.Provider>
	);
};

export const useChannelMix = () => {
	const context = useContext(ChannelMixContext);
	if (!context) {
		throw new Error("useChannelMix must be used within a ChannelMixProvider");
	}
	return context;
};