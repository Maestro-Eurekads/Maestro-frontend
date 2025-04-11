import { FilterState } from "./useCampaignFilters"


// Build Strapi filter query string from filter state
export function buildStrapiFilterQuery(clientID: string, filters: FilterState): string {
  // Start with the client filter
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
    // For channel filters, we need to check if the channel exists in the channel_mix
    filterQuery += `&filters[channel_mix][${filters.channel}][$exists]=true`
  }

  if (filters.phase) {
    filterQuery += `&filters[phase][$eq]=${filters.phase}`
  }

  return filterQuery
}

// Standard populate query for campaigns
export const CAMPAIGN_POPULATE_QUERY = `&populate[media_plan_details]=*&populate[budget_details]=*&populate[client_selection]=*&populate[campaign_budget]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*`

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


export function extractAprroverFilters(campaigns:any[]){
    const made_by = new Set<string>()
    const approved_by = new Set<string>()
    const select_plans = new Set<string>()
    
    campaigns.forEach((campaign) => {
        made_by.add(campaign?.media_plan_details?.internal_approver)
        approved_by.add(campaign.media_plan_details?.client_approver)
        select_plans.add(campaign?.media_plan_details?.plan_name)
    })
    
    return {
        made_by: Array.from(made_by).sort(),
        approved_by: Array.from(approved_by).sort(),
        select_plans: Array.from(select_plans).sort(),
    }
}