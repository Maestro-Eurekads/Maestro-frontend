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
const getCreateClient = async (userId) => {
  const session = await getServerSession(authOptions)
  const jwt = (session?.user as { data?: { jwt: string } })?.data?.jwt;
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients${
      !userId ? "?populate[0]=users&populate[1]=responsible&populate[2]=approver" : `?filters[users][$eq]=${userId}&populate[0]=users&populate[1]=responsible&populate[2]=approver`
    }`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return data;
};

const clientService = { createClient, getCreateClient };

export default clientService;
