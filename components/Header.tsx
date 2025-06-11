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
// import AllClientsCustomDropdown from "./AllClientsCustomDropdown";

const Header = ({ setIsOpen }) => {
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
  } = useCampaigns();

  const { setSelectedDates } = useSelectedDates()

  const { setActive, setSubStep } = useActive();
  const { fetchClientCampaign, fetchClientPOS } = useCampaignHook();
  const dispatch = useAppDispatch();

  const [alert, setAlert] = useState(null);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  const clients: any = getCreateClientData;

  useEffect(() => {
    dispatch(getCreateClient(!isAdmin ? userType : null));

    const timer = setTimeout(() => {
      setAlert(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch, session]);

  //  LocalStorage prioritized
  useEffect(() => {
    if (!userType) return;

    const storedClientId = localStorage.getItem(userType);
    if (storedClientId) {
      setSelectedId(storedClientId);
    } else {
      const fallbackId =
        getCreateClientData?.data?.[0]?.id?.toString() ||
        profile?.clients?.[0]?.id?.toString();
      if (fallbackId) {
        setSelectedId(fallbackId);
      }
    }
  }, [userType, getCreateClientIsLoading, profile?.clients]);

  useEffect(() => {
    if (!clients?.data || clients?.data?.length === 0 || !selectedId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let isMounted = true;

    const clientId = selectedId;
    setSelected(clientId);

    const filteredClient = clients?.data?.find(
      (client) => client?.id === Number(clientId)
    );
    // console.log(clientId);
    fetchClientCampaign(clientId)
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
  }, [clients, selectedId]);


  return (
    <div id="header" className="relative w-full">
      <div className="flex items-center">
        {getCreateClientIsLoading ? (
          <div className="flex items-center gap-2">
            <FiLoader className="animate-spin" />
            <p>Loading clients...</p>
          </div>
        ) : (
          <>
            <CustomSelect
              options={(isAdmin ? clients?.data : profile?.clients)
                ?.filter((c) => !!c?.client_name && !!c?.id && !!c?.createdAt)
                ?.sort(
                  (a, b) =>
                    new Date(b?.createdAt || 0).getTime() -
                    new Date(a?.createdAt || 0).getTime()
                )
                ?.map((c) => ({
                  label: c?.client_name,
                  value: c?.id.toString(),
                }))}
              className="min-w-[150px] z-[20]"
              placeholder="Search or select a client"
              onChange={(value) => {
                if (value) {
                  localStorage.setItem(userType, value?.value);
                  setSelected(value?.value);
                  setSelectedId(value?.value);
                }
              }}
              value={(isAdmin ? clients?.data : profile?.clients)
                ?.map((c) => ({
                  label: c?.client_name,
                  value: c?.id?.toString(),
                }))
                .find(
                  (option) =>
                    option?.value === selectedId || option?.value === selected
                )}
            />


            {(isAdmin ||
              isFinancialApprover ||
              isAgencyApprover) && (
                <button
                  className="client_btn_text whitespace-nowrap w-fit"
                  onClick={() => setIsOpen(true)}
                >
                  <Image src={plus} alt="plus" />
                  New Client
                </button>
              )}

          </>
        )}
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
                  className={`new_plan_btn ${!profile?.clients?.[0]?.id && !isAdmin ? "!bg-[gray]" : ""
                    }`}
                  disabled={!profile?.clients?.[0]?.id && !isAdmin}
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
            {getFirstLetters(session?.user?.name)}

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
    </div>
  );
};

export default Header;
