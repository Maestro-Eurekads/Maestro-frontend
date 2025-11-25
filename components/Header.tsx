"use client";
import Image from "next/image";
import plus from "../public/plus.svg";
import white from "../public/white-plus.svg";
import Link from "next/link";
import { useCampaigns } from "../app/utils/CampaignsContext";
import { FiLoader } from "react-icons/fi";
import useCampaignHook from "../app/utils/useCampaignHook";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "store/useStore";
import AlertMain from "./Alert/AlertMain";
import { getCreateClient } from "features/Client/clientSlice"; // Removed unused 'reset'
import { signOut, useSession } from "next-auth/react";
import { CustomSelect } from "app/homepage/components/CustomReactSelect";
import { useActive } from "app/utils/ActiveContext";
import {
  extractAprroverFilters,
  extractChannelAndPhase,
  extractDateFilters,
  extractLevelFilters,
  extractLevelNameFilters,
} from "app/utils/campaign-filter-utils";
import { useUserPrivileges } from "utils/userPrivileges";
import { getFirstLetters } from "./Options";
import { useSelectedDates } from "app/utils/SelectedDatesContext";
import { toast } from "sonner";
// import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen, setIsView }) => {
  const { data: session } = useSession();

  if (!session) return null;
  // @ts-ignore
  const userType = session?.user?.data?.user?.id?.toString() || "";
  const { isAdmin, isAgencyApprover, isFinancialApprover, isAgencyCreator } =
    useUserPrivileges();

  const { getCreateClientData, getCreateClientIsLoading } = useAppSelector(
    (state) => state.client
  );

  const {
    setClientCampaignData,
    setLoading,
    setCampaignFormData,
    setClientPOs,
    setFetchingPO,
    setFilterOptions,
    profile,
    setSelectedFilters,
    jwt,
    agencyId,
    selectedClient,
    setSelectedClient,
    selectedId,
    setSelectedId,
    setFC,
    FC
  } = useCampaigns();
  const profileClients: any = profile?.clients || [];

  const { setSelectedDates } = useSelectedDates()

  const { setActive, setSubStep } = useActive();
  const { fetchClientCampaign, fetchClientPOS } = useCampaignHook();
  const dispatch = useAppDispatch();

  const [alert, setAlert] = useState(null);

  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState("");







  useEffect(() => {
    setActive(0);
    if (profile && agencyId) {
      dispatch(getCreateClient({ userId: isAdmin ? null : userType, jwt, agencyId }));

      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);

      return () => clearTimeout(timer);

    }
  }, [dispatch, session, profile, agencyId, userType]);


  //  LocalStorage prioritized
  useEffect(() => {
    setActive(0);
    if (!userType) return;

    const storedClientId = localStorage.getItem(userType);
    if (storedClientId) {
      setSelectedId(storedClientId);
      setSelectedClient(storedClientId);
    } else {
      const fallbackId =
        profileClients?.[0]?.id?.toString() ||
        profileClients?.[0]?.id?.toString();
      if (fallbackId) {
        setSelectedId(fallbackId);
        setSelectedClient(fallbackId);
      }
    }
  }, [userType, profileClients]);



  useEffect(() => {
    setActive(0);
    if (!profileClients || profileClients?.length === 0 || !selectedId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let isMounted = true;

    const clientId = selectedId;
    setSelected(clientId);

    const filteredClient = profileClients?.find(
      (client) => client?.id === Number(clientId)
    );

    if (filteredClient) {
      setFC(filteredClient);
      localStorage.setItem(`filteredClient`, JSON.stringify(filteredClient));
    } else {
      // fallback from localStorage if available
      const cachedFC = localStorage.getItem(`filteredClient`);
      if (cachedFC) {
        setFC(JSON.parse(cachedFC));
      }
    }

    fetchClientCampaign(clientId, agencyId)
      .then((res) => {
        const campaigns = res?.data?.data || [];

        if (isMounted) setClientCampaignData(campaigns);

        const dateData = extractDateFilters(campaigns);
        const mediaData = extractAprroverFilters(campaigns);
        const channelData = extractChannelAndPhase(campaigns);
        const levelData = extractLevelFilters(campaigns);
        const levelNames = extractLevelNameFilters(filteredClient);

        setFilterOptions((prev) => ({
          ...prev,
          ...dateData,
          ...mediaData,
          ...channelData,
          ...levelData,
          ...levelNames,
        }));

        fetchClientPOS(clientId)
          .then((res) => {
            setClientPOs(res?.data?.data || []);
          })
          .catch((err) => console.error("Error fetching client POS:", err))
          .finally(() => setFetchingPO(false));
      })
      .catch((err) => console.error("Error fetching client campaigns:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    setFetchingPO(true);
    setSelectedFilters({});

    return () => {
      isMounted = false;
    };
  }, [profileClients, selectedId]);



  return (
    <div id="header" className="relative w-full">
      <div className="flex items-center">
        <>
          <CustomSelect
            options={(profileClients)
              ?.filter((c) => !!c?.client_name && !!c?.id && !!c?.createdAt)
              // ?.sort(
              //  (a, b) =>
              //   new Date(b?.createdAt || 0).getTime() -
              //   new Date(a?.createdAt || 0).getTime()
              // )
              ?.map((c) => ({
                label: c?.client_name,
                value: c?.id.toString(),
              }))}
            className="min-w-[150px] z-[20]"
            placeholder="Search"
            onChange={(value) => {
              if (value) {
                localStorage.removeItem("campaignFormData")
                localStorage.setItem(userType, value?.value);
                setSelected(value?.value);
                setSelectedId(value?.value);
                setSelectedClient(value?.value);
              }
            }}
            value={(profileClients)
              ?.map((c) => ({
                label: c?.client_name,
                value: c?.id?.toString(),
              }))
              .find(
                (option) =>
                  option?.value === selectedId || option?.value === selected
              )}
          />

          <button
            className={`new_plan_btn ml-8 mr-4 ${(!profileClients || !selectedId)
              ? "!bg-gray-400 cursor-not-allowed"
              : ""
              }`}
            disabled={!profileClients || !selectedId}
            onClick={() => {
              if (isAgencyCreator) {
                toast.error("You do not have permission to perform this action.");
                return;
              }
              setIsView(true);
            }}
          >
            <p className="new_plan_btn_text">View Client</p>
          </button>


          {(isAdmin || isFinancialApprover || isAgencyApprover) && (
            <button
              className="client_btn_text whitespace-nowrap w-fit"
              onClick={() => { setIsOpen(true) }}  >
              <Image src={plus} alt="plus" />
              New Client
            </button>
          )}


        </>

      </div>

      {alert && <AlertMain alert={alert} />}

      <div className="profiledropdown_container_main">
        <div className="profiledropdown_container">
          {(isAdmin ||
            isFinancialApprover ||
            isAgencyApprover ||
            isAgencyCreator) && (
              <Link
                href={`/creation`}
                onClick={() => {
                  setCampaignFormData({});
                  setActive(0);
                  setSubStep(0);
                  setSelectedDates({
                    from: null,
                    to: null
                  })
                }}>
                <button
                  className={`new_plan_btn ${!profileClients || !selectedId ? "!bg-gray-400" : ""
                    }`}
                  disabled={!profileClients || !selectedId}
                >
                  <Image src={white} alt="white" />
                  <p className="new_plan_btn_text">New media plan</p>
                </button>
              </Link>
            )}

          <div
            className="profile_container"
            onClick={() => setShow((prev) => !prev)}
          >
            <p className="capitalize">

              {getFirstLetters(session?.user?.name)}
            </p>


            {show && (
              <div className="absolute right-0 top-[60px] w-[200px] bg-white border border-gray-200   shadow-lg z-50 !rounded-[5px]">
                <div className="absolute top-[-4px] right-5 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-200"></div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate mb-3">
                    {session?.user?.email || "??"}
                  </p>
                  <button
                    onClick={async () => {
                      localStorage.removeItem("campaignFormData");
                      localStorage.removeItem("selectedClient");
                      localStorage.removeItem("profileclients");
                      localStorage.removeItem(userType || "");
                      await signOut({
                        callbackUrl: "/",
                      });
                    }}
                    className="w-full px-4 py-2 text-sm text-white !bg-[#3175FF]   hover:bg-blue-700 !rounded-[5px]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default Header;
