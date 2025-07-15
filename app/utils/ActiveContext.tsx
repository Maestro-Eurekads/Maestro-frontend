"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface ActiveContextType {
	active: number;
	setActive: React.Dispatch<React.SetStateAction<number>>;
	subStep: number;
	setSubStep: React.Dispatch<React.SetStateAction<number>>;
	change: boolean;
	showModal: boolean;
	setChange: React.Dispatch<React.SetStateAction<boolean>>;
	setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export const ActiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	// Helper to get stored values from localStorage
	const getStoredValue = <T,>(key: string, defaultValue: T): T => {
		if (typeof window !== "undefined") {
			const storedValue = localStorage.getItem(key);
			try {
				return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
			} catch {
				return defaultValue;
			}
		}
		return defaultValue;
	};

	// States with persisted values
	const [active, setActive] = useState<number>(() => getStoredValue("active", 0));
	const [subStep, setSubStep] = useState<number>(() => getStoredValue("subStep", 0));
	const [change, setChange] = useState<boolean>(() => getStoredValue("change", false));
	const [showModal, setShowModal] = useState(false);

	// Save values to localStorage when they change
	useEffect(() => {
		localStorage.setItem("active", JSON.stringify(active));
	}, [active]);

	useEffect(() => {
		localStorage.setItem("subStep", JSON.stringify(subStep));
	}, [subStep]);

	useEffect(() => {
		localStorage.setItem("change", JSON.stringify(change));
	}, [change]);

	return (
		<ActiveContext.Provider value={{ active, setActive, subStep, setSubStep, change, setChange, showModal, setShowModal }}>
			{children}
		</ActiveContext.Provider>
	);
};

export const useActive = (): ActiveContextType => {
	const context = useContext(ActiveContext);
	if (!context) {
		throw new Error("useActive must be used within an ActiveProvider");
	}
	return context;
};
