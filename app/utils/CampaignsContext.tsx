"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import useCampaignHook from "./useCampaignHook";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

const initialState = {
  client_selection: { id: "", value: "" },
  level_1: { id: "", value: "" },
  level_2: { id: "", value: "" },
  level_3: { id: "", value: "" },
  media_plan: "",
  approver: "",
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
};

const CampaignContext = createContext<any>(null);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaignFormData, setCampaignFormData] = useState(initialState);
  const [campaignData, setCampaignData] = useState(null);
  const [clientCampaignData, setClientCampaignData] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { loadingClients: hookLoadingClients, allClients: hookAllClients } = useCampaignHook();

  const reduxClients = useSelector((state: any) => state.client?.getCreateClientData?.data || []);
  const reduxLoadingClients = useSelector((state: any) => state.client?.getCreateClientIsLoading || false);

  const allClients = reduxClients.length > 0 ? reduxClients : hookAllClients;
  const loadingClients = reduxLoadingClients || hookLoadingClients;

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      if (cId) {
        await getActiveCampaign();
      }
      setLoading(false);
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!loadingClients && allClients?.length > 0) {
      console.log("CampaignProvider: allClients updated", allClients);
    }
  }, [allClients, loadingClients]);

  const [copy, setCopy] = useState(campaignFormData);
  const [businessLevelOptions, setBusinessLevelOptions] = useState({
    level1: [],
    level2: [],
    level3: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const getActiveCampaign = async (docId?: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId || docId}?populate[0]=media_plan_details&populate[1]=budget_details&populate[2]=channel_mix&populate[3]=channel_mix.social_media&populate[4]=channel_mix.display_networks&populate[5]=channel_mix.search_engines&populate[6]=channel_mix.social_media.format&populate[7]=channel_mix.display_networks.format&populate[8]=channel_mix.search_engines.format&populate[9]=client_selection&populate[10]=client&populate[11]=channel_mix.social_media.ad_sets&populate[12]=channel_mix.display_networks.ad_sets&populate[13]=channel_mix.search_engines.ad_sets&populate[14]=channel_mix.social_media.budget&populate[15]=channel_mix.display_networks.budget&populate[16]=channel_mix.search_engines.budget&populate[17]=channel_mix.stage_budget&populate[18]=campaign_budget&populate[19]=channel_mix.social_media.kpi&populate[20]=channel_mix.display_networks.kpi&populate[21]=channel_mix.search_engines.kpi&populate[22]=channel_mix.social_media.ad_sets.kpi&populate[23]=channel_mix.display_networks.ad_sets.kpi&populate[24]=channel_mix.search_engines.ad_sets.kpi&populate[25]=channel_mix.social_media.ad_sets.budget&populate[26]=channel_mix.display_networks.ad_sets.budget&populate[27]=channel_mix.search_engines.ad_sets.budget`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      );
      const data = res?.data?.data;
      setCampaignData(data);
      setCampaignFormData((prev) => ({
        ...prev,
        client_selection: {
          id: data?.client?.documentId || prev.client_selection.id,
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
        budget_details_currency: {
          id: data?.budget_details?.currency || prev.budget_details_currency.id,
          value: data?.budget_details?.currency || prev.budget_details_currency.value,
          label: data?.budget_details?.currency || prev.budget_details_currency.label,
        },
        budget_details_fee_type: {
          id: data?.budget_details?.fee_type || prev.budget_details_fee_type.id,
          value: data?.budget_details?.fee_type || prev.budget_details_fee_type.value,
        },
        budget_details_sub_fee_type: data?.budget_details?.sub_fee_type || prev.budget_details_sub_fee_type,
        budget_details_value: data?.budget_details?.value || prev.budget_details_value,
        campaign_objectives: data?.campaign_objective || prev.campaign_objectives,
        funnel_stages: data?.funnel_stages || prev.funnel_stages,
        channel_mix: data?.channel_mix || prev.channel_mix,
        campaign_timeline_start_date: data?.campaign_timeline_start_date || prev.campaign_timeline_start_date,
        campaign_timeline_end_date: data?.campaign_timeline_end_date || prev.campaign_timeline_end_date,
        campaign_budget: data?.campaign_budget || prev.campaign_budget,
        goal_level: data?.goal_level || prev.goal_level,
      }));
    } catch (error) {
      console.error("Error fetching active campaign:", error);
    } finally {
      setLoading(false);
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
            },
            budget_details: {
              currency: campaignFormData?.budget_details_currency?.id,
              fee_type: campaignFormData?.budget_details_fee_type?.id,
              sub_fee_type: campaignFormData?.budget_details_sub_fee_type,
              value: campaignFormData?.budget_details_value,
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
      setCampaignFormData((prev) => ({
        ...prev,
        budget_details_currency: {
          id: data?.budget_details?.currency || prev.budget_details_currency.id,
          value: data?.budget_details?.currency || prev.budget_details_currency.value,
          label: data?.budget_details?.currency || prev.budget_details_currency.label,
        },
      }));
      return response;
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

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
      setCampaignFormData((prev) => ({
        ...prev,
        budget_details_currency: {
          id: responseData?.budget_details?.currency || prev.budget_details_currency.id,
          value: responseData?.budget_details?.currency || prev.budget_details_currency.value,
          label: responseData?.budget_details?.currency || prev.budget_details_currency.label,
        },
      }));
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
        level1: data?.level_1?.map((item: string) => ({ id: item, value: item, label: item })) || [],
        level2: data?.level_2?.map((item: string) => ({ id: item, value: item, label: item })) || [],
        level3: data?.level_3?.map((item: string) => ({ id: item, value: item, label: item })) || [],
      });
    } catch (error) {
      console.error("Error fetching business level options:", error);
      setBusinessLevelOptions({ level1: [], level2: [], level3: [] });
    } finally {
      setLoading(false);
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
    if (cId) {
      getActiveCampaign();
    }
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
        setIsLoggedIn
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaigns must be used within a CampaignProvider");
  return context;
};