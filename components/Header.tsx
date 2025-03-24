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
import { useAppDispatch, useAppSelector } from "store/useStore";
import { client } from '../types/types';
import AlertMain from "./Alert/AlertMain";
import { getCreateClient, reset } from "features/Client/clientSlice";

const Header = ({ setIsOpen }) => {
  const { getCreateClientData, getCreateClientIsLoading, getCreateClientIsError, getCreateClientMessage } = useAppSelector((state) => state.client);
  const { loadingClients, allClients, setClientCampaignData, setLoading } = useCampaigns();
  const [selected, setSelected] = useState("");
  const { fetchClientCampaign, fetchAllClients } = useCampaignHook();
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(null);
  const [IsError, setIsError] = useState(getCreateClientIsError);
  const clients: any = getCreateClientData


  // useEffect(() => {
  //   if (getCreateClientIsError) {
  //     setAlert({ variant: "error", message: getCreateClientMessage, position: "bottom-right" });
  //   }

  //   dispatch(reset());
  // }, [dispatch, getCreateClientIsError]);

  useEffect(() => { //@ts-ignore
    dispatch(getCreateClient());
    const timer = setTimeout(() => {
      setAlert(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [alert, dispatch]);



  useEffect(() => { //@ts-ignore
    if (!clients?.data || clients?.data?.length === 0) return; // Ensure allClients exists and is not empty

    setLoading(true);
    let isMounted = true; // Prevent setting state after unmount

    const clientId = selected || clients?.data[0]?.id; // Use selected client ID or default to the first client
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
  }, [selected]);




  return (
    <div id="header">
      <div className="flex items-center">
        {getCreateClientIsLoading === true ? (
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <p>Loading clients...</p>
          </div>
        ) : (
          <AllClientsCustomDropdown
            setSelected={setSelected}
            selected={selected}
            allClients={clients?.data}
            loadingClients={getCreateClientIsLoading}
          />
        )}



        <button className="client_btn_text whitespace-nowrap" onClick={() => setIsOpen(true)}>
          <Image src={plus} alt="plus" />
          New Client
        </button>
      </div>
      {alert && <AlertMain alert={alert} />}
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
