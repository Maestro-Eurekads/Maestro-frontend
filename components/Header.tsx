"use client";
import Image from "next/image";
import plus from "../public/plus.svg";
import white from "../public/white-plus.svg";
import Link from "next/link";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "../app/utils/useCampaignHook";
import { useEffect, useState } from "react";
// Removed unused import 'AllClientsCustomDropdown'
import { useAppDispatch, useAppSelector } from "store/useStore";
import AlertMain from "./Alert/AlertMain";
import { getCreateClient } from "features/Client/clientSlice"; // Removed unused 'reset'
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import ClientSelection from "./ClientSelection";
import { CustomSelect } from "app/homepage/components/CustomReactSelect";
import { useActive } from "app/utils/ActiveContext";
import { extractAprroverFilters, extractChannelAndPhase, extractDateFilters } from "app/utils/campaign-filter-utils";
import { useUserPrivileges } from "utils/userPrivileges";
import { el } from "date-fns/locale";
// import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen }) => {
  const { isAdmin } = useUserPrivileges();
  const { data: session } = useSession();
  const {
    getCreateClientData,
    getCreateClientIsLoading,
  } = useAppSelector((state) => state.client);
  const {
    setClientCampaignData,
    setLoading,
    setCampaignFormData,
    setClientPOs,
    setFetchingPO,
    setFilterOptions,
    profile
  } = useCampaigns();
  const { setActive, setSubStep } = useActive()
  const [selected, setSelected] = useState("");
  const { fetchClientCampaign, fetchClientPOS } = useCampaignHook(); // Removed unused 'fetchAllClients'
  const dispatch = useAppDispatch();
  const [alert, setAlert] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  // Removed unused 'IsError' and 'setIsError'
  const clients: any = getCreateClientData;




  // console.log("🚀 ~ profile ~ profile:", profile?.clients);
  // console.log("🚀 ~ profile ~ profile:", isAdmin);
  // console.log("🚀 ~ profile ~ profile:", clients?.data);

  useEffect(() => {
    dispatch(getCreateClient());
    const timer = setTimeout(() => {
      setAlert(null); // Ensure alert is reset properly
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch]);


  useEffect(() => {
    if (isAdmin) {
      const clientId = localStorage.getItem("selectedClient") || "";
      setSelectedId(clientId);

    } else {
      const clientId = localStorage.getItem("profileclients") || "";
      setSelectedId(clientId);
    }
  }, [isAdmin, selected, getCreateClientIsLoading]);

  // const selectedId =
  //   typeof window !== "undefined"
  //     ? localStorage.getItem("selectedClient") || localStorage.getItem("profileclients")
  //     : "";

  // console.log("🚀 ~ selected ~ selectedId:", selectedId);

  useEffect(() => {
    if (!clients?.data || clients.data.length === 0) {
      setLoading(false); // Ensure loading is stopped if no clients
      return;
    }

    setLoading(true);
    let isMounted = true; // Prevent setting state after unmount
    const clientId = selectedId || clients.data[0]?.id; // Use selected client ID or default to the first client
    if (!clientId) {
      setLoading(false); // If no valid client ID, stop loading
      return;
    }

    setSelected(selectedId ? selectedId : clients?.data[0]?.id?.toString() || profile?.clients[0]?.id?.toString());
    fetchClientCampaign(clientId)
      .then((res) => {
        if (isMounted) setClientCampaignData(res?.data?.data || []); // Ensure data fallback
        const dateData = extractDateFilters(res?.data?.data)
        const mediaData = extractAprroverFilters(res?.data?.data)
        const channelData = extractChannelAndPhase(res?.data?.data)
        setFilterOptions((prev) => ({ ...prev, ...dateData, ...mediaData, ...channelData }))
        fetchClientPOS(clientId)
          .then((res) => {
            setClientPOs(res?.data?.data || []);
          })
          .catch((err) => console.error("Error fetching client POS:", err))
          .finally(() => {
            setFetchingPO(false);
          });
      })
      .catch((err) => console.error("Error fetching client campaigns:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    setFetchingPO(true);

    return () => {
      isMounted = false; // Cleanup function to avoid memory leaks
    };
  }, [clients, selectedId, profile?.client?.id]); // Removed unused 'profile?.client?.id'



  function getFirstLetters(str) {
    const words = str?.trim().split(/\s+/);
    const first = words?.length > 0 && words[0]?.[0] || '';
    const second = words?.length > 0 && words[1]?.[0] || '';
    return (first + second).toUpperCase();
  }


  return (
    <div id="header">
      {isAdmin ?
        <div className="flex items-center">
          {getCreateClientIsLoading === true ? (
            <div className="flex items-center gap-2">
              <FiLoader className="animate-spin" />
              <p>Loading clients...</p>
            </div>
          ) : (
            clients?.data && (
              <>
                <CustomSelect
                  options={clients?.data?.map((c) => ({
                    label: c?.client_name,
                    value: c?.id,
                  }))}
                  className="min-w-[150px] z-[20]"
                  placeholder="Select client"
                  onChange={(value: { label: string; value: string } | null) => {
                    if (value) {
                      localStorage.setItem("selectedClient", value.value);
                      setSelected(value.value);
                    }
                  }}
                  value={clients?.data
                    ?.map((c) => ({
                      label: c.client_name,
                      value: c.id?.toString(),
                    }))
                    .find(
                      (option: { label: string; value: string }) =>
                        option.value === selectedId || option.value === selected
                    )}
                />
              </>
            )
          )}

          <button
            className="client_btn_text whitespace-nowrap w-fit"
            onClick={() => setIsOpen(true)}
          >
            <Image src={plus} alt="plus" />
            New Client
          </button>
        </div> :
        <div className="flex items-center">
          {getCreateClientIsLoading === true ? (
            <div className="flex items-center gap-2">
              <FiLoader className="animate-spin" />
              <p>Loading clients...</p>
            </div>
          ) : (
            profile?.clients && (
              <>
                <CustomSelect
                  options={profile?.clients?.map((c) => ({
                    label: c?.client_name,
                    value: c?.id,
                  }))}
                  className="min-w-[150px] z-[20]"
                  placeholder="Select client"
                  onChange={(value: { label: string; value: string } | null) => {
                    if (value) {
                      localStorage.setItem("profileclients", value.value);
                      setSelected(value.value);
                    }
                  }}
                  value={profile?.clients
                    ?.map((c) => ({
                      label: c?.client_name,
                      value: c?.id?.toString(),
                    }))
                    .find(
                      (option: { label: string; value: string }) =>
                        option?.value === selectedId || option?.value === selected
                    )}
                />
              </>
            )
          )}

          <button
            className="client_btn_text whitespace-nowrap w-fit"
            onClick={() => setIsOpen(true)}
          >
            <Image src={plus} alt="plus" />
            New Client
          </button>
        </div>}
      {alert && <AlertMain alert={alert} />}
      <div className="profiledropdown_container_main">
        <div className="profiledropdown_container">
          <Link
            href={`/creation`}
            onClick={() => {
              setCampaignFormData({});
              setActive(0)
              setSubStep(0)
            }}
          >

            {profile?.clients[0]?.id || isAdmin ?
              <button className="new_plan_btn">
                <Image src={white} alt="white" />
                <p className="new_plan_btn_text">New media plan</p>
              </button>
              : <button
                className={`new_plan_btn ${!profile?.clients[0]?.id || !isAdmin ? '!bg-[gray]' : 'new_plan_btn'}`}
                disabled={!profile?.clients[0]?.id || !isAdmin}
              >
                <Image src={white} alt="white" />
                <p className="new_plan_btn_text">New media plan</p>
              </button>}

          </Link>
          <div
            className="profile_container"
            onClick={() => setShow((prev) => !prev)}
          >
            {getFirstLetters(session?.user?.name)}
            {show && (
              <div className="absolute bg-white border shadow-md rounded-[10px] top-[50px]">
                <div
                  className="flex items-center gap-2 cursor-pointer p-2"
                  onClick={async () =>
                    await signOut({
                      callbackUrl: "/",
                    })
                  }
                >
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
