"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface ActiveContextType {
	active: number;
	setActive: React.Dispatch<React.SetStateAction<number>>;
	subStep: number;
	setSubStep: React.Dispatch<React.SetStateAction<number>>;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export const ActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	// Retrieve saved state from localStorage
	const getStoredValue = (key: string, defaultValue: number) => {
		if (typeof window !== "undefined") {
			const storedValue = localStorage.getItem(key);
			return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
		}
		return defaultValue;
	};

	// State with localStorage persistence
	const [active, setActive] = useState<number>(() => getStoredValue("active", 0));
	const [subStep, setSubStep] = useState<number>(() => getStoredValue("subStep", 0));

	// Store values in localStorage when they change
	useEffect(() => {
		localStorage.setItem("active", JSON.stringify(active));
	}, [active]);

	useEffect(() => {
		localStorage.setItem("subStep", JSON.stringify(subStep));
	}, [subStep]);

	return (
		<ActiveContext.Provider value={{ active, setActive, subStep, setSubStep }}>
			{children}
		</ActiveContext.Provider>
	);
};

export const useActive = () => {
	const context = useContext(ActiveContext);
	if (!context) {
		throw new Error("useActive must be used within an ActiveProvider");
	}
	return context;
};
