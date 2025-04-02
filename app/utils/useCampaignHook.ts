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
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?populate[0]=media_plan_details&populate[1]=budget_details&populate[2]=channel_mix.channels&populate[3]=channel_mix.channels.channel_data.format&populate[4]=client_selection&populate[5]=client&populate[6]=channel_mix.channels.channel_data.ad_sets&populate[7]=channel_mix.channels.channel_data.budget&populate[8]=channel_mix.stage_budget&populate[9]=campaign_budget&populate[10]=channel_mix.channels.channel_data.kpi&populate[11]=channel_mix.channels.channel_data.ad_sets.kpi&populate[12]=channel_mix.channels.channel_data.ad_sets.budget`,
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
