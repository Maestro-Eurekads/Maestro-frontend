"use client"

import { createContext, useContext, useState } from "react";

interface ActiveContextType {
	active: number;
	setActive: React.Dispatch<React.SetStateAction<number>>;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export const ActiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [active, setActive] = useState<number>(1);

	return (
		<ActiveContext.Provider value={{ active, setActive }}>
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
