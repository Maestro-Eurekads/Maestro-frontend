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
      const filters = {
        client: {
          $eq: clientID,
        },
      };
  
      // Add user filter only if user_type includes 'client'
      if (session?.user?.data?.user?.user_type?.includes("client")) {
        filters.user = {
          $eq: session?.user?.id,
        };
      }
  
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
                  approved_by:true,
                  internal_approver: {
                    populate: "user",
                  },
                  client_approver: {
                    populate: "user"
                  },
                },
              },
              channel_mix: {
                populate: channelMixPopulate,
              },
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
  
      return res;
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
