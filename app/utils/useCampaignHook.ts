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
      const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      });
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
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[client][$eq]=${clientID}&populate[0]=media_plan_details&populate[1]=budget_details&populate[2]=channel_mix&populate[3]=channel_mix.social_media&populate[4]=channel_mix.display_networks&populate[5]=channel_mix.search_engines&populate[6]=channel_mix.social_media.format&populate[7]=channel_mix.display_networks.format&populate[8]=channel_mix.search_engines.format&populate[9]=client_selection&populate[10]=client&populate[11]=channel_mix.social_media.ad_sets&populate[12]=channel_mix.display_networks.ad_sets&populate[13]=channel_mix.search_engines.ad_sets&populate[14]=channel_mix.social_media.budget&populate[15]=channel_mix.display_networks.budget&populate[16]=channel_mix.search_engines.budget&populate[17]=channel_mix.stage_budget&populate[18]=campaign_budget`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      }
    );
  };

  

  // Initial fetch on mount
  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

 

  return { 
    loadingClients, 
    allClients, 
    fetchClientCampaign, 
    fetchAllClients
  };
};

export default useCampaignHook;
