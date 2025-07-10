import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "utils/auth";

//  Create Client
const createClient = async (inputs: any) => {
  const formattedData = {
    ...inputs,
    sports: inputs.sports.map((sport: string) => ({ id: sport })),
    categories: inputs.categories.map((category: string) => ({ id: category })),
    businessUnits: inputs.businessUnits.map((unit: string) => ({ id: unit })),
  };
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
    {
      data: inputs,
    }
  );
  return response.data;
};



//  Get Created Client
const getCreateClient = async (userId, jwt, agencyId) => {
  const filters = {
    users: {
      $eq: userId,
    },
    agency: {
      $eq: agencyId,
    }
  };
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
    {
      params: {
        filters,
        populate: {
          agency: {
            populate: {
              agency_users: { populate: ['user'] },
              admins: { populate: ['user'] },
              client_users: { populate: ['user'] }
            }
          },
          approver: true,
        }
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return data;
};

const clientService = { createClient, getCreateClient };

export default clientService;
