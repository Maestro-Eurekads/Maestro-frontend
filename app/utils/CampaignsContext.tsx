"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import useCampaignHook from "./useCampaignHook";
import axios from "axios";
import { useSearchParams } from "next/navigation";

// 🎯 Initial Campaign State
const initialState = {
  client_selection: {
    id: "",
    value: "",
  },
  level_1: {
    id: "",
    value: "",
  },
  level_2: {
    id: "",
    value: "",
  },
  level_3: {
    id: "",
    value: "",
  },
  media_plan: "",
  approver: "",
  budget_details_currency: {
    id: "",
    value: "",
  },
  budget_details_fee_type: {
    id: "",
    value: "",
  },
  budget_details_sub_fee_type: "",
  budget_details_value: "",
  campaign_objectives: "",
  funnel_stages: [],
  channel_mix: {},

  campaign_timeline_start_date: "",
  campaign_timeline_end_date: "",
};



// 🎯 Create Context
const CampaignContext = createContext<any>(null);

// 🎯 Provider Component
export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaignFormData, setCampaignFormData] = useState(initialState);
  const [campaignData, setCampaignData] = useState(null);
  const [clientCampaignData, setClientCampaignData] = useState([])
  const [loading, setLoading] = useState(false);
  const query = useSearchParams();
  const cId = query.get("campaignId");
  const { loadingClients, allClients } = useCampaignHook();
  const [copy, setCopy] = useState(campaignFormData)

  const getActiveCampaign = async (docId?: string) => {
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId || docId}?populate[0]=media_plan_details&populate[1]=budget_details&populate[2]=channel_mix&populate[3]=channel_mix.social_media&populate[4]=channel_mix.display_networks&populate[5]=channel_mix.search_engines&populate[6]=channel_mix.social_media.format&populate[7]=channel_mix.display_networks.format&populate[8]=channel_mix.search_engines.format&populate[9]=client_selection&populate[10]=client&populate[11]=channel_mix.social_media.ad_sets&populate[12]=channel_mix.display_networks.ad_sets&populate[13]=channel_mix.search_engines.ad_sets&populate[14]=channel_mix.social_media.budget&populate[15]=channel_mix.display_networks.budget&populate[16]=channel_mix.search_engines.budget&populate[17]=channel_mix.stage_budget&populate[18]=campaign_budget`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        }
      )
      .then((res) => {
        const data = res?.data?.data;
        setCampaignData(data)
        setCampaignFormData((prev) => ({
          ...prev,
          client_selection: {
            id: data?.client?.documentId,
            value: data?.client?.client_name,
          },
          level_1: {
            id: data?.client_selection?.level_1,
            value: data?.client_selection?.level_1,
          },
          level_2: {
            id: data?.client_selection?.level_2,
            value: data?.client_selection?.level_2,
          },
          level_3: {
            id: data?.client_selection?.level_3,
            value: data?.client_selection?.level_3,
          },
          media_plan: data?.media_plan_details?.plan_name,
          approver: data?.media_plan_details?.internal_approver,
          budget_details_currency: {
            id: data?.client?.budget_details?.currency,
            value: data?.client?.budget_details?.currency,
          },
          budget_details_fee_type: {
            id: data?.budget_details?.fee_type,
            value: data?.budget_details?.fee_type,
          },
          budget_details_sub_fee_type:
            data?.budget_details?.sub_fee_type,
          budget_details_value: data?.budget_details?.value,
          campaign_objectives: data?.campaign_objective,
          funnel_stages: data?.funnel_stages || [],
          channel_mix: data?.channel_mix || [],
          campaign_timeline_start_date: data?.campaign_timeline_start_date,
          campaign_timeline_end_date: data?.campaign_timeline_end_date,
          campaign_budget: data?.campaign_budget || {},
          goal_level:data?.goal_level
        }));
      });
  };

  const createCampaign = async () => {
    try {
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

      // Fetch all clients after a successful campaign creation


      return response; // Return API response in case the calling function needs it
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error; // Re-throw to handle errors in calling functions
    }
  };


  const updateCampaign = async (data) => {
    return await axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns/${cId}`,
      {
        data: { ...data },
      }, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      }
    }
    );
  };

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
        setCopy
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

// 🎯 Custom Hook for easy access
export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (!context)
    throw new Error("useCampaigns must be used within a CampaignProvider");
  return context;
};
