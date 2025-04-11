"use client"

import { useState, useEffect } from "react"
import axios from "axios"

// Define filter types
export type FilterState = {
  year: string | null
  quarter: string | null
  month: string | null
  category: string | null
  product: string | null
  select_plans: string | null
  made_by: string | null
  approved_by: string | null
  channel: string | null
  phase: string | null
  searchQuery: string
}

// Define campaign type (adjust based on your actual data structure)
export type Campaign = {
  id: number
  attributes: {
    name: string
    start_date: string
    end_date: string
    status: string
    // Add other fields as needed
    media_plan_details: any
    budget_details: any
    client_selection: any
    campaign_budget: any
    channel_mix: any
  }
}

export function useCampaignFilters(clientID: string) {
  // State for campaigns and loading
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    year: null,
    quarter: null,
    month: null,
    category: null,
    product: null,
    select_plans: null,
    made_by: null,
    approved_by: null,
    channel: null,
    phase: null,
    searchQuery: "",
  })

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const response = await fetchClientCampaign(clientID)
      setCampaigns(response.data.data)
      setFilteredCampaigns(response.data.data)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  // The main fetch function
  const fetchClientCampaign = async (clientID: string) => {
    return await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?filters[client][$eq]=${clientID}&populate[media_plan_details]=*&populate[budget_details]=*&populate[client_selection]=*&populate[campaign_budget]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      },
    )
  }

  // Enhanced fetch with filters
  const fetchFilteredCampaigns = async () => {
    // Build filter query
    let filterQuery = `filters[client][$eq]=${clientID}`

    // Add additional filters based on state
    if (filters.year) {
      filterQuery += `&filters[year][$eq]=${filters.year}`
    }

    if (filters.quarter) {
      filterQuery += `&filters[quarter][$eq]=${filters.quarter}`
    }

    if (filters.month) {
      filterQuery += `&filters[month][$eq]=${filters.month}`
    }

    if (filters.category) {
      filterQuery += `&filters[category][$eq]=${filters.category}`
    }

    if (filters.product) {
      filterQuery += `&filters[product][$eq]=${filters.product}`
    }

    if (filters.select_plans) {
      filterQuery += `&filters[plan][$eq]=${filters.select_plans}`
    }

    if (filters.made_by) {
      filterQuery += `&filters[created_by][$eq]=${filters.made_by}`
    }

    if (filters.approved_by) {
      filterQuery += `&filters[approved_by][$eq]=${filters.approved_by}`
    }

    if (filters.channel) {
      filterQuery += `&filters[channel_mix][${filters.channel}][$exists]=true`
    }

    if (filters.phase) {
      filterQuery += `&filters[phase][$eq]=${filters.phase}`
    }

    // Add the same populate parameters as in the original query
    const populateQuery = `&populate[media_plan_details]=*&populate[budget_details]=*&populate[client_selection]=*&populate[campaign_budget]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`

    setLoading(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?${filterQuery}${populateQuery}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
        },
      )
      return response.data.data
    } catch (error) {
      console.error("Error fetching filtered campaigns:", error)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Apply filters whenever filters state changes
  useEffect(() => {
    if (Object.values(filters).some((val) => val !== null && val !== "")) {
      // If we have server-side filters, fetch from API
      const fetchData = async () => {
        const data = await fetchFilteredCampaigns()
        setFilteredCampaigns(data)
      }
      fetchData()
    } else {
      // Otherwise just apply client-side filtering (for search)
      applyClientSideFilters()
    }
  }, [filters])

  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns()
  }, [clientID])

  // Client-side filtering for search
  const applyClientSideFilters = () => {
    if (campaigns.length === 0) {
      setFilteredCampaigns([])
      return
    }

    // Filter campaigns based on search query
    let filtered = [...campaigns]

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((campaign) => campaign.attributes.name?.toLowerCase().includes(query))
    }

    setFilteredCampaigns(filtered)
  }

  // Handle filter changes
  const handleFilterChange = (filterName: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      year: null,
      quarter: null,
      month: null,
      category: null,
      product: null,
      select_plans: null,
      made_by: null,
      approved_by: null,
      channel: null,
      phase: null,
      searchQuery: "",
    })
  }

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter((val) => val !== null && val !== "").length

  return {
    campaigns: filteredCampaigns,
    loading,
    filters,
    handleFilterChange,
    clearFilters,
    activeFilterCount,
    refetch: fetchCampaigns,
  }
}
