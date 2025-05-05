"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import useCampaignHook from "./useCampaignHook";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { channelMixPopulate } from "utils/fetcher";
import { useSession } from "next-auth/react";

// Get initial state from localStorage if available
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('campaignFormData');
    if (savedState) {
      return JSON.parse(savedState);
    }
  }

  return {
    client_selection: { id: "", value: "" },
    level_1: { id: "", value: "" },
    level_2: { id: "", value: "" },
    level_3: { id: "", value: "" },
    media_plan: "",
    approver: "",
    client_approver: "",
    budget_details_currency: { id: "", value: "", label: "" },
    budget_details_fee_type: { id: "", value: "" },
    budget_details_sub_fee_type: "",
    budget_details_value: "",
    campaign_objectives: "",
    funnel_stages: [],
    channel_mix: {},
    campaign_timeline_start_date: "",
    campaign_timeline_end_date: "",
    campaign_budget: {},
    goal_level: "",
    validatedStages: {},
  };
};

const CampaignContext = createContext<any>(null);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const token = useSession();
  const id = (token?.data?.user as { id?: string })?.id;
  const [campaignFormData, setCampaignFormData] = useState(getInitialState());
  const [campaignData, setCampaignData] = useState(null);
  const [clientCampaignData, setClientCampaignData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(true)
  const [profile, setGetProfile] = useState(null);
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { loadingClients: hookLoadingClients, allClients: hookAllClients } =
    useCampaignHook();
  const [loadingObj, setLoadingObj] = useState(false);
  const [platformList, setPlatformList] = useState({});
  const [objectives, setObjectives] = useState([]);
  const [buyObj, setBuyObj] = useState([]);
  const [buyType, setBuyType] = useState([]);
  const [clientPOs, setClientPOs] = useState([]);
  const [fetchingPO, setFetchingPO] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    year: [],
    quarter: [],
    month: [],
    category: [],
    product: [],
    select_plans: [],
    made_by: [],
    approved_by: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({});

  const reduxClients = useSelector(
    (state: any) => state.client?.getCreateClientData?.data || []
  );
  const reduxLoadingClients = useSelector(
    (state: any) => state.client?.getCreateClientIsLoading || false
  );

  const allClients = reduxClients.length > 0 ? reduxClients : hookAllClients;
  const loadingClients = reduxLoadingClients || hookLoadingClients || false;

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campaignFormData', JSON.stringify(campaignFormData));
    }
  }, [campaignFormData]);

  // Initialize data on mount
  // useEffect(() => {
  //   const initializeData = async () => {
  //     if (cId) {
  //       await getActiveCampaign();
  //     }
  //     setLoading(false);
  //   };

  //   initializeData();
  // }, []);



  useEffect(() => {
    if (!loadingClients && allClients?.length > 0) {
    }
  }, [allClients, loadingClients]);

  const [copy, setCopy] = useState(campaignFormData);
  const [businessLevelOptions, setBusinessLevelOptions] = useState({
    level1: [],
    level2: [],
    level3: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getActiveCampaign = async (docId?: string) => {
    try {
      setLoadingCampaign(true);
      // const res = await axios.get(
      //   `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId || docId
      //   }?populate=client&populate[media_plan_details]=*&populate[budget_details]=*&populate[client_selection]=*&populate[campaign_budget][populate][budget_fees]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      //     },
      //   }
      // );
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId || docId}`,
        {
          params: {
            populate: {
              client: true,
              media_plan_details: '*',
              budget_details: '*',
              client_selection: '*',
              campaign_budget: {
                populate: ['budget_fees'],
              },
              channel_mix: {
                populate: {
                  ...channelMixPopulate,
                  stage_budget: "*"
                },
              },
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      console.log("🚀 ~ getActiveCampaign ~ data:", JSON.stringify(data, null, 2))

      setCampaignData(data);
      setCampaignFormData((prev) => ({
        ...prev,
        client_selection: {
          id: data?.client?.documentId || prev?.client_selection?.id,
          value: data?.client?.client_name || prev.client_selection.value,
        },
        level_1: {
          id: data?.client_selection?.level_1 || prev.level_1.id,
          value: data?.client_selection?.level_1 || prev.level_1.value,
        },
        level_2: {
          id: data?.client_selection?.level_2 || prev.level_2.id,
          value: data?.client_selection?.level_2 || prev.level_2.value,
        },
        level_3: {
          id: data?.client_selection?.level_3 || prev.level_3.id,
          value: data?.client_selection?.level_3 || prev.level_3.value,
        },
        media_plan: data?.media_plan_details?.plan_name || prev.media_plan,
        approver: data?.media_plan_details?.internal_approver || prev.approver,
        campaign_objectives:
          data?.campaign_objective || prev.campaign_objectives,
        funnel_stages: data?.funnel_stages || prev.funnel_stages,
        channel_mix: data?.channel_mix || prev.channel_mix,
        campaign_timeline_start_date:
          data?.campaign_timeline_start_date ||
          prev.campaign_timeline_start_date,
        campaign_timeline_end_date:
          data?.campaign_timeline_end_date || prev.campaign_timeline_end_date,
        campaign_budget: data?.campaign_budget || prev.campaign_budget,
        goal_level: data?.goal_level || prev.goal_level,
        progress_percent: data?.progress_percent,
        custom_funnels: data?.custom_funnels
      }));
    } catch (error) {
      console.error("Error fetching active campaign:", error);
    } finally {
      setLoadingCampaign(false);
    }
  };

  const createCampaign = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
        {
          data: {
            client: campaignFormData?.client_selection?.id,
            client_selection: {
              client: campaignFormData?.client_selection?.value,
              level_1: campaignFormData?.level_1?.id,
              level_2: campaignFormData?.level_2?.id,
              level_3: campaignFormData?.level_3?.id,
            },
            media_plan_details: {
              plan_name: campaignFormData?.media_plan,
              internal_approver: campaignFormData?.approver,
              client_approver: campaignFormData?.client_approver,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = response?.data?.data;
      return response;
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${id}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      const responseData = response?.data;
      setGetProfile(responseData);
      return response;
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }


  const updateCampaign = async (data) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
        { data },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );

      const responseData = response?.data?.data;
      return response;
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessLevelOptions = async (clientId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = response?.data?.data || {};
      setBusinessLevelOptions({
        level1:
          data?.level_1?.map((item: string) => ({
            id: item,
            value: item,
            label: item,
          })) || [],
        level2:
          data?.level_2?.map((item: string) => ({
            id: item,
            value: item,
            label: item,
          })) || [],
        level3:
          data?.level_3?.map((item: string) => ({
            id: item,
            value: item,
            label: item,
          })) || [],
      });
    } catch (error) {
      console.error("Error fetching business level options:", error);
      setBusinessLevelOptions({ level1: [], level2: [], level3: [] });
    } finally {
      setLoading(false);
    }
  };

  const fetchObjectives = async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaign-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
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
  };

  const fetchBuyObjectives = async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-objectives?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      setBuyObj(data);
    } catch (err) {
      console.error("Error fetching buy objectives:", err);
    } finally {
      setLoadingObj(false);
    }
  };

  const fetchBuyTypes = async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/buy-types?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      setBuyType(data);
    } catch (err) {
      console.error("Error fetching buy objectives:", err);
    } finally {
      setLoadingObj(false);
    }
  };

  function organizeAdvertisingPlatforms(data) {
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

      if (channelType === "in-game") {
        channelType = "in_game";
      }

      if (channelType === "e-commerce") {
        channelType = "e_commerce";
      }

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
  }

  const fetchPlatformLists = async () => {
    setLoadingObj(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/platform-lists?pagination[pageSize]=200`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      const organizedPlatforms = organizeAdvertisingPlatforms(data);
      setPlatformList(organizedPlatforms);
    } catch (err) {
      console.error("Error fetching buy objectives:", err);
    } finally {
      setLoadingObj(false);
    }
  };

  useEffect(() => {
    const clientId = campaignFormData.client_selection?.id;
    if (clientId) {
      fetchBusinessLevelOptions(clientId);
      setCampaignFormData((prev) => ({
        ...prev,
        level_1: { id: "", value: "" },
        level_2: { id: "", value: "" },
        level_3: { id: "", value: "" },
      }));
    }
  }, [campaignFormData.client_selection?.id]);

  useEffect(() => {
    getProfile();

    if (cId) {
      getActiveCampaign();
    }
    fetchBuyObjectives();
    fetchObjectives();
    fetchPlatformLists();
    fetchBuyTypes();
  }, [cId]);



  return (
    <CampaignContext.Provider
      value={{
        loadingClients,
        allClients,
        campaignFormData,
        setCampaignFormData,
        createCampaign,
        updateCampaign,
        campaignData,
        cId,
        getActiveCampaign,
        clientCampaignData,
        setClientCampaignData,
        loading,
        setLoading,
        setCampaignData,
        copy,
        setCopy,
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
        getProfile
      }}
    >
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
