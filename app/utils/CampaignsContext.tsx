"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import useCampaignHook from "./useCampaignHook";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { channelMixPopulate } from "utils/fetcher";
import { signOut, useSession } from "next-auth/react";
import { updateUsersWithCampaign } from "app/homepage/functions/clients";
import { extractObjectives, getFilteredMetrics } from "app/creation/components/EstablishedGoals/table-view/data-processor";
import { useUserPrivileges } from "utils/userPrivileges";

// Get initial state from localStorage if available
const getInitialState = () => {
  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("campaignFormData");
    if (savedState) {
      return JSON.parse(savedState);
    }
  }

  return {
    client_selection: { id: "", value: "" },
    level_1: { id: "", value: "" },
    media_plan: "",
    internal_approver: [],
    client_approver: [],
    campaign_builder: "",
    budget_details_currency: { id: "", value: "", label: "" },
    budget_details_fee_type: { id: "", value: "" },
    budget_details_sub_fee_type: "",
    budget_details_value: "",
    country_details: { id: "", value: "" },
    campaign_objectives: "",
    funnel_stages: [],
    channel_mix: {},
    campaign_timeline_start_date: "",
    campaign_timeline_end_date: "",
    campaign_budget: {},
    goal_level: "",
    validatedStages: {},
    campaign_id: {},
  };
};



const CampaignContext = createContext<any>(null);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const id = (session?.user as { id?: string })?.id;
  const jwt = (session?.user as { data?: { jwt: string } })?.data?.jwt;
  const campaign_builder = session?.user;
  const [campaignFormData, setCampaignFormData] = useState(getInitialState());
  const [campaignData, setCampaignData] = useState(null);
  const [clientCampaignData, setClientCampaignData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(false);
  const [getloading, setgetLoading] = useState(false);
  const [profile, setGetProfile] = useState(null);
  const [isEditingBuyingObjective, setIsEditingBuyingObjective] =
    useState(false);
  const [selectedOption, setSelectedOption] = useState("percentage");
  const [requiredFields, setRequiredFields] = useState([]);
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { loadingClients: hookLoadingClients, allClients: hookAllClients } =
    useCampaignHook();
  const [FC, setFC] = useState(null);
  const [loadingObj, setLoadingObj] = useState(false);
  const [platformList, setPlatformList] = useState({});
  const [objectives, setObjectives] = useState([]);
  const [buyObj, setBuyObj] = useState([]);
  const [buyType, setBuyType] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);
  const [fetchingPO, setFetchingPO] = useState(false);
  const [isStepZeroValid, setIsStepZeroValid] = useState(false);
  const [currencySign, setCurrencySign] = useState("");
  const { loggedInUser } = useUserPrivileges()
  const [user, setUser] = useState(null);
  const [headerData, setHeaderData] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    year: [],
    quarter: [],
    month: [],
    level_1: [],
    made_by: [],
    approved_by: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({});
  const [clientUsers, setClientUsers] = useState([]);
  const [agencyId, setAgencyId] = useState<string | number | null>(null);
  const [selectedClient, setSelectedClient] = useState()
  const [agencyData, setAgencyData] = useState(null);
  const [selectedId, setSelectedId] = useState<string>("");


  const reduxClients = useSelector(
    (state: any) => state.client?.getCreateClientData?.data || []
  );
  const reduxLoadingClients = useSelector(
    (state: any) => state.client?.getCreateClientIsLoading || false
  );

  const allClients = reduxClients?.length > 0 ? reduxClients : hookAllClients;
  const loadingClients = reduxLoadingClients || hookLoadingClients || false;

  // Save form data to localStorage with debounce
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timeout = setTimeout(() => {
        localStorage.setItem(
          "campaignFormData",
          JSON.stringify(campaignFormData)
        );
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [campaignFormData]);

  const [businessLevelOptions, setBusinessLevelOptions] = useState({
    level1: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getActiveCampaign = useCallback(
    async (docId?: string) => {
      const campaignId = cId || docId;
      if (!campaignId) return;

      try {
        setLoadingCampaign(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${campaignId}`,
          {
            params: {
              populate: {
                client: true,
                campaign_builder: true,
                media_plan_details: {
                  populate: {
                    internal_approver: {
                      populate: "user",
                    },
                    client_approver: {
                      populate: "user",
                    },
                  },
                },
                budget_details: "*",
                client_selection: "*",
                user: true,
                campaign_budget: { populate: ["budget_fees"] },
                channel_mix: {
                  populate: { ...channelMixPopulate, stage_budget: "*" },
                },
              },
            },
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        const data = res?.data?.data;

        if (!data) return;
        // const obj = await extractObjectives(campaignFormData);
        // const sMetrics = await getFilteredMetrics(obj)
        setCampaignData(data);
        setHeaderData(data?.table_headers || {});
        setCampaignFormData((prev) => ({
          ...prev,
          client_selection: {
            id: data?.client?.documentId ?? prev?.client_selection?.id,
            value: data?.client?.client_name ?? prev?.client_selection?.value,
          },
          level_1: {
            id: data?.client_selection?.level_1 ?? prev.level_1?.id,
            value: data?.client_selection?.level_1 ?? prev.level_1?.value,
          },
          media_plan: data?.media_plan_details?.plan_name ?? prev.media_plan,
          budget_details_currency: {
            id: data?.budget_details?.currency,
            value: data?.budget_details?.currency,
          },
          country_details: {
            id: data?.budget_details?.value,
            value: data?.budget_details?.value,
          },
          internal_approver:
            data?.media_plan_details?.internal_approver ??
            prev.internal_approver,
          client_approver:
            data?.media_plan_details?.client_approver ?? prev.client_approver,
          campaign_objectives:
            data?.campaign_objective ?? prev.campaign_objectives,
          funnel_stages: data?.funnel_stages ?? prev.funnel_stages,
          channel_mix: data?.channel_mix ?? prev.channel_mix,
          campaign_timeline_start_date:
            data?.campaign_timeline_start_date ??
            prev.campaign_timeline_start_date,
          campaign_timeline_end_date:
            data?.campaign_timeline_end_date ?? prev.campaign_timeline_end_date,
          campaign_budget: data?.campaign_budget ?? prev.campaign_budget,
          goal_level: data?.goal_level ?? prev.goal_level,
          progress_percent: data?.progress_percent ?? prev.progress_percent,
          custom_funnels: data?.custom_funnels ?? prev.custom_funnels,
          campaign_builder: data?.campaign_builder ?? prev.campaign_builder,
          user: data?.user ?? prev.user,
          campaign_id: data?.id ?? prev.id,
          isApprove: data?.isApprove,
          table_headers:
            ((data?.table_headers || {}) ??
              (prev?.table_headers)) ||
            {},
          selected_metrics: ((data?.selected_metrics || {}) ?? (prev?.selected_metrics)) || {},
        }));
        setLoadingCampaign(false);
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }

      } finally {
        setLoadingCampaign(false);
      }
    },
    [cId]
  );

  const createCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
        {
          data: {
            //@ts-ignore
            campaign_builder: loggedInUser?.id,
            client: campaignFormData?.client_selection?.id,
            client_selection: {
              client: campaignFormData?.client_selection?.value,
              level_1: campaignFormData?.level_1?.id,
            },
            media_plan_details: {
              plan_name: campaignFormData?.media_plan,
              internal_approver: campaignFormData?.internal_approver?.map(
                (ff) => ff?.value
              ),
              client_approver: campaignFormData?.client_approver?.map(
                (ff) => ff?.value
              ),
            },
            agency_profile: agencyId
          },
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      await updateUsersWithCampaign(
        clientUsers?.map((uu) => uu?.id),
        response?.data?.data?.id,
        jwt
      );
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [campaignFormData]);

  const getProfile = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/get-profile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setGetProfile(response?.data);


      const aId =
        response?.data?.user_type === "admin"
          ? response?.data?.admin?.agency?.id
          : response?.data?.user_type?.includes("cleint")
            ? response?.data?.cleint_user?.agency?.id
            : response?.data?.agency_user?.agency?.id;
      //console.log("agencyId", aId);
      setAgencyId(aId);
      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getAgency = useCallback(async () => {
    // get-agency-profile
    if (!agencyId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/get-agency-profile/${agencyId}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setAgencyData(response?.data);

      return response;
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  const updateCampaign = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
          { data },
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        return response;
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cId]
  );

  // const fetchBusinessLevelOptions = useCallback(async (clientId: string) => {
  //   if (!clientId) return;
  //   try {
  //     setLoading(true);
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}?populate=*`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${jwt}`,
  //         },
  //       }
  //     );
  //     const data = response?.data?.data || {};
  //     //console.log("Client Architecture Options Data:", data);
  //     setBusinessLevelOptions({
  //       level1:
  //         data?.level_1?.map((item: string) => ({
  //           id: item,
  //           value: item,
  //           label: item,
  //         })) || [],  
  //     });
  //   } catch (error) {
  //     console.error("Error fetching Client Architecture options:", error);
  //     setBusinessLevelOptions({ level1: [], level2: [], level3: [] });
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchObjectives = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const data = res?.data?.data;
      const formattedData = data?.map((d: any) => ({
        id: d?.id,
        title: d?.title,
        description: d?.subtitle,
        icon: d?.icon?.url,
      }));
      setObjectives(formattedData);
    } catch (err) {
      console.error("Error fetching objectives:", err);
    } finally {
      setLoadingObj(false);
    }
  }, []);

  const fetchBuyObjectives = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setBuyObj(res?.data?.data);
    } catch (err) {
      console.error("Error fetching buy objectives:", err);
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, []);

  const fetchBuyTypes = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-types?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setBuyType(res?.data?.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, []);

  const getUserByUserType = async (userTypes) => {
    setgetLoading(true);
    try {
      const queryString = userTypes
        .map((type) => `filters[user_type][$in]=${type}`)
        .join("&");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/users?${queryString}&pagination[page]=1&pagination[pageSize]=100`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      const users = response.data;
      setUser(users);
    } catch (error) {
      if (error?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }

    } finally {
      setgetLoading(false);
    }
  };

  const organizeAdvertisingPlatforms = useCallback((data) => {
    const result = {
      online: {
        social_media: [],
        display_networks: [],
        search_engines: [],
        e_commerce: [],
        streaming: [],
        mobile: [],
        ooh: [],
        print: [],
        broadcast: [],
        messaging: [],
        in_game: [],
      },
      offline: {
        social_media: [],
        display_networks: [],
        search_engines: [],
        e_commerce: [],
        streaming: [],
        mobile: [],
        ooh: [],
        print: [],
        broadcast: [],
        messaging: [],
        in_game: [],
      },
    };

    data.forEach((platform) => {
      const typeCategory = platform.type.toLowerCase();
      let channelType = platform.channel_type
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (channelType === "in-game") channelType = "in_game";
      if (channelType === "e-commerce") channelType = "e_commerce";
      if (result[typeCategory] && result[typeCategory][channelType]) {
        result[typeCategory][channelType].push({
          id: platform.id,
          documentId: platform.documentId,
          platform_name: platform.platform_name,
          description: platform.description,
        });
      }
    });

    return result;
  }, []);

  const fetchPlatformLists = useCallback(async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/platform-lists?pagination[pageSize]=200`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const data = res?.data?.data;
      const organizedPlatforms = organizeAdvertisingPlatforms(data);
      setPlatformList(organizedPlatforms);
    } catch (err) {
      if (err?.response?.status === 401) {
        const event = new Event("unauthorizedEvent");
        window.dispatchEvent(event);
      }
    } finally {
      setLoadingObj(false);
    }
  }, [organizeAdvertisingPlatforms]);

  // FetchClient Architecture options when client selection changes
  // useEffect(() => {
  //   // const clientId = campaignFormData?.client_selection?.id;
  //   if (selectedClient) {
  //     fetchBusinessLevelOptions(selectedClient);
  //     setCampaignFormData((prev) => ({
  //       ...prev,
  //       level_1: { id: "", value: "" },
  //     }));
  //   }
  // }, [selectedClient, fetchBusinessLevelOptions]);

  // Initial data fetching



  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          id && getProfile(),
          agencyId && getAgency(),
          cId && getActiveCampaign(),
          fetchBuyObjectives(),
          fetchObjectives(),
          fetchPlatformLists(),
          fetchBuyTypes(),
        ]);
      } catch (error) {
        if (error?.response?.status === 401) {
          const event = new Event("unauthorizedEvent");
          window.dispatchEvent(event);
        }
      }
    };
    if (jwt) {
      fetchInitialData();
    }
  }, [
    cId,
    id,
    getProfile,
    getActiveCampaign,
    fetchBuyObjectives,
    fetchObjectives,
    fetchPlatformLists,
    fetchBuyTypes,
    jwt,
    agencyId
  ]);

  const contextValue = useMemo(
    () => ({
      loadingClients,
      allClients,
      campaignFormData,
      setCampaignFormData,
      createCampaign,
      updateCampaign,
      campaignData,
      cId,
      getActiveCampaign,
      getUserByUserType,
      getloading,
      clientCampaignData,
      setClientCampaignData,
      loading,
      setLoading,
      setCampaignData,
      businessLevelOptions,
      isLoggedIn,
      setIsLoggedIn,
      platformList,
      loadingObj,
      buyObj,
      objectives,
      buyType,
      setBuyObj,
      setBuyType,
      clientPOs,
      setClientPOs,
      fetchingPO,
      setFetchingPO,
      filterOptions,
      setFilterOptions,
      selectedFilters,
      setSelectedFilters,
      isLoading,
      setIsLoading,
      profile,
      loadingCampaign,
      setLoadingCampaign,
      getProfile,
      isEditingBuyingObjective,
      setIsEditingBuyingObjective,
      isStepZeroValid,
      setIsStepZeroValid,
      selectedOption,
      setSelectedOption,
      requiredFields,
      setRequiredFields,
      currencySign,
      setCurrencySign,
      user,
      setClientUsers,
      clientUsers,
      jwt,
      agencyId,
      selectedClient,
      setSelectedClient,
      selectedId,
      setSelectedId,
      FC,
      setFC,
      agencyData,
      setAgencyData
    }),
    [
      getUserByUserType,
      loadingClients,
      allClients,
      campaignFormData,
      campaignData,
      cId,
      clientCampaignData,
      loading,
      isLoading,
      loadingCampaign,
      businessLevelOptions,
      isLoggedIn,
      platformList,
      loadingObj,
      buyObj,
      objectives,
      buyType,
      clientPOs,
      fetchingPO,
      filterOptions,
      selectedFilters,
      profile,
      isEditingBuyingObjective,
      isStepZeroValid,
      setIsStepZeroValid,
      selectedOption,
      setSelectedOption,
      requiredFields,
      setRequiredFields,
      currencySign,
      setCurrencySign,
      user,
      setClientUsers,
      clientUsers,
      agencyId,
      selectedClient,
      setSelectedClient,
      selectedId,
      setSelectedId,
      FC,
      setFC,
      agencyData,
      setAgencyData
    ]
  );

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context)
    throw new Error("useCampaigns must be used within a CampaignProvider");
  return context;
};
