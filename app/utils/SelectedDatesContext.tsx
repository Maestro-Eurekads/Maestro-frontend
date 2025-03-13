"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Define types
interface DateType {
	day: number;
	month: number;
}

interface SelectedDatesContextType {
	selectedDates: {
		from: DateType | null;
		to: DateType | null;
	};
	setSelectedDates: React.Dispatch<
		React.SetStateAction<{ from: DateType | null; to: DateType | null }>
	>;
}

// Create context
const SelectedDatesContext = createContext<SelectedDatesContextType | undefined>(undefined);

// Provider component
export const SelectedDatesProvider = ({ children }: { children: ReactNode }) => {
	const [selectedDates, setSelectedDates] = useState<{ from: DateType | null; to: DateType | null }>({
		from: null,
		to: null,
	});

	return (
		<SelectedDatesContext.Provider value={{ selectedDates, setSelectedDates }}>
			{children}
		</SelectedDatesContext.Provider>
	);
};

// Custom hook to use the context
export const useSelectedDates = () => {
	const context = useContext(SelectedDatesContext);
	if (!context) {
		throw new Error("useSelectedDates must be used within a SelectedDatesProvider");
	}
	return context;
};
