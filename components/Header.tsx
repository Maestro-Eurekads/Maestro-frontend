"use client";
import Image from "next/image";
import nike from "../public/nike.svg";
import plus from "../public/plus.svg";
import white from "../public/white-plus.svg";
import down from "../public/ri-arrow-down-s-line.svg";
import Link from "next/link";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "../app/utils/useCampaignHook";
import { useEffect, useState } from "react";
import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen }) => {
  const { loadingClients, allClients, setClientCampaignData, setLoading } = useCampaigns();
  const [selected, setSelected] = useState("");
  const { fetchClientCampaign, refresh, fetchAllClients, setRefresh } = useCampaignHook();


  useEffect(() => {
    fetchAllClients();
    const timer = setTimeout(() => {
      setRefresh(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [refresh]);



  useEffect(() => {
    if (!allClients || allClients.length === 0) return; // Ensure allClients exists and is not empty

    setLoading(true);
    let isMounted = true; // Prevent setting state after unmount

    const clientId = selected || allClients[0]?.id; // Use selected client ID or default to the first client
    if (!clientId) return setLoading(false); // If no valid client ID, stop loading

    fetchClientCampaign(clientId)
      .then((res) => {
        if (isMounted) setClientCampaignData(res?.data?.data);
      })
      .catch((err) => console.error("Error fetching client campaigns:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Cleanup function to avoid memory leaks
    };
  }, [selected, allClients]);


  return (
    <div id="header">
      <div className="flex items-center">
        {loadingClients && (
          <div className="flex items-center gap-2">
            {" "}
            <FiLoader className="animate-spin" />
            <p>Loading clients...</p>
          </div>
        )}

        <AllClientsCustomDropdown setSelected={setSelected} selected={selected} allClients={allClients} loadingClients={loadingClients} />
        <button className="client_btn_text whitespace-nowrap" onClick={() => setIsOpen(true)}>
          <Image src={plus} alt="plus" />
          New Client
        </button>
      </div>

      <div className="profiledropdown_container_main">
        <div className="profiledropdown_container">
          <Link href={`/creation`}>
            <button className="new_plan_btn">
              <Image src={white} alt="white" />
              <p className="new_plan_btn_text">New media plan</p>
            </button>
          </Link>
          <div className="profile_container">MD</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
