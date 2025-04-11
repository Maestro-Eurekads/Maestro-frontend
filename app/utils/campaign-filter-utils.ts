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

  if (filters.selectPlans) {
    filterQuery += `&filters[plan][$eq]=${filters.selectPlans}`
  }

  if (filters.madeBy) {
    filterQuery += `&filters[created_by][$eq]=${filters.madeBy}`
  }

  if (filters.approvedBy) {
    filterQuery += `&filters[approved_by][$eq]=${filters.approvedBy}`
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
  const years = new Set<string>()
  const quarters = new Set<string>()
  const months = new Set<string>()

  campaigns.forEach((campaign) => {
    const startDate = new Date(campaign.campaign_timeline_start_date)
    const endDate = new Date(campaign.campaign_timeline_end_date)

    // Extract year
    const startYear = startDate.getFullYear().toString()
    const endYear = endDate.getFullYear().toString()
    years.add(startYear)
    if (startYear !== endYear) {
      years.add(endYear)
    }

    // Extract quarter
    const startQuarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`
    const endQuarter = `Q${Math.floor(endDate.getMonth() / 3) + 1}`
    quarters.add(startQuarter)
    if (startQuarter !== endQuarter || startYear !== endYear) {
      quarters.add(endQuarter)
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
    months.add(startMonth)
    if (startMonth !== endMonth || startYear !== endYear) {
      months.add(endMonth)
    }
  })

  return {
    years: Array.from(years).sort(),
    quarters: Array.from(quarters).sort(),
    months: Array.from(months).sort((a, b) => {
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
