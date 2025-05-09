import axios from "axios"
import type { FilterState } from "./useCampaignFilters"

// Build Strapi filter query string from filter state
export function buildStrapiFilterQuery(clientID: string, filters: FilterState): string {
  // Start with the client filter - this is always required
  let filterQuery = `filters[client][$eq]=${clientID}`

  // Track if we have any filters to apply with $or logic
  let hasOrFilters = false
  let orFilterIndex = 0

  // Add filters using $or logic between different filter types
  if (filters.year) {
    filterQuery += `&filters[$or][${orFilterIndex}][year][$eq]=${filters.year}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.quarter) {
    filterQuery += `&filters[$or][${orFilterIndex}][quarter][$eq]=${filters.quarter}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.month) {
    filterQuery += `&filters[$or][${orFilterIndex}][month][$eq]=${filters.month}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.category) {
    filterQuery += `&filters[$or][${orFilterIndex}][category][$eq]=${filters.category}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.product) {
    filterQuery += `&filters[$or][${orFilterIndex}][product][$eq]=${filters.product}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.select_plans) {
    filterQuery += `&filters[$or][${orFilterIndex}][plan][$eq]=${filters.select_plans}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.made_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][created_by][$eq]=${filters.made_by}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.approved_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][approved_by][$eq]=${filters.approved_by}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.channel) {
    filterQuery += `&filters[$or][${orFilterIndex}][channel_mix][${filters.channel}][$exists]=true`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.phase) {
    filterQuery += `&filters[$or][${orFilterIndex}][phase][$eq]=${filters.phase}`
    hasOrFilters = true
    orFilterIndex++
  }

  // If no filters were applied, just return the client filter
  return filterQuery
}

// Standard populate query for campaigns
export const CAMPAIGN_POPULATE_QUERY = `&populate[media_plan_details]=*&populate[budget_details]=*&populate[campaign_budget][populate][budget_fees]=*&populate[client_selection]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`

// Extract date-related filters from campaign data
export function extractDateFilters(campaigns: any[]) {
  const year = new Set<string>()
  const quarter = new Set<string>()
  const month = new Set<string>()

  campaigns.forEach((campaign) => {
    const startDate = new Date(campaign.campaign_timeline_start_date)
    const endDate = new Date(campaign.campaign_timeline_end_date)

    // Extract year
    const startYear = startDate.getFullYear().toString()
    const endYear = endDate.getFullYear().toString()
    year.add(startYear)
    if (startYear !== endYear) {
      year.add(endYear)
    }

    // Extract quarter
    const startQuarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`
    const endQuarter = `Q${Math.floor(endDate.getMonth() / 3) + 1}`
    quarter.add(startQuarter)
    if (startQuarter !== endQuarter || startYear !== endYear) {
      quarter.add(endQuarter)
    }

    // Extract month
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const startMonth = monthNames[startDate.getMonth()]
    const endMonth = monthNames[endDate.getMonth()]
    month.add(startMonth)
    if (startMonth !== endMonth || startYear !== endYear) {
      month.add(endMonth)
    }
  })

  return {
    year: Array.from(year).sort(),
    quarter: Array.from(quarter).sort(),
    month: Array.from(month).sort((a, b) => {
      const monthOrder = {
        January: 0,
        February: 1,
        March: 2,
        April: 3,
        May: 4,
        June: 5,
        July: 6,
        August: 7,
        September: 8,
        October: 9,
        November: 10,
        December: 11,
      }
      return monthOrder[a as keyof typeof monthOrder] - monthOrder[b as keyof typeof monthOrder]
    }),
  }
}

export function extractAprroverFilters(campaigns: any[]) {
  const made_by = new Set<string>()
  const approved_by = new Set<string>()
  const select_plans = new Set<string>()

  campaigns.forEach((campaign) => {
    made_by.add(campaign?.media_plan_details?.client_approver)
    approved_by.add(campaign.media_plan_details?.internal_approver)
    select_plans.add(campaign?.media_plan_details?.plan_name)
  })

  return {
    made_by: Array.from(made_by).sort(),
    approved_by: Array.from(approved_by).sort(),
    select_plans: Array.from(select_plans).sort(),
  }
}

export function extractChannelAndPhase(campaigns: any[]) {
  const channel = new Set<string>()
  const phase = new Set<string>()

  campaigns.forEach((campaign) => {
    // Handle channel mix
    campaign.channel_mix.forEach((mix) => {
      if (mix) {
        Object.keys(mix).forEach((channelKey) => {
          if (
            channelKey &&
            channelKey !== "id" &&
            channelKey !== "funnel_stage_timeline_start_date" &&
            channelKey !== "funnel_stage_timeline_end_date" &&
            channelKey !== "funnel_stage"
          ) {
            channel.add(channelKey)
          }
        })
      }
    })

    // Handle funnel_stages (flatten array of arrays)
    if (Array.isArray(campaign.funnel_stages)) {
      campaign.funnel_stages.forEach((stageGroup) => {
        if (Array.isArray(stageGroup)) {
          stageGroup.forEach((stage) => phase.add(stage))
        } else {
          phase.add(stageGroup) // In case it's not nested
        }
      })
    }
  })

  return {
    channel: Array.from(channel).sort(),
    phase: Array.from(phase).sort(),
  }
}

export const fetchFilteredCampaigns = async (clientID, filters) => {
  // Build filter query - client ID is always required
  let filterQuery = `filters[client][$eq]=${clientID}`

  // Track if we have any filters to apply with $or logic
  let hasOrFilters = false
  let orFilterIndex = 0
  const dateQuery = ""

  // Handle year filtering with $or logic
  if (filters.year) {
    const year = filters.year
    const start = `${year}-01-01`
    const end = `${year}-12-31`
    filterQuery += `&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$gte]=${start}&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$lte]=${end}`
    hasOrFilters = true
    orFilterIndex++
  }

  // Handle quarter filtering with $or logic
  if (filters.quarter) {
    const year = filters.year || new Date().getFullYear()
    const quarters = {
      Q1: [`${year}-01-01`, `${year}-03-31`],
      Q2: [`${year}-04-01`, `${year}-06-30`],
      Q3: [`${year}-07-01`, `${year}-09-30`],
      Q4: [`${year}-10-01`, `${year}-12-31`],
    }
    const [start, end] = quarters[filters.quarter]
    filterQuery += `&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$gte]=${start}&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$lte]=${end}`
    hasOrFilters = true
    orFilterIndex++
  }

  // Handle month filtering with $or logic
  // if (filters.month) {
  //   const year = filters.year || new Date().getFullYear()
  //   const monthOrder = {
  //     January: 0,
  //     February: 1,
  //     March: 2,
  //     April: 3,
  //     May: 4,
  //     June: 5,
  //     July: 6,
  //     August: 7,
  //     September: 8,
  //     October: 9,
  //     November: 10,
  //     December: 11,
  //   }
  //   let month = monthOrder[filters.month] + 1
  //   month = month.toString().padStart(2, "0")
  //   const start = `${year}-${month}-01`
  //   const end = new Date(year, Number.parseInt(month), 0).toISOString().slice(0, 10) // last day of month
  //   filterQuery += `&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$gte]=${start}&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$lte]=${end}`
  //   hasOrFilters = true
  //   orFilterIndex++
  // }

  const monthOrder = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  }

if (filters.month) {
  const monthIndex = monthOrder[filters.month] ?? -1
  if (monthIndex !== -1) {
    const year = filters.year || new Date().getFullYear()
    const start = new Date(year, monthIndex, 1).toISOString()
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59).toISOString()

    if (!filters.quarter && !filters.year) {
      // Use direct AND filtering on createdAt
      filterQuery += `&filters[createdAt][$gte]=${start}&filters[createdAt][$lte]=${end}`
    } else {
      // Use $or when combined with other filters
      filterQuery += `&filters[$or][${orFilterIndex}][createdAt][$gte]=${start}&filters[$or][${orFilterIndex}][createdAt][$lte]=${end}`
      hasOrFilters = true
      orFilterIndex++
    }
  }
}


//   if (filters.month) {
//   const year = filters.year || new Date().getFullYear()

//   const monthIndex = monthOrder[filters.month] // 0-based month index
//   const start = new Date(year, monthIndex, 1).toISOString().slice(0, 10)
//   const end = new Date(year, monthIndex + 1, 0).toISOString().slice(0, 10) // last day of the month

//   filterQuery += `&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$gte]=${start}&filters[$or][${orFilterIndex}][campaign_timeline_start_date][$lte]=${end}`
//   hasOrFilters = true
//   orFilterIndex++
// }


  // Add other filters with $or logic
  if (filters.category) {
    filterQuery += `&filters[$or][${orFilterIndex}][category][$eq]=${filters.category}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.product) {
    filterQuery += `&filters[$or][${orFilterIndex}][product][$eq]=${filters.product}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.select_plans) {
    filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][plan_name][$eq]=${filters.select_plans}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.made_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][client_approver][$eq]=${filters.made_by}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.approved_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][internal_approver][$eq]=${filters.approved_by}`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.channel) {
    filterQuery += `&filters[$or][${orFilterIndex}][channel_mix][${filters.channel}][$notNull]=true`
    hasOrFilters = true
    orFilterIndex++
  }

  if (filters.phase) {
    filterQuery += `&filters[$or][${orFilterIndex}][funnel_stages][$containsi]=${filters.phase}`
    hasOrFilters = true
    orFilterIndex++
  }

  // Add the same populate parameters as in the original query
  const populateQuery = CAMPAIGN_POPULATE_QUERY

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?${filterQuery}${populateQuery}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    })
    return response.data.data
  } catch (error) {
    console.error("Error fetching filtered campaigns:", error)
    return []
  }
}
