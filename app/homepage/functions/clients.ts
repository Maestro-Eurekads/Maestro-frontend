import axios from "axios";

export const addNewClient = async (data: any, jwt:any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients`,
    {
      data: { ...data },
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const addClientUser = async (userData: any, jwt:any) => {
  return await axios.post(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/auth/custom-register`,
    {
      ...userData,
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const checkExisitingEmails = async (emailList: any, jwt:any) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users`,
    {
      params: {
        filters: {
          email: {
            $in: emailList,
          },
        },
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  return response.data;
};

export const updateUsersWithCampaign = async (
  userIds: string[],
  campaignId: string,
  jwt: any
) => {
  for (const userId of userIds) {
    await axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${userId}`,
      {
        campaigns: campaignId,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
  }
};




export const updateClient = async (documentId: string, data: any, jwt: any) => {
  return await axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${documentId}`,
    {
      data: { ...data },
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const addClientToUserPayroll = async (userId: string, clientId: string, jwt: any) => {
  return await axios.put(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/users/${userId}`,
    {
      clients: clientId,
    },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const getClientById = async (clientId: string, jwt: any) => {
  return await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/clients/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const getClientCampaigns = async (clientId: string, jwt: any) => {
  return await axios.get(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/campaigns`,
    {
      params: {
        filters: {
          client_selection: {
            id: {
              $eq: clientId
            }
          }
        },
        populate: '*'
      },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};
