"use client"

import type React from "react"
import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import useCampaignHook from "./useCampaignHook"

// Type definitions
interface ClientSelection {
  id: string
  value: string
}

interface BusinessLevel {
  id: string
  value: string
}

interface CurrencyOption {
  id: string
  value: string
  label: string
}

interface FeeType {
  id: string
  value: string
}

interface CampaignFormData {
  client_selection: ClientSelection
  level_1: BusinessLevel
  level_2: BusinessLevel
  level_3: BusinessLevel
  media_plan: any
  approver: string
  budget_details_currency: CurrencyOption
  budget_details_fee_type: FeeType
  budget_details_sub_fee_type: any
  budget_details_value: any
  campaign_objective: string
  funnel_stages: any[]
  channel_mix: any[]
  campaign_timeline_start_date: any
  campaign_timeline_end_date: any
  campaign_budget: any
  goal_level: string
  validatedStages:any
}

interface BusinessLevelOptions {
  level1: Array<{ id: string; value: string; label: string }>
  level2: Array<{ id: string; value: string; label: string }>
  level3: Array<{ id: string; value: string; label: string }>
}

interface CampaignContextType {
  loadingClients: boolean
  allClients: any[]
  campaignFormData: any
  setCampaignFormData: any
  createCampaign: () => Promise<any>
  updateCampaign: (data: any) => Promise<any>
  campaignData: any
  cId: string | null
  getActiveCampaign: (docId?: string) => Promise<void>
  clientCampaignData: any[]
  setClientCampaignData: React.Dispatch<React.SetStateAction<any[]>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  setCampaignData: React.Dispatch<React.SetStateAction<any>>
  copy: any
  setCopy: React.Dispatch<React.SetStateAction<any>>
  businessLevelOptions: BusinessLevelOptions
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
  loadingObj: boolean
  objectives: any[]
  buyObj: any[]
  validatedStages?: any;
}

// Initial state
const initialState: CampaignFormData = {
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
  campaign_objective: "",
  funnel_stages: [],
  channel_mix: [],
  campaign_timeline_start_date: "",
  campaign_timeline_end_date: "",
  campaign_budget: {},
  goal_level: "",
  validatedStages: []
}

// Create context
const CampaignContext = createContext<CampaignContextType | null>(null)

// API helpers
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
  },
})

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  // State management
  const [campaignFormData, setCampaignFormData] = useState<any>(initialState)
  const [campaignData, setCampaignData] = useState<any>(null)
  const [clientCampaignData, setClientCampaignData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingObj, setLoadingObj] = useState<boolean>(false)
  const [objectives, setObjectives] = useState<any[]>([])
  const [buyObj, setBuyObj] = useState<any[]>([])
  const [copy, setCopy] = useState<CampaignFormData>(campaignFormData)
  const [businessLevelOptions, setBusinessLevelOptions] = useState<BusinessLevelOptions>({
    level1: [],
    level2: [],
    level3: [],
  })
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  // Hooks
  const query = useSearchParams()
  const cId = query.get("campaignId")
  const { loadingClients: hookLoadingClients, allClients: hookAllClients } = useCampaignHook()

  // Redux selectors
  const reduxClients = useSelector((state: any) => state.client?.getCreateClientData?.data || [])
  const reduxLoadingClients = useSelector((state: any) => state.client?.getCreateClientIsLoading || false)

  // Combine data sources
  const allClients = reduxClients.length > 0 ? reduxClients : hookAllClients
  const loadingClients = reduxLoadingClients || hookLoadingClients

  // Campaign API methods
  const getActiveCampaign = async (docId?: string) => {
    try {
      const campaignId = cId || docId
      if (!campaignId) return

      const populateParams = [
        "media_plan_details",
        "budget_details",
        "channel_mix",
        "channel_mix.social_media",
        "channel_mix.display_networks",
        "channel_mix.search_engines",
        "channel_mix.social_media.format",
        "channel_mix.display_networks.format",
        "channel_mix.search_engines.format",
        "client_selection",
        "client",
        "channel_mix.social_media.ad_sets",
        "channel_mix.display_networks.ad_sets",
        "channel_mix.search_engines.ad_sets",
        "channel_mix.social_media.budget",
        "channel_mix.display_networks.budget",
        "channel_mix.search_engines.budget",
        "channel_mix.stage_budget",
        "campaign_budget",
        "channel_mix.social_media.kpi",
        "channel_mix.display_networks.kpi",
        "channel_mix.search_engines.kpi",
        "channel_mix.social_media.ad_sets.kpi",
        "channel_mix.display_networks.ad_sets.kpi",
        "channel_mix.search_engines.ad_sets.kpi",
        "channel_mix.social_media.ad_sets.budget",
        "channel_mix.display_networks.ad_sets.budget",
        "channel_mix.search_engines.ad_sets.budget",
      ]
        .map((item, index) => `populate[${index}]=${item}`)
        .join("&")

      const res = await apiClient.get(`/campaigns/${campaignId}?${populateParams}`)
      const data = res?.data?.data

      setCampaignData(data)
      updateCampaignFormWithData(data)
    } catch (error) {
      console.error("Error fetching active campaign:", error)
    }
  }

  const updateCampaignFormWithData = (data: any) => {
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
      campaign_objective: data?.campaign_objective || prev.campaign_objective,
      funnel_stages: data?.funnel_stages || prev.funnel_stages,
      channel_mix: data?.channel_mix || prev.channel_mix,
      campaign_timeline_start_date: data?.campaign_timeline_start_date || prev.campaign_timeline_start_date,
      campaign_timeline_end_date: data?.campaign_timeline_end_date || prev.campaign_timeline_end_date,
      campaign_budget: data?.campaign_budget || prev.campaign_budget,
      goal_level: data?.goal_level || prev.goal_level,
    }))
  }

  const createCampaign = async () => {
    try {
      const payload = {
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
      }

      const response = await apiClient.post("/campaigns", payload)
      const data = response?.data?.data

      // Update currency info from response
      updateCurrencyFromResponse(data)

      return response
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw error
    }
  }

  const updateCampaign = async (data: any) => {
    try {
      if (!cId) throw new Error("Campaign ID is required for update")

      const response = await apiClient.put(`/campaigns/${cId}`, { data })
      const responseData = response?.data?.data

      // Update currency info from response
      updateCurrencyFromResponse(responseData)

      return response
    } catch (error) {
      console.error("Error updating campaign:", error)
      throw error
    }
  }

  const updateCurrencyFromResponse = (responseData: any) => {
    if (responseData?.budget_details?.currency) {
      setCampaignFormData((prev) => ({
        ...prev,
        budget_details_currency: {
          id: responseData?.budget_details?.currency || prev.budget_details_currency.id,
          value: responseData?.budget_details?.currency || prev.budget_details_currency.value,
          label: responseData?.budget_details?.currency || prev.budget_details_currency.label,
        },
      }))
    }
  }

  // Data fetching methods
  const fetchBusinessLevelOptions = async (clientId: string) => {
    try {
      const response = await apiClient.get(`/clients/${clientId}?populate=*`)
      const data = response?.data?.data || {}

      setBusinessLevelOptions({
        level1: mapToOptions(data?.level_1),
        level2: mapToOptions(data?.level_2),
        level3: mapToOptions(data?.level_3),
      })
    } catch (error) {
      console.error("Error fetching business level options:", error)
      setBusinessLevelOptions({ level1: [], level2: [], level3: [] })
    }
  }

  const mapToOptions = (items: string[] = []) => {
    return items.map((item: string) => ({
      id: item,
      value: item,
      label: item,
    }))
  }

  const fetchObjectives = async () => {
    setLoadingObj(true)
    try {
      const res = await apiClient.get("/campaign-objectives?populate=*")
      const data = res?.data?.data

      const formattedData = data?.map((d: any) => ({
        id: d?.id,
        title: d?.title,
        description: d?.subtitle,
        icon: d?.icon?.url,
      }))

      setObjectives(formattedData)
    } catch (err) {
      console.error("Error fetching objectives:", err)
    } finally {
      setLoadingObj(false)
    }
  }

  const fetchBuyObjectives = async () => {
    setLoadingObj(true)
    try {
      const res = await apiClient.get("/buy-objectives?populate=*")
      const data = res?.data?.data
      setBuyObj(data)
    } catch (err) {
      console.error("Error fetching buy objectives:", err)
    } finally {
      setLoadingObj(false)
    }
  }

  // Effects
  useEffect(() => {
    const clientId = campaignFormData.client_selection?.id
    if (clientId) {
      fetchBusinessLevelOptions(clientId)
      // Reset level selections when client changes
      setCampaignFormData((prev) => ({
        ...prev,
        level_1: { id: "", value: "" },
        level_2: { id: "", value: "" },
        level_3: { id: "", value: "" },
      }))
    }
  }, [campaignFormData.client_selection?.id])

  useEffect(() => {
    if (cId) {
      getActiveCampaign()
    }
    fetchObjectives()
    fetchBuyObjectives()
  }, [cId])

  // Context value
  const contextValue: CampaignContextType = {
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
    loadingObj,
    objectives,
    buyObj,
  }

  return <CampaignContext.Provider value={contextValue}>{children}</CampaignContext.Provider>
}

export const useCampaigns = () => {
  const context = useContext(CampaignContext)
  if (!context) throw new Error("useCampaigns must be used within a CampaignProvider")
  return context
}

