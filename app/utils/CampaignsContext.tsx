"use client";

import React, { createContext, useReducer, useContext, ReactNode } from "react";

// 🎯 Initial Campaign State
const initialState = {
	campaigns: {
		mediaplan: {
			setupNewCampaign: {},
			defineCampaignObjective: {},
			mapFunnelStages: {},
			selectChannelMix: {},
			formatsSelection: {},
			setBuyObjectivesandTypes: {},
			midRecap: {},
			planCampaignSchedule: {},
			configureAdSetsandBudget: {},
			establishGoals: {},
			overviewOfYourCampaign: {},
		},
	},
};

// 🎯 Reducer Function
const campaignReducer = (state: any, action: any) => {
	switch (action.type) {
		case "UPDATE_CAMPAIGN":
			return {
				...state,
				campaigns: {
					...state.campaigns,
					mediaplan: {
						...state.campaigns.mediaplan,
						[action.payload.step]: action.payload.data, // Update specific step
					},
				},
			};
		default:
			return state;
	}
};

// 🎯 Create Context
const CampaignContext = createContext<any>(null);

// 🎯 Provider Component
export const CampaignProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(campaignReducer, initialState);

	return (
		<CampaignContext.Provider value={{ state, dispatch }}>
			{children}
		</CampaignContext.Provider>
	);
};

// 🎯 Custom Hook for easy access
export const useCampaigns = () => {
	const context = useContext(CampaignContext);
	if (!context) throw new Error("useCampaigns must be used within a CampaignProvider");
	return context;
};
