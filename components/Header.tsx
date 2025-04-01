"use client";
import Image from "next/image";
// Removed unused import 'nike'
import plus from "../public/plus.svg";
import white from "../public/white-plus.svg";
// Removed unused import 'down'
import Link from "next/link";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "../app/utils/useCampaignHook";
import { useEffect, useState } from "react";
// Removed unused import 'AllClientsCustomDropdown'
import { useAppDispatch, useAppSelector } from "store/useStore";
// Removed unused import 'client'
import AlertMain from "./Alert/AlertMain";
import { getCreateClient } from "features/Client/clientSlice"; // Removed unused 'reset'
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
// import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen }) => {
  const {
    getCreateClientData,
    getCreateClientIsLoading,
    // Removed unused 'getCreateClientIsError'
    // Removed unused 'getCreateClientMessage'
  } = useAppSelector((state) => state.client);
  const { setClientCampaignData, setLoading, setCampaignFormData, isLoggedIn } =
    useCampaigns();
  const [selected, setSelected] = useState("");
  const { fetchClientCampaign } = useCampaignHook(); // Removed unused 'fetchAllClients'
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(null);
  const [show, setShow] = useState(false);
  // Removed unused 'IsError' and 'setIsError'
  const clients: any = getCreateClientData;

  // useEffect(() => {
  //   if (getCreateClientIsError) {
  //     setAlert({ variant: "error", message: getCreateClientMessage, position: "bottom-right" });
  //   }

  //   dispatch(reset());
  // }, [dispatch, getCreateClientIsError]);

  useEffect(() => {
    dispatch(getCreateClient());
    const timer = setTimeout(() => {
      setAlert(null); // Ensure alert is reset properly
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  const selectedId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedClient") || ""
      : ""; // Ensure a default value
  // console.log("🚀 ~ useEffect ~ selectedId:", selectedId);

  useEffect(() => {
    if (!clients?.data || clients.data.length === 0) {
      setLoading(false); // Ensure loading is stopped if no clients
      return;
    }

    setLoading(true);
    setSelected(selectedId);
    let isMounted = true; // Prevent setting state after unmount
    const clientId = selectedId || clients.data[0]?.id; // Use selected client ID or default to the first client
    if (!clientId) {
      setLoading(false); // If no valid client ID, stop loading
      return;
    }

    fetchClientCampaign(clientId)
      .then((res) => {
        if (isMounted) setClientCampaignData(res?.data?.data || []); // Ensure data fallback
      })
      .catch((err) => console.error("Error fetching client campaigns:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Cleanup function to avoid memory leaks
    };
  }, [clients, selectedId]);

  return (
    <div id="header">
      <div className="flex items-center">
        {getCreateClientIsLoading === true ? (
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <p>Loading clients...</p>
          </div>
        ) : (
          <>
            <select
              className="flex items-center px-4 py-2 w-full h-[40px] bg-[#F7F7F7] border border-[#EFEFEF] rounded-[10px] cursor-pointer text-[16px] focus:outline-none focus:ring-0 active:outline-none active:ring-0"
              value={selectedId || selected || ""}
              onChange={(e) => {
                localStorage.setItem("selectedClient", e.target.value);
                setSelected(e.target.value);
              }}
            >
              <option disabled={true}>Select a client</option>
              {clients?.data?.map(
                (client: { id: string; client_name: string }, ind: number) => (
                  <option key={ind} value={client?.id}>
                    {client?.client_name}
                  </option>
                )
              )}
            </select>
            {/* <AllClientsCustomDropdown
            setSelected={setSelected}
            selected={selected}
            allClients={clients?.data}
            loadingClients={getCreateClientIsLoading}
          /> */}
          </>
        )}

        <button
          className="client_btn_text whitespace-nowrap w-fit"
          onClick={() => setIsOpen(true)}
        >
          <Image src={plus} alt="plus" />
          New Client
        </button>
      </div>
      {alert && <AlertMain alert={alert} />}
      <div className="profiledropdown_container_main">
        <div className="profiledropdown_container">
          <Link href={`/creation`} onClick={() => setCampaignFormData({})}>
            <button className="new_plan_btn">
              <Image src={white} alt="white" />
              <p className="new_plan_btn_text">New media plan</p>
            </button>
          </Link>
          <div
            className="profile_container"
            onClick={() => setShow((prev) => !prev)}
          >
            MD
            {show && (
              <div className="absolute bg-white border shadow-md rounded-[10px] top-[50px]">
                <div className="flex items-center gap-2 cursor-pointer p-2" onClick={async () => await signOut({
                  callbackUrl: "/"
                })}>
                  <LogOut color="#3175FF" />
                  <p>Logout</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
