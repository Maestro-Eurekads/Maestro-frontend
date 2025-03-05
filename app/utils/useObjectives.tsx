"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Objective {
	id: number;
	title: string;
}

interface ObjectivesContextType {
	selectedObjectives: Objective[];
	setSelectedObjectives: React.Dispatch<React.SetStateAction<Objective[]>>;
	selectedFunnels: number[];
	setSelectedFunnels: React.Dispatch<React.SetStateAction<number[]>>;
}

const ObjectivesContext = createContext<ObjectivesContextType | undefined>(undefined);

interface ObjectivesProviderProps {
	children: ReactNode;
}

export const ObjectivesProvider = ({ children }: ObjectivesProviderProps) => {
	const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);
	const [selectedFunnels, setSelectedFunnels] = useState<number[]>([]);

	return (
		<ObjectivesContext.Provider
			value={{
				selectedObjectives,
				setSelectedObjectives,
				selectedFunnels,
				setSelectedFunnels,
			}}
		>
			{children}
		</ObjectivesContext.Provider>
	);
};

export const useObjectives = () => {
	const context = useContext(ObjectivesContext);
	if (!context) {
		throw new Error("useObjectives must be used within an ObjectivesProvider");
	}
	return context;
};
