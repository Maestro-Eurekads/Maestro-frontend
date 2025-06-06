// app/api/fetch-filtered-campaigns/route.ts
import { getServerSession } from "next-auth"; 
import { NextRequest } from "next/server";
import axios from "axios";
import { authOptions } from "utils/auth";

export async function fetchFilteredCampaignsSub(req: NextRequest) {
  const session:any = await getServerSession(authOptions);
  const { clientID } = await req.json();

  if (!clientID) {
    return Response.json({ error: "Client ID is required." }, { status: 400 });
  }
const jwt =session?.user?.data?.jwt
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const token = jwt;

  if (!baseUrl || !token) {
    return Response.json({ error: "Missing environment variables." }, { status: 500 });
  }

  const userType = session?.user?.data?.user?.user_type;
  const userId = session?.user?.id;

  const filterQuery = `filters[client][$eq]=${clientID}` +
    (userType !== "admin" ? `&filters[user][$eq]=${userId}` : "") +
    `&filters[media_plan_details][$notNull]=true`;

  const CAMPAIGN_POPULATE_QUERY = [
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

  const fullUrl = `${baseUrl}/campaigns?${filterQuery}&${CAMPAIGN_POPULATE_QUERY}`;

  try {
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return Response.json(response.data.data);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return Response.json({ error: "Failed to fetch campaigns." }, { status: 500 });
  }
}
