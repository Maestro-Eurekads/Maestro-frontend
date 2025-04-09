import axios from "axios";
import { useState, useEffect, useCallback } from "react";

const useCampaignHook = () => {
  // Loading States
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientCampaignData, setClientCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allClients, setAllClients] = useState([]);

  // Fetch all clients
  const fetchAllClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      setAllClients(res?.data?.data);
    } catch (err) {
      console.error("An error occurred while fetching clients:", err);
    } finally {
      setLoadingClients(false);
    }
  }, []); // useCallback prevents unnecessary re-renders

  // Fetch client campaigns
  const fetchClientCampaign = async (clientID) => {
    return await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[client][$eq]=${clientID}&populate[media_plan_details]=*&populate[budget_details]=*&populate[client_selection]=*&populate[campaign_budget]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      }
    );
  };

  const fetchClientPOS = async (clientID) => {
    return await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/purchase-orders?filters[client][$eq]=${clientID}&populate[0]=assigned_media_plans.campaign&populate[1]=assigned_media_plans.campaign.media_plan_details&populate[2]=client_responsible&populate[3]=financial_responsible&populate[4]=client`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      }
    );
  };

  const fetchUserByType = (filters?: string) => {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/users${
      filters ? `${filters}&` : `?`
    }populate=*`;
    return axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    });
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
    fetchClientPOS
  };
};

export default useCampaignHook;
