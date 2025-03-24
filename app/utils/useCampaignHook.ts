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
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[client][$eq]=${clientID}&populate=*`,
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
