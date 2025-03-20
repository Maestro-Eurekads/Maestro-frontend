"use client";

import React, { createContext, useContext, useState } from "react";

// Validation Rules
export const validationRules = {
	"Set up your new campaign": (data: any) =>
		data?.client_selection?.value &&
		data?.media_plan &&
		data?.approver &&
		data?.budget_details_currency?.id &&
		data?.budget_details_fee_type?.id &&
		data?.budget_details_value,

	"Define campaign objective": (data: any) => !!data?.campaign_objectives?.length,
	"Map funnel stages": (data: any) => !!data?.funnel_stages?.length,
	"Select channel mix": (data: any) => !!data?.channel_mix && Object.keys(data.channel_mix).length > 0,
	"Formats selection": (data: any) => !!data?.formats?.length,
	"Set buy objectives and types": (data: any) => !!data?.buyObjectives?.length,
	"Plan campaign schedule": (data: any) => !!data?.schedule?.startDate && !!data?.schedule?.endDate,
	"Configure ad sets and budget": (data: any) => data?.budget > 0,
	"Establish goals": (data: any) => !!data?.goal,
	"Overview of your campaign": (data: any) => Object.values(data).every((value) => value !== null && value !== ""),
};

// Verification Context Types
interface VerificationState {
	[key: string]: boolean;
}

interface VerificationContextType {
	verificationState: VerificationState;
	verifyStep: (step: string, isValid: boolean) => void;
	isStepVerified: (step: string) => boolean;
	resetStep: (step: string) => void;
	validateStep: (step: string, data: any) => boolean;
	verifybeforeMove: { [key: string]: boolean }[];
	setverifybeforeMove: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }[]>>;
}


const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

// Provider Component
export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [verificationState, setVerificationState] = useState<VerificationState>({});
	const [verifybeforeMove, setverifybeforeMove] = useState([
		{ "Set up your new campaign": false },
		{ "Define campaign objective": false },
		{ "Map funnel stages": false },
		{ "Select channel mix": false },
		{ "Formats selection": false },
		{ "Set buy objectives and types": false },
		{ "Plan campaign schedule": false },
		{ "Configure ad sets and budget": false },
		{ "Establish goals": false },
		{ "Overview of your campaign": false },
	]);

	// Validate and update step status
	const verifyStep = (step: string, isValid: boolean) => {
		setVerificationState((prev) => ({ ...prev, [step]: isValid }));
	};

	// Check if a step is verified
	const isStepVerified = (step: string) => !!verificationState[step];

	// Reset a step when input changes
	const resetStep = (step: string) => {
		setVerificationState((prev) => ({ ...prev, [step]: false }));
	};

	// Validate a step using predefined rules
	const validateStep = (step: string, data: any) => {
		const isValid = validationRules[step]?.(data) || false;
		verifyStep(step, isValid);
		return isValid;
	};

	return (
		<VerificationContext.Provider value={{ verificationState, verifyStep, isStepVerified, resetStep, validateStep, verifybeforeMove, setverifybeforeMove }}>
			{children}
		</VerificationContext.Provider>
	);
};

// Hook to use verification context
export const useVerification = () => {
	const context = useContext(VerificationContext);
	if (!context) {
		throw new Error("useVerification must be used within a VerificationProvider");
	}
	return context;
};
