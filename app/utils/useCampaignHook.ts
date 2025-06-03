//@ts-nocheck

import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const useCampaignHook = () => {
  // Loading States
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientCampaignData, setClientCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const { data: session } = useSession();

 

  
  // Fetch all clients
  const fetchAllClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await axios.get(
        // @ts-ignore
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients${
          //@ts-ignore
          session?.user?.data?.user?.user_type === "admin"
            ? "?populate[0]=users&populate[1]=responsible&populate[2]=approver"
            : `?filters[users][$eq]=${session?.user?.id}&populate[0]=users&populate[1]=responsible&populate[2]=approver`
        }`,
{
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
},
}
);
      setAllClients(res?.data?.data || []);
    } catch (err) {
      console.error("An error occurred while fetching clients:", err);
      setError(err.message || "Failed to fetch clients");
    } finally {
      setLoadingClients(false);
    }
  }, []);

  // Fetch client campaigns
  const fetchClientCampaign = async (clientID) => {
    try {
      return await axios.get(
        // @ts-ignore
        `${
          process.env.NEXT_PUBLIC_STRAPI_URL
        }/campaigns?filters[client][$eq]=${clientID}${
  session?.user?.data?.user?.user_type?.includes("client")
    ? `&filters[user][$eq]=${session?.user?.id}`
    : ""
}&populate[budget_details]=*&populate[campaign_budget][populate][budget_fees]=*&populate[client_selection]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error("Error fetching client campaigns:", err);
      throw err;
    }
  };

  // Fetch client purchase orders
  const fetchClientPOS = async (clientID) => {
    try {
      return await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders?filters[client][$eq]=${clientID}&sort=createdAt:desc&populate[0]=assigned_media_plans.campaign&populate[1]=assigned_media_plans.campaign.media_plan_details&populate[2]=client_responsible&populate[3]=financial_responsible&populate[4]=client`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
    } catch (err) {
      console.error("Error fetching client POs:", err);
      throw err;
    }
  };

  // Fetch users by type
  const fetchUserByType = async (filters?: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/users${
        filters ? `${filters}&` : `?`
      }populate=*`;
      return await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      throw err;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  return {
    loadingClients,
    allClients,
    fetchClientCampaign,
    fetchAllClients,
    fetchUserByType,
    fetchClientPOS,
    clientCampaignData,
    loading,
    error,
  };
};

export default useCampaignHook;
