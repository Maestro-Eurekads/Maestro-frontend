 
import axios from "axios"; 
import qs from "qs";

export interface FilterState {
  year?: string;
  quarter?: string;
  month?: string;
  category?: string;
  product?: string;
  made_by?: string;
  approved_by?: string;
  channel?: string;
  phase?: string;
  searchQuery?: string;
  level_1?: string[];
}

export function buildStrapiFilterQuery(clientID: string, filters: FilterState | any): string {
  let filterQuery = `filters[$and][0][client][$eq]=${clientID}`;
  let andFilterIndex = 1;

  if (filters.year) {
    filterQuery += `&filters[$and][${andFilterIndex}][year][$eq]=${filters.year}`;
    andFilterIndex++;
  }

  if (filters.quarter) {
    filterQuery += `&filters[$and][${andFilterIndex}][quarter][$eq]=${filters.quarter}`;
    andFilterIndex++;
  }

  if (filters.month) {
    filterQuery += `&filters[$and][${andFilterIndex}][month][$eq]=${filters.month}`;
    andFilterIndex++;
  }

  if (filters.category) {
    filterQuery += `&filters[$and][${andFilterIndex}][category][$eq]=${filters.category}`;
    andFilterIndex++;
  }

  if (filters.product) {
    filterQuery += `&filters[$and][${andFilterIndex}][product][$eq]=${filters.product}`;
    andFilterIndex++;
  }

  if (filters.made_by) {
    filterQuery += `&filters[$and][${andFilterIndex}][campaign_builder][username][$eq]=${filters.made_by}`;
    andFilterIndex++;
  }

  if (filters.approved_by) {
    filterQuery += `&filters[$and][${andFilterIndex}][media_plan_details][approved_by][username][$eq]=${filters.approved_by}`;
    andFilterIndex++;
  }

  if (filters.channel) {
    filterQuery += `&filters[$and][${andFilterIndex}][channel_mix][${filters.channel}][$exists]=true`;
    andFilterIndex++;
  }

  if (filters.phase) {
    filterQuery += `&filters[$and][${andFilterIndex}][funnel_stages][$containsi]=${filters.phase}`;
    andFilterIndex++;
  }

  if (filters.level_1 && Array.isArray(filters.level_1) && filters.level_1.length > 0) {
    filterQuery += `&filters[$and][${andFilterIndex}][$or][0][client_selection][level_1][value][$in]=${encodeURIComponent(
      filters.level_1.join(",")
    )}`;
    filterQuery += `&filters[$and][${andFilterIndex}][$or][1][client_selection][level_1][value][value][$in]=${encodeURIComponent(
      filters.level_1.join(",")
    )}`;
    filterQuery += `&filters[$and][${andFilterIndex}][$or][2][client_selection][level_1][id][value][$in]=${encodeURIComponent(
      filters.level_1.join(",")
    )}`;
    andFilterIndex++;
  }

  // Preserve original code
  let hasOrFilters = false;
  let orFilterIndex = 0;

  if (filters.year) {
    filterQuery += `&filters[$or][${orFilterIndex}][year][$eq]=${filters.year}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.quarter) {
    filterQuery += `&filters[$or][${orFilterIndex}][quarter][$eq]=${filters.quarter}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.month) {
    filterQuery += `&filters[$or][${orFilterIndex}][month][$eq]=${filters.month}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

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

  if (filters.made_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][campaign_builder][username][$eq]=${filters.made_by}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.approved_by) {
    filterQuery += `&filters[$or][${orFilterIndex}][approved_by][$eq]=${filters.approved_by}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.channel) {
    filterQuery += `&filters[$or][${orFilterIndex}][channel_mix][${filters.channel}][$exists]=true`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.phase) {
    filterQuery += `&filters[$or][${orFilterIndex}][phase][$eq]=${filters.phase}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  if (filters.level_1 && Array.isArray(filters.level_1) && filters.level_1.length > 0) {
    filterQuery += `&filters[$or][${orFilterIndex}][client_selection][level_1][value][$in]=${encodeURIComponent(
      filters.level_1.join(",")
    )}`;
    hasOrFilters = true;
    orFilterIndex++;
  }

  return filterQuery;
}

// Standard populate query for campaigns
export const CAMPAIGN_POPULATE_QUERY = `&populate[media_plan_details]=*&populate[budget_details]=*&populate[campaign_budget][populate][budget_fees]=*&populate[client_selection]=*&populate[channel_mix][populate][social_media][populate]=*&populate[channel_mix][populate][display_networks][populate]=*&populate[channel_mix][populate][search_engines][populate]=*&populate[channel_mix][populate][streaming][populate]=*&populate[channel_mix][populate][ooh][populate]=*&populate[channel_mix][populate][broadcast][populate]=*&populate[channel_mix][populate][messaging][populate]=*&populate[channel_mix][populate][print][populate]=*&populate[channel_mix][populate][e_commerce][populate]=*&populate[channel_mix][populate][in_game][populate]=*&populate[channel_mix][populate][mobile][populate]=*&populate[stage_budget]=*`;

export function extractDateFilters(campaigns: any[]) {
  const year = new Set<string>();
  const quarter = new Set<string>();
  const month = new Set<string>();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // //console.log("Extracting date filters from campaigns...",campaigns);

  campaigns?.forEach((campaign) => {
    const hasTimelineDates =
      campaign.campaign_timeline_start_date &&
      campaign.campaign_timeline_end_date &&
      !isNaN(new Date(campaign.campaign_timeline_start_date).getTime()) &&
      !isNaN(new Date(campaign.campaign_timeline_end_date).getTime());

    if (hasTimelineDates) {
      const startDate = new Date(campaign.campaign_timeline_start_date);
      const endDate = new Date(campaign.campaign_timeline_end_date);

      const startYear = startDate.getFullYear().toString();
      const endYear = endDate.getFullYear().toString();
      year.add(startYear);
      if (startYear !== endYear) {
        year.add(endYear);
      }

      const startQuarter = `Q${Math.floor(startDate.getMonth() / 3) + 1}`;
      const endQuarter = `Q${Math.floor(endDate.getMonth() / 3) + 1}`;
      quarter.add(startQuarter);
      if (startQuarter !== endQuarter || startYear !== endYear) {
        quarter.add(endQuarter);
      }

      // Generate all months between start and end dates
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const monthName = monthNames[currentDate.getMonth()];
        month.add(monthName);
        
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1); // Ensure we start at the beginning of the next month
      }
    } else if (campaign.createdAt && !isNaN(new Date(campaign.createdAt).getTime())) {
      const createdDate = new Date(campaign.createdAt);

      const createdYear = createdDate.getFullYear().toString();
      year.add(createdYear);

      const createdQuarter = `Q${Math.floor(createdDate.getMonth() / 3) + 1}`;
      quarter.add(createdQuarter);

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

// New function to filter months based on selected year
export function extractDateFiltersForYear(campaigns: any[], selectedYear?: string) {
  const quarter = new Set<string>();
  const month = new Set<string>();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (!selectedYear) {
    return { quarter: [], month: [] };
  }

  campaigns?.forEach((campaign) => {
    const hasTimelineDates =
      campaign.campaign_timeline_start_date &&
      campaign.campaign_timeline_end_date &&
      !isNaN(new Date(campaign.campaign_timeline_start_date).getTime()) &&
      !isNaN(new Date(campaign.campaign_timeline_end_date).getTime());

    if (hasTimelineDates) {
      const startDate = new Date(campaign.campaign_timeline_start_date);
      const endDate = new Date(campaign.campaign_timeline_end_date);

      // Only process campaigns that overlap with the selected year
      const yearStart = new Date(parseInt(selectedYear), 0, 1); // Use parseInt and month 0 for January
      const yearEnd = new Date(parseInt(selectedYear), 11, 31); // Month 11 for December

      if (startDate <= yearEnd && endDate >= yearStart) {
        // Clamp dates to the selected year boundaries
        const effectiveStart = new Date(Math.max(startDate.getTime(), yearStart.getTime()));
        const effectiveEnd = new Date(Math.min(endDate.getTime(), yearEnd.getTime()));

        // Generate all quarters between effective start and end dates
        let currentQuarter = Math.floor(effectiveStart.getMonth() / 3) + 1;
        const endQuarter = Math.floor(effectiveEnd.getMonth() / 3) + 1;
        
        while (currentQuarter <= endQuarter) {
          quarter.add(`Q${currentQuarter}`);
          currentQuarter++;
        }

        // Generate all months between effective start and end dates
        // Create a new date object to avoid mutation issues
        const currentDate = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);
        const endMonth = effectiveEnd.getMonth();
        const endYear = effectiveEnd.getFullYear();
        
        while (
          currentDate.getFullYear() < endYear || 
          (currentDate.getFullYear() === endYear && currentDate.getMonth() <= endMonth)
        ) {
          const monthName = monthNames[currentDate.getMonth()];
          month.add(monthName);
          
          // Move to next month safely
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
    } else if (campaign.createdAt && !isNaN(new Date(campaign.createdAt).getTime())) {
      const createdDate = new Date(campaign.createdAt);
      
      if (createdDate.getFullYear().toString() === selectedYear) {
        const createdQuarter = `Q${Math.floor(createdDate.getMonth() / 3) + 1}`;
        quarter.add(createdQuarter);

        const createdMonth = monthNames[createdDate.getMonth()];
        month.add(createdMonth);
      }
    }
  });

  return {
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
  // const select_plans = new Set<string>()

  campaigns.forEach((campaign) => {
    made_by.add(campaign?.campaign_builder?.username)
    approved_by.add(campaign?.media_plan_details?.approved_by[0]?.username)
    // select_plans.add(campaign?.media_plan_details?.plan_name)
  })

  return {
    made_by: Array.from(made_by).sort(),
    approved_by: Array.from(approved_by).sort(),
    // select_plans: Array.from(select_plans).sort(),
  }
}

export function extractApproverFilters(campaigns: any[]) {
  const made_by = new Set<string>();
  const approved_by = new Set<string>();

  campaigns.forEach((campaign) => {
    if (campaign?.campaign_builder?.username) {
      made_by.add(campaign.campaign_builder.username);
    }
    if (campaign?.media_plan_details?.approved_by?.[0]?.username) {
      approved_by.add(campaign.media_plan_details.approved_by[0].username);
    }
  });

  return {
    made_by: Array.from(made_by).sort().filter(Boolean),
    approved_by: Array.from(approved_by).sort().filter(Boolean),
  };
}

export function extractChannelAndPhase(campaigns: any[]) {
  const channel = new Set<string>();
  const phase = new Set<string>();

  campaigns.forEach((campaign) => {
    campaign?.channel_mix.forEach((mix) => {
      if (mix) {
        Object.keys(mix).forEach((channelKey) => {
          if (
            channelKey &&
            channelKey !== "id" &&
            channelKey !== "funnel_stage_timeline_start_date" &&
            channelKey !== "funnel_stage_timeline_end_date" &&
            channelKey !== "funnel_stage"
          ) {
            channel.add(channelKey);
          }
        });
      }
    });

    if (Array.isArray(campaign.funnel_stages)) {
      campaign.funnel_stages.forEach((stageGroup) => {
        if (Array.isArray(stageGroup)) {
          stageGroup.forEach((stage) => phase.add(stage));
        } else {
          phase.add(stageGroup);
        }
      });
    }
  });

  return {
    channel: Array.from(channel).sort(),
    phase: Array.from(phase).sort(),
  };
}

 export function extractLevelFilters(campaigns: any[]) {
  const level_1 = new Set<string>(); 

  campaigns.forEach((campaign) => {
    const clientSelection = campaign?.client_selection;
    if (!clientSelection) return;

    if (clientSelection.level_1) level_1.add(clientSelection.level_1); 
  });

  return {
    level_1: Array.from(level_1).sort(), 
  };
}
export function extractLevelNameFilters(client: any) {
  if (!client || typeof client !== 'object') {
    return { level_1_name: []};
  }
 

  const extractNames = (level) => {
    if (!level?.parameters || !Array.isArray(level?.parameters)) return [];
    return level?.parameters?.map((param) => ({
      title: level?.title,
      label: param?.name,
      value: param?.name,
    }));
  };

  return {
    level_1_name: extractNames(client.level_1),
  };
}

 

export const fetchFilteredCampaigns = async (
  clientID: string,
  filters: FilterState | null = {
    year: undefined,
    quarter: "",
    month: "",
    made_by: "",
    approved_by: "",
    channel: "",
    phase: "",
    searchQuery: "",
    level_1: [],
  },
  jwt: string
) => {
  if (!clientID) return [];

  const defaultFilters: FilterState = {
    year: undefined,
    quarter: "",
    month: "",
    made_by: "",
    approved_by: "",
    channel: "",
    phase: "",
    searchQuery: "",
    level_1: [],
  };

  filters = filters || defaultFilters;

  const channelMixPopulate = {
    social_media: { populate: "*" },
    display_networks: { populate: "*" },
    search_engines: { populate: "*" },
    streaming: { populate: "*" },
    ooh: { populate: "*" },
    broadcast: { populate: "*" },
    messaging: { populate: "*" },
    print: { populate: "*" },
    e_commerce: { populate: "*" },
    in_game: { populate: "*" },
    mobile: { populate: "*" },
    stage_budget: { populate: "*" },
  };

  const query: any = {
    filters: {
      $and: [{ client: { $eq: clientID } }],
    },
    populate: {
      budget_details: "*",
      campaign_budget: { populate: ["budget_fees"] },
      client_selection: "*",
      campaign_builder: true,
      media_plan_details: {
        populate: {
          approved_by: true,
          internal_approver: { populate: "user" },
          client_approver: { populate: "user" },
        },
      },
      
      channel_mix: { populate: channelMixPopulate },
    },
  };

  const year = filters?.year || new Date().getFullYear().toString();

  // Date filters
  if (filters.month || filters.quarter || filters.year) {
    const monthOrder: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };

    let start: string | null = null;
    let end: string | null = null;

    if (filters.month && monthOrder[filters.month] !== undefined) {
      const monthIndex = monthOrder[filters.month];
      start = new Date(Number(year), monthIndex, 1).toISOString().slice(0, 10);
      end = new Date(Number(year), monthIndex + 1, 0).toISOString().slice(0, 10);
    } else if (filters.quarter) {
      const quarterMap: Record<string, [number, number]> = {
        Q1: [0, 2], Q2: [3, 5], Q3: [6, 8], Q4: [9, 11],
      };
      const [startMonth, endMonth] = quarterMap[filters.quarter] || [0, 2];
      start = new Date(Number(year), startMonth, 1).toISOString().slice(0, 10);
      end = new Date(Number(year), endMonth + 1, 0).toISOString().slice(0, 10);
    } else if (filters.year) {
      start = `${year}-01-01`;
      end = `${year}-12-31`;
    }

    if (start && end) {
      query.filters.$and.push({
        $or: [
          {
            $and: [
              { campaign_timeline_start_date: { $notNull: true } },
              { campaign_timeline_start_date: { $lte: end } },
              { campaign_timeline_end_date: { $gte: start } },
            ],
          },
          {
            $and: [
              { campaign_timeline_start_date: { $null: true } },
              { createdAt: { $gte: start } },
              { createdAt: { $lte: end } },
            ],
          },
        ],
      });
    }
  }

  // Other filters
  if (filters.category) {
    query.filters.$and.push({ category: { $eq: filters.category } });
  }
  if (filters.product) {
    query.filters.$and.push({ product: { $eq: filters.product } });
  }
  if (filters.made_by) {
    query.filters.$and.push({
      campaign_builder: { username: { $eq: filters.made_by } },
    });
  }
  if (filters.approved_by) {
    query.filters.$and.push({
      media_plan_details: {
        approved_by: { username: { $eq: filters.approved_by } },
      },
    });
  }
  if (filters.channel) {
    query.filters.$and.push({
      [`channel_mix.${filters.channel}`]: { $notNull: true },
    });
  }
  if (filters.phase) {
    query.filters.$and.push({
      funnel_stages: { $containsi: filters.phase },
    });
  }
  if (Array.isArray(filters.level_1) && filters.level_1.length > 0) {
    query.filters.$or = filters.level_1.map((val: string) => ({
      client_selection: { level_1: { $containsi: val } },
    }));
  }

  const queryString = qs.stringify(query, { encodeValuesOnly: true });
  const fullUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns?${queryString}`;

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return response?.data?.data ?? [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const event = new Event("unauthorizedEvent");
      window.dispatchEvent(event);
    }
    return [];
  }
};
