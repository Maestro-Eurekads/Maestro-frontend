import axios from "axios";
import type { FilterState } from "./useCampaignFilters";

// Standard populate query for campaigns
export const CAMPAIGN_POPULATE_QUERY = [
  "populate[media_plan_details]=*",
  "populate[budget_details]=*",
  "populate[campaign_budget][populate][budget_fees]=*",
  "populate[client_selection]=*",
  "populate[channel_mix][populate][social_media][populate]=*",
  "populate[channel_mix][populate][display_networks][populate]=*",
  "populate[channel_mix][populate][search_engines][populate]=*",
  "populate[channel_mix][populate][streaming][populate]=*",
  "populate[channel_mix][populate][ooh][populate]=*",
  "populate[channel_mix][populate][broadcast][populate]=*",
  "populate[channel_mix][populate][messaging][populate]=*",
  "populate[channel_mix][populate][print][populate]=*",
  "populate[channel_mix][populate][e_commerce][populate]=*",
  "populate[channel_mix][populate][in_game][populate]=*",
  "populate[channel_mix][populate][mobile][populate]=*",
].join("&");

// export const fetchFilteredCampaignsSub = async (
//   clientID: string, 
// ) => {
//   if (!clientID) {
//     console.error("Client ID is required.");
//     return [];
//   }

//   const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
//   const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

//   if (!baseUrl || !token) {
//     console.error("Missing environment variables for Strapi URL or token.");
//     return [];
//   }

//   const filterQuery = `filters[client][$eq]=${clientID}`;
//   const fullUrl = `${baseUrl}/campaigns?${filterQuery}&${CAMPAIGN_POPULATE_QUERY}`;

//   try {
//     const response = await axios.get(fullUrl, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return response.data.data;
//   } catch (error) {
//     console.error("Error fetching filtered campaigns:", error);
//     return [];
//   }
// };
export const fetchFilteredCampaignsSub = async (clientID: string) => {
  if (!clientID) {
    console.error("Client ID is required.");
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

  if (!baseUrl || !token) {
    console.error("Missing environment variables for Strapi URL or token.");
    return [];
  }

  // Add filter to ensure media_plan_details is not null
  const filterQuery = `filters[client][$eq]=${clientID}&filters[media_plan_details][$notNull]=true`;
  const fullUrl = `${baseUrl}/campaigns?${filterQuery}&${CAMPAIGN_POPULATE_QUERY}`;

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching filtered campaigns:", error);
    return [];
  }
};