import axios from "axios";
import { useState, useEffect } from "react";

const useCampaignHook = () => {
  // Loading States
  const [loadingClients, setLoadingClients] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allClients, setAllClients] = useState([]);

  const fetchAllClients = async () => {
    setLoadingClients(true);
    await axios
      .get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      })
      .then((res) => {
        setAllClients(res?.data?.data);
      })
      .catch((err) => {
        console.log("An error occured", err);
      })
      .finally(() => {
        setLoadingClients(false);
      });
  };



  useEffect(() => {
    fetchAllClients();
  }, []);

  return { loadingClients, allClients };
};

export default useCampaignHook;
