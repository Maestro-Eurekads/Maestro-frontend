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

  // if (filters.select_plans) {
  //   filterQuery += `&filters[$or][${orFilterIndex}][plan][$eq]=${filters.select_plans}`
  //   hasOrFilters = true
  //   orFilterIndex++
  // }

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

 
export function extractDateFilters(campaigns: any[]) {
  const year = new Set<string>();
  const quarter = new Set<string>();
  const month = new Set<string>();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  campaigns?.forEach((campaign) => {
    // Try to use campaign_timeline_start_date and campaign_timeline_end_date
    const hasTimelineDates =
      campaign.campaign_timeline_start_date &&
      campaign.campaign_timeline_end_date &&
      !isNaN(new Date(campaign.campaign_timeline_start_date).getTime()) &&
      !isNaN(new Date(campaign.campaign_timeline_end_date).getTime());

    if (hasTimelineDates) {
      const startDate = new Date(campaign.campaign_timeline_start_date);
      const endDate = new Date(campaign.campaign_timeline_end_date);

      // Extract year
      const startYear = startDate.getFullYear().toString();
      const endYear = endDate.getFullYear().toString();
      year.add(startYear);
      if (startYear !== endYear) {
        year.add(endYear);
      }

      // Extract quarter
      const startQuarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`;
      const endQuarter = `Q${Math.floor(endDate.getMonth() / 3) + 1}`;
      quarter.add(startQuarter);
      if (startQuarter !== endQuarter || startYear !== endYear) {
        quarter.add(endQuarter);
      }

      // Extract month
      const startMonth = monthNames[startDate.getMonth()];
      const endMonth = monthNames[endDate.getMonth()];
      month.add(startMonth);
      if (startMonth !== endMonth || startYear !== endYear) {
        month.add(endMonth);
      }
    } else if (campaign.createdAt && !isNaN(new Date(campaign.createdAt).getTime())) {
      // Fallback to createdAt
      const createdDate = new Date(campaign.createdAt);

      // Extract year
      const createdYear = createdDate.getFullYear().toString();
      year.add(createdYear);

      // Extract quarter
      const createdQuarter = `Q${Math.floor(createdDate.getMonth() / 3) + 1}`;
      quarter.add(createdQuarter);

      // Extract month
      const createdMonth = monthNames[createdDate.getMonth()];
      month.add(createdMonth);
    }
  });

  return {
    year: Array.from(year).sort(),
    quarter: Array.from(quarter).sort(),
    month: Array.from(month).sort((a, b) => {
      const monthOrder = {
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
      };
      return monthOrder[a as keyof typeof monthOrder] - monthOrder[b as keyof typeof monthOrder];
    }),
  };
}

export function extractAprroverFilters(campaigns: any[]) {
  const made_by = new Set<string>()
  const approved_by = new Set<string>()
  const select_plans = new Set<string>()

  campaigns.forEach((campaign) => {
    made_by.add(campaign?.campaign_builder)
    approved_by.add(campaign?.internal_approver)
    select_plans.add(campaign?.media_plan_details?.plan_name)
  })

  return {
    made_by: Array.from(made_by).sort(),
    approved_by: Array.from(approved_by).sort(),
    // select_plans: Array.from(select_plans).sort(),
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

export function extractLevelFilters(campaigns: any[]) {
  const level_1 = new Set<string>();
  const level_2 = new Set<string>();
  const level_3 = new Set<string>();

  campaigns.forEach((campaign) => {
    const clientSelection = campaign.client_selection;
    if (!clientSelection) return;

    if (clientSelection.level_1) level_1.add(clientSelection.level_1);
    if (clientSelection.level_2) level_2.add(clientSelection.level_2);
    if (clientSelection.level_3) level_3.add(clientSelection.level_3);
  });

  return {
    level_1: Array.from(level_1).sort(),
    level_2: Array.from(level_2).sort(),
    level_3: Array.from(level_3).sort(),
  };
}

export function extractLevelNameFilters(client: any) {
  return {
    level_1_name: client?.level_1?.[0] || "",
    level_2_name: client?.level_2?.[0] || "",
    level_3_name: client?.level_3?.[0] || "",
  };
}



  
export const fetchFilteredCampaigns = async (clientID: string, filters: FilterState) => {
  // Start with the client filter - always required
  let filterQuery = `filters[client][$eq]=${clientID}`;

  // Track non-date filters for $or logic
  let orFilterIndex = 0;
  let hasOrFilters = false;

  // Handle date filters using campaign_timeline_start_date
  const dateFilters: string[] = [];
  const year = filters.year || new Date().getFullYear().toString();

  // Add notNull filter only if a date filter (year, quarter, or month) is selected
  if (filters.year || filters.quarter || filters.month) {
    filterQuery += `&filters[campaign_timeline_start_date][$notNull]=true`;
  }

  if (filters.month) {
    const monthOrder: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };
    const monthIndex = monthOrder[filters.month];
    if (monthIndex !== undefined) {
      const start = new Date(Number(year), monthIndex, 1).toISOString().slice(0, 10);
      const end = new Date(Number(year), monthIndex + 1, 0).toISOString().slice(0, 10);

      dateFilters.push(
        `filters[campaign_timeline_start_date][$lte]=${end}`,  // campaign started before or during month
        `filters[campaign_timeline_end_date][$gte]=${start}`   // campaign ends after or during month
      );
    }
  } else if (filters.quarter) {
    const quarterMap: Record<string, [number, number]> = {
      Q1: [0, 2],  // Jan–Mar
      Q2: [3, 5],  // Apr–Jun
      Q3: [6, 8],  // Jul–Sep
      Q4: [9, 11], // Oct–Dec
    };

    const [startMonth, endMonth] = quarterMap[filters.quarter] || [0, 2];
    const startDate = new Date(Number(year), startMonth, 1).toISOString().slice(0, 10);
    const endDate = new Date(Number(year), endMonth + 1, 0).toISOString().slice(0, 10);

    // Only include campaigns where the start date is within the quarter
    dateFilters.push(
      `filters[campaign_timeline_start_date][$gte]=${startDate}`,
      `filters[campaign_timeline_start_date][$lte]=${endDate}`
    );
  } else if (filters.year) {
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    dateFilters.push(
      `filters[campaign_timeline_start_date][$gte]=${start}`,
      `filters[campaign_timeline_start_date][$lte]=${end}`
    );
  }

  if (dateFilters.length > 0) {
    filterQuery += `&${dateFilters.join("&")}`;
  }

  // Handle non-date filters with $or logic
  if (filters.category) {
    filterQuery += `&filters[$or][${orFilterIndex}][category][$eq]=${filters.category}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.product) {
    filterQuery += `&filters[$or][${orFilterIndex}][product][$eq]=${filters.product}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  // if (filters.select_plans) {
  //   filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][plan_name][$eq]=${filters.select_plans}`;
  //   hasOrFilters = true;
  //   orFilterIndex++;
  // }

  if (filters.made_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][made_by][$eq]=${filters.made_by}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  // if (filters.approved_by) {
  //   filterQuery += `&filters[$or][${orFilterIndex}][media_plan_details][internal_approver][$eq]=${filters.approved_by}`;
  //   hasOrFilters = true;
  //   orFilterIndex++;
  // }
  if (filters.approved_by) {
  filterQuery += `&filters[$or][${orFilterIndex}][internal_approver][$containsi]=${filters.approved_by}`;
  hasOrFilters = true;
  orFilterIndex++;
}


  if (filters.channel) {
    filterQuery += `&filters[$or][${orFilterIndex}][channel_mix][${filters.channel}][$notNull]=true`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.phase) {
    filterQuery += `&filters[$or][${orFilterIndex}][funnel_stages][$containsi]=${filters.phase}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.level_1) {
    filterQuery += `&filters[$or][${orFilterIndex}][client_selection][level_1][$eq]=${filters.level_1}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.level_2) {
    filterQuery += `&filters[$or][${orFilterIndex}][client_selection][level_2][$eq]=${filters.level_2}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.level_3) {
    filterQuery += `&filters[$or][${orFilterIndex}][client_selection][level_3][$eq]=${filters.level_3}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  // Add populate parameters
  const populateQuery = CAMPAIGN_POPULATE_QUERY;

  const baseUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`;

  const defaultFilter = `filters[client][$eq]=${clientID}`;
  const fullUrl =
    filterQuery === defaultFilter
      ? `${baseUrl}?${populateQuery}`
      : `${baseUrl}?${filterQuery}&${populateQuery}`;

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
    });

    return response.data.data;
  } catch (error) { 
    return [];
  }
};
