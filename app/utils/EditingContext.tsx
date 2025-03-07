"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface EditingContextType {
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
	const [isEditing, setIsEditing] = useState(false);

	return (
		<EditingContext.Provider value={{ isEditing, setIsEditing }}>
			{children}
		</EditingContext.Provider>
	);
}

export function useEditing() {
	const context = useContext(EditingContext);
	if (!context) {
		throw new Error("useEditing must be used within an EditingProvider");
	}
	return context;
}
