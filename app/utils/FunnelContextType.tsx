"use client";
import React, { createContext, useContext, useState } from "react";

interface FunnelContextType {
	funnelWidths: { [key: string]: number };
	setFunnelWidth: (id: string, width: number) => void;
}

const FunnelContext = createContext<FunnelContextType | undefined>(undefined);

export const FunnelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [funnelWidths, setFunnelWidths] = useState<{ [key: string]: number }>({});

	const setFunnelWidth = (id: string, width: number) => {
		setFunnelWidths((prev) => ({ ...prev, [id]: width }));
	};

	return (
		<FunnelContext.Provider value={{ funnelWidths, setFunnelWidth }}>
			{children}
		</FunnelContext.Provider>
	);
};

export const useFunnelContext = () => {
	const context = useContext(FunnelContext);
	if (!context) {
		throw new Error("useFunnelContext must be used within a FunnelProvider");
	}
	return context;
};
