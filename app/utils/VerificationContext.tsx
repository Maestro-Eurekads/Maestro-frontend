"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Step validation rules
export const validationRules = {
	step0: (data: any) =>
		data?.client_selection?.value &&
		data?.media_plan &&
		data?.approver &&
		data?.budget_details_currency?.id &&
		data?.budget_details_fee_type?.id &&
		data?.budget_details_value,

	step1: (data: any) => !!data?.campaign_objectives?.length,
	step2: (data: any) => !!data?.funnel_stages?.length,
	step3: (data: any) => !!data?.channel_mix && Object.keys(data.channel_mix).length > 0,
	step4: (data: any) => !!data?.formats?.length,
	step5: (data: any) => !!data?.buyObjectives?.length,
	step6: (data: any) => !!data?.schedule?.startDate && !!data?.schedule?.endDate,
	step7: (data: any) => data?.budget > 0,
	step8: (data: any) => !!data?.goal,
	step9: (data: any) => Object.values(data).every((value) => value !== null && value !== ""),
};

// Context Types
interface VerificationState {
	[key: string]: boolean;
}

interface VerificationContextType {
	verificationState: VerificationState;
	verifyStep: (step: string, isValid: boolean) => void;
	isStepVerified: (step: string) => boolean;
	resetStep: (step: string) => void;
	validateStep: (step: string, data: any) => boolean;
	verifybeforeMove: { [key: string]: boolean };
	setverifybeforeMove: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

// Provider Component
export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [verificationState, setVerificationState] = useState<VerificationState>({});

	// Load stored verification state from local storage
	const loadStoredState = () => {
		if (typeof window !== "undefined") {
			const storedState = localStorage.getItem("verifybeforeMove");
			return storedState
				? JSON.parse(storedState)
				: {
					step0: false,
					step1: false,
					step2: false,
					step3: false,
					step4: false,
					step5: false,
					step6: false,
					step7: false,
					step8: false,
					step9: false,
				};
		}
		return {};
	};

	const [verifybeforeMove, setverifybeforeMove] = useState<{ [key: string]: boolean }>(loadStoredState);

	// Persist state in local storage whenever verifybeforeMove updates
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("verifybeforeMove", JSON.stringify(verifybeforeMove));
		}
	}, [verifybeforeMove]);

	// Validate and update step status
	const verifyStep = (step: string, isValid: boolean) => {
		setVerificationState((prev) => ({ ...prev, [step]: isValid }));
		setverifybeforeMove((prev) => ({
			...prev,
			[step.toLowerCase().replace(" ", "")]: isValid, // "Step 1" -> "step1"
		}));
	};

	// Check if a step is verified
	const isStepVerified = (step: string) => !!verificationState[step];

	// Reset a step when input changes
	const resetStep = (step: string) => {
		setVerificationState((prev) => ({ ...prev, [step]: false }));
	};

	// Validate a step using predefined rules
	const validateStep = (step: string, data: any) => {
		const stepKey = step.toLowerCase().replace(" ", ""); // Convert "Step 1" -> "step1"
		const isValid = validationRules[stepKey]?.(data) || false;
		verifyStep(stepKey, isValid);
		return isValid;
	};

	return (
		<VerificationContext.Provider
			value={{ verificationState, verifyStep, isStepVerified, resetStep, validateStep, verifybeforeMove, setverifybeforeMove }}
		>
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
