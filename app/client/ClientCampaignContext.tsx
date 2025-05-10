// context/ClientCampaignContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface Campaign {
	id: string;
	title: string;
	// Add other fields based on your Strapi campaign schema
}

interface ClientCampaignContextProps {
	campaigns: Campaign[];
	loading: boolean;
	fetchCampaignsByClientId: (clientId: string) => void;
}

const ClientCampaignContext = createContext<ClientCampaignContextProps>({
	campaigns: [],
	loading: false,
	fetchCampaignsByClientId: () => { },
});

export const useClientCampaign = () => useContext(ClientCampaignContext);

export const ClientCampaignProvider = ({ children }: { children: React.ReactNode }) => {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchCampaignsByClientId = async (clientId: string) => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[user][id][$eq]=${clientId}&populate=*`,
				{
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
					},
				}
			);
			setCampaigns(res.data.data);
		} catch (err) {
			console.error("Failed to fetch campaigns:", err);
		} finally {
			setLoading(false);
		}
	};


	return (
		<ClientCampaignContext.Provider value={{ campaigns, loading, fetchCampaignsByClientId }}>
			{children}
		</ClientCampaignContext.Provider>
	);
};
