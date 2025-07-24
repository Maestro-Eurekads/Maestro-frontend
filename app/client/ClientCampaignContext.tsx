// context/ClientCampaignContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

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

export const ClientCampaignProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const jwt =
    (session?.user as { data?: { jwt: string } })?.data?.jwt

  const fetchCampaignsByClientId = async (clientId: string) => {
    setLoading(true);
    const filters = {
      user: {
        $in: clientId,
      },
      isApprove: {
        $eq: true,
      },
    };
    const channelMixPopulate = {
      social_media: { populate: "*" },
      display_networks: { populate: "*" },
      search_engines: { populate: "*" },
      streaming: { populate: "*" },
      ooh: { populate: "*" },
      broadcast: { populate: "*" },
      messaging: { populate: "*" },
      print: { populate: "*" },
      e_commerce: { populate: "*" },
      in_game: { populate: "*" },
      mobile: { populate: "*" },
    };
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
        {
          params: {
            filters,
            populate: {
              budget_details: "*",
              campaign_budget: { populate: ["budget_fees"] },
              client_selection: "*",
              campaign_builder: true,
              media_plan_details: {
                populate: {
                  approved_by: true,
                  internal_approver: {
                    populate: "user",
                  },
                  client_approver: {
                    populate: "user",
                  },
                },
              },
              channel_mix: {
                populate: channelMixPopulate,
              },
            },
          },
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setCampaigns(res.data.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientCampaignContext.Provider
      value={{ campaigns, loading, fetchCampaignsByClientId }}
    >
      {children}
    </ClientCampaignContext.Provider>
  );
};